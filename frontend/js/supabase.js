// var SUPABASE_URL = null;
// var SUPABASE_KEY = null;

// var _configLoaded  = false;
// var _configLoading = false;
// var _pendingQueue  = [];


// /* CONFIG LOADER */
// function _loadConfig() {
//   if (_configLoaded || _configLoading) return;
//   _configLoading = true;

//   var backendBase = (typeof OTP_BACKEND_URL !== 'undefined')
//     ? OTP_BACKEND_URL
//     : 'http://localhost:8000';

//   console.log('[Config] Fetching Supabase credentials from', backendBase + '/config');

//   fetch(backendBase + '/config', {
//     method:  'GET',
//     headers: { 'Content-Type': 'application/json' }
//   })
//   .then(function(res) {
//     if (!res.ok) throw new Error('HTTP ' + res.status);
//     return res.json();
//   })
//   .then(function(cfg) {
//     if (!cfg.supabase_url || !cfg.supabase_key) {
//       throw new Error('/config response missing supabase_url or supabase_key');
//     }
//     SUPABASE_URL   = cfg.supabase_url;
//     SUPABASE_KEY   = cfg.supabase_key;
//     _configLoaded  = true;
//     _configLoading = false;
//     console.log('[Config] ✓ Supabase credentials loaded');

//     if (_pendingQueue.length > 0) {
//       console.log('[Config] Draining', _pendingQueue.length, 'queued save(s)…');
//       _pendingQueue.forEach(function(item) {
//         try { item.fn(); } catch(e) {
//           console.error('[Config] Queued call failed (' + item.label + '):', e);
//         }
//       });
//       _pendingQueue = [];
//     }
//   })
//   .catch(function(err) {
//     _configLoading = false;
//     console.error('[Config] ✗ Failed to load Supabase credentials:', err.message);
//     _sbShowBanner('error',
//       '✗ Could not load app configuration.<br>' +
//       '<span style="font-weight:400">Please check the backend is running and refresh.</span>'
//     );
//   });
// }


// /*  READY GUARD */
// function _whenReady(fn, label) {
//   if (_configLoaded) {
//     fn();
//   } else {
//     console.warn('[Config] Not ready yet — queuing:', label);
//     _pendingQueue.push({ fn: fn, label: label });
//     _loadConfig();
//   }
// }


// /* DIAGNOSTIC BANNER */
// function _sbShowBanner(type, msg) {
//   var existing = document.getElementById('sb-status-banner');
//   if (existing) existing.remove();

//   var colors = {
//     warn:    { bg: '#FFF8E1', border: '#F9A825', text: '#5D4037' },
//     error:   { bg: '#FFEBEE', border: '#C62828', text: '#B71C1C' },
//     success: { bg: '#E8F5E9', border: '#2E7D32', text: '#1B5E20' }
//   };

//   var c = colors[type] || colors.warn;
//   var div = document.createElement('div');
//   div.id = 'sb-status-banner';
//   div.style.cssText = [
//     'position:fixed', 'bottom:80px', 'right:16px', 'z-index:9999',
//     'background:'    + c.bg,
//     'border:2px solid ' + c.border,
//     'border-radius:12px', 'padding:12px 16px', 'max-width:340px',
//     'font-family:sans-serif', 'font-size:13px', 'color:' + c.text,
//     'box-shadow:0 4px 20px rgba(0,0,0,0.15)', 'line-height:1.5'
//   ].join(';');
//   div.innerHTML = msg;
//   document.body.appendChild(div);
//   if (type === 'success') setTimeout(function() { div.remove(); }, 5000);
// }


// /* LOW-LEVEL REST INSERT */
// function _sbInsert(table, record) {
//   if (!SUPABASE_URL || !SUPABASE_KEY) {
//     return Promise.reject(new Error('Supabase credentials not loaded yet'));
//   }

