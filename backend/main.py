import os, random, string, hashlib, hmac
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import redis
import httpx
import bcrypt
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

load_dotenv()

# Config 
REDIS_URL        = os.getenv("REDIS_URL",        "redis://localhost:6379")
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
FROM_EMAIL       = os.getenv("FROM_EMAIL",       "noreply@evaerahealth.in")
FROM_NAME        = os.getenv("FROM_NAME",        "EvaEraHealth")
SUPABASE_URL     = os.getenv("SUPABASE_URL",     "")
SUPABASE_KEY     = os.getenv("SUPABASE_KEY",     "")

ADMIN_OTP_RATE_LIMIT    = 3    # max 3 OTP requests per 15 min
ADMIN_OTP_RATE_WINDOW   = 900  # 15 min in seconds
ADMIN_OTP_TTL           = 300  # 5 min OTP expiry
ADMIN_RESEND_COOLDOWN   = 30   # 30 sec between resends

# Redis 
r = redis.from_url(REDIS_URL, decode_responses=True)

# App 
app = FastAPI(title="EvaEraHealth API", version="7.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Schemas

class SendOTPRequest(BaseModel):
    identifier: str
    portal: str = "patient"

class VerifyOTPRequest(BaseModel):
    identifier: str
    otp: str

class SendReportRequest(BaseModel):
    email: str
    name: str
    composite: int
    band: str
    scores: dict
    triage: list
    ai_message: Optional[str] = ""

class AdminLoginStep1Request(BaseModel):
    email: str
    password: str

class AdminOTPVerifyRequest(BaseModel):
    email: str
    otp: str

class AdminResendOTPRequest(BaseModel):
    email: str


# Supabase Helpers

def supabase_headers():
    return {
        "apikey":        SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type":  "application/json",
        "Prefer":        "return=minimal"
    }


def get_admin_from_db(email: str):
    try:
        response = httpx.get(
            f"{SUPABASE_URL}/rest/v1/admins",
            headers={
                "apikey":        SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type":  "application/json"
            },
            params={
                "email":     f"eq.{email.strip().lower()}",
                "is_active": "eq.true",
                "select":    "id,email,password_hash,full_name,is_active"
            },
            timeout=5
        )
        print(f"[Supabase] Admin fetch status: {response.status_code}")
        if response.status_code != 200:
            return None
        data = response.json()
        if not data or len(data) == 0:
            print(f"[Supabase] No admin found for: {email}")
            return None
        return data[0]
    except Exception as e:
        print(f"[Supabase] Admin fetch error: {e}")
        return None


def update_admin_last_login(email: str):
    try:
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc).isoformat()
        httpx.patch(
            f"{SUPABASE_URL}/rest/v1/admins",
            headers=supabase_headers(),
            params={"email": f"eq.{email.strip().lower()}"},
            json={"last_login_at": now},
            timeout=5
        )
        print(f"[Supabase] ✓ last_login_at updated for {email}")
    except Exception as e:
        print(f"[Supabase] last_login update error: {e}")


def log_admin_event(email: str, event: str):
    if not SUPABASE_URL or not SUPABASE_KEY:
        print(f"[Supabase log] Skipped — credentials not set. Event: {event}")
        return
    try:
        response = httpx.post(
            f"{SUPABASE_URL}/rest/v1/admin_login_log",
            headers=supabase_headers(),
            json={"email": email, "event": event},
            timeout=5
        )
        if response.status_code not in (200, 201):
            print(f"[Supabase log] Failed: {response.status_code} {response.text}")
        else:
            print(f"[Supabase log] ✓ '{event}' saved for {email}")
    except Exception as e:
        print(f"[Supabase log error] {e}")


# General Helpers

def generate_otp(length: int = 4) -> str:
    return "".join(random.choices(string.digits, k=length))

def redis_key(identifier: str) -> str:
    return f"evr_otp:{identifier.strip().lower()}"

def is_email(identifier: str) -> bool:
    return "@" in identifier

def admin_otp_key(email: str) -> str:
    return f"evr_admin_otp:{email.strip().lower()}"

def admin_rate_key(email: str) -> str:
    return f"evr_admin_rate:{email.strip().lower()}"

def admin_verified_key(email: str) -> str:
    return f"evr_admin_verified:{email.strip().lower()}"

