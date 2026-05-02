import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smartlearn_backend.settings")
django.setup()

from api.gemini_utils import GeminiResumeAnalyzer
from api.models import Course, Skill
from django.db import models as dm

search = "System Design"
domain = None
analyzer = GeminiResumeAnalyzer()
try:
    suggestions = analyzer.generate_free_courses(search, domain)
    print("Suggestions found:", bool(suggestions))
    if suggestions:
        skill_obj, _ = Skill.objects.get_or_create(name=search.title())
        print("Skill:", skill_obj.name)
        for entry in suggestions:
            course, created = Course.objects.get_or_create(
                title=entry.get('title'),
                defaults={
                    'description': entry.get('description', ''),
                    'is_free': True,
                    'is_external': True,
                    'external_url': entry.get('external_url', ''),
                    'provider': entry.get('provider', 'External'),
                    'what_you_will_learn': entry.get('what_you_will_learn', []),
                    'duration_hours': float(entry.get('duration_hours', 1.0)),
                    'level': entry.get('level', 'beginner').lower(),
                    'rating': float(entry.get('rating', 4.5)),
                    'category': domain or 'General'
                }
            )
            course.skills.add(skill_obj)
            print("Created course:", course.title, "Is external:", course.is_external, "Free:", course.is_free, "Skills:", [s.name for s in course.skills.all()])

        qs = Course.objects.filter(dm.Q(title__icontains=search) | dm.Q(skills__name__icontains=search)).filter(is_free=True).distinct()
        print("Final QS count:", qs.count())
except Exception as e:
    print("Exception!!", e)
