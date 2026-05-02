import os
import django
import google.generativeai as genai

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smartlearn_backend.settings")
django.setup()

api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=api_key)

for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)