//   return fetch(SUPABASE_URL + '/rest/v1/' + table, {
//     method:  'POST',
//     headers: {
//       'Content-Type':  'application/json',
//       'apikey':        SUPABASE_KEY,
//       'Authorization': 'Bearer ' + SUPABASE_KEY,
//       'Prefer':        'return=minimal'
//     },
//     body: JSON.stringify(record)
//   })
//   .then(function(res) {
//     if (!res.ok) {
//       return res.text().then(function(body) {
//         throw new Error('HTTP ' + res.status + ' — ' + body);
//       });
//     }
//     return res;
//   });
// }


// /* HELPERS */

// /* Current date in IST as "YYYY-MM-DD" */
// function _istNow() {
//   var now    = new Date();
//   var offset = 5.5 * 60 * 60 * 1000;
//   var ist    = new Date(now.getTime() + offset);
//   var yyyy   = ist.getUTCFullYear();
//   var mm     = String(ist.getUTCMonth() + 1).padStart(2, '0');
//   var dd     = String(ist.getUTCDate()).padStart(2, '0');
//   return yyyy + '-' + mm + '-' + dd;
// }

// /* BMI rounded to 1 dp, or null if inputs missing */
// function _calcBmi(weight_kg, height_cm) {
//   if (!weight_kg || !height_cm) return null;
//   var h = height_cm / 100;
//   return parseFloat((weight_kg / (h * h)).toFixed(1));
// }


// /* SAVE: SESSION */
// function saveSessionToSupabase() {
//   if (!S.session || !S.session.id) return;

//   _whenReady(function() {
//     var row = {
//       session_id: S.session.id,
//       email_id:   S.session.authId || null,
//       is_guest:   S.session.id.indexOf('guest_') === 0,
//       created_at: _istNow()
//     };

//     console.log('[Supabase] Saving session →', row);

//     _sbInsert('sessions', row)
//       .then(function()      { console.log('[Supabase] ✓ Session saved'); })
//       .catch(function(err)  {
//         console.error('[Supabase] ✗ Session save failed:', err.message);
//         _sbShowBanner('error', '✗ Session save failed:<br>' + err.message);
//       });
//   }, 'saveSessionToSupabase');
// }


// /* SAVE: CONSENT */
// function saveConsentToSupabase() {
//   if (!S.session || !S.session.id) return;

//   _whenReady(function() {
//     var cd = S.consentData || {};

//     var row = {
//       session_id:           S.session.id,
//       created_at:           _istNow(),
//       c1_health_data:       cd['c1'] === true,
//       c2_wearable_data:     cd['c2'] === true,
//       c3_ayurvedic_profile: cd['c3'] === true,
//       c4_ai_processing:     cd['c4'] === true,
//       c5_share_hcp:         cd['c5'] === true,
//       c6_research:          cd['c6'] === true,
//       c7_corporate:         cd['c7'] === true
//     };

//     console.log('[Supabase] Saving consent →', row);

//     _sbInsert('consent_records', row)
//       .then(function()     { console.log('[Supabase] ✓ Consent saved'); })
//       .catch(function(err) {
//         console.error('[Supabase] ✗ Consent save failed:', err.message);
//         _sbShowBanner('error', '✗ Consent save failed:<br>' + err.message);
//       });
//   }, 'saveConsentToSupabase');
// }


// /* ─── SAVE: DEMOGRAPHICS */
// function saveDemographicsToSupabase() {
//   if (!S.session || !S.session.id) return;

//   _whenReady(function() {
//     var a = S.answers || {};

//     function n(v)   { return (v !== undefined && v !== null && v !== '') ? v : null; }
//     function num(v) {
//       if (v == null || isNaN(v)) return null;
//       return parseFloat(parseFloat(v).toFixed(1));
//     }

//     var row = {
//       session_id:        S.session.id,
//       email_id:          S.session.authId ? S.session.authId.trim().toLowerCase() : null,  /* ← NEW */
//       full_name:         n(a.name),
//       age:               n(a.age),
//       city:              n(a.city),
//       height_cm:         num(a.height_cm),
//       weight_kg:         num(a.weight_kg),
//       bmi:               _calcBmi(a.weight_kg, a.height_cm),
//       marital_status:    n(a.marital),
//       occupation:        n(a.occupation),
//       highest_education: n(a.education),
//       created_at:        _istNow()
//     };

//     console.log('[Supabase] Saving demographics →', row);

