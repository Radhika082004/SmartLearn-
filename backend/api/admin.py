from django.contrib import admin
from .models import UserProfile, Skill, UserSkill, Course, Enrollment, Assessment, ResumeUpload, LearningPath, Certification, AssessmentQuestion


admin.site.register(AssessmentQuestion)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'job_role', 'career_goal', 'learning_streak', 'total_hours']
    search_fields = ['user__username', 'user__email', 'job_role']


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category']
    search_fields = ['name', 'category']


@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ['user', 'skill', 'level', 'proficiency']
    list_filter = ['level']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'level', 'rating', 'is_free', 'student_count']
    list_filter = ['category', 'level', 'is_free']
    search_fields = ['title', 'description']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'status', 'progress', 'enrolled_at']
    list_filter = ['status']


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'assessment_type', 'score', 'total_questions', 'taken_at']


@admin.register(ResumeUpload)
class ResumeUploadAdmin(admin.ModelAdmin):
    list_display = ['user', 'resume_score', 'uploaded_at']


@admin.register(LearningPath)
class LearningPathAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'goal', 'overall_progress', 'is_active']


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'provider', 'level', 'duration_weeks']
    search_fields = ['title', 'provider']
