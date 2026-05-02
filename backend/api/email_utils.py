"""
SmartLearn Email Utility
Sends beautifully designed HTML emails for registration and Google login events.
"""

import threading
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


# ─────────────────────────── HTML TEMPLATES ───────────────────────────

def _base_html(content_html: str, preheader: str = "") -> str:
    """Wrap content in a full branded HTML email shell."""
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SmartLearn</title>
</head>
<body style="margin:0;padding:0;background-color:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
  <!-- Preheader (hidden preview text) -->
  <span style="display:none;max-height:0;overflow:hidden;">{preheader}</span>

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%);padding:40px 48px;text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                ⚡ SmartLearn
              </div>
              <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:6px;letter-spacing:1px;text-transform:uppercase;">
                AI-Powered Learning Platform
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#1a1d27;padding:48px;">
              {content_html}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#13151f;padding:24px 48px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;font-size:12px;color:#4b5563;">
                © 2025 SmartLearn · AI-Powered Learning Platform
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#374151;">
                You received this email because an action was performed on your SmartLearn account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def _cta_button(text: str, url: str) -> str:
    return f"""
<table cellpadding="0" cellspacing="0" style="margin:32px 0;">
  <tr>
    <td style="border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);">
      <a href="{url}"
         style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;
                color:#ffffff;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">
        {text} →
      </a>
    </td>
  </tr>
</table>
"""


# ─────────────────────────── EMAIL BUILDERS ───────────────────────────

def _build_welcome_email(user) -> tuple[str, str, str]:
    """Returns (subject, plain_text, html) for registration welcome."""
    first_name = user.first_name or user.username
    dashboard_url = "http://localhost:3000/dashboard"

    subject = "🎉 Welcome to SmartLearn — Your AI Learning Journey Starts Now!"

    plain = f"""
Hi {first_name},

Welcome to SmartLearn! 🚀

Your account has been successfully created. You're now part of a community of learners using AI to accelerate their careers.

Here's what you can do next:
  • Complete your profile and set your career goal
  • Take a skill assessment to discover your strengths
  • Explore AI-recommended courses and certifications
  • Upload your resume for personalized insights

Get started: {dashboard_url}

Happy learning!
The SmartLearn Team
"""

    content_html = f"""
<h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;">
  Welcome to SmartLearn! 🎉
</h1>
<p style="margin:0 0 24px;font-size:15px;color:#9ca3af;line-height:1.6;">
  Hi <strong style="color:#a78bfa;">{first_name}</strong>, your account has been successfully created.
  You're now part of an AI-powered learning community.
</p>

<div style="background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1));
            border:1px solid rgba(139,92,246,0.25);border-radius:12px;padding:24px;margin:24px 0;">
  <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#a78bfa;text-transform:uppercase;letter-spacing:1px;">
    🚀 What's Next
  </p>
  <table cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding:8px 0;">
        <span style="color:#6366f1;font-weight:700;margin-right:10px;">01</span>
        <span style="color:#d1d5db;font-size:14px;">Complete your profile &amp; set your career goal</span>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 0;">
        <span style="color:#6366f1;font-weight:700;margin-right:10px;">02</span>
        <span style="color:#d1d5db;font-size:14px;">Take a skill assessment to find your strengths</span>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 0;">
        <span style="color:#6366f1;font-weight:700;margin-right:10px;">03</span>
        <span style="color:#d1d5db;font-size:14px;">Explore AI-recommended courses &amp; certifications</span>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 0;">
        <span style="color:#6366f1;font-weight:700;margin-right:10px;">04</span>
        <span style="color:#d1d5db;font-size:14px;">Upload your resume for personalized insights</span>
      </td>
    </tr>
  </table>
</div>

{_cta_button("Go to My Dashboard", dashboard_url)}

<p style="margin:24px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
  If you didn't create this account, please ignore this email or 
  <a href="mailto:radhikashrotriya2004@gmail.com" style="color:#8b5cf6;">contact support</a>.
</p>
"""

    html = _base_html(content_html, preheader=f"Hi {first_name}, welcome to SmartLearn! Your AI learning journey begins today.")
    return subject, plain, html