//     _sbInsert('patient_demographics', row)
//       .then(function()     { console.log('[Supabase] ✓ Demographics saved'); })
//       .catch(function(err) {
//         console.error('[Supabase] ✗ Demographics save failed:', err.message);
//         _sbShowBanner('error', '✗ Demographics save failed:<br>' + err.message);
//       });
//   }, 'saveDemographicsToSupabase');
// }


// /* BUILD ASSESSMENT ROW */
// function buildSupabaseRow() {
//   var a     = S.answers       || {};
//   var comor = a.comorbidities || {};

//   function n(v)   { return (v !== undefined && v !== null && v !== '') ? v : null; }
//   function num(v) {
//     if (v == null || isNaN(v)) return null;
//     return parseFloat(parseFloat(v).toFixed(1));
//   }

//   return {
//     session_id:   n(S.session ? S.session.id : null),
//     created_at:   _istNow(),

//     // add this line inside buildSupabaseRow(), alongside session_id and created_at
//     email_id: S.session.authId ? S.session.authId.trim().toLowerCase() : null,
//     full_name:         n(a.name),
//     age:               n(a.age),
//     city:              n(a.city),
//     country:           n(a.country),
//     height_cm:         num(a.height_cm),
//     weight_kg:         num(a.weight_kg),
//     bmi:               _calcBmi(a.weight_kg, a.height_cm),
//     menstrual_status:  n(a.stage),
//     menstrual_pattern: n(a.menstrual_pattern),
//     marital_status:    n(a.marital),
//     occupation:        n(a.occupation),
//     highest_education: n(a.education),
//     ethnicity:         n(a.ethnicity),
//     hrt_history:       n(a.hrt_history),
//     parity:            n(a.parity),
//     smoking_history:   n(a.smoking_history),
//     alcohol_use:       n(a.alcohol_use),
//     prakriti:          n(a.prakriti),
//     vikriti:           n(a.vikriti),
//     wearable_device:   n(a.wearable),

//     rf1_unusual_vaginal_bleeding: n(a.rf1 !== undefined ? (a.rf1 ? 'Yes' : 'No') : null),
//     rf2_persistent_pelvic_pain:   n(a.rf2 !== undefined ? (a.rf2 ? 'Yes' : 'No') : null),
//     rf3_breast_changes:           n(a.rf3 !== undefined ? (a.rf3 ? 'Yes' : 'No') : null),

//     mq_v1_hot_flushes:      n(a.mq_v1),
//     mq_v2_night_sweats:     n(a.mq_v2),
//     mq_v3_daytime_sweating: n(a.mq_v3),
//     mq_v4_feeling_cold:     n(a.mq_v4),
//     mq_v5_palpitations:     n(a.mq_v5),
//     mq_v6_facial_flushing:  n(a.mq_v6),

//     mq_p1_fatigue:            n(a.mq_p1),
//     mq_p2_sleep_difficulty:   n(a.mq_p2),
//     mq_p3_joint_muscle_pain:  n(a.mq_p3),
//     mq_p4_skin_changes:       n(a.mq_p4),
//     mq_p5_weight_gain:        n(a.mq_p5),
//     mq_p6_headaches:          n(a.mq_p6),
//     mq_p7_hair_loss:          n(a.mq_p7),
//     mq_p8_appearance_concern: n(a.mq_p8),

//     mq_ps1_anxiety:          n(a.mq_ps1),
//     mq_ps2_loss_of_interest: n(a.mq_ps2),
//     mq_ps3_depression:       n(a.mq_ps3),
//     mq_ps4_irritability:     n(a.mq_ps4),
//     mq_ps5_overwhelmed:      n(a.mq_ps5),
//     mq_ps6_brain_fog:        n(a.mq_ps6),
//     mq_ps7_low_motivation:   n(a.mq_ps7),

//     mq_s1_reduced_desire:    n(a.mq_s1),
//     mq_s2_vaginal_dryness:   n(a.mq_s2),
//     mq_s3_avoiding_intimacy: n(a.mq_s3),

