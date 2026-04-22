import os, random, string
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import redis
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

load_dotenv()

# Config
REDIS_URL        = os.getenv("REDIS_URL", "redis://localhost:6379")
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
FROM_EMAIL       = os.getenv("FROM_EMAIL", "noreply@evaerahealth.in")
FROM_NAME        = os.getenv("FROM_NAME", "EvaEraHealth")

# Redis client
r = redis.from_url(REDIS_URL, decode_responses=True)

# App 
app = FastAPI(title="EvaEraHealth OTP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://clever-sprinkles-3d7234.netlify.app"
    ],
    #  allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas 
class SendOTPRequest(BaseModel):
    identifier: str   # email or mobile
    portal: str = "patient"   # "patient" | "hcp"

class VerifyOTPRequest(BaseModel):
    identifier: str
    otp: str

#  Helpers 
def generate_otp(length: int = 4) -> str:
    return "".join(random.choices(string.digits, k=length))

def redis_key(identifier: str) -> str:
    return f"evr_otp:{identifier.strip().lower()}"

def is_email(identifier: str) -> bool:
    return "@" in identifier

def send_email_otp(to_email: str, otp: str, portal: str) -> bool:
    """Send OTP via SendGrid. Returns True on success."""
    if not SENDGRID_API_KEY:
        print(f"[DEV] OTP for {to_email}: {otp}")   # fallback for local dev
        return True

    portal_label = "Clinician Portal" if portal == "hcp" else "Patient Portal"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;
                border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
      <div style="background:#880E4F;padding:24px;text-align:center">
        <div style="font-size:26px;color:#fff;font-weight:800">🌸 EvaEraHealth</div>
        <div style="color:rgba(255,255,255,.7);font-size:12px;margin-top:4px">
          {portal_label}
        </div>
      </div>
      <div style="padding:28px;background:#fff">
        <p style="margin:0 0 8px;font-size:14px;color:#374151">
          Your one-time password is:
        </p>
        <div style="letter-spacing:10px;font-size:36px;font-weight:900;
                    color:#880E4F;text-align:center;padding:16px 0">
          {otp}
        </div>
        <p style="font-size:12px;color:#9ca3af;margin:16px 0 0">
          This OTP is valid for a single use only.<br>
          If you did not request this, please ignore this email.
        </p>
      </div>
      <div style="background:#f9fafb;padding:12px;text-align:center;
                  font-size:11px;color:#9ca3af">
        EvaEraHealth Clinic · Gurugram Flagship Center ·
        <a href="mailto:support@evaerahealth.in" style="color:#880E4F">
          support@evaerahealth.in
        </a>
      </div>
    </div>
    """
    message = Mail(
        from_email=(FROM_EMAIL, FROM_NAME),
        to_emails=to_email,
        subject=f"Your EvaEraHealth OTP: {otp}",
        html_content=html,
    )
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        return response.status_code in (200, 201, 202)
    except Exception as e:
        print(f"[SendGrid error] {e}")
        return False

#  Routes

@app.post("/send-otp")
def send_otp(body: SendOTPRequest):
    identifier = body.identifier.strip()
    if not identifier:
        raise HTTPException(400, "identifier is required")

    otp = generate_otp()
    key = redis_key(identifier)

    # Store in Redis 
    # r.set(key, otp)
    r.set(key, otp, ex=300)

    # Deliver
    if is_email(identifier):
        ok = send_email_otp(identifier, otp, body.portal)
        if not ok:
            raise HTTPException(502, "Failed to send OTP email. Try again.")
        return {"success": True, "message": f"OTP sent to {identifier}"}
    else:
        # SMS integration placeholder — print for now
        print(f"[SMS] OTP for {identifier}: {otp}")
        return {"success": True, "message": f"OTP sent to {identifier}"}


@app.post("/verify-otp")
def verify_otp(body: VerifyOTPRequest):
    identifier = body.identifier.strip()
    otp        = body.otp.strip()

    if not identifier or not otp:
        raise HTTPException(400, "identifier and otp are required")

    key        = redis_key(identifier)
    stored_otp = r.get(key)

    if stored_otp is None:
        raise HTTPException(404, "OTP not found or already used. Please request a new one.")

    if stored_otp != otp:
        raise HTTPException(401, "Invalid OTP. Please try again.")

    # Delete after successful verification (single-use)
    r.delete(key)
    return {"success": True, "message": "OTP verified successfully"}


@app.post("/resend-otp")
def resend_otp(body: SendOTPRequest):
    identifier = body.identifier.strip()
    if not identifier:
        raise HTTPException(400, "identifier is required")

    # Delete old OTP first so previous one is immediately invalid
    key = redis_key(identifier)
    r.delete(key)

    # Generate and store fresh OTP
    otp = generate_otp()
    r.set(key, otp, ex=300)

    # Send it
    if is_email(identifier):
        ok = send_email_otp(identifier, otp, body.portal)
        if not ok:
            raise HTTPException(502, "Failed to send OTP email. Try again.")
        return {"success": True, "message": f"New OTP sent to {identifier}"}
    else:
        print(f"[SMS] New OTP for {identifier}: {otp}")
        return {"success": True, "message": f"New OTP sent to {identifier}"}

@app.get("/health")
def health():
    try:
        r.ping()
        return {"status": "ok", "redis": "connected"}
    except Exception:
        return {"status": "degraded", "redis": "disconnected"}