def _build_google_login_email(user, is_new_user: bool) -> tuple[str, str, str]:
    """Returns (subject, plain_text, html) for Google login notification."""
    first_name = user.first_name or user.username
    dashboard_url = "http://localhost:3000/dashboard"
    from django.utils import timezone
    # localtime() converts to the timezone defined in settings (Asia/Kolkata)
    login_time = timezone.localtime().strftime("%B %d, %Y at %I:%M %p IST")

    if is_new_user:
        subject = "🎉 Welcome to SmartLearn — Account Created via Google"
        headline = "Account Created with Google! 🎉"
        sub_text = f"Hi <strong style=\"color:#a78bfa;\">{first_name}</strong>, your SmartLearn account has been created using your Google account. You're all set to start learning!"
    else:
        subject = "✅ Successful Sign-In to SmartLearn"
        headline = "Sign-In Successful ✅"
        sub_text = f"Hi <strong style=\"color:#a78bfa;\">{first_name}</strong>, you have successfully signed in to SmartLearn using your Google account."

    plain = f"""
Hi {first_name},

{"Your SmartLearn account was just created" if is_new_user else "You just signed in"} using Google Sign-In.

Account: {user.email}
Time: {login_time}
Method: Google OAuth

{f"Welcome aboard! Get started at: {dashboard_url}" if is_new_user else f"Access your dashboard at: {dashboard_url}"}

If this wasn't you, please contact support immediately.

The SmartLearn Team
"""

    content_html = f"""
<h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;">
  {headline}
</h1>
<p style="margin:0 0 24px;font-size:15px;color:#9ca3af;line-height:1.6;">
  {sub_text}
</p>

<div style="background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.2);
            border-radius:12px;padding:24px;margin:24px 0;">
  <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#10b981;text-transform:uppercase;letter-spacing:1px;">
    🔐 Sign-In Details
  </p>
  <table cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding:6px 0;color:#6b7280;font-size:13px;width:120px;">Account</td>
      <td style="padding:6px 0;color:#e5e7eb;font-size:13px;font-weight:600;">{user.email}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#6b7280;font-size:13px;">Time</td>
      <td style="padding:6px 0;color:#e5e7eb;font-size:13px;">{login_time}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#6b7280;font-size:13px;">Method</td>
      <td style="padding:6px 0;">
        <span style="display:inline-block;background:rgba(99,102,241,0.15);color:#a78bfa;
                     font-size:12px;font-weight:700;padding:2px 10px;border-radius:20px;">
          Google OAuth
        </span>
      </td>
    </tr>
  </table>
</div>

{_cta_button("Go to My Dashboard", dashboard_url)}

<div style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);
            border-radius:10px;padding:16px;margin-top:24px;">
  <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
    ⚠️ <strong style="color:#f87171;">Wasn't you?</strong> 
    If you did not sign in, please 
    <a href="mailto:radhikashrotriya2004@gmail.com" style="color:#f87171;">contact support</a>
    immediately to secure your account.
  </p>
</div>
"""

    html = _base_html(content_html, preheader=f"{'Account created' if is_new_user else 'Successful sign-in'} via Google — {login_time}")
    return subject, plain, html


# ─────────────────────────── SEND HELPERS ───────────────────────────

def _send_email(to_email: str, subject: str, plain: str, html: str):
    """Low-level send using Django's mail backend."""
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )
        msg.attach_alternative(html, "text/html")
        msg.send(fail_silently=False)
        print(f"[SmartLearn Email] ✅ Sent '{subject}' to {to_email}")
    except Exception as e:
        print(f"[SmartLearn Email] ❌ Failed to send to {to_email}: {e}")


def _send_in_background(to_email: str, subject: str, plain: str, html: str):
    """Send email in a daemon thread so it never blocks the HTTP response."""
    t = threading.Thread(
        target=_send_email,
        args=(to_email, subject, plain, html),
        daemon=True
    )
    t.start()


# ─────────────────────────── PUBLIC API ───────────────────────────

def send_welcome_email(user):
    """Call after successful registration."""
    if not user.email:
        return
    subject, plain, html = _build_welcome_email(user)
    _send_in_background(user.email, subject, plain, html)


def send_google_login_email(user, is_new_user: bool = False):
    """Call after successful Google OAuth login."""
    if not user.email:
        return
    subject, plain, html = _build_google_login_email(user, is_new_user)
    _send_in_background(user.email, subject, plain, html)
