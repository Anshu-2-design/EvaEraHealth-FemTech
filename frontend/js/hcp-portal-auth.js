/* ─────────────────────────────────────────────────────────────────────────────
   hcp-portal-auth.js  —  EvaEraHealth
   HCP Portal Login using Email + Password against Supabase hcp_clinicians table.

   HOW IT WORKS:
   ┌──────────────────────────────────────────────────────────────────┐
   │  Admin adds consultant → hcpEmail + hcpPass saved to Supabase   │
   │  Clinician opens HCP portal → enters email + password           │
   │  JS queries Supabase hcp_clinicians → checks email + pass       │
   │  If active=true and match → enter dashboard                     │
   │  If no match or active=false → access denied                    │
   └──────────────────────────────────────────────────────────────────┘

   LOAD ORDER in index.html (must be after integration.js):
   <script src="js/hcp-portal-auth.js"></script>
───────────────────────────────────────────────────────────────────────────── */


/* ═══════════════════════════════════════════════════════════════════════════
   PART 1 — HCP AUTH SCREEN
   Replaces the OTP-based HCP login screen with Email + Password login.
   This patches the existing hcp-auth-screen HTML at runtime.
═══════════════════════════════════════════════════════════════════════════ */

function hcpRenderLoginScreen() {
  var card = document.querySelector('.hcp-auth-card');
  if (!card) return;

  card.innerHTML = ''
    + '<h2 style="font-family:\'Cormorant Garamond\',serif;font-size:24px;margin-bottom:4px">🩺 Clinician Login</h2>'
    + '<p style="font-size:12px;opacity:0.5;margin-bottom:20px">EvaEraHealth Clinic · Gurugram Flagship Center</p>'
    + '<a onclick="intShowLauncher()" style="font-size:11px;color:rgba(255,255,255,.4);cursor:pointer;display:block;margin-bottom:16px;text-align:center">← Back to Portal Selection</a>'

    /* Error box */
    + '<div id="hcp-login-err" style="display:none;background:rgba(153,27,27,0.25);border:1px solid rgba(153,27,27,0.5);border-radius:8px;padding:9px 12px;font-size:12px;color:#FCA5A5;margin-bottom:12px"></div>'

    /* Email field */
    + '<div class="form-group" style="margin-bottom:12px">'
    +   '<label style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.5);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Email</label>'
    +   '<input type="email" id="hcp-email-input" placeholder="you@evaerahealth.in" autocomplete="email"'
    +   ' style="width:100%;padding:11px 14px;background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.2);border-radius:10px;font-size:13px;outline:none;color:#fff;box-sizing:border-box"'
    +   ' onfocus="this.style.borderColor=\'rgba(192,48,90,0.7)\'" onblur="this.style.borderColor=\'rgba(255,255,255,0.2)\'"'
    +   ' onkeydown="if(event.key===\'Enter\')document.getElementById(\'hcp-pass-input\').focus()">'
    + '</div>'

    /* Password field */
    + '<div class="form-group" style="margin-bottom:20px">'
    +   '<label style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.5);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Password</label>'
    +   '<div style="position:relative">'
    +     '<input type="password" id="hcp-pass-input" placeholder="Your password" autocomplete="current-password"'
    +     ' style="width:100%;padding:11px 40px 11px 14px;background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.2);border-radius:10px;font-size:13px;outline:none;color:#fff;box-sizing:border-box"'
    +     ' onfocus="this.style.borderColor=\'rgba(192,48,90,0.7)\'" onblur="this.style.borderColor=\'rgba(255,255,255,0.2)\'"'
    +     ' onkeydown="if(event.key===\'Enter\')hcpDoLogin()">'
    +     '<span onclick="hcpTogglePassVis()" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:14px;opacity:0.5" title="Show/hide">👁</span>'
    +   '</div>'
    + '</div>'

    /* Login button */
    + '<button id="hcp-login-btn" onclick="hcpDoLogin()" class="btn-hcp" style="width:100%;padding:13px;background:linear-gradient(135deg,#C0305A,#9C1B43);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:0">Sign In →</button>'

    /* Footer */
    + '<div style="margin-top:20px;text-align:center;font-size:11px;color:rgba(255,255,255,0.25)">Access is granted by your administrator only</div>';
}

function hcpTogglePassVis() {
  var inp = document.getElementById('hcp-pass-input');
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
}


/* ═══════════════════════════════════════════════════════════════════════════
   PART 2 — LOGIN LOGIC
   Queries Supabase hcp_clinicians table: email + password match + active=true
═══════════════════════════════════════════════════════════════════════════ */

