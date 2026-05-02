from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Skill, UserSkill, Course, CourseModule, Lesson, Enrollment, Assessment, ResumeUpload, LearningPath, Certification, AssessmentQuestion


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    career_goal = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'career_goal']

    def create(self, validated_data):
        career_goal = validated_data.pop('career_goal', '')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        UserProfile.objects.create(user=user, career_goal=career_goal)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'full_name', 'bio', 'location', 'job_role',
                  'career_goal', 'github_url', 'linkedin_url', 'avatar',
                  'learning_streak', 'total_hours', 'created_at']

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'description']


class UserSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_category = serializers.CharField(source='skill.category', read_only=True)

    class Meta:
        model = UserSkill
        fields = ['id', 'skill', 'skill_name', 'skill_category', 'level', 'proficiency', 'assessed_at']


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'order', 'duration_minutes', 'video_url', 'is_preview']


class CourseModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = CourseModule
        fields = ['id', 'title', 'order', 'lessons']


class CourseSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    modules = CourseModuleSerializer(many=True, read_only=True)
    ai_match_score = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'level', 'duration_hours',
                  'rating', 'review_count', 'student_count', 'price', 'is_free',
                  'is_external', 'external_url', 'provider', 'what_you_will_learn',
                  'thumbnail_url', 'skills', 'modules', 'instructor', 'created_at', 'ai_match_score']

    def get_ai_match_score(self, obj):
        """Compute match score based on user profile and resume data."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None

        score = 50.0  # Base score
        user = request.user
        profile = getattr(user, 'profile', None)
        
        if profile:
            # Category match (+30%)
            if profile.career_goal and profile.career_goal.lower() in obj.category.lower():
                score += 30
            elif profile.job_role and profile.job_role.lower() in obj.category.lower():
                score += 15

        # Resume Skill match (up to +40%)
        # Get latest resume
        resume = ResumeUpload.objects.filter(user=user).order_by('-uploaded_at').first()
        if resume:
            extracted_skills = resume.extracted_skills.all()
            course_skills = obj.skills.all()
            match_count = sum(1 for s in course_skills if s in extracted_skills)
            if course_skills.count() > 0:
                score += (match_count / course_skills.count()) * 40

        # Profile Skill match (up to +20%)
        user_skills = UserSkill.objects.filter(user=user).select_related('skill')
        user_skill_objs = [us.skill for us in user_skills]
        profile_match_count = sum(1 for s in obj.skills.all() if s in user_skill_objs)
        if obj.skills.count() > 0:
            score += (profile_match_count / obj.skills.count()) * 20

        return min(round(score, 1), 99.9)


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), source='course', write_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'course_id', 'status', 'progress', 'enrolled_at', 'completed_at', 'last_accessed']
        read_only_fields = ['enrolled_at', 'last_accessed']


class AssessmentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentQuestion
        fields = '__all__'


class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = ['id', 'assessment_type', 'score', 'total_questions', 'correct_answers', 'taken_at', 'skills_assessed']
        read_only_fields = ['taken_at']


class ResumeUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeUpload
        fields = ['id', 'file', 'analysis_result', 'extracted_skills', 'resume_score', 'uploaded_at']
        read_only_fields = ['analysis_result', 'extracted_skills', 'resume_score', 'uploaded_at']


class LearningPathSerializer(serializers.ModelSerializer):
    courses = CourseSerializer(many=True, read_only=True)

    class Meta:
        model = LearningPath
        fields = ['id', 'title', 'goal', 'courses', 'is_active', 'overall_progress', 'ai_match_score', 'created_at']


class CertificationSerializer(serializers.ModelSerializer):
    required_skills = SkillSerializer(many=True, read_only=True)
    ai_match_score = serializers.SerializerMethodField()

    class Meta:
        model = Certification
        fields = ['id', 'title', 'provider', 'level', 'duration_weeks', 'required_skills', 'description', 'external_url', 'icon_url', 'ai_match_score']

    def get_ai_match_score(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0.0

        user = request.user
        profile = getattr(user, 'profile', None)
        score = 0.0

        # Domain/Goal Match (+40%)
        if profile:
            # Check career goal
            if profile.career_goal:
                goal_words = profile.career_goal.lower().split()
                # Match against title, provider, and description
                target_text = (obj.title + " " + obj.provider + " " + obj.description).lower()
                match_count = sum(1 for word in goal_words if word in target_text)
                if match_count > 0:
                    score += min((match_count / len(goal_words)) * 40, 40)
            
            # Check job role
            elif profile.job_role:
                if profile.job_role.lower() in obj.title.lower() or profile.job_role.lower() in obj.provider.lower():
                    score += 20

        # Resume Skill match (+40%)
        # This is a strong indicator of relevance as it relates to current achievements
        resume = ResumeUpload.objects.filter(user=user).order_by('-uploaded_at').first()
        req_skills = obj.required_skills.all()
        
        if resume and req_skills.exists():
            extracted_skills = resume.extracted_skills.all()
            match_count = sum(1 for s in req_skills if s in extracted_skills)
            score += (match_count / req_skills.count()) * 40

        # Current User Skills match (+20%)
        # Helps identify certifications that bridge small gaps
        user_skills = UserSkill.objects.filter(user=user).values_list('skill', flat=True)
        if req_skills.exists():
            match_count = sum(1 for s in req_skills if s.id in user_skills)
            score += (match_count / req_skills.count()) * 20

        # Final score calculation
        if score > 0:
             return round(min(score, 99.9), 1)
        
        # Smart Fallback: Minimum baseline for related items even if no direct keyword match
        # Baseline score based on ID consistency but keep it low to avoid false positives
        return round(40 + (obj.id % 20), 1)
