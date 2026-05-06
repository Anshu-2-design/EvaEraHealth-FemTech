import os, random, string
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import redis
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

load_dotenv()

# Config
REDIS_URL           = os.getenv("REDIS_URL",           "redis://localhost:6379")
SENDGRID_API_KEY    = os.getenv("SENDGRID_API_KEY",    "")
FROM_EMAIL          = os.getenv("FROM_EMAIL",          "noreply@evaerahealth.in")
FROM_NAME           = os.getenv("FROM_NAME",           "EvaEraHealth")

# Redis
r = redis.from_url(REDIS_URL, decode_responses=True)

# App
app = FastAPI(title="EvaEraHealth API")

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

# Helpers 
def generate_otp(length: int = 4) -> str:
    return "".join(random.choices(string.digits, k=length))

def redis_key(identifier: str) -> str:
    return f"evr_otp:{identifier.strip().lower()}"

def is_email(identifier: str) -> bool:
    return "@" in identifier


# Email OTP 
def send_email_otp(to_email: str, otp: str, portal: str) -> bool:
    if not SENDGRID_API_KEY:
        print(f"[DEV] Email OTP for {to_email}: {otp}")
        return True
    portal_label = "Clinician Portal" if portal == "hcp" else "Patient Portal"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
      <div style="background:#880E4F;padding:24px;text-align:center">
        <div style="font-size:26px;color:#fff;font-weight:800">🌸 EvaEraHealth</div>
        <div style="color:rgba(255,255,255,.7);font-size:12px;margin-top:4px">{portal_label}</div>
      </div>
      <div style="padding:28px;background:#fff">
        <p style="margin:0 0 8px;font-size:14px;color:#374151">Your one-time password is:</p>
        <div style="letter-spacing:10px;font-size:36px;font-weight:900;color:#880E4F;text-align:center;padding:16px 0">{otp}</div>
        <p style="font-size:12px;color:#9ca3af;margin:16px 0 0">Valid for 5 minutes. Single use only.<br>If you did not request this, please ignore this email.</p>
      </div>
      <div style="background:#f9fafb;padding:12px;text-align:center;font-size:11px;color:#9ca3af">
        EvaEraHealth Clinic · Gurugram Flagship Center · <a href="mailto:support@evaerahealth.in" style="color:#880E4F">support@evaerahealth.in</a>
      </div>
    </div>"""
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        msg = Mail(from_email=(FROM_EMAIL, FROM_NAME), to_emails=to_email,
                   subject=f"Your EvaEraHealth OTP: {otp}", html_content=html)
        res = sg.send(msg)
        return res.status_code in (200, 201, 202)
    except Exception as e:
        print(f"[SendGrid OTP error] {e}")
        return False

# Report Email 
def build_report_email(name: str, composite: int, band: str,
                        scores: dict, triage: list, ai_message: str) -> str:

    band_color = ("#00695C" if composite <= 5 else "#2E7D32" if composite <= 30
                  else "#E65100" if composite <= 55 else "#C62828" if composite <= 80
                  else "#880E4F")
    band_icon  = ("🌟" if band == "Optimal" else "🌿" if band == "Mild"
                  else "🌀" if band == "Moderate" else "⚠️" if band == "Severe" else "🆘")

    # Domain score bars
    def score_bar(val, max_val, warn, alert):
        if val is None:
            return ""
        pct = min(100, round((val / max_val) * 100))
        col = "#EF5350" if val >= alert else "#FF9800" if val >= warn else "#4CAF50"
        band_label = "High" if val >= alert else "Moderate" if val >= warn else "Low"
        return f"""
        <tr>
          <td style="padding:10px 14px;font-size:13px;color:#374151;border-bottom:1px solid #F3F4F6;font-weight:500">{val}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #F3F4F6">
            <div style="background:#F3F4F6;border-radius:6px;height:8px;overflow:hidden">
              <div style="height:100%;width:{pct}%;background:{col};border-radius:6px"></div>
            </div>
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #F3F4F6">
            <span style="background:{col}22;color:{col};font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px">{band_label}</span>
          </td>
        </tr>"""

    sc = scores
    domain_rows = ""
    domain_defs = [
        ("MenQOL Vasomotor",    sc.get("MENQOL_vasomotor"),    20, 7,  14),
        ("MenQOL Physical",     sc.get("MENQOL_physical"),     20, 7,  14),
        ("MenQOL Psychosocial", sc.get("MENQOL_psychosocial"), 20, 7,  14),
        ("MenQOL Sexual",       sc.get("MENQOL_sexual"),       20, 7,  14),
        ("ISI Sleep",           sc.get("ISI"),                 28, 8,  15),
        ("PHQ-9 Depression",    sc.get("PHQ9"),                27, 5,  15),
        ("GAD-7 Anxiety",       sc.get("GAD7"),                21, 5,  15),
        ("PSS-8 Stress",        sc.get("PSS8"),                32, 11, 21),
    ]
    for label, val, mx, warn, alert in domain_defs:
        if val is None:
            continue
        domain_rows += f'<tr><td style="padding:10px 14px;font-size:13px;color:#374151;border-bottom:1px solid #F3F4F6;font-weight:600">{label}</td>'
        domain_rows += score_bar(val, mx, warn, alert)
        domain_rows = domain_rows.rstrip("</tr>") # fix double close
        # rebuild properly
    # Rebuild domain rows cleanly
    domain_rows = ""
    for label, val, mx, warn, alert in domain_defs:
        if val is None:
            continue
        pct = min(100, round((val / mx) * 100))
        col = "#EF5350" if val >= alert else "#FF9800" if val >= warn else "#4CAF50"
        bl  = "High" if val >= alert else "Moderate" if val >= warn else "Low"
        domain_rows += f"""
        <tr>
          <td style="padding:10px 14px;font-size:13px;color:#374151;border-bottom:1px solid #F3F4F6;font-weight:600;min-width:160px">{label}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #F3F4F6;font-size:14px;font-weight:800;color:{col}">{val}<span style="font-size:11px;color:#9CA3AF;font-weight:400">/{mx}</span></td>
          <td style="padding:10px 14px;border-bottom:1px solid #F3F4F6;min-width:120px">
            <div style="background:#F3F4F6;border-radius:6px;height:8px;overflow:hidden;width:100px">
              <div style="height:100%;width:{pct}%;background:{col};border-radius:6px"></div>
            </div>
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #F3F4F6">
            <span style="background:{col}22;color:{col};font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px">{bl}</span>
          </td>
        </tr>"""

    # Triage cards
    triage_html = ""
    triage_icons = {
        "psychiatric_alert": "🚨", "gynecology_referral": "👩‍⚕️",
        "psychologist_referral": "🧠", "sexual_therapy_pathway": "💙",
        "sleep_recovery_program": "😴", "stress_management_program": "🌿",
        "recommend_menopause_program": "🌸", "gurugram_clinic": "🏥",
        "exercise_program": "🏃", "nutrition_guidance": "🥗",
    }
    triage_descs = {
        "psychiatric_alert": "Immediate mental health support needed",
        "gynecology_referral": "Specialist gynaecological review recommended",
        "psychologist_referral": "Clinical psychology & therapy support",
        "sexual_therapy_pathway": "Integrated psychosexual therapy",
        "sleep_recovery_program": "CBT-I and structured sleep hygiene",
        "stress_management_program": "Mindfulness and stress reduction",
        "recommend_menopause_program": "EvaEraHealth personalised programme",
        "gurugram_clinic": "In-person consultation at Gurugram Clinic",
        "exercise_program": "Personalised movement prescription",
        "nutrition_guidance": "Hormonal nutrition plan",
    }
    for t in triage[:5]:
        action = t.get("action", "")
        sev    = t.get("sev", "mild")
        icon   = triage_icons.get(action, "✦")
        desc   = triage_descs.get(action, "")
        sev_color  = "#C62828" if sev == "severe" else "#E65100" if sev == "moderate" else "#2E7D32"
        sev_bg     = "#FFF1F2" if sev == "severe" else "#FFF7ED" if sev == "moderate" else "#F0FDF4"
        sev_border = "#FECDD3" if sev == "severe" else "#FED7AA" if sev == "moderate" else "#BBF7D0"
        sev_label  = "URGENT" if sev == "severe" else "RECOMMENDED" if sev == "moderate" else "ADVISORY"
        triage_html += f"""
        <div style="display:flex;align-items:flex-start;gap:12px;background:{sev_bg};border:1px solid {sev_border};border-left:4px solid {sev_color};border-radius:10px;padding:12px 14px;margin-bottom:10px">
          <span style="font-size:22px;flex-shrink:0">{icon}</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:700;color:#111827;text-transform:capitalize;margin-bottom:2px">{action.replace("_", " ")}</div>
            <div style="font-size:12px;color:#6B7280">{desc}</div>
          </div>
          <span style="font-size:10px;font-weight:800;color:{sev_color};background:white;padding:3px 9px;border-radius:10px;border:1px solid {sev_border};flex-shrink:0;white-space:nowrap">{sev_label}</span>
        </div>"""

    ai_section = ""
    if ai_message:
        ai_section = f"""
        <div style="background:linear-gradient(135deg,#FDF4FF,#FFF0F5);border:1.5px solid #E879F9;border-radius:14px;padding:20px 22px;margin-bottom:28px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <span style="font-size:18px">✨</span>
            <span style="font-size:12px;font-weight:800;color:#7C3AED;text-transform:uppercase;letter-spacing:0.5px">Your Personalised Message</span>
          </div>
          <div style="font-size:15px;color:#374151;line-height:1.7;font-style:italic">&ldquo;{ai_message}&rdquo;</div>
        </div>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>EvaEraHealth Wellness Report — {name}</title>