//     isi_0_difficulty_falling_asleep: n(a.isi_0),
//     isi_1_difficulty_staying_asleep: n(a.isi_1),
//     isi_2_early_awakening:           n(a.isi_2),
//     isi_3_sleep_satisfaction:        n(a.isi_3),
//     isi_4_noticeable_to_others:      n(a.isi_4),
//     isi_5_worried_about_sleep:       n(a.isi_5),
//     isi_6_daytime_interference:      n(a.isi_6),

//     comor_hypertension:        n(comor['Hypertension']),
//     comor_diabetes:            n(comor['Diabetes']),
//     comor_hypothyroidism:      n(comor['Hypothyroidism']),
//     comor_hyperthyroidism:     n(comor['Hyperthyroidism']),
//     comor_hyperlipidemia:      n(comor['Hyperlipidemia']),
//     comor_anaemia:             n(comor['Anaemia']),
//     comor_pcod:                n(comor['PCOD']),
//     comor_osteoporosis:        n(comor['Osteoporosis']),
//     comor_heart_disease:       n(comor['Heart Disease']),
//     comor_ckd:                 n(comor['CKD']),
//     comor_autoimmune_disorder: n(comor['Autoimmune Disorder']),
//     comor_stroke_history:      n(comor['Stroke (history)']),
//     comor_cancer_history:      n(comor['Cancer (history)']),

//     scores: S.scores ? JSON.parse(JSON.stringify(S.scores)) : null,
//     triage: S.triage ? JSON.parse(JSON.stringify(S.triage)) : null
//   };
// }


// /* SAVE: FULL ASSESSMENT */
// function saveToSupabase() {
//   if (window.location.protocol === 'file:') {
//     console.error('[Supabase] file:// protocol — use a local HTTP server.');
//     _sbShowBanner('error', '✗ Please use a local HTTP server, not file://');
//     return;
//   }

//   _whenReady(function() {
//     var row = buildSupabaseRow();
//     console.log('[Supabase] Saving assessment →', row);

//     _sbInsert('assessments', row)
//       .then(function()     {
//         console.log('[Supabase] ✓ Assessment saved successfully');
//         _sbShowBanner('success', '✓ Assessment saved successfully.');
//       })
//       .catch(function(err) {
//         console.error('[Supabase] ✗ Assessment save failed:', err.message);
//         _sbShowBanner('error', '✗ Assessment save failed:<br>' + err.message);
//       });
//   }, 'saveToSupabase');
// }


// /* BOOT */
// _loadConfig();















var SUPABASE_URL = null;
var SUPABASE_KEY = null;

var _configLoaded  = false;
var _configLoading = false;
var _pendingQueue  = [];