function hcpDoLogin() {
  var email = (document.getElementById('hcp-email-input') || {}).value || '';
  var pass  = (document.getElementById('hcp-pass-input')  || {}).value || '';
  email = email.trim().toLowerCase();
  pass  = pass.trim();

  var errEl = document.getElementById('hcp-login-err');
  var btn   = document.getElementById('hcp-login-btn');

  /* Basic validation */
  if (!email) { _hcpShowErr('Please enter your email address.'); return; }
  if (!pass)  { _hcpShowErr('Please enter your password.'); return; }

  /* Loading state */
  if (btn) { btn.textContent = 'Signing in…'; btn.disabled = true; }
  if (errEl) errEl.style.display = 'none';

  /* Check Supabase is ready */
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    _whenReady(function() { _hcpQuerySupabase(email, pass, btn); }, 'hcpDoLogin');
    return;
  }

  _hcpQuerySupabase(email, pass, btn);
}

function _hcpQuerySupabase(email, pass, btn) {
  /* Query hcp_clinicians where hcp_email matches */
  var url = SUPABASE_URL + '/rest/v1/hcp_clinicians'
    + '?hcp_email=eq.' + encodeURIComponent(email)
    + '&select=id,name,qualification,specialisation,hcp_email,hcp_pass,active,fee,experience,languages';

  fetch(url, {
    method: 'GET',
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type':  'application/json'
    }
  })
  .then(function(res) {
    if (!res.ok) return res.text().then(function(t) { throw new Error('Server error: ' + t); });
    return res.json();
  })
  .then(function(rows) {
    if (btn) { btn.textContent = 'Sign In →'; btn.disabled = false; }

    /* No matching email */
    if (!rows || rows.length === 0) {
      _hcpShowErr('⚠ Invalid email or password.');
      return;
    }

    var clinician = rows[0];

    /* Check password match */
    if (clinician.hcp_pass !== pass) {
      _hcpShowErr('⚠ Invalid email or password.');
      return;
    }

    /* Check if active */
    if (!clinician.active) {
      _hcpShowErr('🚫 Your access has been deactivated. Please contact your administrator.');
      return;
    }

    /* ✅ All checks passed — log in */
    _hcpOnLoginSuccess(clinician);
  })
  .catch(function(err) {
    if (btn) { btn.textContent = 'Sign In →'; btn.disabled = false; }
    console.error('[HCP Login] Supabase error:', err);
    _hcpShowErr('⚠ Could not connect. Please check your connection and try again.');
  });
}

function _hcpOnLoginSuccess(clinician) {
  /* Update last_login timestamp in Supabase */
  _hcpUpdateLastLogin(clinician.id);

  /* Store in session state */
  S.hcpConsultant = {
    id:        clinician.id,
    name:      clinician.name,
    qual:      clinician.qualification,
    spec:      clinician.specialisation,
    hcpEmail:  clinician.hcp_email,
    fee:       clinician.fee,
    exp:       clinician.experience,
    lang:      clinician.languages
  };
  S.hcpEmail = clinician.hcp_email;

  /* Log activity */
  iLogA('ok', 'HCP login: ' + clinician.name, clinician.hcp_email, 'HCP');

  /* Open dashboard */
  showHCPDashboard();
}

function _hcpUpdateLastLogin(clinicianId) {
  if (!SUPABASE_URL || !SUPABASE_KEY || !clinicianId) return;

  fetch(SUPABASE_URL + '/rest/v1/hcp_clinicians?id=eq.' + encodeURIComponent(clinicianId), {
    method: 'PATCH',
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type':  'application/json',
      'Prefer':        'return=minimal'
    },
    body: JSON.stringify({ last_login: new Date().toISOString() })
  }).catch(function(e) { console.warn('[HCP Login] last_login update failed:', e); });
}

function _hcpShowErr(msg) {
  var errEl = document.getElementById('hcp-login-err');
  if (!errEl) { alert(msg); return; }
  errEl.textContent = msg;
  errEl.style.display = 'block';
  var btn = document.getElementById('hcp-login-btn');
  if (btn) { btn.textContent = 'Sign In →'; btn.disabled = false; }
}


/* ═══════════════════════════════════════════════════════════════════════════
   PART 3 — ADMIN: SAVE CONSULTANT TO SUPABASE
   Patches admACon() so when admin adds a consultant,
   the credentials are saved to Supabase hcp_clinicians table.
═══════════════════════════════════════════════════════════════════════════ */

(function() {
  var _orig = window.admACon;

  window.admACon = function() {
    /* Run original admACon (saves to localStorage, shows credential modal) */
    _orig.call(this);

    /* Get the consultant that was just added (last item in list) */
    var list      = iLd(IK.cn, []);
    var editId    = (document.getElementById('anc-eid') || {}).value || '';

    /* Only push to Supabase for NEW consultants (not edits) */
    if (editId) return;

    var newest = list[list.length - 1];
    if (!newest || !newest.hcpEmail) return;

    _hcpSaveToSupabase(newest);
  };
})();

