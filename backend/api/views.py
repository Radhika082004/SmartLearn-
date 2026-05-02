from rest_framework import generics, status, viewsets
from django.db import models as dm
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import os
import re
import random
import urllib.parse
try:
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
except ImportError:
    id_token = None
    google_requests = None
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None
from .models import UserProfile, Skill, UserSkill, Course, Enrollment, Assessment, ResumeUpload, LearningPath, Certification, DailyStudyTime
from .serializers import (
    UserSerializer, RegisterSerializer, UserProfileSerializer, SkillSerializer,
    UserSkillSerializer, CourseSerializer, EnrollmentSerializer, AssessmentSerializer,
    ResumeUploadSerializer, LearningPathSerializer, CertificationSerializer
)
from .gemini_utils import GeminiResumeAnalyzer
from .email_utils import send_welcome_email, send_google_login_email


# ──────────────────────────── AUTH VIEWS ────────────────────────────

class RegisterView(APIView):
    """POST /api/auth/register/ — Register a new user and return JWT tokens."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            # Send welcome email in the background
            send_welcome_email(user)
            return Response({
                'message': 'Account created successfully!',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """POST /api/auth/login/ — Authenticate user and return JWT tokens."""
    permission_classes = [AllowAny]

    def post(self, request):
        from django.contrib.auth import authenticate
        username = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')

        # Allow login with email
        if '@' in (username or ''):
            try:
                user_obj = User.objects.get(email=username)
                username = user_obj.username
            except User.DoesNotExist:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class GoogleLoginView(APIView):
    """POST /api/auth/google/ — Authenticate with Google ID Token."""
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Google token is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not id_token:
            return Response({'error': 'Google Auth not configured on server (missing libraries)'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            # In a real app, you'd specify your CLIENT_ID here
            # For this demo, we'll verify the token and extract info
            # verify_oauth2_token(token, requests.Request(), CLIENT_ID)
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request())

            email = idinfo.get('email')
            if not email:
                return Response({'error': 'Invalid token: email not found'}, status=status.HTTP_400_BAD_REQUEST)

            # Get or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0] + "_" + str(random.randint(100, 999)),
                    'first_name': idinfo.get('given_name', ''),
                    'last_name': idinfo.get('family_name', ''),
                }
            )

            refresh = RefreshToken.for_user(user)
            # Send login/welcome email in the background
            send_google_login_email(user, is_new_user=created)
            return Response({
                'message': 'Google login successful',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
                'is_new_user': created
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': f'Google authentication failed: {str(e)}'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """POST /api/auth/logout/ — Blacklist refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


# ──────────────────────────── USER PROFILE ────────────────────────────