</head>
<body style="margin:0;padding:0;background:#F8F4F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F4F0;padding:32px 16px">
    <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#880E4F 0%,#C2185B 50%,#AD1457 100%);border-radius:20px 20px 0 0;padding:36px 40px;text-align:center">
        <div style="font-size:32px;margin-bottom:6px">🌸</div>
        <div style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#fff;margin-bottom:4px">EvaEraHealth</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-bottom:24px">Adaptive Menopause Wellness Platform</div>
        <div style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:30px;display:inline-block;padding:6px 20px">
          <span style="font-size:12px;font-weight:700;color:#fff;letter-spacing:0.5px">PERSONAL WELLNESS REPORT</span>
        </div>
      </td></tr>

      <!-- Patient Info Bar -->
      <tr><td style="background:#1E3A5F;padding:16px 40px">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align:center;border-right:1px solid rgba(255,255,255,0.15);padding-right:20px">
              <div style="font-size:10px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px">Patient</div>
              <div style="font-size:14px;font-weight:700;color:#fff">{name}</div>
            </td>
            <td style="text-align:center;border-right:1px solid rgba(255,255,255,0.15);padding:0 20px">
              <div style="font-size:10px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px">Overall Score</div>
              <div style="font-size:14px;font-weight:700;color:{band_color}">{composite}/100</div>
            </td>
            <td style="text-align:center;padding-left:20px">
              <div style="font-size:10px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px">Assessment Level</div>
              <div style="font-size:14px;font-weight:700;color:{band_color}">{band_icon} {band}</div>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Main Content -->
      <tr><td style="background:#fff;padding:36px 40px">

        <!-- AI Disclaimer -->
        <div style="background:#FFF8E1;border:1.5px solid #FFB300;border-radius:12px;padding:12px 16px;margin-bottom:28px;display:flex;gap:10px;align-items:flex-start">
          <span style="font-size:18px">🤖</span>
          <div style="font-size:11px;color:#795548;line-height:1.6"><strong>AI-Generated Report</strong> — For informational purposes only. Must be reviewed by a qualified clinician before any clinical decision. Not a medical diagnosis.</div>
        </div>

        <!-- Band Hero -->
        <div style="background:linear-gradient(135deg,#FFF0F5,#F0F9FF);border-radius:16px;padding:28px;text-align:center;margin-bottom:28px">
          <div style="font-size:52px;margin-bottom:8px">{band_icon}</div>
          <div style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:{band_color};margin-bottom:6px">{band} Wellness Level</div>
          <div style="font-size:13px;color:#6B7280;max-width:380px;margin:0 auto">Composite Score: <strong style="color:{band_color}">{composite}/100</strong></div>
          <!-- Score bar -->
          <div style="background:#E5E7EB;border-radius:8px;height:10px;overflow:hidden;margin:16px auto 0;max-width:300px">
            <div style="height:100%;width:{min(composite, 100)}%;background:linear-gradient(90deg,{band_color},{band_color}99);border-radius:8px"></div>
          </div>
        </div>

        <!-- AI Message -->
        {ai_section}

        <!-- Domain Scores -->
        <div style="margin-bottom:28px">
          <div style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#1E3A5F;margin-bottom:4px;padding-bottom:10px;border-bottom:2px solid #FCE4EC">Clinical Domain Scores</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px">
            <thead>
              <tr style="background:#F9FAFB">
                <th style="padding:10px 14px;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;text-align:left">Domain</th>
                <th style="padding:10px 14px;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;text-align:left">Score</th>
                <th style="padding:10px 14px;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;text-align:left">Scale</th>
                <th style="padding:10px 14px;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;text-align:left">Band</th>
              </tr>
            </thead>
            <tbody>{domain_rows}</tbody>
          </table>
        </div>

        <!-- Care Recommendations -->
        {'<div style="margin-bottom:28px"><div style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#1E3A5F;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid #FCE4EC">Your Personalised Care Plan</div>' + triage_html + '</div>' if triage_html else ''}

        <!-- CTA -->
        <div style="background:linear-gradient(135deg,#FFF0F5,#F3E5F5);border:2px solid #C2185B;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px">
          <div style="font-size:22px;margin-bottom:8px">📅</div>
          <div style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1E3A5F;margin-bottom:6px">Ready to speak with a specialist?</div>
          <div style="font-size:12px;color:#6B7280;margin-bottom:16px">Book an online video consultation or in-person visit at EvaEraHealth Clinic, Gurugram.</div>
          <a href="tel:+918069050000" style="display:inline-block;background:linear-gradient(135deg,#880E4F,#C2185B);color:#fff;text-decoration:none;padding:13px 32px;border-radius:12px;font-size:14px;font-weight:700">📞 +91 80690 50000</a>
          <div style="font-size:10px;color:#9CA3AF;margin-top:8px">Gynaecologist · Psychologist · Menopause Specialist · Ayurvedic Physician</div>
        </div>

        <!-- Disclaimer -->
        <div style="background:#FFF8E1;border:1.5px solid #FFB300;border-radius:12px;padding:16px">
          <div style="font-size:13px;font-weight:800;color:#E65100;margin-bottom:6px">⚕️ Medical Disclaimer</div>
          <div style="font-size:11px;color:#795548;line-height:1.7">This report is generated by <strong>EvaEraHealth AI (Claude, Anthropic)</strong> and is for <strong>informational and wellness awareness purposes only</strong>. It does not constitute a medical diagnosis, prescription, or clinical advice. All recommendations must be reviewed and verified by a qualified clinician before any action. Scores are self-reported. For emergencies call 112.</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
            <span style="background:white;border:1px solid #FFB300;border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;color:#E65100">🤖 AI Generated</span>
            <span style="background:white;border:1px solid #66BB6A;border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;color:#2E7D32">🔒 DPDP 2023</span>
            <span style="background:white;border:1px solid #42A5F5;border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;color:#1565C0">👩‍⚕️ Clinician Review Required</span>
          </div>
        </div>

      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#1E3A5F;border-radius:0 0 20px 20px;padding:20px 40px">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:12px;color:rgba(255,255,255,0.65)">
              <strong style="color:#fff">EvaEraHealth Clinic</strong><br>
              Gurugram Flagship Center<br>
              <a href="mailto:clinic@evaerahealth.in" style="color:#93C5FD;text-decoration:none">clinic@evaerahealth.in</a>
            </td>
            <td style="text-align:right;font-size:11px;color:rgba(255,255,255,0.4)">
              app.evaerahealth.com<br>
              DPDP Act 2023 Compliant<br>
              <a href="mailto:dpo@evaerahealth.in" style="color:rgba(255,255,255,0.4)">dpo@evaerahealth.in</a>
            </td>
          </tr>
        </table>
      </td></tr>

    </table>
    </td></tr>
  </table>

</body>
</html>"""


def send_report_email(to_email: str, name: str, html_content: str) -> bool:
    if not SENDGRID_API_KEY:
        print(f"[DEV] Report email to {to_email}")
        return True
    try:
        sg  = SendGridAPIClient(SENDGRID_API_KEY)
        msg = Mail(
            from_email=(FROM_EMAIL, FROM_NAME),
            to_emails=to_email,
            subject=f"🌸 Your EvaEraHealth Wellness Report — {name}",
            html_content=html_content,
        )
        res = sg.send(msg)
        return res.status_code in (200, 201, 202)
    except Exception as e:
        print(f"[SendGrid Report error] {e}")
        return False


# Routes 

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

