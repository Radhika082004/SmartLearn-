import urllib.request
import urllib.parse
import re

query = urllib.parse.quote("Python full course freecodecamp")
url = f"https://www.youtube.com/results?search_query={query}"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    video_ids = re.findall(r"watch\?v=(\S{11})", html)
    if video_ids:
        print("FOUND VIDEO:", video_ids[0])
    else:
        print("NO VIDEO FOUND")
except Exception as e:
    print("ERROR", e)
