function intSendReport() {
  // Build modal HTML 
  var prefillEmail = (S.authId && S.authId.indexOf('@') >= 0) ? S.authId : '';

  var modalHtml = `
    <div id="send-report-overlay"
      style="position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;
             background:rgba(15,30,60,0.72);backdrop-filter:blur(6px);padding:16px;animation:srFadeIn 0.25s ease">
      <style>
        @keyframes srFadeIn  { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }
        @keyframes srSlideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        #send-report-card    { animation: srSlideUp 0.3s ease 0.05s both }
        .sr-tab              { padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;border:2px solid transparent;transition:all 0.2s }
        .sr-tab.active       { background:linear-gradient(135deg,#880E4F,#C2185B);color:#fff;border-color:transparent }
        .sr-tab:not(.active) { background:transparent;color:#6B7280;border-color:#E5E7EB }
        .sr-tab:not(.active):hover { border-color:#C2185B;color:#C2185B }
        .sr-input            { width:100%;padding:12px 14px;border:1.5px solid #E5E7EB;border-radius:12px;font-size:14px;outline:none;box-sizing:border-box;transition:border-color 0.2s;font-family:inherit }
        .sr-input:focus      { border-color:#C2185B;box-shadow:0 0 0 3px rgba(194,24,91,0.1) }
        .sr-btn-send         { width:100%;padding:14px;background:linear-gradient(135deg,#880E4F,#C2185B);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;transition:opacity 0.2s }
        .sr-btn-send:hover   { opacity:0.9 }
        .sr-btn-send:disabled { opacity:0.6;cursor:not-allowed }
      </style>

      <div id="send-report-card" style="background:#fff;border-radius:24px;width:100%;max-width:460px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,0.35)">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#880E4F,#C2185B);padding:24px 28px;position:relative">
          <button onclick="document.getElementById('send-report-overlay').remove()"
            style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.15);border:none;
                   color:#fff;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;
                   display:flex;align-items:center;justify-content:center;line-height:1">✕</button>
          <div style="font-size:28px;margin-bottom:6px">📧</div>
          <div style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#fff;margin-bottom:2px">Send Your Wellness Report</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.7)">Receive a beautiful copy directly in your inbox</div>
        </div>

        <!-- Tab selector -->
        <div style="padding:20px 28px 0;display:flex;gap:8px">
          <div class="sr-tab active" id="sr-tab-email" onclick="srSwitchTab('email')">✉️ Email</div>
          <div class="sr-tab"        id="sr-tab-wa"    onclick="srSwitchTab('whatsapp')">💬 WhatsApp</div>
        </div>

        <!-- Body -->
        <div style="padding:20px 28px 28px">

          <!-- Email panel -->
          <div id="sr-panel-email">
            <div style="margin-bottom:16px">
              <label style="display:block;font-size:12px;font-weight:700;color:#374151;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.4px">Email Address</label>
              <input id="sr-email-input" class="sr-input" type="email"
                placeholder="your@email.com"
                value="${prefillEmail}">
            </div>

            <!-- What they'll receive preview -->
            <div style="background:#FFF8FC;border:1.5px solid #FCE4EC;border-radius:12px;padding:14px 16px;margin-bottom:20px">
              <div style="font-size:11px;font-weight:700;color:#880E4F;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.4px">📋 What's included in your report</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
                ${[
                  ['✨','AI Wellness Message'],
                  ['📊','All Domain Scores'],
                  ['🎯','Care Recommendations'],
                  ['🌿','Ayurvedic Insights'],
                  ['📈','Score Visualisations'],
                  ['🏥','Clinic Contact Info'],
                ].map(([icon, label]) =>
                  `<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#374151">
                    <span>${icon}</span><span>${label}</span>
                  </div>`
                ).join('')}
              </div>
            </div>

            <div id="sr-email-status" style="display:none;margin-bottom:12px"></div>

            <button class="sr-btn-send" id="sr-send-btn" onclick="srSendEmail()">
              📧 Send Report to Email
            </button>
          </div>

          <!-- WhatsApp panel -->
          <div id="sr-panel-wa" style="display:none">
            <div style="background:#F0FDF4;border:1.5px solid #86EFAC;border-radius:12px;padding:16px;margin-bottom:16px">
              <div style="font-size:13px;font-weight:700;color:#166534;margin-bottom:6px">💬 Share via WhatsApp</div>
              <div style="font-size:12px;color:#374151;line-height:1.6">
                WhatsApp will open with a pre-filled message containing your wellness summary and a link to book a consultation.
              </div>
            </div>

            <div style="margin-bottom:16px">
              <label style="display:block;font-size:12px;font-weight:700;color:#374151;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.4px">Mobile Number (optional)</label>
              <input id="sr-wa-input" class="sr-input" type="tel"
                placeholder="+91 98765 43210">
              <div style="font-size:11px;color:#9CA3AF;margin-top:4px">Leave blank to open WhatsApp and choose a contact</div>
            </div>

            <button class="sr-btn-send" onclick="srSendWhatsApp()" style="background:linear-gradient(135deg,#16A34A,#22C55E)">
              💬 Open in WhatsApp
            </button>
          </div>

        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Focus email input after animation
  setTimeout(function() {
    var inp = document.getElementById('sr-email-input');
    if (inp && !inp.value) inp.focus();
  }, 350);
}

// Tab switcher
function srSwitchTab(tab) {
  document.getElementById('sr-tab-email').classList.toggle('active', tab === 'email');
  document.getElementById('sr-tab-wa').classList.toggle('active',    tab === 'whatsapp');
  document.getElementById('sr-panel-email').style.display = tab === 'email'     ? 'block' : 'none';
  document.getElementById('sr-panel-wa').style.display    = tab === 'whatsapp'  ? 'block' : 'none';
}

// Send Email
function srSendEmail() {
  var email = (document.getElementById('sr-email-input').value || '').trim();
  if (!email || !email.includes('@')) {
    srShowStatus('error', '⚠️ Please enter a valid email address.');
    return;
  }

  var btn = document.getElementById('sr-send-btn');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  var sc   = S.scores || {};
  var name = (S.answers && S.answers.name) || 'there';
  var comp = sc.composite || 0;
  var band = sc.composite_band || (comp <= 5 ? 'Optimal' : comp <= 30 ? 'Mild' : comp <= 55 ? 'Moderate' : comp <= 80 ? 'Severe' : 'Critical');

  // Grab the AI message text if already generated
  var aiEl = document.getElementById('ai-message-text');
  var aiMsg = aiEl ? aiEl.textContent.replace(/^"|"$/g, '').trim() : '';

  // Build scores object with only what's assessed
  var scores = {
    MENQOL_vasomotor:    sc.MENQOL_vasomotor,
    MENQOL_physical:     sc.MENQOL_physical,
    MENQOL_psychosocial: sc.MENQOL_psychosocial,
    MENQOL_sexual:       sc.MENQOL_sexual,
    ISI:                 sc.ISI,
  };
  if (S.flags && S.flags.mentalHealthCompleted) {
    scores.PHQ9 = sc.PHQ9;
    scores.GAD7 = sc.GAD7;
    scores.PSS8 = sc.PSS8;
  }

  fetch(OTP_BACKEND_URL + '/send-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email:      email,
      name:       name,
      composite:  comp,
      band:       band,
      scores:     scores,
      triage:     S.triage || [],
      ai_message: aiMsg,
    })
  })
  .then(function(res) {
    if (!res.ok) return res.json().then(function(e) { throw new Error(e.detail); });
    return res.json();
  })
  .then(function(data) {
    btn.textContent = '✅ Report Sent!';
    btn.style.background = 'linear-gradient(135deg,#166534,#16A34A)';
    srShowStatus('success',
      '✅ Your wellness report has been sent to <strong>' + email + '</strong>.<br>' +
      '<span style="font-size:11px;color:#6B7280">Check your inbox (and spam folder) in the next few minutes.</span>'
    );
    // Auto-close after 4 seconds
    setTimeout(function() {
      var overlay = document.getElementById('send-report-overlay');
      if (overlay) overlay.remove();
    }, 4000);
  })
  .catch(function(err) {
    btn.textContent = '📧 Send Report to Email';
    btn.disabled = false;
    btn.style.background = '';
    srShowStatus('error', '❌ ' + (err.message || 'Failed to send. Please try again.'));
  });
}

// Send WhatsApp 
function srSendWhatsApp() {
  var sc   = S.scores || {};
  var name = (S.answers && S.answers.name) || 'there';
  var comp = sc.composite || 0;
  var band = sc.composite_band || (comp <= 5 ? 'Optimal' : comp <= 30 ? 'Mild' : comp <= 55 ? 'Moderate' : comp <= 80 ? 'Severe' : 'Critical');

  var topActions = (S.triage || [])
    .slice(0, 3)
    .map(function(t) { return '• ' + t.action.replace(/_/g, ' '); })
    .join('\n');

  var msg = [
    '🌸 *EvaEraHealth Wellness Report*',
    '',
    'Hello ' + name + '!',
    '',
    '📊 *Your Assessment Results*',
    'Overall Score: *' + comp + '/100 (' + band + ')*',
    '',
    '🎯 *Top Recommendations*',
    topActions || '• Continue your wellness practices',
    '',
    '📅 *Book a consultation with our specialists*',
    '📞 +91 80690 50000',
    '🌐 app.evaerahealth.com',
    '',
    '_EvaEraHealth Clinic, Gurugram · AI-assisted report, not a medical diagnosis_',
  ].join('\n');

  var waInput = document.getElementById('sr-wa-input');
  var mobile  = waInput ? waInput.value.replace(/[^0-9]/g, '') : '';
  var waUrl   = mobile
    ? 'https://wa.me/' + (mobile.startsWith('91') ? mobile : '91' + mobile) + '?text=' + encodeURIComponent(msg)
    : 'https://wa.me/?text=' + encodeURIComponent(msg);

  window.open(waUrl, '_blank');
}

// Status helper
function srShowStatus(type, html) {
  var el = document.getElementById('sr-email-status');
  if (!el) return;
  var bg  = type === 'success' ? '#F0FDF4' : '#FFF1F2';
  var bdr = type === 'success' ? '#86EFAC' : '#FECACA';
  var col = type === 'success' ? '#166534' : '#991B1B';
  el.style.cssText = 'display:block;background:' + bg + ';border:1.5px solid ' + bdr + ';border-radius:10px;padding:12px 14px;font-size:13px;color:' + col + ';line-height:1.6';
  el.innerHTML = html;
}