/* CONFIG LOADER */
function _loadConfig() {
  if (_configLoaded || _configLoading) return;
  _configLoading = true;

  var backendBase = (typeof OTP_BACKEND_URL !== 'undefined')
    ? OTP_BACKEND_URL
    // : 'http://localhost:8000';
    : 'https://evaerahealth-femtech.onrender.com';

  console.log('[Config] Fetching Supabase credentials from', backendBase + '/config');

  fetch(backendBase + '/config', {
    method:  'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  .then(function(res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  })
  .then(function(cfg) {
    if (!cfg.supabase_url || !cfg.supabase_key) {
      throw new Error('/config response missing supabase_url or supabase_key');
    }
    SUPABASE_URL   = cfg.supabase_url;
    SUPABASE_KEY   = cfg.supabase_key;
    _configLoaded  = true;
    _configLoading = false;
    console.log('[Config] ✓ Supabase credentials loaded');

    if (_pendingQueue.length > 0) {
      console.log('[Config] Draining', _pendingQueue.length, 'queued save(s)…');
      _pendingQueue.forEach(function(item) {
        try { item.fn(); } catch(e) {
          console.error('[Config] Queued call failed (' + item.label + '):', e);
        }
      });
      _pendingQueue = [];
    }
  })
  .catch(function(err) {
    _configLoading = false;
    console.error('[Config] ✗ Failed to load Supabase credentials:', err.message);
    _sbShowBanner('error',
      '✗ Could not load app configuration.<br>' +
      '<span style="font-weight:400">Please check the backend is running and refresh.</span>'
    );
  });
}


/* READY GUARD */
function _whenReady(fn, label) {
  if (_configLoaded) {
    fn();
  } else {
    console.warn('[Config] Not ready yet — queuing:', label);
    _pendingQueue.push({ fn: fn, label: label });
    _loadConfig();
  }
}


/* DIAGNOSTIC BANNER */
function _sbShowBanner(type, msg) {
  var existing = document.getElementById('sb-status-banner');
  if (existing) existing.remove();

  var colors = {
    warn:    { bg: '#FFF8E1', border: '#F9A825', text: '#5D4037' },
    error:   { bg: '#FFEBEE', border: '#C62828', text: '#B71C1C' },
    success: { bg: '#E8F5E9', border: '#2E7D32', text: '#1B5E20' }
  };

  var c = colors[type] || colors.warn;
  var div = document.createElement('div');
  div.id = 'sb-status-banner';
  div.style.cssText = [
    'position:fixed', 'bottom:80px', 'right:16px', 'z-index:9999',
    'background:'    + c.bg,
    'border:2px solid ' + c.border,
    'border-radius:12px', 'padding:12px 16px', 'max-width:340px',
    'font-family:sans-serif', 'font-size:13px', 'color:' + c.text,
    'box-shadow:0 4px 20px rgba(0,0,0,0.15)', 'line-height:1.5'
  ].join(';');
  div.innerHTML = msg;
  document.body.appendChild(div);
  if (type === 'success') setTimeout(function() { div.remove(); }, 5000);
}


/* LOW-LEVEL REST INSERT */
function _sbInsert(table, record) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return Promise.reject(new Error('Supabase credentials not loaded yet'));
  }

  return fetch(SUPABASE_URL + '/rest/v1/' + table, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Prefer':        'return=minimal'
    },
    body: JSON.stringify(record)
  })
  .then(function(res) {
    if (!res.ok) {
      return res.text().then(function(body) {
        throw new Error('HTTP ' + res.status + ' — ' + body);
      });
    }
    return res;
  });
}


/* HELPERS */

/* Current date in IST as "YYYY-MM-DD" */
function _istDate() {
  var now    = new Date();
  var offset = 5.5 * 60 * 60 * 1000;
  var ist    = new Date(now.getTime() + offset);
  var yyyy   = ist.getUTCFullYear();
  var mm     = String(ist.getUTCMonth() + 1).padStart(2, '0');
  var dd     = String(ist.getUTCDate()).padStart(2, '0');
  return yyyy + '-' + mm + '-' + dd;
}

/* Current time in IST as "HH:MM:SS" */
function _istTime() {
  var now    = new Date();
  var offset = 5.5 * 60 * 60 * 1000;
  var ist    = new Date(now.getTime() + offset);
  var hh     = String(ist.getUTCHours()).padStart(2, '0');
  var min    = String(ist.getUTCMinutes()).padStart(2, '0');
  var ss     = String(ist.getUTCSeconds()).padStart(2, '0');
  return hh + ':' + min + ':' + ss;
}

/* BMI rounded to 1 dp, or null if inputs missing */
function _calcBmi(weight_kg, height_cm) {
  if (!weight_kg || !height_cm) return null;
  var h = height_cm / 100;
  return parseFloat((weight_kg / (h * h)).toFixed(1));
}


/* SAVE: SESSION */
function saveSessionToSupabase() {
  if (!S.session || !S.session.id) return;

  _whenReady(function() {
    var row = {
      session_id: S.session.id,
      email_id:   S.session.authId || null,
      is_guest:   S.session.id.indexOf('guest_') === 0,
      login_date: _istDate(),
      login_time: _istTime()
    };

    console.log('[Supabase] Saving session →', row);

    _sbInsert('sessions', row)
      .then(function()      { console.log('[Supabase] ✓ Session saved'); })
      .catch(function(err)  {
        console.error('[Supabase] ✗ Session save failed:', err.message);
        _sbShowBanner('error', '✗ Session save failed:<br>' + err.message);
      });
  }, 'saveSessionToSupabase');
}


