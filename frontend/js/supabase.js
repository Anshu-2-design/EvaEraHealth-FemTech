var SUPABASE_URL  = 'https://ilxgfycqdxzfqnxcycpn.supabase.co';
var SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlseGdmeWNxZHh6ZnFueGN5Y3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDgyMjcsImV4cCI6MjA5MTY4NDIyN30.rTSj6Q13jFVYuE8CWt-MV31X0RTbB9IuCU-jfbZWK8E';


/* On-screen diagnostic banner */
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
    'background:' + c.bg, 'border:2px solid ' + c.border,
    'border-radius:12px', 'padding:12px 16px', 'max-width:340px',
    'font-family:sans-serif', 'font-size:13px', 'color:' + c.text,
    'box-shadow:0 4px 20px rgba(0,0,0,0.15)', 'line-height:1.5'
  ].join(';');
  div.innerHTML = msg;
  document.body.appendChild(div);
  if (type === 'success') setTimeout(function(){ div.remove(); }, 5000);
}

/* Low-level REST insert  */
function _sbInsert(table, record) {
  return fetch(SUPABASE_URL + '/rest/v1/' + table, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Prefer':        'return=minimal'
    },
    body: JSON.stringify(record)
  }).then(function(res) {
    if (!res.ok) {
      return res.text().then(function(body) {
        throw new Error('HTTP ' + res.status + ' — ' + body);
      });
    }
    return res;
  });
}

/* Map S.answers + S.scores → flat row matching your schema */
function buildSupabaseRow() {
  var a     = S.answers       || {};
  var sc    = S.scores        || {};
  var comor = a.comorbidities || {};

  // Returns null for empty/undefined values
  function n(v) { return (v !== undefined && v !== null && v !== '') ? v : null; }
  function num(v) {
    if (v == null || isNaN(v)) return null;
    return parseFloat(parseFloat(v).toFixed(1));
  }

  return {
    session_id: n(S.session ? S.session.id : 'guest'),

    // Demographics 
    full_name:        n(a.name),
    age:              n(a.age),
    city:             n(a.city),
    country:          n(a.country),
    ethnicity:        n(a.ethnicity),
    height_cm:        n(a.height_cm),
    weight_kg:        n(a.weight_kg),
    bmi:              num(a.bmi),
    marital_status:   n(a.marital),
    occupation:       n(a.occupation),
    education:        n(a.education),
    smoking_history:  n(a.smoking_history),
    alcohol_use:      n(a.alcohol_use),
    hrt_history:      n(a.hrt_history),
    parity:           n(a.parity),
    prakriti:         n(a.prakriti),
    vikriti:          n(a.vikriti),

    // Red Flags 
    rf1_unusual_vaginal_bleeding: n(a.rf1 !== undefined ? (a.rf1 ? 'Yes' : 'No') : null),
    rf2_persistent_pelvic_pain:   n(a.rf2 !== undefined ? (a.rf2 ? 'Yes' : 'No') : null),
    rf3_breast_changes:           n(a.rf3 !== undefined ? (a.rf3 ? 'Yes' : 'No') : null),

    // MenQOL Vasomotor 
    mq_v1_hot_flushes:      n(a.mq_v1),
    mq_v2_night_sweats:     n(a.mq_v2),
    mq_v3_daytime_sweating: n(a.mq_v3),
    mq_v4_feeling_cold:     n(a.mq_v4),
    mq_v5_palpitations:     n(a.mq_v5),
    mq_v6_facial_flushing:  n(a.mq_v6),

    // MenQOL Physical
    mq_p1_fatigue:            n(a.mq_p1),
    mq_p2_sleep_difficulty:   n(a.mq_p2),
    mq_p3_joint_muscle_pain:  n(a.mq_p3),
    mq_p4_skin_changes:       n(a.mq_p4),
    mq_p5_weight_gain:        n(a.mq_p5),
    mq_p6_headaches:          n(a.mq_p6),
    mq_p7_hair_loss:          n(a.mq_p7),
    mq_p8_appearance_concern: n(a.mq_p8),

    // MenQOL Psychosocial 
    mq_ps1_anxiety:          n(a.mq_ps1),
    mq_ps2_loss_of_interest: n(a.mq_ps2),
    mq_ps3_depression:       n(a.mq_ps3),
    mq_ps4_irritability:     n(a.mq_ps4),
    mq_ps5_overwhelmed:      n(a.mq_ps5),
    mq_ps6_brain_fog:        n(a.mq_ps6),
    mq_ps7_low_motivation:   n(a.mq_ps7),

    // ── MenQOL Sexual 
    mq_s1_reduced_desire:    n(a.mq_s1),
    mq_s2_vaginal_dryness:   n(a.mq_s2),
    mq_s3_avoiding_intimacy: n(a.mq_s3),

    // ── ISI
    isi_0_difficulty_falling_asleep: n(a.isi_0),
    isi_1_difficulty_staying_asleep: n(a.isi_1),
    isi_2_early_awakening:           n(a.isi_2),
    isi_3_sleep_satisfaction:        n(a.isi_3),
    isi_4_noticeable_to_others:      n(a.isi_4),
    isi_5_worried_about_sleep:       n(a.isi_5),
    isi_6_daytime_interference:      n(a.isi_6),

    // ── Wearable 
    wearable_device: n(a.wearable),

    // ── Comorbidities
    comor_hypertension:    n(comor['Hypertension']),
    comor_diabetes:        n(comor['Diabetes']),
    comor_hypothyroidism:  n(comor['Hypothyroidism']),
    comor_hyperthyroidism: n(comor['Hyperthyroidism']),
    comor_hyperlipidemia:  n(comor['Hyperlipidemia']),
    comor_anaemia:         n(comor['Anaemia']),
    comor_pcod:            n(comor['PCOD']),
    comor_osteoporosis:    n(comor['Osteoporosis']),
    comor_heart_disease:   n(comor['Heart Disease']),
    comor_ckd:             n(comor['CKD']),
    comor_autoimmune:      n(comor['Autoimmune Disorder']),
    comor_stroke:          n(comor['Stroke (history)']),
    comor_cancer:          n(comor['Cancer (history)'])
 
  };
}

/* Main save — called directly from results.js */
function saveToSupabase() {

  if (!SUPABASE_URL || SUPABASE_URL.indexOf('YOUR_PROJECT_ID') !== -1 ||
      !SUPABASE_KEY  || SUPABASE_KEY.indexOf('YOUR_SUPABASE_ANON_KEY') !== -1) {
    console.warn('[Supabase] Credentials not set in js/supabase.js');
    return;
  }

  if (window.location.protocol === 'file:') {
    console.error('[Supabase] file:// protocol — use a local HTTP server.');
    return;
  }

  var row = buildSupabaseRow();
  console.log('[Supabase] Saving →', row);

  _sbInsert('patient_assessments', row)
    .then(function() {
      console.log('[Supabase] ✓ Saved successfully');
    })
    .catch(function(err) {
      console.error('[Supabase] ✗ Failed:', err.message);
    });
}