def admin_cooldown_key(email: str) -> str:
    """30-second cooldown between resend requests."""
    return f"evr_admin_cd:{email.strip().lower()}"

def hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()


# Email — Patient / HCP OTP

def send_email_otp(to_email: str, otp: str, portal: str) -> bool:
    if not SENDGRID_API_KEY:
        print(f"[DEV] Email OTP for {to_email}: {otp}")
        return True
    portal_label = "Clinician Portal" if portal == "hcp" else "Patient Portal"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;border-radius:12px;
                border:1px solid #e5e7eb;overflow:hidden">
      <div style="background:#880E4F;padding:24px;text-align:center">
        <div style="font-size:26px;color:#fff;font-weight:800">🌸 EvaEraHealth</div>
        <div style="color:rgba(255,255,255,.7);font-size:12px;margin-top:4px">{portal_label}</div>
      </div>
      <div style="padding:28px;background:#fff">
        <p style="margin:0 0 8px;font-size:14px;color:#374151">Your one-time password is:</p>
        <div style="letter-spacing:10px;font-size:36px;font-weight:900;color:#880E4F;
                    text-align:center;padding:16px 0">{otp}</div>
        <p style="font-size:12px;color:#9ca3af;margin:16px 0 0">
          Valid for 5 minutes. Single use only.<br>
          If you did not request this, please ignore this email.
        </p>
      </div>
      <div style="background:#f9fafb;padding:12px;text-align:center;font-size:11px;color:#9ca3af">
        EvaEraHealth Clinic · Gurugram Flagship Center ·
        <a href="mailto:support@evaerahealth.in" style="color:#880E4F">support@evaerahealth.in</a>
      </div>
    </div>"""
    try:
        sg  = SendGridAPIClient(SENDGRID_API_KEY)
        msg = Mail(from_email=(FROM_EMAIL, FROM_NAME), to_emails=to_email,
                   subject=f"Your EvaEraHealth OTP: {otp}", html_content=html)
        res = sg.send(msg)
        return res.status_code in (200, 201, 202)
    except Exception as e:
        print(f"[SendGrid OTP error] {e}")
        return False


# Email — Admin OTP

def send_admin_otp_email(to_email: str, otp: str) -> bool:
    if not SENDGRID_API_KEY:
        print(f"[DEV] ADMIN OTP for {to_email}: {otp}")
        return True
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;border-radius:12px;
                border:2px solid #1E3A5F;overflow:hidden">
      <div style="background:#131F38;padding:24px;text-align:center">
        <div style="font-size:22px;color:#fff;font-weight:800">🔐 EvaEraHealth</div>
        <div style="color:rgba(255,255,255,.6);font-size:12px;margin-top:4px">
          Admin Portal — 2-Factor Authentication
        </div>
      </div>
      <div style="padding:28px;background:#fff">
        <p style="margin:0 0 8px;font-size:14px;color:#374151;font-weight:600">Admin Login OTP</p>
        <p style="font-size:13px;color:#6B7280;margin:0 0 16px">
          Someone (hopefully you) is signing into the EvaEraHealth Admin Portal.
          Use this code to complete login:
        </p>
        <div style="background:#F0F4FF;border:2px dashed #1E3A5F;border-radius:12px;
                    padding:20px;text-align:center;margin-bottom:16px">
          <div style="letter-spacing:12px;font-size:40px;font-weight:900;
                      color:#131F38;font-family:monospace">{otp}</div>
        </div>
        <div style="background:#FFF8E1;border:1px solid #F9A825;border-radius:8px;
                    padding:12px;font-size:12px;color:#5D4037">
          ⚠️ <strong>This code expires in 5 minutes.</strong><br>
          If you did not attempt to log in, your password may be compromised.
          Contact your security team immediately.
        </div>
      </div>
      <div style="background:#f9fafb;padding:12px;text-align:center;font-size:11px;color:#9ca3af">
        EvaEraHealth Admin Portal · Do not share this code with anyone ·
        <a href="mailto:support@evaerahealth.in" style="color:#1E3A5F">support@evaerahealth.in</a>
      </div>
    </div>"""
    try:
        sg  = SendGridAPIClient(SENDGRID_API_KEY)
        msg = Mail(
            from_email=(FROM_EMAIL, FROM_NAME),
            to_emails=to_email,
            subject=f"[EvaEraHealth Admin] Your login OTP: {otp}",
            html_content=html
        )
        res = sg.send(msg)
        return res.status_code in (200, 201, 202)
    except Exception as e:
        print(f"[SendGrid Admin OTP error] {e}")
        return False