/* SAVE: CONSENT */
function saveConsentToSupabase() {
  if (!S.session || !S.session.id) return;

  _whenReady(function() {
    var cd = S.consentData || {};

    var row = {
      session_id:           S.session.id,
      login_date:           _istDate(),
      login_time:           _istTime(),
      c1_health_data:       cd['c1'] === true,
      c2_wearable_data:     cd['c2'] === true,
      c3_ayurvedic_profile: cd['c3'] === true,
      c4_ai_processing:     cd['c4'] === true,
      c5_share_hcp:         cd['c5'] === true,
      c6_research:          cd['c6'] === true,
      c7_corporate:         cd['c7'] === true
    };

    console.log('[Supabase] Saving consent →', row);

    _sbInsert('consent_records', row)
      .then(function()     { console.log('[Supabase] ✓ Consent saved'); })
      .catch(function(err) {
        console.error('[Supabase] ✗ Consent save failed:', err.message);
        _sbShowBanner('error', '✗ Consent save failed:<br>' + err.message);
      });
  }, 'saveConsentToSupabase');
}


/* SAVE: DEMOGRAPHICS */
function saveDemographicsToSupabase() {
  if (!S.session || !S.session.id) return;

  _whenReady(function() {
    var a = S.answers || {};

    function n(v)   { return (v !== undefined && v !== null && v !== '') ? v : null; }
    function num(v) {
      if (v == null || isNaN(v)) return null;
      return parseFloat(parseFloat(v).toFixed(1));
    }

    var row = {
      session_id:        S.session.id,
      email_id:          S.session.authId ? S.session.authId.trim().toLowerCase() : null,
      full_name:         n(a.name),
      age:               n(a.age),
      city:              n(a.city),
      height_cm:         num(a.height_cm),
      weight_kg:         num(a.weight_kg),
      bmi:               _calcBmi(a.weight_kg, a.height_cm),
      marital_status:    n(a.marital),
      occupation:        n(a.occupation),
      highest_education: n(a.education),
      login_date:        _istDate(),
      login_time:        _istTime()
    };

    console.log('[Supabase] Saving demographics →', row);

    _sbInsert('patient_demographics', row)
      .then(function()     { console.log('[Supabase] ✓ Demographics saved'); })
      .catch(function(err) {
        console.error('[Supabase] ✗ Demographics save failed:', err.message);
        _sbShowBanner('error', '✗ Demographics save failed:<br>' + err.message);
      });
  }, 'saveDemographicsToSupabase');
}


