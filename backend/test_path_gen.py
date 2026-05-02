import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smartlearn_backend.settings")
django.setup()

from api.gemini_utils import GeminiResumeAnalyzer
analyzer = GeminiResumeAnalyzer()
goal = "Master System Design"
curriculum = analyzer.generate_learning_path_with_phases(goal)
print("GOAL:", goal)
print("CURRICULUM:", curriculum)