function _hcpSaveToSupabase(consultant) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    /* Supabase not ready yet — queue it */
    _whenReady(function() { _hcpSaveToSupabase(consultant); }, 'hcpSaveToSupabase');
    return;
  }

  var row = {
    id:             consultant.id,
    name:           consultant.name           || '',
    qualification:  consultant.qual           || '',
    specialisation: consultant.spec           || '',
    hcp_email:      consultant.hcpEmail.toLowerCase().trim(),
    hcp_pass:       consultant.hcpPass        || '',
    fee:            consultant.fee            || 1500,
    experience:     consultant.exp            || '',
    languages:      consultant.lang           || 'Hindi, English',
    default_dur:    consultant.defaultDur     || 30,
    active:         true,
    added_at:       new Date().toISOString()
  };

  console.log('[HCP Supabase] Saving clinician →', row.hcp_email);

  fetch(SUPABASE_URL + '/rest/v1/hcp_clinicians', {
    method: 'POST',
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type':  'application/json',
      'Prefer':        'return=minimal'
    },
    body: JSON.stringify(row)
  })
  .then(function(res) {
    if (!res.ok) return res.text().then(function(t) { throw new Error(t); });
    console.log('[HCP Supabase] ✓ Clinician saved:', row.hcp_email);
    intToast('success', 'HCP credentials saved to database', row.hcp_email, 'Admin');
  })
  .catch(function(err) {
    console.error('[HCP Supabase] ✗ Save failed:', err.message);
    intToast('warn', 'Credentials saved locally only', 'Supabase save failed — check console', 'Admin');
  });
}


/* ═══════════════════════════════════════════════════════════════════════════
   PART 4 — ADMIN: TOGGLE ACTIVE STATUS IN SUPABASE
   When admin activates/deactivates a consultant, sync to Supabase.
═══════════════════════════════════════════════════════════════════════════ */

(function() {
  var _orig = window.admTogCon;

  window.admTogCon = function(cid) {
    /* Run original (toggles in localStorage) */
    _orig.call(this, cid);

    /* Sync the new active state to Supabase */
    var list      = iLd(IK.cn, []);
    var consultant = list.find(function(c) { return c.id === cid; });
    if (!consultant || !consultant.hcpEmail) return;

    _hcpUpdateActiveState(consultant.hcpEmail, consultant.active);
  };
})();

function _hcpUpdateActiveState(hcpEmail, activeState) {
  if (!SUPABASE_URL || !SUPABASE_KEY || !hcpEmail) return;

  fetch(SUPABASE_URL + '/rest/v1/hcp_clinicians?hcp_email=eq.' + encodeURIComponent(hcpEmail.toLowerCase()), {
    method: 'PATCH',
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type':  'application/json',
      'Prefer':        'return=minimal'
    },
    body: JSON.stringify({
      active:     activeState,
      updated_at: new Date().toISOString()
    })
  })
  .then(function(res) {
    if (!res.ok) return res.text().then(function(t) { throw new Error(t); });
    console.log('[HCP Supabase] ✓ Active state updated:', hcpEmail, '→', activeState);
  })
  .catch(function(err) {
    console.error('[HCP Supabase] ✗ Active update failed:', err.message);
  });
}


/* ═══════════════════════════════════════════════════════════════════════════
   PART 5 — INIT
   Replace the HCP auth screen UI when that screen is shown.
═══════════════════════════════════════════════════════════════════════════ */

(function() {
  var _orig = window.showScreen;
  if (typeof _orig === 'function') {
    window.showScreen = function(screenId) {
      _orig(screenId);
      if (screenId === 'hcp-auth-screen') {
        /* Small delay so the screen is visible before patching */
        setTimeout(hcpRenderLoginScreen, 50);
      }
    };
  }

  /* Also patch intEnter so clicking HCP from launcher renders the new UI */
  var _origIntEnter = window.intEnter;
  if (typeof _origIntEnter === 'function') {
    window.intEnter = function(p) {
      _origIntEnter(p);
      if (p === 'hcp') {
        setTimeout(hcpRenderLoginScreen, 80);
      }
    };
  }

  /* Render on page load if hcp-auth-screen is already active */
  window.addEventListener('load', function() {
    var screen = document.getElementById('hcp-auth-screen');
    if (screen && screen.classList.contains('active')) {
      setTimeout(hcpRenderLoginScreen, 100);
    }
  });
})();