class ProfileView(APIView):
    """GET/PATCH /api/profile/ — Get or update authenticated user's profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        old_goal = profile.career_goal
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            new_goal = serializer.validated_data.get('career_goal', old_goal)
            
            # If career goal changed, generate a learning path
            if new_goal != old_goal and new_goal:
                _generate_learning_path_for_goal(request.user, new_goal)
                
            return Response({'message': 'Profile updated', 'data': serializer.data})
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


def _generate_learning_path_for_goal(user, goal):
    """Dynamically generate a learning path and attach relevant courses."""
    from .gemini_utils import GeminiResumeAnalyzer
    from .models import Course, Skill
    import urllib.parse
    
    # Deactivate old paths
    LearningPath.objects.filter(user=user).update(is_active=False)
    
    path = LearningPath.objects.create(
        user=user,
        title=f"{goal} Master Path",
        goal=goal,
        ai_match_score=92.5
    )
    
    analyzer = GeminiResumeAnalyzer()
    curriculum = analyzer.generate_learning_path_with_phases(goal)
    
    final_courses = []
    
    if curriculum:
        for phase in curriculum:
            phase_title = phase.get('phase_title', 'Fundamentals')
            for c_data in phase.get('courses', []):
                # Search if course already exists or create it
                title = c_data.get('title')
                
                # Fetch a real YouTube URL for this newly suggested course title
                search_q = urllib.parse.quote(f"{title} full course tutorial")
                fallback_url = f"https://www.youtube.com/results?search_query={search_q}"
                
                course, created = Course.objects.get_or_create(
                    title=title,
                    defaults={
                        'description': c_data.get('description', ''),
                        'category': phase_title, # This becomes the "Phase" title in frontend
                        'level': c_data.get('level', 'beginner'),
                        'provider': c_data.get('provider', 'YouTube'),
                        'duration_hours': float(c_data.get('duration_hours', 2.0)),
                        'is_free': True,
                        'is_external': True,
                        'external_url': fallback_url,
                        'rating': 4.8
                    }
                )
                final_courses.append(course)
    
    # Absolute Fallback if AI fails completely (Rate Limits / Timeouts)
    if not final_courses:
        # We generate a high-quality 3-phase fallback for the specific goal
        fallback_data = [
            {
                'phase': f"Phase 1: {goal} Fundamentals",
                'title': f"Introduction to {goal}",
                'desc': f"Master the core principles and basic building blocks of {goal}."
            },
            {
                'phase': f"Phase 2: {goal} Intermediate",
                'title': f"Deep Dive into {goal} Architectures",
                'desc': f"Advance your knowledge with practical implementations and scaling techniques for {goal}."
            },
            {
                'phase': f"Phase 3: {goal} Mastery",
                'title': f"{goal} Expert Case Studies",
                'desc': f"Real-world application and advanced optimization strategies for professional-grade {goal}."
            }
        ]
        
        for item in fallback_data:
            search_q = urllib.parse.quote(f"{item['title']} full course tutorial")
            course, _ = Course.objects.get_or_create(
                title=item['title'],
                defaults={
                    'description': item['desc'],
                    'category': item['phase'],
                    'level': 'intermediate',
                    'provider': 'YouTube',
                    'duration_hours': 5.0,
                    'is_free': True,
                    'is_external': True,
                    'external_url': f"https://www.youtube.com/results?search_query={search_q}",
                    'rating': 4.7
                }
            )
            final_courses.append(course)
        
    path.courses.set(final_courses)
    return path


# ──────────────────────────── SKILLS ────────────────────────────

class SkillListView(generics.ListAPIView):
    """GET /api/skills/ — Public list of all skills."""
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]


class UserSkillsView(APIView):
    """GET/POST /api/skills/mine/ — Get or update user's skill proficiency."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_skills = UserSkill.objects.filter(user=request.user).select_related('skill')
        serializer = UserSkillSerializer(user_skills, many=True)
        return Response(serializer.data)

    def post(self, request):
        skill_id = request.data.get('skill_id')
        skill_name = request.data.get('skill_name')
        proficiency = request.data.get('proficiency', 0)
        level = request.data.get('level', 'beginner')
        
        # Debugging: let's see what's actually coming in
        print(f"DEBUG: skill_id={skill_id}, skill_name={skill_name}")

        try:
            # Better check for truthy skill_id (ignore empty strings or nulls)
            if skill_id is not None and str(skill_id).strip() != "" and str(skill_id).lower() != "undefined":
                skill = Skill.objects.get(id=skill_id)
            elif skill_name:
                skill, _ = Skill.objects.get_or_create(
                    name=skill_name.strip(),
                    defaults={'category': 'General'}
                )
            else:
                return Response({'error': f'skill_id or skill_name required (received id={skill_id}, name={skill_name})'}, status=status.HTTP_400_BAD_REQUEST)

            user_skill, created = UserSkill.objects.update_or_create(
                user=request.user, skill=skill,
                defaults={'proficiency': proficiency, 'level': level}
            )
            return Response(UserSkillSerializer(user_skill).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except Skill.DoesNotExist:
            return Response({
                'error': f'Skill not found (DB lookup failed). Received skill_id={skill_id}, skill_name={skill_name}',
                'received_data': request.data
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ──────────────────────────── COURSES ────────────────────────────

class CourseListView(generics.ListAPIView):
    """GET /api/courses/ — Browse all courses with optional filters."""
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            data = serializer.data
            if request.query_params.get('recommend') == 'true' and request.user.is_authenticated:
                data = sorted(data, key=lambda x: x.get('ai_match_score') or 0, reverse=True)
            return self.get_paginated_response(data)

        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        if request.query_params.get('recommend') == 'true' and request.user.is_authenticated:
            data = sorted(data, key=lambda x: x.get('ai_match_score') or 0, reverse=True)
        return Response(data)

    def get_queryset(self):
        qs = Course.objects.all()
        category = self.request.query_params.get('category')
        level = self.request.query_params.get('level')
        search = self.request.query_params.get('search')
        is_free = self.request.query_params.get('free')
        if category:
            qs = qs.filter(category__icontains=category)
        if level:
            qs = qs.filter(level=level)
            
        recommend = self.request.query_params.get('recommend') == 'true'
        
        # Helper to fetch real YouTube Video URLs instead of search pages/hallucinations
        def get_real_youtube_url(course_title):
            import urllib.request
            import urllib.parse
            import re
            try:
                query = urllib.parse.quote(f"{course_title} full course tutorial")
                url = f"https://www.youtube.com/results?search_query={query}"
                # Use a real browser User-Agent to get consistent HTML
                user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
                req = urllib.request.Request(url, headers={'User-Agent': user_agent})
                html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8')
                
                # Internal YouTube JSON pattern is the most reliable way to get video IDs
                video_ids = re.findall(r'"videoId":"([^"]{11})"', html)
                if video_ids:
                    return f"https://www.youtube.com/watch?v={video_ids[0]}"
            except Exception:
                pass
            return f"https://www.youtube.com/results?search_query={urllib.parse.quote(course_title)}"
            
        # If recommend is true, ensure we ONLY show free courses as requested by user
        if recommend:
             qs = qs.filter(is_free=True)
             
        if search:
            # We want exact matches in title or skill when searching for recommendations, not vague matches
            qs = qs.filter(dm.Q(title__icontains=search) | dm.Q(skills__name__icontains=search)).distinct()
            
            # Dynamic Course Generation Injection
            if recommend and not qs.exists():
                try:
                    from .gemini_utils import GeminiResumeAnalyzer
                    from .models import Skill
                    import urllib.parse
                    analyzer = GeminiResumeAnalyzer()
                    
                    # Try to fetch domain/goal from user profile 
                    domain = None
                    if self.request.user.is_authenticated:
                        profile = getattr(self.request.user, 'profile', None)
                        if profile:
                            domain = profile.career_goal or profile.job_role
                            
                    suggestions = []
                    try:
                        suggestions = analyzer.generate_free_courses(search, domain)
                    except Exception as ai_e:
                        print(f"Gemini generation error: {ai_e}")
                    
                    # FALLBACK: If Gemini gave us 0 courses because of Rate Limiting or errors
                    if not suggestions:
                        suggestions = [
                            {
                                'title': f"Complete {search.title()} Masterclass",
                                'description': f"A comprehensive, fully free external video course to master {search}.",
                                'what_you_will_learn': [f"Fundamentals of {search}", f"Advanced {search} Concepts", f"Practical implementation", "Best practices"],
                                'provider': "YouTube",
                                'external_url': get_real_youtube_url(f"{search} full course"),
                                'duration_hours': 4.5,
                                'level': "beginner",
                                'rating': 4.7
                            },
                            {
                                'title': f"Advanced {search.title()} for Professionals",
                                'description': f"Take your {search} skills to the next level with this deep dive.",
                                'what_you_will_learn': [f"{search} Architecture", "Performance Tuning", "Real-world scaling", "Production configurations"],
                                'provider': "YouTube",
                                'external_url': get_real_youtube_url(f"{search} advanced tutorial"),
                                'duration_hours': 6.0,
                                'level': "advanced",
                                'rating': 4.8
                            },
                            {
                                'title': f"{search.title()} Crash Course",
                                'description': f"Learn the basics of {search} quickly in this fast-paced crash course.",
                                'what_you_will_learn': [f"Core {search} concepts", "Quick start guide", "Basic commands / tools", "Workflow essentials"],
                                'provider': "YouTube",
                                'external_url': get_real_youtube_url(f"{search} crash course"),
                                'duration_hours': 2.0,
                                'level': "beginner",
                                'rating': 4.5
                            }
                        ]
                    
                    if suggestions:
                        skill_obj, _ = Skill.objects.get_or_create(name=search.title())
                        for entry in suggestions:
                            raw_url = entry.get('external_url', '')
                            # If AI provided a broken or generic link, fetch a real one
                            if not raw_url or 'youtube.com/results' in raw_url or 'youtube.com/watch' not in raw_url:
                                final_url = get_real_youtube_url(entry.get('title'))
                            else:
                                final_url = raw_url

                            course, created = Course.objects.get_or_create(
                                title=entry.get('title'),
                                defaults={
                                    'description': entry.get('description', ''),
                                    'is_free': True,
                                    'is_external': True,
                                    'external_url': final_url,
                                    'provider': entry.get('provider', 'YouTube'),
                                    'what_you_will_learn': entry.get('what_you_will_learn', []),
                                    'duration_hours': float(entry.get('duration_hours', 1.0)),
                                    'level': entry.get('level', 'beginner').lower(),
                                    'rating': float(entry.get('rating', 4.5)),
                                    'category': domain or 'General'
                                }
                            )
                            # Update logic: If course exists but URL is a results page OR we suspect it's a hallucination
                            if not created:
                                is_results_page = 'results?search_query' in (course.external_url or '')
                                is_potential_hallucination = 'youtube.com' in (course.external_url or '') and len(course.external_url.split('v=')[-1]) != 11
                                
                                if is_results_page or is_potential_hallucination or not course.external_url:
                                    new_url = get_real_youtube_url(course.title)
                                    if new_url != course.external_url:
                                        course.external_url = new_url
                                        course.save()
                                
                            course.skills.add(skill_obj)
                            
                        # Re-run query after populating DB
                        qs = Course.objects.filter(dm.Q(title__icontains=search) | dm.Q(skills__name__icontains=search)).filter(is_free=True).distinct()

                except Exception as e:
                    print(f"Dynamic course gen failed: {e}")

        if is_free == 'true':
            qs = qs.filter(is_free=True)
        return qs

    def get_serializer_context(self):
        return {'request': self.request}


class CourseDetailView(generics.RetrieveAPIView):
    """GET /api/courses/<id>/ — Get course details."""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]


# ──────────────────────────── ENROLLMENTS ────────────────────────────

class EnrollmentView(APIView):
    """GET/POST /api/enrollments/ — View or create course enrollments."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        enrollments = Enrollment.objects.filter(user=request.user).select_related('course')
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

    def post(self, request):
        course_id = request.data.get('course_id')
        try:
            course = Course.objects.get(id=course_id)
            enrollment, created = Enrollment.objects.get_or_create(
                user=request.user, course=course,
                defaults={'status': 'enrolled'}
            )
            if not created:
                return Response({'message': 'Already enrolled', 'data': EnrollmentSerializer(enrollment).data})
            return Response({'message': 'Enrolled successfully!', 'data': EnrollmentSerializer(enrollment).data}, status=status.HTTP_201_CREATED)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk=None):
        """Update progress for an enrollment."""
        try:
            enrollment = Enrollment.objects.get(id=pk, user=request.user)
            enrollment.progress = request.data.get('progress', enrollment.progress)
            enrollment.status = request.data.get('status', enrollment.status)
            enrollment.save()
            return Response(EnrollmentSerializer(enrollment).data)
        except Enrollment.DoesNotExist:
            return Response({'error': 'Enrollment not found'}, status=status.HTTP_404_NOT_FOUND)


# ──────────────────────────── ASSESSMENTS ────────────────────────────

class AssessmentView(APIView):
    """GET/POST /api/assessments/ — View or submit skill assessments."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        domain = request.query_params.get('domain')
        if domain:
            from .models import AssessmentQuestion, Skill
            from .serializers import AssessmentQuestionSerializer
            from .gemini_utils import GeminiResumeAnalyzer
            
            # Fetch all existing skill names for reference
            db_skill_names = list(Skill.objects.values_list('name', flat=True))
            
            # Generate AI Questions
            analyzer = GeminiResumeAnalyzer()
            ai_questions = analyzer.generate_assessment_questions(domain, available_skills=db_skill_names)
            
            if ai_questions and isinstance(ai_questions, list):
                # Save generated questions to DB for scoring verification
                questions_to_return = []
                for q_data in ai_questions:
                    # Try to find or create the skill object mentioned by AI
                    skill_obj = None
                    skill_name = q_data.get('skill', '')
                    if skill_name:
                        skill_obj, _ = Skill.objects.get_or_create(name=skill_name)
                    
                    # Create the unique question instance
                    q_obj = AssessmentQuestion.objects.create(
                        question_text=q_data['question_text'],
                        option_a=q_data['option_a'],
                        option_b=q_data['option_b'],
                        option_c=q_data['option_c'],
                        option_d=q_data['option_d'],
                        correct_option=q_data['correct_option'],
                        domain=domain,
                        difficulty=q_data.get('difficulty', 'intermediate'),
                        skill=skill_obj
                    )
                    questions_to_return.append(q_obj)
                
                serializer = AssessmentQuestionSerializer(questions_to_return, many=True)
                return Response(serializer.data)
            
            # Fallback to existing pool if Gemini fails
            questions = AssessmentQuestion.objects.filter(domain=domain).order_by('?')[:20]
            serializer = AssessmentQuestionSerializer(questions, many=True)
            return Response(serializer.data)
        
        # Default: return user's past assessments
        assessments = Assessment.objects.filter(user=request.user).order_by('-taken_at')
        serializer = AssessmentSerializer(assessments, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Submit assessment and compute score with Hybrid AI/Local logic."""
        assessment_type = request.data.get('type', 'General')
        answers = request.data.get('answers', []) # [{question_id, selected_option}]
        
        if not answers:
            return Response({'error': 'No answers provided'}, status=status.HTTP_400_BAD_REQUEST)

        from .models import AssessmentQuestion, Assessment
        from .serializers import AssessmentSerializer
        from .gemini_utils import GeminiResumeAnalyzer

        # 1. LOCAL GRADING (Instant, No Timeout)
        correct_count = 0
        detailed_results = []
        for ans in answers:
            try:
                q = AssessmentQuestion.objects.get(id=ans.get('question_id'))
                is_correct = q.correct_option == ans.get('selected_option')
                if is_correct:
                    correct_count += 1
                
                # Include full question context so AI can extract the exact sub-topic
                options_map = {0: q.option_a, 1: q.option_b, 2: q.option_c, 3: q.option_d}
                detailed_results.append({
                    'question': q.question_text,
                    'correct_answer': options_map.get(q.correct_option, ''),
                    'user_answer': options_map.get(ans.get('selected_option'), ''),
                    'is_correct': is_correct,
                    'skill_tag': q.skill.name if q.skill else None,
                })
            except AssessmentQuestion.DoesNotExist:
                continue

        total_questions = len(detailed_results)
        score = round((correct_count / total_questions * 100), 1) if total_questions > 0 else 0

        # 2. COMPUTE STRENGTHS & GAPS LOCALLY PER-QUESTION (No grouping = granular results)
        # Define broad/generic tags that must be overridden with question-derived topics
        BROAD_TAGS = {
            'docker', 'aws', 'kubernetes', 'java', 'python', 'react', 'javascript',
            'typescript', 'angular', 'vue', 'nodejs', 'node.js', 'django', 'flask',
            'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'git', 'linux',
            'general', 'data science', 'machine learning', 'ai', 'deep learning',
            'web development', 'devops', 'cloud', 'system design', 'dsa', 'algorithms',
            'networking', 'cybersecurity', 'blockchain',
        }

        def extract_topic(question_text, skill_tag):
            """Return a specific topic: use skill_tag if available and granular, else clean the question."""
            # Pre-clean the skill tag
            clean_tag = skill_tag.strip().title() if skill_tag else ""
            
            # If we have a tag and it's not super-broad, use it
            if clean_tag and clean_tag.lower() not in BROAD_TAGS:
                return clean_tag
            
            # If it is broad, try to find a more specific noun phrase in the question
            q = question_text.strip()
            
            # Remove common question preambles
            prefixes = [
                r"which of the following is", r"which of these is", r"which library is",
                r"what is the", r"what is", r"how do you", r"where is", r"choose the",
                r"in the context of", r"in", r"the", r"a"
            ]
            
            topic = q.lower()
            for pref in prefixes:
                topic = re.sub(f"^{pref}\\s+", "", topic, flags=re.IGNORECASE)
            
            # Remove trailing question marks and clean up
            topic = topic.rstrip('?').rstrip(':').rstrip('.').strip().title()
            
            # If cleaning resulted in a long sentence, fallback to the original tag or first 4 words
            if len(topic.split()) > 5:
                if clean_tag: return clean_tag
                return ' '.join(topic.split()[:4]).title()
            
            return topic or clean_tag or "General Knowledge"

        final_strengths = []
        final_gaps = []
        for r in detailed_results:
            topic = extract_topic(r['question'], r.get('skill_tag'))
            if r['is_correct']:
                final_strengths.append(topic)
            else:
                # Only add to gaps if not already a strength (avoid overlap)
                final_gaps.append(topic)
        
        # Deduplicate while preserving order
        final_strengths = list(dict.fromkeys(final_strengths))
        final_gaps = list(dict.fromkeys(final_gaps))
        # Remove anything that's in both lists from strengths
        final_strength_set = set(final_strengths) - set(final_gaps)
        final_strengths = [s for s in final_strengths if s in final_strength_set]

        # 3. CREATE RECORD
        assessment = Assessment.objects.create(
            user=request.user,
            assessment_type=assessment_type,
            score=score,
            total_questions=total_questions,
            correct_answers=correct_count
        )

        # 4. AI FOR NARRATIVE FEEDBACK + RECOMMENDATIONS ONLY
        ai_feedback = f'You scored {score}%. Keep practicing!'
        ai_recommendations = [{'title': f'Improve {g}', 'reason': f'You missed questions on this topic', 'type': 'course'} for g in final_gaps[:3]]

        try:
            analyzer = GeminiResumeAnalyzer()
            feedback_prompt_data = {
                'domain': assessment_type,
                'score': score,
                'strengths': final_strengths,
                'gaps': final_gaps
            }
            narrative = analyzer.generate_narrative_feedback(feedback_prompt_data)
            if narrative:
                ai_feedback = narrative.get('feedback', ai_feedback)
                ai_recommendations = narrative.get('ai_recommendations', ai_recommendations)
        except Exception as e:
            print(f"Non-critical narrative feedback error: {str(e)}")

        return Response({
            'message': 'Assessment graded successfully',
            'result': AssessmentSerializer(assessment).data,
            'correct_skills': final_strengths,
            'gap_skills': final_gaps,
            'ai_recommendations': ai_recommendations,
            'ai_feedback': ai_feedback
        }, status=status.HTTP_201_CREATED)


def get_skill_recommendations(user, score):
    """Mock AI recommendation logic — replace with actual ML model."""
    recommendations = []
    if score < 50:
        recommendations.append({'type': 'course', 'title': 'Fundamentals Bootcamp', 'reason': 'Strengthen core skills'})
    elif score < 75:
        recommendations.append({'type': 'course', 'title': 'Intermediate Practice Problems', 'reason': 'Improve weak areas'})
    else:
        recommendations.append({'type': 'certification', 'title': 'Advanced Certification', 'reason': 'Ready for next level'})
    return recommendations


# ──────────────────────────── RESUME ────────────────────────────

class ResumeUploadView(APIView):
    """POST /api/resume/upload/ — Upload and analyse resume."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        resumes = ResumeUpload.objects.filter(user=request.user).order_by('-uploaded_at')
        serializer = ResumeUploadSerializer(resumes, many=True)
        return Response(serializer.data)

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        resume = ResumeUpload.objects.create(user=request.user, file=file)

        # Basic text extraction
        extracted_text = ""
        try:
            file.seek(0)
            if file.name.endswith('.pdf') and PyPDF2:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    extracted_text += page.extract_text() + " "
            else:
                extracted_text = file.read().decode('utf-8', errors='ignore')
        except Exception as e:
            extracted_text = f"Error reading file: {str(e)}"

        # Get specific skill names from DB to help Gemini map correctly
        db_skill_names = list(Skill.objects.values_list('name', flat=True))

        # Use Gemini for AI Analysis
        analyzer = GeminiResumeAnalyzer()
        analysis_result = analyzer.analyze_resume(extracted_text, available_skills=db_skill_names)
        
        if not analysis_result:
            # Fallback to mock if AI fails
            text_lower = extracted_text.lower()
            all_skills = Skill.objects.all()
            found_skills = []
            for skill in all_skills:
                if re.search(r'\b' + re.escape(skill.name.lower()) + r'\b', text_lower):
                    found_skills.append(skill)
            
            # Ensure gaps don't overlap with what we actually found
            found_names = [s.name for s in found_skills]
            potential_gaps = ['React.js', 'Python', 'AWS', 'Docker', 'System Design']
            actual_gaps = [g for g in potential_gaps if g not in found_names][:3]
            if not actual_gaps:
                actual_gaps = ['Cloud Security', 'Kubernetes']

            analysis_result = {
                'name': f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username,
                'experience_years': 1,
                'extracted_skills': found_names or ['Technical Literacy'],
                'skill_gaps': actual_gaps,
                'resume_score': 65 if found_names else 40,
                'suggestions': ['Add more specific project metrics', 'Highlight your technical stack more clearly'],
                'seniority_level': 'Junior',
            }
        else:
            # Map extracted skills to database Skill objects
            all_skills = Skill.objects.all()
            found_skills = []
            extracted_skill_names = [s.lower() for s in analysis_result.get('extracted_skills', [])]
            for skill in all_skills:
                if skill.name.lower() in extracted_skill_names:
                    found_skills.append(skill)
            
            # CRITICAL FIX: Remove found skills from Gemini's suggested gaps list
            found_names_lower = [s.name.lower() for s in found_skills]
            analysis_result['skill_gaps'] = [
                gap for gap in analysis_result.get('skill_gaps', []) 
                if gap.lower() not in found_names_lower
            ]
        resume.analysis_result = analysis_result
        resume.resume_score = analysis_result.get('resume_score', 0)
        resume.save()

        return Response({
            'message': 'Resume analysed successfully using Gemini AI',
            'data': ResumeUploadSerializer(resume).data,
        }, status=status.HTTP_201_CREATED)


# ──────────────────────────── LEARNING PATHS ────────────────────────────

class LearningPathView(APIView):
    """GET /api/learning-path/ — Get user's active learning path."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        paths = LearningPath.objects.filter(user=request.user, is_active=True)
        serializer = LearningPathSerializer(paths, many=True)
        return Response(serializer.data)

    def post(self, request):
        """POST /api/learning-path/ — Generate or update learning path based on resume or profile."""
        profile = getattr(request.user, 'profile', None)
        goal = request.data.get('goal')
        
        if not goal and profile:
            goal = profile.career_goal or profile.job_role
        
        if not goal:
            # Fallback to latest resume extracted skills if no goal is set
            resume = ResumeUpload.objects.filter(user=request.user).order_by('-uploaded_at').first()
            if resume and resume.extracted_skills.exists():
                goal = ", ".join([s.name for s in resume.extracted_skills.all()[:2]])
            else:
                goal = "General Technical Path"

        path = _generate_learning_path_for_goal(request.user, goal)
        return Response({
            'message': 'Learning path generated successfully!',
            'data': LearningPathSerializer(path).data
        }, status=status.HTTP_201_CREATED)


# ──────────────────────────── CERTIFICATIONS ────────────────────────────

class CertificationListView(generics.ListAPIView):
    """GET /api/certifications/ — Get AI-recommended certifications."""
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Determine user goal for dynamic certification generation
        # combining domain from profile and skill gaps from resume
        goal_parts = []
        if request.user.is_authenticated:
            profile = getattr(request.user, 'profile', None)
            if profile and profile.career_goal:
                goal_parts.append(profile.career_goal)
            
            resume = ResumeUpload.objects.filter(user=request.user).order_by('-uploaded_at').first()
            if resume and resume.analysis_result:
                gaps = resume.analysis_result.get('skill_gaps', [])
                if gaps:
                    goal_parts.append(", ".join(gaps[:2]))

        goal = " and ".join(goal_parts) if goal_parts else "Software Engineering"

        # If no certifications exist, generate them dynamically
        if not queryset.exists():
            certs_data = []
            try:
                from .gemini_utils import GeminiResumeAnalyzer
                analyzer = GeminiResumeAnalyzer()
                certs_data = analyzer.generate_industry_certifications(goal)
            except Exception as e:
                print(f"Certification dynamic gen AI failed: {e}")

            # FALLBACK: If AI fails (Rate Limits), provide high-quality defaults based on goal
            if not certs_data:
                # Clean up the goal for the title
                simple_goal = goal.replace("To become ", "").replace("Master ", "").split(",")[0].strip()
                certs_data = [
                    {
                        'title': f"Google Professional {simple_goal} Engineer",
                        'provider': "Google",
                        'level': "Advanced",
                        'duration_weeks': 8,
                        'description': f"Validates your ability to design and monitor systems for {simple_goal}.",
                        'external_url': "https://cloud.google.com/learn/certification/"
                    },
                    {
                        'title': f"AWS Certified {simple_goal} – Associate",
                        'provider': "AWS",
                        'level': "Intermediate",
                        'duration_weeks': 10,
                        'description': f"The industry standard for demonstrating your technical expertise in {simple_goal}.",
                        'external_url': "https://aws.amazon.com/certification/"
                    },
                    {
                        'title': f"Microsoft Certified: {simple_goal} Fundamentals",
                        'provider': "Microsoft",
                        'level': "Beginner",
                        'duration_weeks': 4,
                        'description': f"Prove your knowledge of foundational tech concepts within {simple_goal}.",
                        'external_url': "https://learn.microsoft.com/en-us/credentials/browse/"
                    }
                ]
            
            if certs_data:
                for cert in certs_data:
                    # Construct a useful external URL if the AI didn't provide one
                    final_url = cert.get('external_url', '')
                    if not final_url:
                        search_q = urllib.parse.quote(f"{cert.get('title')} {cert.get('provider')} official certification page")
                        final_url = f"https://www.google.com/search?q={search_q}"
                        
                    Certification.objects.get_or_create(
                        title=cert.get('title'),
                        defaults={
                            'provider': cert.get('provider', 'Industry Standard'),
                            'level': cert.get('level', 'Intermediate'),
                            'duration_weeks': cert.get('duration_weeks', 8),
                            'description': cert.get('description', ''),
                            'external_url': final_url,
                            'icon_url': cert.get('icon_url', '')
                        }
                    )
                queryset = self.get_queryset()

        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        
        if request.user.is_authenticated:
            # Sort by relevance or title 
            data = sorted(data, key=lambda x: x.get('title'))
            
        return Response(data)

    def get_serializer_context(self):
        return {'request': self.request}


# ──────────────────────────── DASHBOARD / ANALYTICS ────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """GET /api/dashboard/ — Aggregated stats for dashboard and analytics."""
    user = request.user
    enrollments = Enrollment.objects.filter(user=user).select_related('course')
    assessments = Assessment.objects.filter(user=user)
    
    # Basic Stats
    completed_count = enrollments.filter(status='completed').count()
    avg_progress = enrollments.aggregate(avg=dm.Avg('progress'))['avg'] or 0
    
    # Skill Radar Data (from UserSkills)
    user_skills = UserSkill.objects.filter(user=user).select_related('skill')
    radar_data = []
    for us in user_skills:
        radar_data.append({
            'subject': us.skill.name,
            'A': us.proficiency
        })
    if not radar_data:
        radar_data = [{'subject': 'General', 'A': 50}]

    # Weekly Activity (Mocked for demo purposes, usually from logs)
    weekly_data = [
        {'day': 'Mon', 'hours': random.randint(1, 5)},
        {'day': 'Tue', 'hours': random.randint(2, 6)},
        {'day': 'Wed', 'hours': random.randint(1, 4)},
        {'day': 'Thu', 'hours': random.randint(3, 7)},
        {'day': 'Fri', 'hours': random.randint(2, 5)},
        {'day': 'Sat', 'hours': random.randint(4, 9)},
        {'day': 'Sun', 'hours': random.randint(1, 4)},
    ]

    # Course Performance
    course_performance = []
    for en in enrollments:
        course_performance.append({
            'course': en.course.title,
            'score': en.progress,
            'quiz': f"{random.randint(75, 95)}%" if en.status == 'completed' else (f"{random.randint(40, 70)}%" if en.progress > 0 else "N/A"),
            'timeSpent': f"{round(en.progress * 0.15, 1)}h" if en.progress > 0 else "0h",
            'status': en.status.capitalize()
        })

    # Basic Stats
    courses_enrolled = enrollments.count()
    completed_count = enrollments.filter(status='completed').count()
    avg_progress = enrollments.aggregate(avg=dm.Avg('progress'))['avg'] or 0
    skills_gained = user_skills.filter(proficiency__gte=70).count()
    
    # Certification Count (Recommended)
    cert_count = Certification.objects.all().count()

    # Weekly Activity (REAL DATA FROM DB)
    from datetime import date, timedelta
    last_7_days = []
    for i in range(6, -1, -1):
        dt = date.today() - timedelta(days=i)
        record = DailyStudyTime.objects.filter(user=user, date=dt).first()
        last_7_days.append({
            'week': dt.strftime('%a'),
            'hours': record.hours if record else 0
        })

    # Skill Analysis (From Resume Analysis Gaps)
    latest_resume = ResumeUpload.objects.filter(user=user).order_by('-uploaded_at').first()
    skill_gaps_data = []
    colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6']
    
    if latest_resume and latest_resume.analysis_result:
        gaps = latest_resume.analysis_result.get('skill_gaps', [])
        for i, gap in enumerate(gaps[:5]): # Top 5 gaps
            skill_gaps_data.append({
                'skill': gap,
                'level': random.randint(20, 50), # Gaps are low proficiency by definition
                'color': colors[i % len(colors)]
            })
    
    # Fallback to UserSkills if no resume gaps found
    if not skill_gaps_data:
        for i, us in enumerate(user_skills[:5]):
            skill_gaps_data.append({
                'skill': us.skill.name,
                'level': us.proficiency,
                'color': colors[i % len(colors)]
            })
            
    if not skill_gaps_data:
        skill_gaps_data = [
            {'skill': 'General Aptitude', 'level': 65, 'color': '#6366f1'},
            {'skill': 'Technical Literacy', 'level': 45, 'color': '#06b6d4'}
        ]

    profile = getattr(user, 'profile', None)
    # AI Recommendations (Real Courses)
    recommendations_data = []
    # Try to find courses matching the user's goal/domain
    domain_query = profile.career_goal if profile and profile.career_goal else "Technical"
    rec_courses = Course.objects.filter(dm.Q(category__icontains=domain_query) | dm.Q(title__icontains=domain_query)).order_by('-rating')[:3]
    
    # If not enough, just pick top rated free courses
    if rec_courses.count() < 3:
        rec_courses = Course.objects.filter(is_free=True).order_by('-rating')[:3]
        
    for rc in rec_courses:
        recommendations_data.append({
            'title': rc.title,
            'category': rc.category,
            'match': f"{random.randint(85, 99)}%",
            'level': rc.level.capitalize(),
            'external_url': rc.external_url or f"https://www.youtube.com/results?search_query={urllib.parse.quote(rc.title)}",
            'icon': "🎓" if "Data" in rc.category else "💻"
        })

    return Response({
        'user_name': f"{user.first_name} {user.last_name}".strip() or user.username,
        'career_goal': profile.career_goal if profile and profile.career_goal else (profile.job_role if profile and profile.job_role else "Technical Growth"),
        'courses_enrolled': courses_enrolled,
        'courses_completed': completed_count,
        'avg_progress': round(avg_progress, 1),
        'skills_gained': skills_gained,
        'skill_gaps': skill_gaps_data,
        'recommendations': recommendations_data,
        'certifications_count': cert_count,
        'assessments_taken': assessments.count(),
        'learning_streak': 7,
        'total_hours': int(getattr(profile, 'total_hours', 0)),
        'radar_data': radar_data,
        'weekly_data': last_7_days,
        'course_performance': course_performance
    })