# Report Email — paste your existing functions here

def build_report_email(name, composite, band, scores, triage, ai_message):
    pass  # ← paste your existing function body here

def send_report_email(to_email: str, name: str, html_content: str) -> bool:
    pass  # ← paste your existing function body here


# Patient / HCP Routes

@app.post("/send-otp")
def send_otp(body: SendOTPRequest):
    identifier = body.identifier.strip()
    if not identifier:
        raise HTTPException(400, "identifier is required")
    if not is_email(identifier):
        raise HTTPException(400, "Please enter a valid email address")
    otp = generate_otp()
    r.set(redis_key(identifier), otp, ex=300)
    if not send_email_otp(identifier, otp, body.portal):
        raise HTTPException(502, "Failed to send OTP. Please try again.")
    return {"success": True, "message": f"OTP sent to {identifier}"}


@app.post("/verify-otp")
def verify_otp(body: VerifyOTPRequest):
    identifier = body.identifier.strip()
    otp        = body.otp.strip()
    if not identifier or not otp:
        raise HTTPException(400, "identifier and otp are required")
    stored = r.get(redis_key(identifier))
    if stored is None:
        raise HTTPException(404, "OTP expired or already used. Please request a new one.")
    if stored != otp:
        raise HTTPException(401, "Invalid OTP. Please try again.")
    r.delete(redis_key(identifier))
    return {"success": True, "message": "OTP verified successfully"}


@app.post("/resend-otp")
def resend_otp(body: SendOTPRequest):
    identifier = body.identifier.strip()
    if not identifier:
        raise HTTPException(400, "identifier is required")
    if not is_email(identifier):
        raise HTTPException(400, "Please enter a valid email address")
    r.delete(redis_key(identifier))
    otp = generate_otp()
    r.set(redis_key(identifier), otp, ex=300)
    if not send_email_otp(identifier, otp, body.portal):
        raise HTTPException(502, "Failed to send OTP. Please try again.")
    return {"success": True, "message": f"New OTP sent to {identifier}"}


# Admin 2FA Routes

@app.post("/admin/login")
def admin_login_step1(body: AdminLoginStep1Request):
    email = body.email.strip().lower()

    # 1. Fetch admin from Supabase
    admin = get_admin_from_db(email)
    if not admin:
        log_admin_event(email, "step1_fail_email")
        raise HTTPException(401, "Invalid credentials")

    # 2. Verify password
    try:
        password_matches = bcrypt.checkpw(
            body.password.encode(),
            admin["password_hash"].encode()
        )
    except Exception as e:
        print(f"[bcrypt error] {e}")
        password_matches = False

    if not password_matches:
        log_admin_event(email, "step1_fail_password")
        raise HTTPException(401, "Invalid credentials")

    # 3. Rate limit (max 3 per 15 min)
    rate_key   = admin_rate_key(email)
    send_count = r.get(rate_key)
    if send_count and int(send_count) >= ADMIN_OTP_RATE_LIMIT:
        ttl = r.ttl(rate_key)
        log_admin_event(email, "rate_limited")
        raise HTTPException(429, f"Too many OTP requests. Try again in {ttl // 60 + 1} minute(s).")

    # 4. Delete old OTP
    r.delete(admin_otp_key(email))

    # 5. Generate new OTP and store hash
    otp = "".join(random.choices(string.digits, k=6))
    r.set(admin_otp_key(email), hash_otp(otp), ex=ADMIN_OTP_TTL)

    # 6. Mark step-1 passed
    r.set(admin_verified_key(email), "1", ex=600)

    # 7. Set 30 second resend cooldown
    r.set(admin_cooldown_key(email), "1", ex=ADMIN_RESEND_COOLDOWN)

    # 8. Increment rate counter
    pipe = r.pipeline()
    pipe.incr(rate_key)
    pipe.expire(rate_key, ADMIN_OTP_RATE_WINDOW)
    pipe.execute()

    # 9. Send OTP email
    if not send_admin_otp_email(email, otp):
        raise HTTPException(502, "Failed to send OTP email. Please try again.")

    # 10. Log to Supabase
    log_admin_event(email, "otp_sent")

    return {
        "success": True,
        "message": f"OTP sent to {email}. Valid for 5 minutes.",
        "admin_name": admin.get("full_name", "Admin")
    }


