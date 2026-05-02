from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """Extended user profile with skills and career goals."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    job_role = models.CharField(max_length=200, blank=True)
    career_goal = models.CharField(max_length=200, blank=True)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    learning_streak = models.IntegerField(default=0)
    total_hours = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class Skill(models.Model):
    """Skills database."""
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class UserSkill(models.Model):
    """Many-to-many between users and skills with proficiency levels."""
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    proficiency = models.IntegerField(default=0)  # 0-100
    assessed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'skill']

    def __str__(self):
        return f"{self.user.username} - {self.skill.name} ({self.proficiency}%)"


class Course(models.Model):
    """Course catalog."""
    LEVEL_CHOICES = [('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')]
    title = models.CharField(max_length=300)
    description = models.TextField()
    category = models.CharField(max_length=100)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    duration_hours = models.FloatField(default=0)
    rating = models.FloatField(default=0.0)
    review_count = models.IntegerField(default=0)
    student_count = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    is_free = models.BooleanField(default=False)
    is_external = models.BooleanField(default=False)
    external_url = models.URLField(blank=True)
    provider = models.CharField(max_length=100, blank=True)
    thumbnail_url = models.URLField(blank=True)
    skills = models.ManyToManyField(Skill, blank=True)
    instructor = models.CharField(max_length=200, blank=True)
    what_you_will_learn = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class CourseModule(models.Model):
    """A module/section within a course."""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=300)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lesson(models.Model):
    """An individual video lesson or reading inside a module."""
    module = models.ForeignKey(CourseModule, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=300)
    order = models.IntegerField(default=0)
    duration_minutes = models.IntegerField(default=0)
    video_url = models.URLField(blank=True)
    is_preview = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class Enrollment(models.Model):
    """User course enrollments with progress tracking."""
    STATUS_CHOICES = [('enrolled', 'Enrolled'), ('in_progress', 'In Progress'), ('completed', 'Completed')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')
    progress = models.IntegerField(default=0)  # 0-100
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user.username} → {self.course.title} ({self.progress}%)"


class Assessment(models.Model):
    """Skill assessment records."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessments')
    assessment_type = models.CharField(max_length=100)
    score = models.FloatField()
    total_questions = models.IntegerField()
    correct_answers = models.IntegerField()
    taken_at = models.DateTimeField(auto_now_add=True)
    skills_assessed = models.ManyToManyField(Skill, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.assessment_type} ({self.score}%)"


class AssessmentQuestion(models.Model):
    """Questions for skill assessments."""
    DOMAIN_CHOICES = [
        ('web', 'Web Development'),
        ('ds', 'Data Science'),
        ('ai', 'AI/ML'),
        ('devops', 'DevOps'),
        ('dsa', 'DSA & Algorithms'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    question_text = models.TextField()
    option_a = models.CharField(max_length=500)
    option_b = models.CharField(max_length=500)
    option_c = models.CharField(max_length=500)
    option_d = models.CharField(max_length=500)
    correct_option = models.IntegerField(help_text="0 for A, 1 for B, 2 for C, 3 for D")
    domain = models.CharField(max_length=20, choices=DOMAIN_CHOICES)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='intermediate')
    skill = models.ForeignKey(Skill, on_delete=models.SET_NULL, null=True, blank=True, related_name='questions')

    def __str__(self):
        return f"[{self.domain}] {self.question_text[:50]}..."


class ResumeUpload(models.Model):
    """Resume uploads and analysis results."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to='resumes/')
    analysis_result = models.JSONField(null=True, blank=True)
    extracted_skills = models.ManyToManyField(Skill, blank=True)
    resume_score = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Resume ({self.uploaded_at.date()})"


class LearningPath(models.Model):
    """Personalized learning paths."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learning_paths')
    title = models.CharField(max_length=300)
    goal = models.CharField(max_length=200)
    courses = models.ManyToManyField(Course, blank=True)
    is_active = models.BooleanField(default=True)
    overall_progress = models.IntegerField(default=0)
    ai_match_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class Certification(models.Model):
    """Available certifications."""
    title = models.CharField(max_length=300)
    provider = models.CharField(max_length=200)
    level = models.CharField(max_length=100)
    duration_weeks = models.IntegerField(default=0)
    required_skills = models.ManyToManyField(Skill, blank=True)
    description = models.TextField(blank=True)
    external_url = models.URLField(blank=True)
    icon_url = models.URLField(blank=True)

    def __str__(self):
        return f"{self.title} by {self.provider}"


class DailyStudyTime(models.Model):
    """Tracks hours spent learning per day per user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_times')
    date = models.DateField(default=models.functions.Now())
    hours = models.FloatField(default=0.0)

    class Meta:
        unique_together = ['user', 'date']

    def __str__(self):
        return f"{self.user.username} - {self.date}: {self.hours}h"
