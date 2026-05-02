import urllib.request
import urllib.parse
import re

def get_real_youtube_url(course_title):
    try:
        query = urllib.parse.quote(f"{course_title} full course tutorial")
        url = f"https://www.youtube.com/results?search_query={query}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'})
        html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8')
        
        # Method 2: Look for videoId in the JSON blob inside HTML
        video_ids = re.findall(r'"videoId":"([^"]{11})"', html)
        if video_ids:
            # Filter out known non-video IDs if any, or just take the first
            return f"https://www.youtube.com/watch?v={video_ids[0]}"
            
        # Method 1 (Fallback): Original regex
        video_ids = re.findall(r"watch\?v=([a-zA-Z0-9_-]{11})", html)
        if video_ids:
            return f"https://www.youtube.com/watch?v={video_ids[0]}"
    except Exception as e:
        print("ERROR:", e)
    return None

print("python tutorial:", get_real_youtube_url("python tutorial"))
print("node.js tutorial:", get_real_youtube_url("node.js tutorial"))
