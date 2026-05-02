from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # ── Authentication ──
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/google/', views.GoogleLoginView.as_view(), name='google-login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ── Profile ──
    path('profile/', views.ProfileView.as_view(), name='profile'),

    # ── Skills ──
    path('skills/', views.SkillListView.as_view(), name='skills-list'),
    path('skills/mine/', views.UserSkillsView.as_view(), name='my-skills'),

    # ── Courses ──
    path('courses/', views.CourseListView.as_view(), name='courses-list'),
    path('courses/<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),

    # ── Enrollments ──
    path('enrollments/', views.EnrollmentView.as_view(), name='enrollments'),
    path('enrollments/<int:pk>/', views.EnrollmentView.as_view(), name='enrollment-detail'),

    # ── Assessments ──
    path('assessments/', views.AssessmentView.as_view(), name='assessments'),

    # ── Resume ──
    path('resume/upload/', views.ResumeUploadView.as_view(), name='resume-upload'),

    # ── Learning Path ──
    path('learning-path/', views.LearningPathView.as_view(), name='learning-path'),

    # ── Certifications ──
    path('certifications/', views.CertificationListView.as_view(), name='certifications'),

    # ── Dashboard ──
    path('dashboard/', views.dashboard_stats, name='dashboard-stats'),
]
