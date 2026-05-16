/* HELPERS */

function _pd_iLd(key, fallback) {
  try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch(e) { return fallback; }
}
function _pd_iSv(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

/* SCORE / BAND UTILITIES */

var PD_BAND_CFG = {
  composite: [
    { min: 81, label: 'Critical',  colour: '#B71C1C', fill: '#EF4444' },
    { min: 56, label: 'Severe',    colour: '#EF5350', fill: '#F87171' },
    { min: 31, label: 'Moderate',  colour: '#F59E0B', fill: '#FBBF24' },
    { min:  6, label: 'Mild',      colour: '#16A34A', fill: '#4ADE80' },
    { min:  0, label: 'Optimal',   colour: '#00695C', fill: '#2DD4BF' },
  ],
};

function _pdBand(composite) {
  for (var i = 0; i < PD_BAND_CFG.composite.length; i++) {
    if (composite >= PD_BAND_CFG.composite[i].min) return PD_BAND_CFG.composite[i];
  }
  return PD_BAND_CFG.composite[PD_BAND_CFG.composite.length - 1];
}

function _pdScoreColour(value, warnAt, alertAt) {
  if (value >= alertAt) return '#EF4444';
  if (value >= warnAt)  return '#F59E0B';
  return '#16A34A';
}

/* DATA HELPERS */

function _pdGetAppointments(patient) {
  var IK_AP = (window.IK && IK.ap) ? IK.ap : 'evh_appts';
  var all = _pd_iLd(IK_AP, []);
  if (!patient) return all;
  return all.filter(function(a) {
    return a.patientId === patient.id || a.patientName === patient.name;
  }).sort(function(a, b) {
    return new Date(b.bookedAt || b.date) - new Date(a.bookedAt || a.date);
  });
}

function _pdGetHCPNote(patient) {
  if (!patient) return null;
  var raw = _pd_iLd('evh_pat_note_' + (patient.id || ''), null);
  if (raw && typeof raw === 'object' && raw.note) return raw;
  var plain = _pd_iLd('hcp_note_' + (patient.id || ''), '');
  return plain ? { note: plain, consultant: 'Your Consultant', savedAt: '' } : null;
}

/* ENTRY POINT
   Called after patient OTP verified (in consent.js verifyOTP success handler).
   Returning patient (has prior assessment) → dashboard.
   New patient → consent → assessment.*/

function checkReturningPatient() {
  var hasPriorAssessment = false;
  var matchedPatient = null;

  try {
    var stored = localStorage.getItem('evr_patients_v7');
    if (stored) {
      var patients = JSON.parse(stored);
      var authId = (S.session && S.session.authId) ? S.session.authId.trim().toLowerCase() : null;
      if (authId && patients && patients.length > 0) {
        var matches = patients.filter(function(p) {
          return (p.authId && p.authId.trim().toLowerCase() === authId) ||
                 (p.sessionId && S.session && p.sessionId === S.session.id);
        }).sort(function(a, b) {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        if (matches.length > 0) {
          hasPriorAssessment = true;
          matchedPatient = matches[0];
        }
      }
    }
  } catch(e) {
    console.warn('[checkReturningPatient] localStorage error:', e);
  }

  if (hasPriorAssessment) {
    showPatientDashboard(matchedPatient);   // → Returning patient: show dashboard
  } else {
    showConsent();                          // → New patient: consent → assessment
  }
}

/* MAIN RENDER */

function showPatientDashboard(patient) {
  var screen = document.getElementById('patient-dashboard-screen');
  if (!screen) { console.error('[PatientDashboard] Missing #patient-dashboard-screen in HTML'); return; }

  screen.innerHTML = _pdBuildHTML(patient);
  showScreen('patient-dashboard-screen');

  /* wire default active tab */
  _pdActivateTab(0);
}

/* HTML BUILDER */

function _pdBuildHTML(patient) {
  var sc       = patient.scores || {};
  var comp     = sc.composite || 0;
  var band     = _pdBand(comp);
  var appts    = _pdGetAppointments(patient);
  var note     = _pdGetHCPNote(patient);
  var hcpNote  = note ? note.note : '';
  var hcpBy    = note ? (note.consultant + (note.savedAt ? ' · ' + note.savedAt : '')) : '';
  var nextAppt = appts.filter(function(a) { return a.status === 'confirmed' || a.status === 'pending'; })[0];
  var assessDate = patient.timestamp
    ? new Date(patient.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Unknown date';

  return _pdStyles()
    + '<div class="pd-wrap">'
    + _pdTopBar()
    + _pdWelcomeBand(patient, comp, band, assessDate, nextAppt)
    + _pdTabBar()
    + '<div class="pd-panels">'
    + _pdPanel0_Overview(patient, sc, comp, band, appts, assessDate)
    + _pdPanel1_Scores(sc)
    + _pdPanel2_CarePlan(patient)
    + _pdPanel3_Appointments(appts)
    + _pdPanel4_Wearable(patient)
    + _pdPanel5_HCPNotes(hcpNote, hcpBy)
    + '</div>'
    + _pdRetakeCTA()
    + '</div>';
}

/* TOP BAR */

function _pdTopBar() {
  return '<nav class="pd-nav">'
    + '<div class="pd-brand">Eva<span>Era</span>Health <span class="pd-brand-tag">My Health</span></div>'
    + '<div class="pd-nav-actions">'
    + '<button class="pd-btn-retake" onclick="pdRetakeAssessment()">↻ Retake Assessment</button>'
    + '<button class="pd-btn-signout" onclick="pdSignOut()">Sign out</button>'
    + '</div></nav>';
}

/* WELCOME BAND */

function _pdWelcomeBand(patient, comp, band, assessDate, nextAppt) {
  var compPct = Math.min(comp, 100);
  var pills = '';
  if (patient.stage)  pills += '<div class="pd-pill">🌸 ' + patient.stage + '</div>';
  if (patient.city)   pills += '<div class="pd-pill">📍 ' + patient.city + '</div>';
  if (nextAppt)       pills += '<div class="pd-pill">🩺 1 upcoming appt</div>';

  return '<div class="pd-welcome">'
    + '<div class="pd-welcome-name">Welcome back, ' + (patient.name || 'Patient') + '</div>'
    + '<div class="pd-welcome-sub">Last assessed: ' + assessDate + ' · ' + (patient.stage || '') + ' · Prakriti: ' + (patient.prakriti || '—') + '</div>'
    + '<div class="pd-pills">' + pills + '</div>'
    + '<div class="pd-comp-row">'
    + '<div class="pd-comp-left">'
    + '<div class="pd-comp-label">Composite Score</div>'
    + '<div class="pd-comp-score" style="color:' + band.fill + '">' + comp + '</div>'
    + '<div class="pd-comp-band" style="color:' + band.fill + '">' + band.label + '</div>'
    + '</div>'
    + '<div class="pd-comp-right">'
    + '<div class="pd-comp-bar-wrap"><div class="pd-comp-bar" style="width:' + compPct + '%;background:' + band.fill + '"></div></div>'
    + '<div class="pd-comp-meta">Out of 100 · Assessed ' + assessDate + '</div>'
    + '<div class="pd-comp-meta" style="margin-top:4px">' + ((patient.triage || []).length) + ' care actions triggered</div>'
    + '</div></div></div>';
}

/* TAB BAR */

function _pdTabBar() {
  var tabs = ['Overview', 'Scores', 'Care Plan', 'Appointments', 'Wearable', 'HCP Notes'];
  var html = '<div class="pd-tabs-row">';
  for (var i = 0; i < tabs.length; i++) {
    html += '<div class="pd-tab' + (i === 0 ? ' active' : '') + '" onclick="_pdActivateTab(' + i + ')">' + tabs[i] + '</div>';
  }
  return html + '</div>';
}

function _pdActivateTab(index) {
  var tabs   = document.querySelectorAll('.pd-tab');
  var panels = document.querySelectorAll('.pd-panel');
  for (var i = 0; i < tabs.length; i++)   tabs[i].classList.toggle('active', i === index);
  for (var i = 0; i < panels.length; i++) panels[i].style.display = i === index ? 'block' : 'none';
}

/* PANEL 0: OVERVIEW */

function _pdPanel0_Overview(patient, sc, comp, band, appts, assessDate) {
  var domains = [
    { key: 'MENQOL_vasomotor',    label: 'Vasomotor',         max: 20 },
    { key: 'MENQOL_physical',     label: 'Physical',          max: 20 },
    { key: 'MENQOL_psychosocial', label: 'Psychosocial',      max: 20 },
    { key: 'MENQOL_sexual',       label: 'Sexual / Intimate', max: 20 },
  ];

  var domainCards = '';
  for (var d = 0; d < domains.length; d++) {
    var dm  = domains[d];
    var val = sc[dm.key] || 0;
    var pct = Math.round((val / dm.max) * 100);
    var col = _pdScoreColour(val, 7, 14);
    var bLabel = val >= 14 ? 'High' : val >= 7 ? 'Moderate' : 'Low';
    domainCards += '<div class="pd-dm">'
      + '<div class="pd-dm-label">' + dm.label + '</div>'
      + '<div><span class="pd-dm-val" style="color:' + col + '">' + val + '</span><span class="pd-dm-max">/' + dm.max + '</span></div>'
      + '<div class="pd-dm-band" style="color:' + col + '">' + bLabel + '</div>'
      + '<div class="pd-mini-bar"><div class="pd-mini-fill" style="width:' + pct + '%;background:' + col + '"></div></div>'
      + '</div>';
  }

  var nextAppt = appts.filter(function(a) { return a.status === 'confirmed' || a.status === 'pending'; })[0];
  var apptSnippet = nextAppt
    ? '<div class="pd-card" style="margin-top:12px"><div class="pd-card-hdr"><span class="pd-card-title">Next appointment</span></div><div class="pd-card-body" style="padding-top:4px">' + _pdApptItem(nextAppt) + '</div></div>'
    : '';

  var topTriage = (patient.triage || []).slice(0, 3);
  var triageSnippet = '';
  if (topTriage.length) {
    var triageRows = '';
    for (var t = 0; t < topTriage.length; t++) triageRows += _pdTriageItem(topTriage[t]);
    triageSnippet = '<div class="pd-card" style="margin-top:12px">'
      + '<div class="pd-card-hdr"><span class="pd-card-title">Top care actions</span><span class="pd-badge-rose">' + (patient.triage || []).length + ' triggered</span></div>'
      + '<div class="pd-card-body">' + triageRows + '</div></div>';
  }

  return '<div class="pd-panel" style="display:block">'
    + '<div class="pd-body">'
    + '<div class="pd-card">'
    + '<div class="pd-card-hdr"><span class="pd-card-title">Domain scores</span><span style="font-size:11px;color:#64748B">Assessed ' + assessDate + '</span></div>'
    + '<div class="pd-card-body"><div class="pd-domain-grid">' + domainCards + '</div></div>'
    + '</div>'
    + triageSnippet
    + apptSnippet
    + '</div></div>';
}

/* PANEL 1: SCORES */

function _pdPanel1_Scores(sc) {
  var rows = [
    { l: 'MenQOL Vasomotor',    v: sc.MENQOL_vasomotor    || 0, m: 20, b: sc.MENQOL_vasomotor    >= 14 ? 'High' : sc.MENQOL_vasomotor    >= 7 ? 'Moderate' : 'Low' },
    { l: 'MenQOL Physical',     v: sc.MENQOL_physical     || 0, m: 20, b: sc.MENQOL_physical     >= 14 ? 'High' : sc.MENQOL_physical     >= 7 ? 'Moderate' : 'Low' },
    { l: 'MenQOL Psychosocial', v: sc.MENQOL_psychosocial || 0, m: 20, b: sc.MENQOL_psychosocial >= 14 ? 'High' : sc.MENQOL_psychosocial >= 7 ? 'Moderate' : 'Low' },
    { l: 'MenQOL Sexual',       v: sc.MENQOL_sexual       || 0, m: 20, b: sc.MENQOL_sexual       >= 14 ? 'High' : sc.MENQOL_sexual       >= 7 ? 'Moderate' : 'Low' },
    { l: 'ISI Sleep',           v: sc.ISI                 || 0, m: 28, b: sc.ISI_band   || '' },
  ];
  if (sc.PHQ9  != null) rows.push({ l: 'PHQ-9 Depression',     v: sc.PHQ9  || 0, m: 27, b: sc.PHQ9_band  || '' });
  if (sc.GAD7  != null) rows.push({ l: 'GAD-7 Anxiety',        v: sc.GAD7  || 0, m: 21, b: sc.GAD7_band  || '' });
  if (sc.PSS8  != null) rows.push({ l: 'PSS-8 Stress',         v: sc.PSS8  || 0, m: 32, b: sc.PSS8_band  || '' });
  if (sc.FSFI  != null) rows.push({ l: 'FSFI Sexual Function',  v: sc.FSFI  || 0, m: 36, b: sc.FSFI_band  || '' });
  if (sc.FSDSR != null) rows.push({ l: 'FSDSR Sexual Distress', v: sc.FSDSR || 0, m: 52, b: sc.FSDSR_band || '' });

  var rowsHtml = '';
  for (var i = 0; i < rows.length; i++) {
    var r   = rows[i];
    var pct = Math.round(Math.min(r.v / r.m, 1) * 100);
    var col = _pdScoreColour(r.v, r.m * 0.4, r.m * 0.7);
    rowsHtml += '<tr>'
      + '<td style="font-size:12px;color:#0F1E3C;padding:8px 10px">' + r.l + '</td>'
      + '<td style="padding:8px 10px"><span style="font-size:14px;font-weight:800;color:' + col + '">' + r.v + '</span><span style="font-size:10px;color:#64748B"> /' + r.m + '</span></td>'
      + '<td style="padding:8px 10px"><div class="pd-mini-bar" style="width:72px"><div class="pd-mini-fill" style="width:' + pct + '%;background:' + col + '"></div></div></td>'
      + '<td style="font-size:11px;font-weight:700;padding:8px 10px;color:' + col + '">' + r.b + '</td>'
      + '</tr>';
  }

  return '<div class="pd-panel" style="display:none">'
    + '<div class="pd-body"><div class="pd-card">'
    + '<div class="pd-card-hdr"><span class="pd-card-title">All clinical scores</span></div>'
    + '<table style="width:100%;border-collapse:collapse">'
    + '<thead><tr>'
    + '<th style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#64748B;background:#F1F5F9;padding:7px 10px;text-align:left">Instrument</th>'
    + '<th style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#64748B;background:#F1F5F9;padding:7px 10px;text-align:left">Score</th>'
    + '<th style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#64748B;background:#F1F5F9;padding:7px 10px;text-align:left">Bar</th>'
    + '<th style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#64748B;background:#F1F5F9;padding:7px 10px;text-align:left">Band</th>'
    + '</tr></thead>'
    + '<tbody>' + rowsHtml + '</tbody>'
    + '</table></div></div></div>';
}

/* PANEL 2: CARE PLAN */

var PD_TRIAGE_DESCRIPTIONS = {
  psychiatric_alert:           'Immediate mental health intervention — do not delay',
  psychologist_referral:       'Clinical psychology & evidence-based therapy (CBT/DBT)',
  gynecology_referral:         'Gynaecologist review — EvaEraHealth Clinic Gurugram',
  sexual_therapy_pathway:      'Integrated psychosexual therapy with qualified therapist',
  sexual_wellbeing_program:    'Sexual wellness education and personalised support',
  sleep_recovery_program:      'CBT-I and structured sleep hygiene programme',
  stress_management_program:   'Mindfulness, yoga and structured stress reduction',
  recommend_menopause_program: 'EvaEraHealth personalised menopause programme',
  exercise_program:            'Targeted movement prescription with physiotherapist',
  nutrition_guidance:          'Hormonal nutrition plan with certified nutritionist',
  relationship_counselling:    'Couples or individual relationship counselling',
  activate_psychosexual_module:'Psychosexual wellbeing module activation',
  gurugram_clinic:             'In-person consultation — Gurugram Flagship Centre',
};

function _pdPanel2_CarePlan(patient) {
  var triage = patient.triage || [];
  var cards  = '';

  if (triage.length) {
    var sevMap = {
      severe:   { bg: '#FEE2E2', border: '#F87171', dot: '#EF4444', label: 'Urgent',      tcol: '#B91C1C' },
      moderate: { bg: '#FEF3C7', border: '#FCD34D', dot: '#F59E0B', label: 'Recommended', tcol: '#92400E' },
      mild:     { bg: '#D1FAE5', border: '#6EE7B7', dot: '#16A34A', label: 'Advisory',    tcol: '#065F46' },
    };
    for (var i = 0; i < triage.length; i++) {
      var t   = triage[i];
      var c   = sevMap[t.sev] || sevMap.mild;
      var desc = PD_TRIAGE_DESCRIPTIONS[t.action] || '';
      cards += '<div style="background:' + c.bg + ';border:1px solid ' + c.border + ';border-radius:12px;padding:13px 15px">'
        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'
        + '<div style="width:8px;height:8px;border-radius:50%;background:' + c.dot + ';flex-shrink:0"></div>'
        + '<div style="font-size:13px;font-weight:700;color:#0F1E3C;text-transform:capitalize;flex:1">' + t.action.replace(/_/g, ' ') + '</div>'
        + '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;background:' + c.border + ';color:' + c.tcol + '">' + c.label + '</span>'
        + '</div>'
        + (desc ? '<div style="font-size:12px;color:#64748B;padding-left:16px">' + desc + '</div>' : '')
        + '</div>';
    }
  } else {
    cards = '<div style="text-align:center;padding:40px;color:#64748B;font-size:13px">No care actions — wellness baseline.</div>';
  }

  return '<div class="pd-panel" style="display:none">'
    + '<div class="pd-body">'
    + '<div style="display:flex;flex-direction:column;gap:10px">' + cards + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px">'
    + '<a href="tel:+918069050000" style="background:#C0305A;color:#fff;text-align:center;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;font-size:13px;display:block">📞 Call Clinic</a>'
    + '<a href="mailto:clinic@evaerahealth.in" style="background:rgba(0,188,212,.1);color:#0B7B74;text-align:center;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;border:1px solid rgba(11,123,116,.3);font-size:13px;display:block">✉ Email Clinic</a>'
    + '</div></div></div>';
}

/* PANEL 3: APPOINTMENTS */

function _pdApptItem(a) {
  var dt  = a.date ? new Date(a.date) : (a.bookedAt ? new Date(a.bookedAt) : null);
  var day = dt ? dt.getDate().toString().padStart(2, '0') : '—';
  var mon = dt ? dt.toLocaleString('en-IN', { month: 'short' }).toUpperCase() : '—';
  var badgeMap = {
    confirmed: { bg: '#D1FAE5', col: '#065F46' },
    completed: { bg: '#E0E7FF', col: '#3730A3' },
    pending:   { bg: '#FEF3C7', col: '#92400E' },
    cancelled: { bg: '#FEE2E2', col: '#B91C1C' },
  };
  var badge = badgeMap[a.status] || { bg: '#F1F5F9', col: '#64748B' };
  return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #E2E8F0">'
    + '<div style="width:40px;height:40px;background:#F1F5F9;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0">'
    + '<div style="font-size:15px;font-weight:800;color:#0F1E3C;line-height:1">' + day + '</div>'
    + '<div style="font-size:9px;font-weight:700;color:#64748B">' + mon + '</div>'
    + '</div>'
    + '<div style="flex:1">'
    + '<div style="font-size:12px;font-weight:700;color:#0F1E3C">' + (a.consultantName || 'Consultant') + ' · ' + (a.consultantSpec || a.spec || '') + '</div>'
    + '<div style="font-size:11px;color:#64748B">' + (a.time || '') + ' · ' + (a.mode || '') + ' · Rs ' + (a.fee || 0) + '</div>'
    + '</div>'
    + '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;background:' + badge.bg + ';color:' + badge.col + '">' + (a.status || '—') + '</span>'
    + '</div>';
}

function _pdPanel3_Appointments(appts) {
  var rows = '';
  if (appts.length) {
    for (var i = 0; i < appts.length; i++) rows += _pdApptItem(appts[i]);
  } else {
    rows = '<div style="text-align:center;padding:40px;color:#64748B;font-size:13px">No appointments yet. Book a consultation to get started.</div>';
  }

  return '<div class="pd-panel" style="display:none">'
    + '<div class="pd-body">'
    + '<div class="pd-card">'
    + '<div class="pd-card-hdr"><span class="pd-card-title">Appointment history</span></div>'
    + '<div class="pd-card-body" style="padding-top:4px">' + rows + '</div>'
    + '</div>'
    + '<button onclick="pdBookAppointment()" style="width:100%;padding:12px;background:#C0305A;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">+ Book New Appointment</button>'
    + '</div></div>';
}

/* PANEL 4: WEARABLE */

var PD_WEAR_NORMS = {
  avg_rhr:                { label: 'Resting HR',   unit: 'bpm',    warnHi: 80,   alertHi: 90   },
  avg_hrv:                { label: 'HRV',           unit: 'ms',     warnLo: 30,   alertLo: 20   },
  avg_spo2:               { label: 'SpO₂',          unit: '%',      warnLo: 95,   alertLo: 90   },
  avg_sleep:              { label: 'Avg sleep',     unit: 'hrs',    warnLo: 6.5,  alertLo: 5    },
  night_sweats_per_night: { label: 'Night sweats',  unit: '/night', warnHi: 2,    alertHi: 4    },
  avg_steps:              { label: 'Steps',         unit: '/day',   warnLo: 5000, alertLo: 3000 },
  avg_stress:             { label: 'Stress score',  unit: '/100',   warnHi: 50,   alertHi: 70   },
};

function _pdWearFlag(key, val) {
  var n = PD_WEAR_NORMS[key]; if (!n) return false;
  if (n.alertHi && val >= n.alertHi) return 'alert';
  if (n.warnHi  && val >= n.warnHi)  return 'warn';
  if (n.alertLo && val <= n.alertLo) return 'alert';
  if (n.warnLo  && val <= n.warnLo)  return 'warn';
  return false;
}

function _pdPanel4_Wearable(patient) {
  var wd      = patient.wearable_data || {};
  var device  = patient.wearable || '';
  var hasData = device && device !== 'None / No wearable' && Object.keys(wd).length > 0;

  if (!hasData) {
    return '<div class="pd-panel" style="display:none">'
      + '<div class="pd-body"><div class="pd-card">'
      + '<div class="pd-card-hdr"><span class="pd-card-title">Wearable data</span></div>'
      + '<div class="pd-card-body" style="text-align:center;padding:40px 14px;color:#64748B;font-size:13px">No wearable data linked.<br>Connect your device during reassessment.</div>'
      + '</div></div></div>';
  }

  var rows = '';
  var keys = Object.keys(PD_WEAR_NORMS);
  for (var i = 0; i < keys.length; i++) {
    var key  = keys[i];
    var norm = PD_WEAR_NORMS[key];
    var val  = wd[key]; if (val == null) continue;
    var flag = _pdWearFlag(key, val);
    var badgeHtml = flag === 'alert'
      ? '<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;background:#FEE2E2;color:#B91C1C">⚠ Alert</span>'
      : flag === 'warn'
      ? '<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;background:#FEF3C7;color:#92400E">⚠ Monitor</span>'
      : '<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;background:#D1FAE5;color:#065F46">✓ OK</span>';
    rows += '<div style="display:flex;align-items:center;padding:8px 0;border-bottom:1px solid #E2E8F0">'
      + '<div style="font-size:12px;color:#64748B;width:120px;flex-shrink:0">' + norm.label + '</div>'
      + '<div style="font-size:13px;font-weight:700;color:#0F1E3C;flex:1">' + val + ' <span style="font-size:10px;color:#64748B;font-weight:400">' + norm.unit + '</span></div>'
      + badgeHtml + '</div>';
  }

  var corrs    = wd.correlations || [];
  var corrHtml = '';
  if (corrs.length) {
    var corrItems = '';
    for (var j = 0; j < corrs.length; j++) corrItems += '<div style="font-size:11px;color:#78350F;padding:2px 0">• ' + corrs[j] + '</div>';
    corrHtml = '<div style="background:#FFF7ED;border:1px solid #FCD34D;border-radius:10px;padding:10px 12px;margin-top:10px">'
      + '<div style="font-size:11px;font-weight:700;color:#92400E;margin-bottom:5px">Clinical correlations</div>'
      + corrItems + '</div>';
  }

  return '<div class="pd-panel" style="display:none">'
    + '<div class="pd-body"><div class="pd-card">'
    + '<div class="pd-card-hdr"><span class="pd-card-title">Wearable — ' + device + '</span><span style="font-size:11px;color:#64748B">Last 30 days</span></div>'
    + '<div class="pd-card-body" style="padding-top:4px">' + rows + corrHtml + '</div>'
    + '</div></div></div>';
}

/* PANEL 5: HCP NOTES */

function _pdPanel5_HCPNotes(note, by) {
  var noteHtml = note
    ? '<div style="font-size:11px;font-weight:700;color:#0B7B74;margin-bottom:6px">' + by + '</div>'
      + '<div style="background:rgba(0,188,212,.05);border:1px solid rgba(0,188,212,.2);border-radius:10px;padding:12px;font-size:12px;color:#334155;line-height:1.6;white-space:pre-wrap">' + note + '</div>'
    : '<div style="text-align:center;padding:40px;color:#64748B;font-size:13px">No clinical notes available yet. Notes from your HCP will appear here after your consultation.</div>';

  return '<div class="pd-panel" style="display:none">'
    + '<div class="pd-body"><div class="pd-card">'
    + '<div class="pd-card-hdr"><span class="pd-card-title">Clinical notes from your HCP</span></div>'
    + '<div class="pd-card-body">' + noteHtml + '</div>'
    + '</div></div></div>';
}

/* RETAKE CTA */

function _pdRetakeCTA() {
  return '<div style="background:linear-gradient(135deg,#0F1E3C,#1A2F52);margin:0 16px 24px;border-radius:14px;padding:18px;text-align:center">'
    + '<div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:4px">Ready for your next check-in?</div>'
    + '<div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:14px">Reassess every 3 months to track your progress</div>'
    + '<button onclick="pdRetakeAssessment()" style="padding:10px 24px;background:#C0305A;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">↻ Start new assessment</button>'
    + '</div>';
}

/* TRIAGE ITEM HELPER */

function _pdTriageItem(t) {
  var sevMap = {
    severe:   { dot: '#EF4444', label: 'Urgent',      labBg: '#FEE2E2', labCol: '#B91C1C' },
    moderate: { dot: '#F59E0B', label: 'Recommended', labBg: '#FEF3C7', labCol: '#92400E' },
    mild:     { dot: '#16A34A', label: 'Advisory',    labBg: '#D1FAE5', labCol: '#065F46' },
  };
  var c = sevMap[t.sev] || sevMap.mild;
  return '<div style="display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid #E2E8F0">'
    + '<div style="width:8px;height:8px;border-radius:50%;background:' + c.dot + ';flex-shrink:0;margin-top:4px"></div>'
    + '<div style="flex:1">'
    + '<div style="font-size:12px;font-weight:700;color:#0F1E3C;text-transform:capitalize">' + t.action.replace(/_/g, ' ') + '</div>'
    + '<div style="font-size:11px;color:#64748B;margin-top:1px">' + (PD_TRIAGE_DESCRIPTIONS[t.action] || '') + '</div>'
    + '</div>'
    + '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;background:' + c.labBg + ';color:' + c.labCol + ';flex-shrink:0">' + c.label + '</span>'
    + '</div>';
}

/* ACTIONS */

function pdRetakeAssessment() {
  if (window.S) {
    S.answers   = {};
    S.scores    = {};
    S.triage    = [];
    S.stepIndex = 0;
  }
  if (typeof showConsent === 'function') { showConsent(); return; }
  if (typeof showScreen  === 'function') showScreen('consent-screen');
}

function pdSignOut() {
  if (window.S) { S.authId = null; S.session = null; }
  if (typeof intShowLauncher === 'function') { intShowLauncher(); return; }
  if (typeof showScreen === 'function') showScreen('auth-screen');
}

function pdBookAppointment() {
  if (typeof intShowBooking === 'function') { intShowBooking(); return; }
  if (typeof showScreen === 'function') showScreen('int-bk-screen');
}

/* STYLES */

function _pdStyles() {
  return '<style>'
    + '.pd-wrap{min-height:100vh;background:#F1F5F9;font-family:\'DM Sans\',sans-serif;color:#0F1E3C;font-size:13px}'
    + '.pd-nav{background:#0F1E3C;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50}'
    + '.pd-brand{font-size:15px;font-weight:800;color:#fff}'
    + '.pd-brand span:first-of-type{color:#F9A8C9}'
    + '.pd-brand-tag{font-size:9px;font-weight:700;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.15);border-radius:5px;padding:2px 6px;margin-left:6px;color:rgba(255,255,255,.55);vertical-align:middle}'
    + '.pd-nav-actions{display:flex;align-items:center;gap:8px}'
    + '.pd-btn-retake{padding:6px 14px;background:#C0305A;color:#fff;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer}'
    + '.pd-btn-signout{padding:6px 12px;background:transparent;border:1px solid rgba(255,255,255,.2);border-radius:8px;font-size:11px;color:rgba(255,255,255,.55);cursor:pointer}'
    + '.pd-welcome{background:linear-gradient(135deg,#0F1E3C,#1A2F52);padding:16px 20px 14px;position:relative;overflow:hidden}'
    + '.pd-welcome-name{font-size:20px;font-weight:800;color:#fff;margin-bottom:2px;position:relative;z-index:1}'
    + '.pd-welcome-sub{font-size:12px;color:rgba(255,255,255,.4);position:relative;z-index:1}'
    + '.pd-pills{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0;position:relative;z-index:1}'
    + '.pd-pill{display:flex;align-items:center;gap:4px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:4px 10px;font-size:11px;color:rgba(255,255,255,.7);font-weight:600}'
    + '.pd-comp-row{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px 14px;position:relative;z-index:1}'
    + '.pd-comp-label{font-size:11px;color:rgba(255,255,255,.4);margin-bottom:2px}'
    + '.pd-comp-score{font-size:44px;font-weight:900;line-height:1}'
    + '.pd-comp-band{font-size:15px;font-weight:700;margin-top:2px}'
    + '.pd-comp-bar-wrap{background:rgba(255,255,255,.1);border-radius:4px;height:6px;overflow:hidden}'
    + '.pd-comp-bar{height:100%;border-radius:4px;transition:width .4s}'
    + '.pd-comp-meta{font-size:10px;color:rgba(255,255,255,.3);margin-top:6px}'
    + '.pd-tabs-row{display:flex;background:#fff;border-bottom:1.5px solid #E2E8F0;overflow-x:auto;padding:0 14px;position:sticky;top:48px;z-index:40}'
    + '.pd-tab{padding:11px 13px;font-size:12px;font-weight:600;color:#64748B;cursor:pointer;border-bottom:2.5px solid transparent;white-space:nowrap;transition:all .15s}'
    + '.pd-tab.active{color:#C0305A;border-bottom-color:#C0305A}'
    + '.pd-panels{background:#F1F5F9}'
    + '.pd-panel{display:none}'
    + '.pd-body{padding:14px 16px;display:flex;flex-direction:column;gap:12px}'
    + '.pd-card{background:#fff;border:1px solid #E2E8F0;border-radius:14px;overflow:hidden}'
    + '.pd-card-hdr{padding:11px 14px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between}'
    + '.pd-card-title{font-size:13px;font-weight:700;color:#0F1E3C}'
    + '.pd-card-body{padding:12px 14px}'
    + '.pd-badge-rose{font-size:11px;color:#C0305A;font-weight:700}'
    + '.pd-domain-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
    + '.pd-dm{background:#F1F5F9;border-radius:10px;padding:10px 12px}'
    + '.pd-dm-label{font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px}'
    + '.pd-dm-val{font-size:20px;font-weight:800}'
    + '.pd-dm-max{font-size:11px;color:#64748B;font-weight:400}'
    + '.pd-dm-band{font-size:10px;font-weight:700;margin-top:2px}'
    + '.pd-mini-bar{height:4px;background:#E2E8F0;border-radius:2px;overflow:hidden;margin-top:6px}'
    + '.pd-mini-fill{height:100%;border-radius:2px}'
    + '</style>';
}

/* EXPOSE GLOBALLY */

window.checkReturningPatient = checkReturningPatient;
window.showPatientDashboard  = showPatientDashboard;
window.pdRetakeAssessment    = pdRetakeAssessment;
window.pdSignOut             = pdSignOut;
window.pdBookAppointment     = pdBookAppointment;
window._pdActivateTab        = _pdActivateTab;