/* BUILD ASSESSMENT ROW */
function buildSupabaseRow() {
  var a     = S.answers       || {};
  var comor = a.comorbidities || {};

  function n(v)   { return (v !== undefined && v !== null && v !== '') ? v : null; }
  function num(v) {
    if (v == null || isNaN(v)) return null;
    return parseFloat(parseFloat(v).toFixed(1));
  }

  return {
    session_id:        n(S.session ? S.session.id : null),
    login_date:        _istDate(),
    login_time:        _istTime(),
    email_id:          S.session.authId ? S.session.authId.trim().toLowerCase() : null,

    full_name:         n(a.name),
    age:               n(a.age),
    city:              n(a.city),
    country:           n(a.country),
    height_cm:         num(a.height_cm),
    weight_kg:         num(a.weight_kg),
    bmi:               _calcBmi(a.weight_kg, a.height_cm),
    menstrual_status:  n(a.stage),
    menstrual_pattern: n(a.menstrual_pattern),
    marital_status:    n(a.marital),
    occupation:        n(a.occupation),
    highest_education: n(a.education),
    ethnicity:         n(a.ethnicity),
    hrt_history:       n(a.hrt_history),
    parity:            n(a.parity),
    smoking_history:   n(a.smoking_history),
    alcohol_use:       n(a.alcohol_use),
    prakriti:          n(a.prakriti),
    vikriti:           n(a.vikriti),
    wearable_device:   n(a.wearable),

    rf1_unusual_vaginal_bleeding: n(a.rf1 !== undefined ? (a.rf1 ? 'Yes' : 'No') : null),
    rf2_persistent_pelvic_pain:   n(a.rf2 !== undefined ? (a.rf2 ? 'Yes' : 'No') : null),
    rf3_breast_changes:           n(a.rf3 !== undefined ? (a.rf3 ? 'Yes' : 'No') : null),

    mq_v1_hot_flushes:      n(a.mq_v1),
    mq_v2_night_sweats:     n(a.mq_v2),
    mq_v3_daytime_sweating: n(a.mq_v3),
    mq_v4_feeling_cold:     n(a.mq_v4),
    mq_v5_palpitations:     n(a.mq_v5),
    mq_v6_facial_flushing:  n(a.mq_v6),

    mq_p1_fatigue:            n(a.mq_p1),
    mq_p2_sleep_difficulty:   n(a.mq_p2),
    mq_p3_joint_muscle_pain:  n(a.mq_p3),
    mq_p4_skin_changes:       n(a.mq_p4),
    mq_p5_weight_gain:        n(a.mq_p5),
    mq_p6_headaches:          n(a.mq_p6),
    mq_p7_hair_loss:          n(a.mq_p7),
    mq_p8_appearance_concern: n(a.mq_p8),

    mq_ps1_anxiety:          n(a.mq_ps1),
    mq_ps2_loss_of_interest: n(a.mq_ps2),
    mq_ps3_depression:       n(a.mq_ps3),
    mq_ps4_irritability:     n(a.mq_ps4),
    mq_ps5_overwhelmed:      n(a.mq_ps5),
    mq_ps6_brain_fog:        n(a.mq_ps6),
    mq_ps7_low_motivation:   n(a.mq_ps7),

    mq_s1_reduced_desire:    n(a.mq_s1),
    mq_s2_vaginal_dryness:   n(a.mq_s2),
    mq_s3_avoiding_intimacy: n(a.mq_s3),

    isi_0_difficulty_falling_asleep: n(a.isi_0),
    isi_1_difficulty_staying_asleep: n(a.isi_1),
    isi_2_early_awakening:           n(a.isi_2),
    isi_3_sleep_satisfaction:        n(a.isi_3),
    isi_4_noticeable_to_others:      n(a.isi_4),
    isi_5_worried_about_sleep:       n(a.isi_5),
    isi_6_daytime_interference:      n(a.isi_6),

    comor_hypertension:        n(comor['Hypertension']),
    comor_diabetes:            n(comor['Diabetes']),
    comor_hypothyroidism:      n(comor['Hypothyroidism']),
    comor_hyperthyroidism:     n(comor['Hyperthyroidism']),
    comor_hyperlipidemia:      n(comor['Hyperlipidemia']),
    comor_anaemia:             n(comor['Anaemia']),
    comor_pcod:                n(comor['PCOD']),
    comor_osteoporosis:        n(comor['Osteoporosis']),
    comor_heart_disease:       n(comor['Heart Disease']),
    comor_ckd:                 n(comor['CKD']),
    comor_autoimmune_disorder: n(comor['Autoimmune Disorder']),
    comor_stroke_history:      n(comor['Stroke (history)']),
    comor_cancer_history:      n(comor['Cancer (history)']),

    scores: S.scores ? JSON.parse(JSON.stringify(S.scores)) : null,
    triage: S.triage ? JSON.parse(JSON.stringify(S.triage)) : null
  };
}


/* SAVE: FULL ASSESSMENT */
function saveToSupabase() {
  if (window.location.protocol === 'file:') {
    console.error('[Supabase] file:// protocol — use a local HTTP server.');
    _sbShowBanner('error', '✗ Please use a local HTTP server, not file://');
    return;
  }

  _whenReady(function() {
    var row = buildSupabaseRow();
    console.log('[Supabase] Saving assessment →', row);

    _sbInsert('assessments', row)
      .then(function()     {
        console.log('[Supabase] ✓ Assessment saved successfully');
        _sbShowBanner('success', '✓ Assessment saved successfully.');
      })
      .catch(function(err) {
        console.error('[Supabase] ✗ Assessment save failed:', err.message);
        _sbShowBanner('error', '✗ Assessment save failed:<br>' + err.message);
      });
  }, 'saveToSupabase');
}


/* BOOT */
_loadConfig();