import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smartlearn_backend.settings")
django.setup()

from api.gemini_utils import GeminiResumeAnalyzer
from api.models import Certification

goal = "Full Stack Developer"
print(f"Generating certs for: {goal}...")
analyzer = GeminiResumeAnalyzer()
certs_data = analyzer.generate_industry_certifications(goal)
print("DATA RECEIVED:", certs_data)

if certs_data:
    for cert in certs_data:
        obj, created = Certification.objects.get_or_create(
            title=cert.get('title'),
            defaults={
                'provider': cert.get('provider', 'Industry Standard'),
                'level': cert.get('level', 'Intermediate'),
                'duration_weeks': cert.get('duration_weeks', 8),
                'description': cert.get('description', ''),
            }
        )
        print(f"CERT: {obj.title} (Created: {created})")
else:
    print("NO DATA GENERATED")
