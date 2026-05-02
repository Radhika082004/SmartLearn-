import os
import django
import urllib.parse

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smartlearn_backend.settings")
django.setup()

from api.models import Certification

certs = Certification.objects.filter(external_url='')
print(f"Found {certs.count()} certifications with missing URLs.")

for c in certs:
    search_q = urllib.parse.quote(f"{c.title} {c.provider} official certification page")
    c.external_url = f"https://www.google.com/search?q={search_q}"
    c.save()
    print(f"Fixed: {c.title}")

print("Database repair complete.")