@app.post("/admin/verify-otp")
def admin_verify_otp(body: AdminOTPVerifyRequest):
    email = body.email.strip().lower()
    otp   = body.otp.strip()

    if not otp or len(otp) != 6 or not otp.isdigit():
        raise HTTPException(400, "OTP must be 6 digits")

    # Must have completed step-1
    if not r.exists(admin_verified_key(email)):
        raise HTTPException(403, "Please complete email and password verification first.")

    # Get stored hash
    stored_hash = r.get(admin_otp_key(email))
    if stored_hash is None:
        raise HTTPException(404, "OTP expired or already used. Please request a new one.")

    # Compare
    if not hmac.compare_digest(stored_hash, hash_otp(otp)):
        log_admin_event(email, "otp_fail")
        raise HTTPException(401, "Invalid OTP. Please try again.")

    # ✅ Success — clean up all Redis keys
    r.delete(admin_otp_key(email))
    r.delete(admin_verified_key(email))
    r.delete(admin_rate_key(email))
    r.delete(admin_cooldown_key(email))

    # Update last login in Supabase
    update_admin_last_login(email)

    # Log success
    log_admin_event(email, "login_success")

    return {
        "success": True,
        "message": "Admin authenticated successfully.",
        "admin_email": email
    }


@app.post("/admin/resend-otp")
def admin_resend_otp(body: AdminResendOTPRequest):
    email = body.email.strip().lower()

    # Must have completed step-1
    if not r.exists(admin_verified_key(email)):
        raise HTTPException(403, "Please complete email and password verification first.")

    # ── 30 second cooldown check 
    cd_key = admin_cooldown_key(email)
    if r.exists(cd_key):
        ttl = r.ttl(cd_key)
        raise HTTPException(429, f"Please wait {ttl} seconds before requesting a new OTP.")

    # Rate limit (max 3 per 15 min)
    rate_key   = admin_rate_key(email)
    send_count = r.get(rate_key)
    if send_count and int(send_count) >= ADMIN_OTP_RATE_LIMIT:
        ttl = r.ttl(rate_key)
        log_admin_event(email, "rate_limited")
        raise HTTPException(429, f"Too many OTP requests. Try again in {ttl // 60 + 1} minute(s).")

    # Delete old OTP and generate new one
    r.delete(admin_otp_key(email))
    otp = "".join(random.choices(string.digits, k=6))
    r.set(admin_otp_key(email), hash_otp(otp), ex=ADMIN_OTP_TTL)
    r.set(admin_verified_key(email), "1", ex=600)

    # Set fresh 30 second cooldown
    r.set(cd_key, "1", ex=ADMIN_RESEND_COOLDOWN)

    # Increment rate counter
    pipe = r.pipeline()
    pipe.incr(rate_key)
    pipe.expire(rate_key, ADMIN_OTP_RATE_WINDOW)
    pipe.execute()

    # Send new OTP email
    if not send_admin_otp_email(email, otp):
        raise HTTPException(502, "Failed to resend OTP. Please try again.")

    log_admin_event(email, "otp_sent")
    return {"success": True, "message": f"New OTP sent to {email}"}


# Report Route

@app.post("/send-report")
def send_report(body: SendReportRequest):
    email = body.email.strip()
    if not email or "@" not in email:
        raise HTTPException(400, "Please provide a valid email address")
    html = build_report_email(
        name=body.name,
        composite=body.composite,
        band=body.band,
        scores=body.scores,
        triage=body.triage,
        ai_message=body.ai_message or "",
    )
    if not send_report_email(email, body.name, html):
        raise HTTPException(502, "Failed to send report email. Please try again.")
    return {"success": True, "message": f"Report sent to {email}"}


@app.get("/health")
def health():
    try:
        r.ping()
        return {"status": "ok", "redis": "connected"}
    except Exception:
        return {"status": "degraded", "redis": "disconnected"}