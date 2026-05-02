import google.generativeai as genai
import os
import json

class GeminiResumeAnalyzer:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def analyze_resume(self, text, available_skills=None):
        skill_context = f"Please prioritize mapping identified skills to these existing database skills if they match: {', '.join(available_skills)}" if available_skills else ""
        
        prompt = f"""
        You are an expert HR recruiter and career coach. Analyze the following resume text and provide a structured JSON response.
        
        Resume Text:
        {text}
        
        {skill_context}
        
        Requirements for the JSON response:
        1. "name": The candidate's name.
        2. "experience_years": Estimated years of experience as an integer.
        3. "extracted_skills": A list of technical skills found in the resume. (Use the names from the provided database list where applicable).
        4. "skill_gaps": A list of missing skills that are currently high-demand for the roles this candidate seems interested in. (Preferably using names from the database list).
        5. "resume_score": A score from 0-100 indicating the quality of the resume.
        6. "suggestions": A list of actionable items to improve the resume.
        7. "seniority_level": One of "Junior", "Mid-Level", "Senior", or "Expert".
        
        Return ONLY the JSON. Do not include markdown formatting or extra text.
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Remove potential markdown formatting if Gemini includes it
            cleaned_response = response.text.strip('`').replace('json\n', '', 1).strip()
            return json.loads(cleaned_response)
        except Exception as e:
            print(f"Gemini Analysis Error: {str(e)}")
            return None

    def generate_assessment_questions(self, domain, available_skills=None):
        skill_context = f"Use these specific skills for reference if possible: {', '.join(available_skills)}" if available_skills else ""
        
        prompt = f"""
        Generate 20 unique and high-quality Multiple Choice Questions (MCQs) strictly for the domain: "{domain}".
        
        {skill_context}
        
        GOAL: Create a rigorous assessment where the user cannot 'guess' the answer based on patterns.
        
        CRITICAL RULES FOR OPTIONS & SKILLS:
        1. PLAUSIBILITY: Distractors must be EXTREMELY plausible.
        2. UNIFORM LENGTH: All 4 options MUST have almost identical character counts (±10% variance).
        3. GRANULAR SKILLS (MANDATORY): The "skill" field MUST be a specific technical concept, command, or feature.
           - FORBIDDEN SKILLS (Too Broad): "{domain}", "System Design", "AWS", "Google Cloud", "Kubernetes", "Docker", "Web Development".
           - GOOD SKILLS (Granular): "Horizontal Pod Autoscaling", "Dockerfile Multi-stage Builds", "TCP/IP Handshake", "CSS Flexbox Alignment".
           - Every question must have a unique, specific sub-topic.
        4. TRUE RANDOMIZATION: Distribute correct answers (0-3) strictly 5/5/5/5 across the 20 questions.
        
        Requirements for the JSON response:
        1. "question_text": The question.
        2. "option_a", "option_b", "option_c", "option_d": Four distinct options.
        3. "correct_option": Integer 0-3.
        4. "difficulty": "beginner/intermediate/advanced".
        5. "skill": A specific MULTI-WORD sub-topic phrase (e.g., "Python Decorators", "React Context API", "NumPy Matrix Multiplication"). DO NOT use broad names like "{domain}" or "General". 
        
        CRITICAL: All 4 options MUST be of similar length to avoid patterns. Distribute correct indices evenly.
        """
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text
            
            # Robust JSON extraction using regex
            import re
            json_match = re.search(r'\[.*\]', text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                return json.loads(json_str)
                
            cleaned_response = text.strip('`').replace('json\n', '', 1).strip()
            return json.loads(cleaned_response)
        except Exception as e:
            print(f"Gemini Question Generation Error: {str(e)}")
            return None

    def validate_and_generate_report(self, domain, user_submission):
        prompt = f"""
        You are the Technical Lead Auditor for "{domain}". Generate a pinpoint accurate performance report.
        
        Submission Data:
        {json.dumps(user_submission)}
        
        STRICT REPORTING CONSTRAINTS:
        1. NO SINGLE-WORD SKILLS: "strengths" and "gaps" MUST NOT contain single words like "Docker", "AWS", "Kubernetes", "Java", or "{domain}".
        2. MANDATORY PHRASES: Every strength and gap MUST be a specific technical phrase (e.g., "Docker Multi-stage Builds", "K8s Horizontal Pod Autoscaling", "AWS IAM Policy Logic").
        3. QUESTION-BASED DISCOVERY: Do not trust the category tags in the submission. Read the "question" text for every item and identify the specific sub-topic being tested.
        4. ZERO-DOMAIN POLICY: If you use the word "{domain}" as a skill, the report is invalid.
        
        Requirements for the JSON response:
        1. "score_percentage": (correct_count / total) * 100.
        2. "correct_count": integer.
        3. "incorrect_count": integer.
        4. "strengths": List of SPECIFIC multi-word technical topics mastered.
        5. "gaps": List of SPECIFIC multi-word technical topics missing.
        6. "ai_recommendations": Objects mapping to the granular gaps.
        7. "feedback": Professional analysis.
        
        Return ONLY the JSON. No markdown.
        """
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text
            
            # Robust JSON extraction using regex
            import re
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                return json.loads(json_str)
            
            # Fallback to old cleaning if regex fails
            cleaned_response = text.strip('`').replace('json\n', '', 1).strip()
            return json.loads(cleaned_response)
        except Exception as e:
            print(f"CRITICAL Gemini Validation Error: {str(e)}")
            if hasattr(response, 'text'):
                print(f"Raw Response: {response.text}")
            return None

    def generate_narrative_feedback(self, report_data):
        """Generate only the narrative feedback and course recommendations. Skill names are NOT determined here."""
        domain = report_data.get('domain', '')
        score = report_data.get('score', 0)
        strengths = report_data.get('strengths', [])
        gaps = report_data.get('gaps', [])

        prompt = f"""
        A student completed a "{domain}" assessment and scored {score}%.

        Topics they demonstrated strength in: {json.dumps(strengths)}
        Topics they need to improve: {json.dumps(gaps)}

        Provide a JSON response with ONLY these two fields:
        1. "feedback": A 2-sentence encouraging and honest professional analysis of their performance.
        2. "ai_recommendations": A list of 2-3 objects, each with "title", "reason", and "type" (course or certification), to help them address their gaps.

        Return ONLY the JSON object. No markdown.
        """

        try:
            response = self.model.generate_content(prompt)
            text = response.text
            import re
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            cleaned = text.strip('`').replace('json\n', '', 1).strip()
            return json.loads(cleaned)
        except Exception as e:
            print(f"Narrative Feedback Error: {str(e)}")
            return None

    def generate_free_courses(self, skill_name, domain=None):
        domain_context = f" in the context of {domain}" if domain else ""
        prompt = f"""
        Find 3 high-quality, completely FREE online courses STRICTLY for learning EXACTLY "{skill_name}"{domain_context}.
        The courses MUST be entirely focused on "{skill_name}". Do not provide general courses (e.g. if the skill is AWS, DO NOT provide Docker or Kubernetes courses, ONLY AWS courses).
        These MUST be real, highly-rated free courses from platforms like YouTube, Coursera (free audit/versions), freeCodeCamp, Udemy (free courses), etc.
        
        Return ONLY a JSON array of objects, with no markdown. Each object MUST have:
        - "title": Course title
        - "description": Short 1-2 sentence description
        - "what_you_will_learn": An array of 4 short strings detailing the learning objectives
        - "provider": e.g., "YouTube", "Coursera", "freeCodeCamp"
        - "external_url": A plausible/real URL to the course
        - "duration_hours": Estimated hours to complete (float)
        - "level": One of "beginner", "intermediate", "advanced"
        - "rating": Float between 4.0 and 5.0
        """
        try:
            response = self.model.generate_content(prompt)
            text = response.text
            print("DEBUG GEMINI RESPONSE:", text)
            import re
            json_match = re.search(r'\[.*\]', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            cleaned = text.strip('`').replace('json\n', '', 1).strip()
            return json.loads(cleaned)
        except Exception as e:
            print(f"Course Generation Error: {str(e)}")
            return []
    def generate_learning_path_with_phases(self, goal):
        prompt = f"""
        Generate a 3-phase structured learning roadmap for a student who wants to: "{goal}".
        Each phase should have exactly 1 or 2 high-quality courses.
        
        The phases must be strictly relevant to mastering "{goal}". 
        For example, if the goal is "Master FastAPI", Phase 1 should be "FastAPI Basics", Phase 2 "Advanced FastAPI", etc.
        DO NOT include unrelated topics like "General Web Development" or "Data Science" unless they are directly required for "{goal}".
        
        Return ONLY a JSON array of objects representing the curriculum modules.
        Each object must have:
        - "phase_title": The name of this phase (e.g., "FastAPI Fundamentals")
        - "courses": An array of course objects, each with:
            - "title": Specific course title
            - "description": Short description
            - "level": "beginner", "intermediate", or "advanced"
            - "provider": "YouTube", "freeCodeCamp", or "Coursera"
            - "duration_hours": Number
            
        Return ONLY the JSON array.
        """
        try:
            response = self.model.generate_content(prompt)
            import re
            json_match = re.search(r'\[.*\]', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return []
        except Exception as e:
            print(f"Path Generation Error: {str(e)}")
            return []
    def generate_industry_certifications(self, goal):
        prompt = f"""
        Identify 3 globally recognized professional certifications for: "{goal}".
        Return ONLY a JSON array of objects.
        
        CRITICAL REQUIREMENTS:
        1. "title": Must be the EXACT official certification name (e.g., "AWS Certified Developer – Associate"). No long sentences.
        2. "provider": The organization (e.g., "Amazon Web Services", "Microsoft", "Google").
        3. "external_url": MUST be the direct official credential or exam page. DO NOT provide search results.
        4. "description": 1-2 sentences on career impact.
        
        Example:
        {{
            "title": "AWS Certified Solutions Architect – Associate",
            "provider": "AWS",
            "external_url": "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
            "level": "Intermediate",
            "duration_weeks": 8,
            "description": "The gold standard for cloud architecture roles."
        }}
        
        Return ONLY the JSON array.
        """
        try:
            response = self.model.generate_content(prompt)
            import re
            json_match = re.search(r'\[.*\]', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return []
        except Exception:
            return []
