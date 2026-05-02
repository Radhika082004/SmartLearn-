import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smartlearn_backend.settings")
django.setup()

from api.gemini_utils import GeminiResumeAnalyzer
from api.models import Course, Skill

analyzer = GeminiResumeAnalyzer()
try:
    res = analyzer.generate_free_courses("Python")
    print("Generated:", res)
except Exception as e:
    import traceback
    traceback.print_exc()
