// /** Maps triage action keys to display emoji */
// const TRIAGE_ICONS = {
//   psychiatric_alert:        '🚨',
//   gynecology_referral:      '👩‍⚕️',
//   psychologist_referral:    '🧠',
//   sexual_therapy_pathway:   '💙',
//   sleep_recovery_program:   '😴',
//   stress_management_program:'🌿',
//   recommend_menopause_program:'🌸',
//   gurugram_clinic:          '🏥',
//   exercise_program:         '🏃',
//   nutrition_guidance:       '🥗',
//   sexual_wellbeing_program: '💜',
//   activate_psychosexual_module:'💙',
//   relationship_counselling: '🤝',
// };

// /** Maps triage action keys to short descriptions */
// const TRIAGE_DESCRIPTIONS = {
//   psychiatric_alert:          'Immediate mental health intervention — do not delay',
//   psychologist_referral:      'Clinical psychology & evidence-based therapy (CBT/DBT)',
//   gynecology_referral:        'Gynaecologist review — EvaEraHealth Clinic Gurugram',
//   sexual_therapy_pathway:     'Integrated psychosexual therapy with qualified therapist',
//   sexual_wellbeing_program:   'Sexual wellness education and personalised support',
//   sleep_recovery_program:     'CBT-I and structured sleep hygiene programme',
//   stress_management_program:  'Mindfulness, yoga and structured stress reduction',
//   recommend_menopause_program:'EvaEraHealth personalised menopause programme',
//   exercise_program:           'Targeted movement prescription with physiotherapist',
//   nutrition_guidance:         'Hormonal nutrition plan with certified nutritionist',
//   relationship_counselling:   'Couples or individual relationship counselling',
//   activate_psychosexual_module:'Psychosexual wellbeing module activation',
//   gurugram_clinic:            'In-person consultation — Gurugram Flagship Centre',
// };

// /**
//  * Normal ranges and clinical correlation logic for wearable metrics.
//  * Each entry: { lo, hi, unit, label, correlation(value, scores) → { flag, note } }
//  */
// const WEARABLE_NORMS = {
//   avg_rhr: {
//     lo: 40, hi: 80, unit: 'bpm', label: 'Resting HR',
//     correlation(v, s) {
//       if (v > 80) {
//         let note = 'Elevated RHR';
//         if (s.MENQOL_vasomotor >= 10) note += ` — correlates with vasomotor ${s.MENQOL_vasomotor}/20`;
//         return { flag: true, note };
//       }
//       return { flag: false, note: 'Normal range' };
//     },
//   },
//   avg_hrv: {
//     lo: 20, hi: 60, unit: 'ms', label: 'HRV',
//     correlation(v, s) {
//       if (v < 20) return { flag: true, note: `Severely low — autonomic stress. PSS-8: ${s.PSS8 || '—'}/32, GAD-7: ${s.GAD7 || '—'}/21` };
//       if (v < 30) return { flag: true, note: `Low HRV — stress burden present. ISI sleep: ${s.ISI || '—'}/28` };
//       return { flag: false, note: 'Adequate autonomic resilience' };
//     },
//   },
//   avg_spo2: {
//     lo: 95, hi: 100, unit: '%', label: 'SpO₂',
//     correlation(v) {
//       if (v < 90) return { flag: true, note: '⚠️ URGENT — below 90%, refer immediately' };
//       if (v < 95) return { flag: true, note: 'Below normal — possible sleep apnoea' };
//       return { flag: false, note: 'Normal' };
//     },
//   },
//   avg_sleep: {
//     lo: 7, hi: 9, unit: 'hrs', label: 'Avg Sleep',
//     correlation(v, s, wd) {
//       const sweats = wd.night_sweats_per_night || 0;
//       if (v < 5)   return { flag: true, note: `Severe deprivation. ISI: ${s.ISI || '—'}/28 (${s.ISI_band || '—'}). Night sweats: ${sweats}/night` };
//       if (v < 6.5) return { flag: true, note: `Below target (7–9h). ISI: ${s.ISI || '—'}/28 (${s.ISI_band || '—'})` };
//       return { flag: false, note: 'Within target range' };
//     },
//   },
//   avg_steps: {
//     lo: 7500, hi: 15000, unit: '/day', label: 'Steps',
//     correlation(v, s) {
//       if (v < 3000) return { flag: true, note: `Very sedentary — Physical MenQOL: ${s.MENQOL_physical || '—'}/20` };
//       if (v < 5000) return { flag: true, note: 'Low activity — target ≥7,500/day' };
//       return { flag: false, note: 'Good activity level' };
//     },
//   },
//   avg_stress: {
//     lo: 0, hi: 30, unit: '/100', label: 'Stress Score',
//     correlation(v, s) {
//       if (v > 70) return { flag: true, note: `Very high — PSS-8: ${s.PSS8 || '—'}/32, GAD-7: ${s.GAD7 || '—'}/21` };
//       if (v > 50) return { flag: true, note: `Elevated — correlates with psychosocial: ${s.MENQOL_psychosocial || '—'}/20` };
//       return { flag: false, note: 'Within normal' };
//     },
//   },
//   night_sweats_per_night: {
//     lo: 0, hi: 1, unit: '/night', label: 'Night Sweats',
//     correlation(v, s) {
//       if (v >= 4) return { flag: true, note: `Severe vasomotor — MenQOL Vasomotor: ${s.MENQOL_vasomotor || '—'}/20` };
//       if (v >= 2) return { flag: true, note: 'Significant — correlates with vasomotor domain' };
//       return { flag: false, note: 'Mild/absent' };
//     },
//   },
// };



// // DEMO DATA

// /**
//  * Five representative demo patients covering different clinical profiles.
//  * Added to S.patients on first load if no real patients exist.
//  */
// const DEMO_PATIENTS = [
//   {
//     id: 'P_GYNE', name: 'Meena Iyer', age: 54, city: 'Chennai',
//     stage: 'Post-Menopause', prakriti: 'Pitta', vikriti: 'Pitta_excess',
//     scores: {
//       composite: 50, composite_band: 'Moderate',
//       MENQOL_vasomotor: 15, MENQOL_physical: 12, MENQOL_psychosocial: 8, MENQOL_sexual: 8,
//       PHQ9: 8, PHQ9_band: 'Mild', GAD7: 7, GAD7_band: 'Mild',
//       PSS8: 16, PSS8_band: 'Moderate', ISI: 7, ISI_band: 'None',
//       FSFI: null, FSDSR: null, FSFI_band: 'Not assessed', FSDSR_band: 'Not assessed',
//       MCSS: 0, rf1: 'Yes', rf2: 'No', rf3: 'Yes', comorbidityMod: 13,
//     },
//     triage: [
//       { action: 'gynecology_referral',        sev: 'severe',   rules: ['RED_FLAG'] },
//       { action: 'recommend_menopause_program', sev: 'moderate', rules: ['EVR_VM'] },
//       { action: 'stress_management_program',   sev: 'moderate', rules: ['EVR_PS'] },
//     ],
//     redFlags: ['Unusual vaginal bleeding', 'Breast changes'],
//     flags: { gyneRedFlag: true, menqolPsychTriggered: false, menqolSexualTriggered: false, sleepModerate: false, sleepSevere: false, mentalHealthCompleted: false, psychosexualCompleted: false },
//     psychiatricAlert: false,
//     comorbidities: { Hypertension: 'Controlled', Hyperlipidemia: 'Controlled' },
//     wearable: {
//       device: 'Garmin Venu 2', period: 'Last 30 days',
//       avg_rhr: 78, avg_hrv: 29, avg_spo2: 96, avg_sleep: 5.8,
//       night_sweats_per_night: 3, avg_steps: 4820, avg_stress: 52,
//       correlations: [
//         'Night sweats 3/night — significant vasomotor activity',
//         'HRV 29ms (low) — autonomic stress pattern',
//       ],
//     },
//     timestamp: new Date().toISOString(), sessionId: 'demo',
//   },
//   {
//     id: 'P_PSYCH', name: 'Kavitha Nair', age: 47, city: 'Kochi',
//     stage: 'Perimenopause', prakriti: 'Vata', vikriti: 'Vata_excess',
//     scores: {
//       composite: 100, composite_band: 'Critical',
//       MENQOL_vasomotor: 18, MENQOL_physical: 15, MENQOL_psychosocial: 18, MENQOL_sexual: 5,
//       PHQ9: 26, PHQ9_band: 'Severe', PHQ9_item9: 2, GAD7: 21, GAD7_band: 'Severe',
//       PSS8: 32, PSS8_band: 'High', ISI: 28, ISI_band: 'Severe',
//       FSFI: null, FSDSR: null, FSFI_band: 'Not assessed', FSDSR_band: 'Not assessed',
//       MCSS: 0, rf1: 'No', rf2: 'No', rf3: 'No', comorbidityMod: 14,
//     },
//     triage: [
//       { action: 'psychiatric_alert',           sev: 'severe',   rules: ['R1'] },
//       { action: 'psychologist_referral',        sev: 'severe',   rules: ['EVR_PHQ9'] },
//       { action: 'sleep_recovery_program',       sev: 'severe',   rules: ['EVR_ISI'] },
//       { action: 'gurugram_clinic',              sev: 'severe',   rules: ['COMP_HIGH'] },
//       { action: 'stress_management_program',    sev: 'moderate', rules: ['EVR_GAD7', 'EVR_PSS8', 'EVR_PS'] },
//     ],
//     redFlags: [],
//     flags: { gyneRedFlag: false, menqolPsychTriggered: true, menqolSexualTriggered: false, sleepModerate: true, sleepSevere: true, mentalHealthCompleted: true, psychosexualCompleted: false },
//     psychiatricAlert: true,
//     comorbidities: { Hypothyroidism: 'Controlled', Anaemia: 'Uncontrolled' },
//     wearable: {
//       device: 'Apple Watch Series 9', period: 'Last 30 days',
//       avg_rhr: 88, avg_hrv: 19, avg_spo2: 95, avg_sleep: 4.9,
//       night_sweats_per_night: 4, avg_steps: 3210, avg_stress: 74,
//       correlations: [
//         'HRV 19ms (critically low) — severe autonomic dysregulation',
//         'Sleep 4.9h — severe deprivation compounding depression',
//       ],
//     },
//     timestamp: new Date().toISOString(), sessionId: 'demo',
//   },
//   {
//     id: 'P_NORMAL', name: 'Anita Sharma', age: 48, city: 'Pune',
//     stage: 'Perimenopause', prakriti: 'Tridosha', vikriti: 'Balanced',
//     scores: {
//       composite: 15, composite_band: 'Mild',
//       MENQOL_vasomotor: 5, MENQOL_physical: 5, MENQOL_psychosocial: 5, MENQOL_sexual: 5,
//       PHQ9: 0, PHQ9_band: 'Minimal', GAD7: 0, GAD7_band: 'Minimal',
//       PSS8: 8, PSS8_band: 'Low', ISI: 0, ISI_band: 'None',
//       FSFI: null, FSDSR: null, FSFI_band: 'Not assessed', FSDSR_band: 'Not assessed',
//       MCSS: 0, rf1: 'No', rf2: 'No', rf3: 'No', comorbidityMod: 0,
//     },
//     triage: [
//       { action: 'recommend_menopause_program', sev: 'mild', rules: ['COMP_LOW'] },
//     ],
//     redFlags: [],
//     flags: { gyneRedFlag: false, menqolPsychTriggered: false, menqolSexualTriggered: false, sleepModerate: false, sleepSevere: false, mentalHealthCompleted: false, psychosexualCompleted: false },
//     psychiatricAlert: false,
//     comorbidities: {},
//     wearable: null,
//     timestamp: new Date().toISOString(), sessionId: 'demo',
//   },
//   {
//     id: 'P_PSYCHOSEXUAL', name: 'Rekha Pillai', age: 51, city: 'Bengaluru',
//     stage: 'Menopause (<1yr)', prakriti: 'Kapha', vikriti: 'Kapha_excess',
//     scores: {
//       composite: 59, composite_band: 'Moderate',
//       MENQOL_vasomotor: 12, MENQOL_physical: 12, MENQOL_psychosocial: 10, MENQOL_sexual: 18,
//       PHQ9: 16, PHQ9_band: 'Moderately Severe', GAD7: 14, GAD7_band: 'Moderate',
//       PSS8: 17, PSS8_band: 'Moderate', ISI: 14, ISI_band: 'Subthreshold',
//       FSFI: 7.2, FSFI_band: 'Sexual Dysfunction', FSDSR: 39, FSDSR_band: 'Clinically Significant Distress',
//       MCSS: 5, rf1: 'No', rf2: 'No', rf3: 'No', comorbidityMod: 20,
//     },
//     triage: [
//       { action: 'sexual_therapy_pathway',      sev: 'severe',   rules: ['R2'] },
//       { action: 'psychologist_referral',        sev: 'severe',   rules: ['EVR_PHQ9'] },
//       { action: 'activate_psychosexual_module', sev: 'moderate', rules: ['R3'] },
//       { action: 'sleep_recovery_program',       sev: 'moderate', rules: ['EVR_ISI'] },
//       { action: 'stress_management_program',    sev: 'moderate', rules: ['EVR_GAD7'] },
//     ],
//     redFlags: [],
//     flags: { gyneRedFlag: false, menqolPsychTriggered: true, menqolSexualTriggered: true, sleepModerate: true, sleepSevere: false, mentalHealthCompleted: true, psychosexualCompleted: true },
//     psychiatricAlert: false,
//     comorbidities: { Diabetes: 'Controlled', PCOD: 'Controlled' },
//     wearable: {
//       device: 'Fitbit Sense 2', period: 'Last 30 days',
//       avg_rhr: 82, avg_hrv: 24, avg_spo2: 94, avg_sleep: 5.4,
//       night_sweats_per_night: 2, avg_steps: 5640, avg_stress: 63,
//       correlations: [
//         'FSDSR 39/52 — extreme sexual distress',
//         'SpO2 94% — borderline, monitor',
//       ],
//     },
//     timestamp: new Date().toISOString(), sessionId: 'demo',
//   },
//   {
//     id: 'P_HIGHMQ', name: 'Priya Mehta', age: 45, city: 'Delhi',
//     stage: 'Perimenopause', prakriti: 'Vata-Pitta', vikriti: 'Vata_Pitta_excess',
//     scores: {
//       composite: 78, composite_band: 'Severe',
//       MENQOL_vasomotor: 18, MENQOL_physical: 18, MENQOL_psychosocial: 18, MENQOL_sexual: 15,
//       PHQ9: 16, PHQ9_band: 'Moderately Severe', GAD7: 14, GAD7_band: 'Moderate',
//       PSS8: 26, PSS8_band: 'High', ISI: 21, ISI_band: 'Moderate',
//       FSFI: 14.4, FSFI_band: 'Sexual Dysfunction', FSDSR: 26, FSDSR_band: 'Clinically Significant Distress',
//       MCSS: 10, rf1: 'No', rf2: 'Occasionally', rf3: 'No', comorbidityMod: 12,
//     },
//     triage: [
//       { action: 'sexual_therapy_pathway',      sev: 'severe',   rules: ['R2'] },
//       { action: 'psychologist_referral',        sev: 'severe',   rules: ['EVR_PHQ9'] },
//       { action: 'sleep_recovery_program',       sev: 'severe',   rules: ['EVR_ISI'] },
//       { action: 'gurugram_clinic',              sev: 'severe',   rules: ['COMP_HIGH'] },
//       { action: 'stress_management_program',    sev: 'moderate', rules: ['EVR_GAD7', 'EVR_PSS8'] },
//       { action: 'recommend_menopause_program',  sev: 'moderate', rules: ['EVR_VM'] },
//       { action: 'exercise_program',             sev: 'mild',     rules: ['EVR_PH'] },
//     ],
//     redFlags: [],
//     flags: { gyneRedFlag: false, menqolPsychTriggered: true, menqolSexualTriggered: true, sleepModerate: true, sleepSevere: false, mentalHealthCompleted: true, psychosexualCompleted: true },
//     psychiatricAlert: false,
//     comorbidities: { Hypertension: 'Controlled', Anaemia: 'Controlled' },
//     wearable: {
//       device: 'Samsung Galaxy Watch 6', period: 'Last 30 days',
//       avg_rhr: 84, avg_hrv: 22, avg_spo2: 96, avg_sleep: 5.1,
//       night_sweats_per_night: 4, avg_steps: 6200, avg_stress: 68,
//       correlations: [
//         'Night sweats 4/night — severe vasomotor activity',
//         'ISI 21 — moderate-severe insomnia compounding all domains',
//       ],
//     },
//     timestamp: new Date().toISOString(), sessionId: 'demo',
//   },
// ];



// // SCORE / BAND HELPERS
// /**
//  * Returns a severity band label and hex colour for a composite score (0–100).
//  * @param {number} composite
//  * @returns {{ label: string, colour: string, cssClass: string, tagClass: string }}
//  */
// function compositeBand(composite) {
//   if (composite >= 81) return { label: 'Critical', colour: '#B71C1C', cssClass: 'critical', tagClass: 'tag-rose' };
//   if (composite >= 56) return { label: 'Severe',   colour: '#EF5350', cssClass: 'severe',   tagClass: 'tag-rose' };
//   if (composite >= 31) return { label: 'Moderate', colour: '#FF9800', cssClass: 'moderate', tagClass: 'tag-gold' };
//   if (composite >= 6)  return { label: 'Mild',     colour: '#4CAF50', cssClass: 'mild',     tagClass: 'tag-teal' };
//   return                      { label: 'Optimal',  colour: '#00695C', cssClass: 'optimal',  tagClass: 'tag-teal' };
// }

// /**
//  * Returns an appropriate colour for a score given low/high thresholds.
//  * @param {number} value
//  * @param {number} warnAt   - score at or above which colour turns amber
//  * @param {number} alertAt  - score at or above which colour turns red
//  */
// function scoreColour(value, warnAt, alertAt) {
//   if (value >= alertAt) return '#EF5350';
//   if (value >= warnAt)  return '#FF9800';
//   return '#4CAF50';
// }


// // AUTH — HCP OTP FLOW

// /** Sends an OTP to the HCP's provider email or ID */
// function hcpSendOTP() {
//   const identifier = document.getElementById('hcp-login-id').value.trim();
//   if (!identifier) { alert('Please enter your provider email or ID.'); return; }

//   S.authId = identifier;

//   const btn = document.querySelector('#hcp-auth-screen .btn-hcp');
//   setButtonLoading(btn, 'Sending…');

//   // OTP_BACKEND_URL is defined in consent.js (loaded before hcp-portal.js)
//   fetch(`${OTP_BACKEND_URL}/send-otp`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ identifier, portal: 'hcp' }),
//   })
//     .then(res => res.json())
//     .then(data => {
//       restoreButton(btn, 'Send OTP');
//       if (data.success) {
//         const section = document.getElementById('hcp-otp-section');
//         section.style.display = 'block';
//         const hint = section.querySelector('p');
//         if (hint) hint.textContent = `OTP sent to ${identifier}`;
//         setTimeout(() => document.querySelector('.hcp-otp-digit')?.focus(), 150);
//       } else {
//         alert(data.detail || 'Failed to send OTP. Please try again.');
//       }
//     })
//     .catch(err => {
//       restoreButton(btn, 'Send OTP');
//       console.error('HCP OTP send error:', err);
//       alert('Could not reach the OTP service. Please check your connection.');
//     });
// }

// /** Auto-advances focus to next digit; triggers verify on last digit */
// function hcpOtpNext(el) {
//   if (el.value.length !== 1) return;
//   const digits = Array.from(document.querySelectorAll('.hcp-otp-digit'));
//   const index  = digits.indexOf(el);
//   if (index < digits.length - 1) {
//     digits[index + 1].focus();
//   } else {
//     document.getElementById('btn-hcp-verify').click();
//   }
// }

// /** Verifies the HCP OTP and, on success, opens the dashboard */
// function hcpVerifyOTP() {
//   const digits = Array.from(document.querySelectorAll('.hcp-otp-digit'))
//     .map(d => d.value)
//     .join('');

//   if (digits.length < 4) { alert('Please enter all 4 OTP digits.'); return; }

//   const loginId = document.getElementById('hcp-login-id').value.trim();
//   const btn     = document.getElementById('btn-hcp-verify');
//   setButtonLoading(btn, 'Verifying…');

//   fetch(`${OTP_BACKEND_URL}/verify-otp`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ identifier: loginId, otp: digits }),
//   })
//     .then(res => {
//       if (!res.ok) return res.json().then(e => { throw new Error(e.detail); });
//       return res.json();
//     })
//     .then(data => {
//       restoreButton(btn, 'Verify & Enter Portal');
//       if (data.success) {
//         const consultants = iLd(IK.cn, []);
//         S.hcpConsultant   = consultants.find(c => c.hcpEmail === loginId) || null;
//         showHCPDashboard();
//       }
//     })
//     .catch(err => {
//       restoreButton(btn, 'Verify & Enter Portal');
//       alert(err.message || 'Invalid OTP. Please check and try again.');
//       clearOTPInputs('.hcp-otp-digit');
//     });
// }


// // DASHBOARD

// /** Initialises the HCP portal screen and renders the patient list */
// function showHCPDashboard() {
//   showScreen('hcp-portal-screen');
//   loadPatients();
//   if (S.patients.length === 0) addDemoPatients();

//   const container = document.getElementById('hcp-content');
//   if (!container) return;

//   container.innerHTML = `
//     <div style="display:grid;grid-template-columns:300px 1fr;height:calc(100vh - 64px)">
//       <div id="patient-list" style="overflow-y:auto;border-right:1px solid rgba(255,255,255,0.06)"></div>
//       <div id="patient-detail" style="overflow-y:auto">
//         <div style="text-align:center;padding:80px 40px">
//           <div style="font-size:64px;margin-bottom:20px;opacity:0.2">🩺</div>
//           <div style="font-size:18px;font-weight:700;color:rgba(255,255,255,0.4);margin-bottom:10px;font-family:Cormorant Garamond,serif">
//             Select a Patient
//           </div>
//           <div style="font-size:13px;color:rgba(255,255,255,0.2)">
//             Choose from the list to view the full assessment report
//           </div>
//         </div>
//       </div>
//     </div>`;

//   renderPatientList();
// }

// /** Seeds demo patients into S.patients (skipping any already present) */
// function addDemoPatients() {
//   const existingIds = new Set(S.patients.map(p => p.id));
//   DEMO_PATIENTS.forEach(demo => {
//     if (!existingIds.has(demo.id)) S.patients.push(demo);
//   });
//   savePatients();
// }


// // PATIENT LIST

// /** Renders the full left-panel patient list with stats header and search */
// function renderPatientList() {
//   const total  = S.patients.length;
//   const severe = S.patients.filter(p => (p.scores?.composite || 0) >= 56).length;
//   const alerts = S.patients.filter(p => p.psychiatricAlert || p.redFlags?.length).length;

//   let html = buildPatientListHeader(total, severe, alerts);
//   html    += buildPatientListItems();

//   if (!total) {
//     html += `
//       <div style="padding:40px 16px;text-align:center;color:rgba(255,255,255,0.22)">
//         <div style="font-size:28px;margin-bottom:8px">📋</div>
//         <div style="font-size:12px">No patients yet.<br>Complete an assessment to see records here.</div>
//       </div>`;
//   }

//   const el = document.getElementById('patient-list');
//   if (el) el.innerHTML = html;
// }

// /** Returns HTML for the stats bar and search input at the top of the list */
// function buildPatientListHeader(total, severe, alerts) {
//   return `
//     <div style="background:linear-gradient(135deg,#0D1B2A,#1B2B3A);padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.07)">
//       <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center;margin-bottom:10px">
//         <div>
//           <div style="font-size:24px;font-weight:900;color:#fff">${total}</div>
//           <div style="font-size:9px;color:rgba(255,255,255,0.35);font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Total</div>
//         </div>
//         <div>
//           <div style="font-size:24px;font-weight:900;color:#FFCC80">${severe}</div>
//           <div style="font-size:9px;color:rgba(255,255,255,0.35);font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Moderate+</div>
//         </div>
//         <div>
//           <div style="font-size:24px;font-weight:900;color:#EF9A9A">${alerts}</div>
//           <div style="font-size:9px;color:rgba(255,255,255,0.35);font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Alerts</div>
//         </div>
//       </div>
//       <input class="pl-search" type="text" placeholder="Search patients..." oninput="filterPatients(this.value)">
//     </div>`;
// }

// /** Returns HTML for each patient row, respecting the active severity filter */
// function buildPatientListItems() {
//   const filter = S._severityFilter;
//   const visible = filter
//     ? S.patients.filter(p => {
//         const comp = (p.scores?.composite || p.composite || 0);
//         if (filter === 'critical') return comp >= 81;
//         if (filter === 'severe')   return comp >= 56;
//         if (filter === 'alerts')   return p.psychiatricAlert || p.redFlags?.length > 0;
//         return true;
//       })
//     : S.patients;

//   return visible.map(p => buildPatientRow(p)).join('');
// }

// /** Returns HTML for a single patient row in the list */
// function buildPatientRow(patient) {
//   const comp     = patient.scores?.composite || patient.composite || 0;
//   const band     = compositeBand(comp);
//   const isActive = S.selectedPatient?.id === patient.id;
//   const initials = (patient.name || '?').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
//   const hasAlert = patient.psychiatricAlert || patient.redFlags?.length > 0;
//   const flagCls  = patient.psychiatricAlert ? 'red' : hasAlert ? 'orange' : 'green';

//   const alertBadges = [
//     patient.psychiatricAlert
//       ? '<span style="font-size:9px;background:rgba(183,28,28,0.25);color:#EF9A9A;padding:1px 5px;border-radius:8px;font-weight:700">🚨 Crisis</span>'
//       : '',
//     patient.redFlags?.length
//       ? '<span style="font-size:9px;background:rgba(255,152,0,0.2);color:#FFCC80;padding:1px 5px;border-radius:8px;font-weight:700">⚠ Red Flag</span>'
//       : '',
//     `<span style="font-size:9px;background:rgba(255,255,255,0.06);color:${band.colour};padding:1px 5px;border-radius:8px;font-weight:700">
//       ${band.label}
//     </span>`,
//   ].join('');

//   return `
//     <div class="patient-item${isActive ? ' active' : ''}" onclick="selectPatient('${patient.id}')">
//       <span class="pi-flag ${flagCls}"></span>
//       <div class="pi-avatar">${initials}</div>
//       <div class="pi-info">
//         <div class="pi-name">
//           <span>${patient.name}</span>
//           <span class="pi-score ${band.cssClass}">${comp}</span>
//         </div>
//         <div class="pi-meta">${patient.age}y &middot; ${patient.city}</div>
//         <div class="pi-meta">${patient.stage}</div>
//         <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px">${alertBadges}</div>
//       </div>
//     </div>`;
// }

// /** Filters visible patient rows by search query */
// function filterPatients(query) {
//   document.querySelectorAll('.patient-item').forEach(item => {
//     item.style.display = item.textContent.toLowerCase().includes(query.toLowerCase()) ? '' : 'none';
//   });
// }

// /** Selects a patient and renders their detail panel */
// function selectPatient(id) {
//   S.selectedPatient = S.patients.find(p => p.id === id);
//   if (!S.selectedPatient) return;
//   renderPatientList();
//   renderPatientDetail(S.selectedPatient);
// }


// // PATIENT DETAIL — MAIN RENDERER

// /**
//  * Renders the full patient detail panel.
//  * @param {object}  patient
//  * @param {number=} openTab  - index of tab to open immediately (default: 0)
//  */
// function renderPatientDetail(patient, openTab) {
//   const scores    = patient.scores || {};
//   const composite = scores.composite || 0;
//   const band      = compositeBand(composite);

//   let html = '';
//   html += buildDetailHeader(patient, composite, band);
//   html += buildAlertBanners(patient);
//   html += buildTabBar();
//   html += '<div class="pd-body">';
//   html += buildTab0_Overview(patient, scores, composite, band);
//   html += buildTab1_ClinicalSummary(patient, scores);
//   html += buildTab2_ScoresTable(scores);
//   html += buildTab3_Triage(patient);
//   html += buildTab4_CarePlan(patient);
//   html += buildTab5_RawData(patient);
//   html += '</div>'; // pd-body

//   const el = document.getElementById('patient-detail') || document.getElementById('hcp-content');
//   if (el) el.innerHTML = `<div class="pd-panel">${html}</div>`;

//   // Open a specific tab if requested
//   if (typeof openTab !== 'undefined' && openTab >= 0) {
//     setTimeout(() => {
//       const tabs = document.querySelectorAll('.pd-tab');
//       if (tabs[openTab]) switchPDTab(tabs[openTab], openTab);
//     }, 50);
//   }
// }


// // PATIENT DETAIL — TAB BUILDERS

// function buildDetailHeader(patient, composite, band) {
//   const assessDate = new Date(patient.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

//   return `
//     <div class="pd-header">
//       <div>
//         <h2>${patient.name}${patient.psychiatricAlert ? ' <span style="color:#EF5350;font-size:13px">🚨</span>' : ''}</h2>
//         <div class="pd-meta">
//           ${patient.age} yrs &nbsp;&middot;&nbsp; ${patient.city} &nbsp;&middot;&nbsp; ${patient.stage}
//           <br>Prakriti: ${patient.prakriti}${patient.vikriti ? ` &middot; Vikriti: ${patient.vikriti.replace(/_/g, ' ')}` : ''}
//         </div>
//       </div>
//       <div class="pd-header-right">
//         <span class="tag ${band.tagClass}">${composite}/100 &mdash; ${band.label}</span>
//         <div style="font-size:11px;color:rgba(255,255,255,0.25)">${assessDate}</div>
//       </div>
//     </div>`;
// }

// function buildAlertBanners(patient) {
//   let html = '';

//   if (patient.psychiatricAlert) {
//     html += `
//       <div class="hcp-alert-banner">
//         <div class="hab-icon">🚨</div>
//         <div class="hab-body">
//           <strong>PSYCHIATRIC ALERT</strong> &mdash; PHQ-9 Item 9 positive. Immediate clinical follow-up required.
//           iCall: 9152987821 &middot; Vandrevala: 1860-2662-345
//         </div>
//       </div>`;
//   }

//   if (patient.redFlags?.length) {
//     html += `
//       <div class="hcp-alert-banner" style="border-color:rgba(255,152,0,0.4);background:rgba(255,152,0,0.09)">
//         <div class="hab-icon">⚠️</div>
//         <div class="hab-body" style="color:#FFCC80">
//           <strong>Red Flags: </strong>${patient.redFlags.join(' &middot; ')}
//         </div>
//       </div>`;
//   }

//   return html;
// }

// function buildTabBar() {
//   const tabs = ['Overview', 'Clinical Summary', 'Scores', 'Triage', 'Care Plan', 'Data'];
//   const tabHtml = tabs.map((label, i) =>
//     `<div class="pd-tab${i === 0 ? ' active' : ''}" onclick="switchPDTab(this,${i})">${label}</div>`
//   ).join('');
//   return `<div class="pd-tabs">${tabHtml}</div>`;
// }

// // TAB 0: OVERVIEW 

// function buildTab0_Overview(patient, scores, composite, band) {
//   let html = '<div class="pd-tab-content" id="tab0">';
//   html += buildCompositeGauge(composite, band);
//   html += buildDomainCards(scores);
//   html += buildPatientProfile(patient);
//   html += buildLifestyleRisks(patient.answers || {});
//   html += buildFamilyHistory(patient.answers || {});
//   html += buildMedications(patient.answers || {});
//   html += buildWearableSection(patient);
//   html += buildComorbiditiesSection(patient.comorbidities || {});
//   html += '</div>';
//   return html;
// }

// function buildCompositeGauge(composite, band) {
//   return `
//     <div class="section-hcp" style="text-align:center;padding:18px">
//       <div style="font-size:54px;font-weight:900;color:${band.colour};line-height:1">
//         ${composite}<span style="font-size:18px;color:rgba(255,255,255,0.22)">/100</span>
//       </div>
//       <div style="font-size:13px;font-weight:700;color:#fff;margin:6px 0 2px">Modified MenQOL Composite Score</div>
//       <div style="font-size:11px;color:rgba(255,255,255,0.35)">${band.label} Symptom Burden</div>
//       <div class="mc-bar" style="max-width:220px;margin:10px auto 0">
//         <div class="mc-bar-fill" style="width:${composite}%;background:${band.colour}"></div>
//       </div>
//     </div>`;
// }

// function buildDomainCards(scores) {
//   const domains = [
//     { key: 'MENQOL_vasomotor',    label: 'Vasomotor', emoji: '🌡', max: 20 },
//     { key: 'MENQOL_physical',     label: 'Physical',  emoji: '💪', max: 20 },
//     { key: 'MENQOL_psychosocial', label: 'Emotional', emoji: '🧠', max: 20 },
//     { key: 'MENQOL_sexual',       label: 'Intimate',  emoji: '💙', max: 20 },
//   ];

//   const isiVal    = scores.ISI || 0;
//   const isiColour = scoreColour(isiVal, 8, 15);

//   let html = '<div class="metrics-grid">';

//   domains.forEach(({ key, label, emoji, max }) => {
//     const val    = scores[key] || 0;
//     const colour = scoreColour(val, 7, 14);
//     const pct    = Math.round((val / max) * 100);
//     html += `
//       <div class="metric-card">
//         <div class="mc-label">${emoji} ${label}</div>
//         <div class="mc-value" style="color:${colour}">${val}</div>
//         <div class="mc-sub">/${max}</div>
//         <div class="mc-bar"><div class="mc-bar-fill" style="width:${pct}%;background:${colour}"></div></div>
//       </div>`;
//   });

//   // ISI Sleep
//   html += `
//     <div class="metric-card">
//       <div class="mc-label">😴 Sleep (ISI)</div>
//       <div class="mc-value" style="color:${isiColour}">${isiVal}</div>
//       <div class="mc-sub">/28 &middot; ${scores.ISI_band || '—'}</div>
//       <div class="mc-bar"><div class="mc-bar-fill" style="width:${Math.round((isiVal / 28) * 100)}%;background:${isiColour}"></div></div>
//     </div>`;

//   // PHQ-9 (if assessed)
//   if (scores.PHQ9 != null) {
//     const phqVal    = scores.PHQ9 || 0;
//     const phqColour = scoreColour(phqVal, 5, 10);
//     html += `
//       <div class="metric-card">
//         <div class="mc-label">🧠 PHQ-9</div>
//         <div class="mc-value" style="color:${phqColour}">${phqVal}</div>
//         <div class="mc-sub">/27 &middot; ${scores.PHQ9_band || ''}</div>
//         <div class="mc-bar"><div class="mc-bar-fill" style="width:${Math.round((phqVal / 27) * 100)}%;background:${phqColour}"></div></div>
//       </div>`;
//   }

//   // FSFI (if assessed)
//   if (scores.FSFI != null) {
//     const fsfiColour = scores.FSFI <= 10 ? '#EF5350' : scores.FSFI <= 26.55 ? '#FF9800' : '#4CAF50';
//     html += `
//       <div class="metric-card">
//         <div class="mc-label">💙 FSFI</div>
//         <div class="mc-value" style="color:${fsfiColour}">${scores.FSFI}</div>
//         <div class="mc-sub">/36</div>
//         <div class="mc-bar"><div class="mc-bar-fill" style="width:${Math.round((scores.FSFI / 36) * 100)}%;background:${fsfiColour}"></div></div>
//       </div>`;
//   }

//   html += '</div>';
//   return html;
// }

// /** Builds demographic profile rows (skips blank / privacy-redacted values) */
// function buildPatientProfile(patient) {
//   const answers = patient.answers || {};
//   const bmi = (answers.height_cm && answers.weight_kg)
//     ? (answers.weight_kg / Math.pow(answers.height_cm / 100, 2)).toFixed(1)
//     : null;

//   const rows = [
//     ['Name',              patient.name],
//     ['Age',               patient.age ? `${patient.age} yrs` : null],
//     ['City',              patient.city],
//     ['Country',           answers.country],
//     ['Stage',             patient.stage],
//     ['Ethnicity',         answers.ethnicity],
//     ['Menstrual Pattern', patient.menstrual_pattern],
//     ['Prakriti',          patient.prakriti],
//     ['Vikriti',           patient.vikriti],
//     ['Marital',           answers.marital || patient.marital],
//     ['Parity',            answers.parity],
//     ['Occupation',        answers.occupation || patient.occupation],
//     ['Education',         answers.education || patient.education],
//     ['Sexual Activity',   patient.sexual_activity_status],
//     ['Height',            answers.height_cm ? `${answers.height_cm} cm` : null],
//     ['Weight',            answers.weight_kg ? `${answers.weight_kg} kg` : null],
//     ...(bmi ? [['BMI', `${bmi} kg/m²`, parseFloat(bmi) < 18.5 || parseFloat(bmi) > 27.5]] : []),
//     ['Assessed', new Date(patient.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
//   ];

//   const rowsHtml = rows
//     .filter(([, val]) => val != null && val !== '' && val !== '—' && val !== 'Prefer not to say')
//     .map(([label, val, isAbnormal]) => buildScoreRow(label, val, isAbnormal))
//     .join('');

//   return `<div class="section-hcp"><h4>Patient Profile</h4>${rowsHtml}</div>`;
// }

// function buildLifestyleRisks(answers) {
//   const smoking = answers.smoking_history || '';
//   const alcohol = answers.alcohol_use || '';
//   const hrt     = answers.hrt_history || '';

//   const risks = [];
//   if (smoking && smoking !== 'Never smoked' && smoking !== 'Prefer not to say')
//     risks.push(['Smoking', smoking, true, '⚠ CV/cancer risk']);
//   if (alcohol && alcohol !== 'Non-drinker' && alcohol !== 'Prefer not to say')
//     risks.push(['Alcohol', alcohol, alcohol.includes('Heavy') || alcohol.includes('Moderate'), alcohol.includes('Heavy') ? '⚠ High risk' : '']);
//   if (hrt && hrt !== 'Never used HRT' && hrt !== 'Not Sure / Prefer not to say')
//     risks.push(['HRT History', hrt, hrt === 'Currently using HRT', 'Review indication']);

//   if (!risks.length) return '';

//   const rowsHtml = risks.map(([label, val, isAbnormal, note]) => buildScoreRow(label, val, isAbnormal, note)).join('');
//   return `<div class="section-hcp"><h4>⚠️ Lifestyle Risk Factors</h4>${rowsHtml}</div>`;
// }

// function buildFamilyHistory(answers) {
//   const FAMILY_LABELS = {
//     fam_breast_cancer:   'Breast Cancer',
//     fam_ovarian_cancer:  'Ovarian Cancer',
//     fam_osteoporosis:    'Osteoporosis',
//     fam_cvd:             'Heart Disease/Stroke',
//     fam_diabetes:        'Type 2 Diabetes',
//     fam_depression:      'Depression/Anxiety',
//     fam_early_menopause: 'Early Menopause <45y',
//   };
//   const HIGH_RISK = new Set(['fam_breast_cancer', 'fam_ovarian_cancer', 'fam_cvd']);

//   const positives = Object.keys(FAMILY_LABELS).filter(k => answers[k]);
//   if (!positives.length) return '';

//   const rowsHtml = positives.map(k => {
//     const isHighRisk = HIGH_RISK.has(k);
//     const colour     = isHighRisk ? '#EF9A9A' : '#FFCC80';
//     return `
//       <div class="score-row">
//         <span class="score-label">${FAMILY_LABELS[k]}</span>
//         <span class="score-val" style="color:${colour}">Positive${isHighRisk ? ' ⚠️' : ''}</span>
//       </div>`;
//   }).join('');

//   return `<div class="section-hcp"><h4>🧬 Family History (First-degree)</h4>${rowsHtml}</div>`;
// }

// function buildMedications(answers) {
//   const MED_LABELS = {
//     med_ssri:      'Antidepressants (SSRIs/SNRIs)',
//     med_hrt:       'HRT/Hormone Therapy',
//     med_betablocker:'Beta-blockers',
//     med_statin:    'Statins (Cholesterol)',
//     med_thyroid:   'Thyroid medication',
//     med_insulin:   'Insulin/Diabetes',
//     med_antihyp:   'Antihypertensives',
//     med_sleep:     'Sleep medication/Sedatives',
//     med_nsaid:     'NSAIDs (Regular pain relief)',
//   };
//   const RELEVANT = new Set(['med_ssri', 'med_antihyp', 'med_hrt']);

//   const active = Object.keys(MED_LABELS).filter(k => answers[k]);
//   if (!active.length) return '';

//   const rowsHtml = active.map(k => {
//     const isRelevant = RELEVANT.has(k);
//     const colour     = isRelevant ? '#FFCC80' : 'rgba(255,255,255,0.7)';
//     return `
//       <div class="score-row">
//         <span class="score-label">${MED_LABELS[k]}</span>
//         <span class="score-val" style="color:${colour}">Confirmed${isRelevant ? ' — affects scoring' : ''}</span>
//       </div>`;
//   }).join('');

//   return `<div class="section-hcp"><h4>💊 Current Medications</h4>${rowsHtml}</div>`;
// }

// function buildWearableSection(patient) {
//   const wd     = patient.wearable_data || {};
//   const scores = patient.scores || {};

//   if (!patient.wearable || patient.wearable === 'None / No wearable' || !Object.keys(wd).length) return '';

//   const metricRows   = [];
//   const alertSummary = [];

//   // Standard metrics from WEARABLE_NORMS
//   Object.entries(WEARABLE_NORMS).forEach(([key, norm]) => {
//     const val = wd[key];
//     if (val == null || val === '') return;

//     const result  = norm.correlation(val, scores, wd);
//     const colour  = result.flag ? '#EF9A9A' : 'rgba(255,255,255,0.75)';
//     const flagSpan = result.flag
//       ? `<span style="font-size:10px;color:#FF9800;margin-left:4px">⚠ ${result.note}</span>`
//       : '';

//     metricRows.push(`
//       <div class="score-row">
//         <span class="score-label">${norm.label}</span>
//         <span class="score-val" style="color:${colour}">
//           ${val} <span style="font-size:10px;color:rgba(255,255,255,0.3)">${norm.unit}</span>
//           ${flagSpan}
//         </span>
//       </div>`);

//     if (result.flag) alertSummary.push(`${norm.label}: ${val}${norm.unit} — ${result.note}`);
//   });

//   // Skin temperature (not in WEARABLE_NORMS — special case)
//   if (wd.avg_skin_temp != null) {
//     const isAbnormal = wd.avg_skin_temp > 37.5 || wd.avg_skin_temp < 35;
//     const note = wd.avg_skin_temp > 37.5 ? 'Elevated — correlates with vasomotor' : 'Low';
//     const flagSpan = isAbnormal
//       ? `<span style="font-size:10px;color:#FF9800"> ⚠ ${note}</span>`
//       : '';
//     metricRows.push(`
//       <div class="score-row">
//         <span class="score-label">Skin Temp</span>
//         <span class="score-val" style="color:${isAbnormal ? '#EF9A9A' : 'rgba(255,255,255,0.75)'}">
//           ${wd.avg_skin_temp}°C${flagSpan}
//         </span>
//       </div>`);
//     if (isAbnormal) alertSummary.push(`Skin Temp: ${wd.avg_skin_temp}°C — abnormal`);
//   }

//   // Daily distance (informational, no flagging)
//   if (wd.avg_distance_km != null) {
//     metricRows.push(`
//       <div class="score-row">
//         <span class="score-label">Avg Distance</span>
//         <span class="score-val">${wd.avg_distance_km} <span style="font-size:10px;color:rgba(255,255,255,0.3)">km/day</span></span>
//       </div>`);
//   }

//   let alertBox = '';
//   if (alertSummary.length) {
//     const alertItems = alertSummary.map(a => `<div style="font-size:11px;color:#FFCDD2;padding:2px 0">• ${a}</div>`).join('');
//     alertBox = `
//       <div style="background:rgba(239,83,80,0.12);border:1px solid rgba(239,83,80,0.3);border-radius:8px;padding:10px;margin-top:8px">
//         <div style="font-size:11px;font-weight:800;color:#EF5350;margin-bottom:5px">⚠️ WEARABLE ALERTS (${alertSummary.length})</div>
//         ${alertItems}
//       </div>`;
//   }

//   return `
//     <div class="section-hcp">
//       <h4>⌚ Wearable — ${patient.wearable}</h4>
//       ${metricRows.join('')}
//       ${alertBox}
//     </div>`;
// }

// function buildComorbiditiesSection(comorbidities) {
//   if (!Object.keys(comorbidities).length) return '';

//   const rowsHtml = Object.entries(comorbidities).map(([condition, status]) => {
//     const colour = status === 'Uncontrolled' ? '#EF9A9A' : status === 'Not Sure' ? '#90CAF9' : '#A5D6A7';
//     return `
//       <div class="score-row">
//         <span class="score-label">${condition}</span>
//         <span class="score-val" style="color:${colour}">${status}</span>
//       </div>`;
//   }).join('');

//   return `<div class="section-hcp"><h4>Comorbidities</h4>${rowsHtml}</div>`;
// }

// // TAB 1: CLINICAL SUMMARY

// function buildTab1_ClinicalSummary(patient, scores) {
//   const answers = patient.answers || {};
//   let html = '<div class="pd-tab-content" id="tab1" style="display:none"><div style="padding:14px">';

//   // Red flags block
//   if (patient.redFlags?.length) {
//     const items = patient.redFlags.map(rf => `<div style="font-size:12px;color:#FFCDD2;padding:2px 0">&#x26A0; ${rf}</div>`).join('');
//     html += buildInfoBox('#C2185B', '#EF5350', '🚨 RED FLAGS', items);
//   }

//   // Comorbidities block
//   const comorbKeys = Object.entries(patient.comorbidities || {}).filter(([, v]) => v && v !== 'no');
//   if (comorbKeys.length) {
//     const items = comorbKeys.map(([k, v]) =>
//       `<div style="font-size:12px;color:#FFD0A0;padding:2px 0">• ${k.replace(/_/g, ' ')}: <strong>${v}</strong></div>`
//     ).join('');
//     html += buildInfoBox('#E65100', '#FF9800', '🏥 COMORBIDITIES', items, 'rgba(230,81,0,0.1)', 'rgba(230,81,0,0.25)', '#FFD0A0');
//   }

//   // High-scoring domains
//   const highDomains = [];
//   if ((scores.MENQOL_vasomotor  || 0) >= 10) highDomains.push(`Vasomotor ${scores.MENQOL_vasomotor}/20`);
//   if ((scores.MENQOL_physical   || 0) >= 10) highDomains.push(`Physical ${scores.MENQOL_physical}/20`);
//   if ((scores.MENQOL_psychosocial||0) >= 10) highDomains.push(`Psychosocial ${scores.MENQOL_psychosocial}/20`);
//   if ((scores.MENQOL_sexual     || 0) >=  8) highDomains.push(`Sexual ${scores.MENQOL_sexual}/20`);
//   if ((scores.PHQ9              || 0) >= 10) highDomains.push(`PHQ-9 ${scores.PHQ9}/27 (${scores.PHQ9_band})`);
//   if ((scores.GAD7              || 0) >=  8) highDomains.push(`GAD-7 ${scores.GAD7}/21 (${scores.GAD7_band})`);
//   if ((scores.PSS8              || 0) >= 18) highDomains.push(`PSS-8 Stress ${scores.PSS8}/32`);
//   if ((scores.ISI               || 0) >=  8) highDomains.push(`ISI Sleep ${scores.ISI}/28 (${scores.ISI_band})`);

//   if (highDomains.length) {
//     const items = highDomains.map(d => `<div style="font-size:12px;color:#FDE68A;padding:2px 0">• ${d}</div>`).join('');
//     html += buildInfoBox('#E65100', '#F59E0B', '📊 HIGH-SCORING DOMAINS', items, 'rgba(196,122,10,0.1)', 'rgba(196,122,10,0.25)', '#FDE68A');
//   }

//   // Lifestyle history
//   const lifestyle = [
//     answers.smoking && answers.smoking !== 'Non-smoker' ? `🚬 Smoking: ${answers.smoking}` : null,
//     answers.alcohol && answers.alcohol !== 'Never'      ? `🍷 Alcohol: ${answers.alcohol}` : null,
//     answers.hrt     && answers.hrt     !== 'No'         ? `💊 HRT: ${answers.hrt}` : null,
//     answers.parity                                      ? `👶 Parity: ${answers.parity}` : null,
//     answers.marital                                     ? `💍 Marital: ${answers.marital}` : null,
//     patient.wearable && patient.wearable !== 'None / No wearable' ? `⌚ Wearable: ${patient.wearable}` : null,
//   ].filter(Boolean);

//   if (lifestyle.length) {
//     const items = lifestyle.map(l => `<div style="font-size:12px;color:#B2DFDB;padding:2px 0">${l}</div>`).join('');
//     html += buildInfoBox('#26A69A', '#26A69A', '🌿 LIFESTYLE & HISTORY', items, 'rgba(11,123,116,0.1)', 'rgba(11,123,116,0.25)', '#B2DFDB');
//   }

//   // Saved clinical note (if any)
//   const savedNote = iLd(`hcp_note_${patient.id || ''}`, '');
//   if (savedNote) {
//     html += `
//       <div style="background:rgba(0,188,212,0.08);border:1px solid rgba(0,188,212,0.2);border-radius:10px;padding:12px">
//         <div style="font-size:11px;font-weight:800;color:#00BCD4;margin-bottom:5px">📝 LAST CLINICAL NOTE</div>
//         <div style="font-size:12px;color:rgba(255,255,255,0.6);white-space:pre-wrap;line-height:1.5">${savedNote}</div>
//       </div>`;
//   }

//   html += '</div></div>';
//   return html;
// }

// // TAB 2: SCORES TABLE

// function buildTab2_ScoresTable(scores) {
//   const rows = [
//     { label: 'MenQOL Vasomotor',    value: scores.MENQOL_vasomotor    || 0, max: 20, band: scores.MENQOL_vasomotor    >= 14 ? 'High' : scores.MENQOL_vasomotor    >= 7 ? 'Moderate' : 'Low' },
//     { label: 'MenQOL Physical',     value: scores.MENQOL_physical     || 0, max: 20, band: scores.MENQOL_physical     >= 14 ? 'High' : scores.MENQOL_physical     >= 7 ? 'Moderate' : 'Low' },
//     { label: 'MenQOL Psychosocial', value: scores.MENQOL_psychosocial || 0, max: 20, band: scores.MENQOL_psychosocial >= 14 ? 'High' : scores.MENQOL_psychosocial >= 7 ? 'Moderate' : 'Low' },
//     { label: 'MenQOL Sexual',       value: scores.MENQOL_sexual       || 0, max: 20, band: scores.MENQOL_sexual       >= 14 ? 'High' : scores.MENQOL_sexual       >= 7 ? 'Moderate' : 'Low' },
//     { label: 'ISI Sleep',           value: scores.ISI                 || 0, max: 28, band: scores.ISI_band || '' },
//   ];

//   if (scores.PHQ9 != null) {
//     rows.push(
//       { label: 'PHQ-9 Depression', value: scores.PHQ9  || 0, max: 27, band: scores.PHQ9_band  || '' },
//       { label: 'GAD-7 Anxiety',    value: scores.GAD7  || 0, max: 21, band: scores.GAD7_band  || '' },
//       { label: 'PSS-8 Stress',     value: scores.PSS8  || 0, max: 32, band: scores.PSS8_band  || '' },
//     );
//   }

//   if (scores.FSFI != null) {
//     rows.push(
//       { label: 'FSFI Sexual Function', value: scores.FSFI  || 0, max: 36, band: scores.FSFI_band  || '' },
//       { label: 'FSDSR Sexual Distress',value: scores.FSDSR || 0, max: 52, band: scores.FSDSR_band || '' },
//     );
//   }

//   rows.push({ label: 'Comorbidity Modifier', value: `+${scores.comorbidityMod || 0}`, max: null, band: 'Additive' });

//   const rowsHtml = rows.map(r => {
//     const numVal = parseFloat(r.value) || 0;
//     const colour = r.max
//       ? (numVal / r.max > 0.7 ? '#EF9A9A' : numVal / r.max > 0.4 ? '#FFCC80' : '#A5D6A7')
//       : 'rgba(255,255,255,0.38)';
//     const pct    = r.max ? Math.round(Math.min(numVal / r.max, 1) * 100) : 0;
//     const bar    = r.max
//       ? `<div style="width:80px;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${colour};border-radius:2px"></div></div>`
//       : '—';

//     return `
//       <tr>
//         <td>${r.label}</td>
//         <td>
//           <span style="color:${colour};font-weight:800;font-size:15px">${r.value}</span>
//           ${r.max ? `<span style="color:rgba(255,255,255,0.2);font-size:11px"> /${r.max}</span>` : ''}
//         </td>
//         <td>${bar}</td>
//         <td style="color:${colour};font-size:11px;font-weight:700">${r.band}</td>
//       </tr>`;
//   }).join('');

//   return `
//     <div class="pd-tab-content" id="tab2" style="display:none">
//       <table class="instrument-table">
//         <thead>
//           <tr><th>Instrument</th><th>Score</th><th>Bar</th><th>Band</th></tr>
//         </thead>
//         <tbody>${rowsHtml}</tbody>
//       </table>
//     </div>`;
// }

// // TAB 3: TRIAGE

// function buildTab3_Triage(patient) {
//   const triage = patient.triage || [];

//   const itemsHtml = triage.length
//     ? triage.map(t => {
//         const sevClass = t.sev === 'severe' ? 'sev' : t.sev === 'moderate' ? 'mod' : 'norm';
//         const sevLabel = t.sev === 'severe' ? 'Urgent' : t.sev === 'moderate' ? 'Recommended' : 'Advisory';
//         return `
//           <div class="triage-item ${sevClass}">
//             <div class="ti-icon">${TRIAGE_ICONS[t.action] || '✦'}</div>
//             <div class="ti-body">
//               <div class="ti-action">${t.action.replace(/_/g, ' ')}</div>
//               <div class="ti-rules">${t.rules.slice(0, 4).join(', ')}</div>
//             </div>
//             <div class="ti-sev">${sevLabel}</div>
//           </div>`;
//       }).join('')
//     : '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.22);font-size:13px">No triage actions — wellness baseline</div>';

//   return `
//     <div class="pd-tab-content" id="tab3" style="display:none">
//       <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">
//         ${triage.length} Actions Triggered
//       </div>
//       <div class="triage-list">${itemsHtml}</div>
//     </div>`;
// }

// // TAB 4: CARE PLAN 

// function buildTab4_CarePlan(patient) {
//   const triage = patient.triage || [];

//   const cardsHtml = triage.length
//     ? triage.map(t => {
//         const colours = t.sev === 'severe'
//           ? { bg: 'rgba(183,28,28,0.14)', border: 'rgba(183,28,28,0.35)', text: '#EF9A9A' }
//           : t.sev === 'moderate'
//             ? { bg: 'rgba(255,152,0,0.10)', border: 'rgba(255,152,0,0.30)', text: '#FFCC80' }
//             : { bg: 'rgba(76,175,80,0.08)',  border: 'rgba(76,175,80,0.20)',  text: '#A5D6A7' };

//         return `
//           <div style="background:${colours.bg};border:1px solid ${colours.border};border-radius:12px;padding:14px 16px">
//             <div style="font-size:13px;font-weight:800;color:#fff;text-transform:capitalize;margin-bottom:3px">
//               ${t.action.replace(/_/g, ' ')}
//             </div>
//             <div style="font-size:12px;color:rgba(255,255,255,0.45);margin-bottom:8px">
//               ${TRIAGE_DESCRIPTIONS[t.action] || ''}
//             </div>
//             <span style="background:${colours.border};color:${colours.text};padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700">
//               ${t.sev}
//             </span>
//           </div>`;
//       }).join('')
//     : '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.22);font-size:13px">No care actions — wellness maintenance recommended</div>';

//   const savedNote = iLd(`hcp_note_${patient.id || ''}`, '');

//   // Show appointment status if one exists for this patient
//   const appointments    = iLd(IK.ap, []).filter(a => a.patientId === patient.id || a.patientName === patient.name);
//   const latestAppt      = appointments[0];
//   let apptBadge = '';
//   let completeBtn = '';
//   if (latestAppt) {
//     const isComplete = latestAppt.status === 'completed';
//     const badgeBg    = isComplete ? 'rgba(22,101,52,0.12)' : 'rgba(30,64,175,0.12)';
//     const badgeColor = isComplete ? '#166534' : '#1E40AF';
//     apptBadge = `
//       <span style="padding:7px 12px;background:${badgeBg};border:1px solid ${badgeColor};color:${badgeColor};border-radius:8px;font-size:11px;font-weight:700">
//         💳 Rs ${latestAppt.fee || 0} &middot; ${latestAppt.status}
//       </span>`;
//     if (latestAppt.status === 'confirmed') {
//       completeBtn = `
//         <button onclick="hcpCompleteConsult(&quot;${latestAppt.id}&quot;)"
//           style="padding:7px 14px;background:rgba(22,101,52,0.15);border:1px solid rgba(22,101,52,0.4);color:#16A34A;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">
//           ✅ Mark Consultation Complete
//         </button>`;
//     }
//   }

//   return `
//     <div class="pd-tab-content" id="tab4" style="display:none">
//       <div style="display:flex;flex-direction:column;gap:8px">${cardsHtml}</div>

//       <div style="margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
//         <a href="tel:+918069050000"
//           style="background:var(--rose-deep);color:#fff;text-align:center;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;font-size:13px">
//           📞 +91 80690 50000
//         </a>
//         <a href="mailto:clinic@evaerahealth.in"
//           style="background:rgba(0,188,212,0.13);color:#00BCD4;text-align:center;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;border:1px solid rgba(0,188,212,0.3);font-size:13px">
//           ✉ Email Clinic
//         </a>
//       </div>

//       <div style="margin-top:14px">
//         <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.35);margin-bottom:6px">
//           Post-Consultation Clinical Notes
//         </div>
//         <textarea id="hcp-note-area"
//           style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:10px 12px;color:rgba(255,255,255,0.8);font-size:12px;resize:vertical;min-height:90px;outline:none;font-family:inherit;line-height:1.5"
//           placeholder="Enter clinical observations, follow-up plan, prescriptions..."
//         >${savedNote}</textarea>

//         <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
//           <button onclick="saveHCPNote()"
//             style="padding:7px 16px;background:rgba(0,188,212,0.15);border:1px solid rgba(0,188,212,0.3);color:#00BCD4;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">
//             💾 Save Note
//           </button>
//           ${apptBadge}
//           ${completeBtn}
//         </div>
//       </div>
//     </div>`;
// }

// //  TAB 5: RAW DATA / EXPORT

// function buildTab5_RawData(patient) {
//   const rawData = {
//     name:          patient.name,
//     age:           patient.age,
//     stage:         patient.stage,
//     prakriti:      patient.prakriti,
//     scores:        patient.scores,
//     triage:        patient.triage,
//     redFlags:      patient.redFlags,
//     comorbidities: patient.comorbidities,
//   };

//   return `
//     <div class="pd-tab-content" id="tab5" style="display:none">
//       <div class="download-bar">
//         <button class="btn-download" onclick="downloadHCPReport()">⬇ Download Report</button>
//         <button class="btn-download" onclick="downloadHCPJSON()">{ } Export JSON</button>
//         <button onclick="hcpBookOnBehalf()"
//           style="background:linear-gradient(135deg,#C0305A,#9C1B43);color:#fff;border:none;border-radius:10px;padding:9px 16px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px">
//           📅 Book Appointment for Patient
//         </button>
//       </div>
//       <pre style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px;font-size:11px;color:rgba(255,255,255,0.5);overflow:auto;max-height:400px;line-height:1.5">
// ${JSON.stringify(rawData, null, 2)}</pre>
//     </div>`;
// }

// // PATIENT DETAIL — ACTIONS

// /** Saves a clinical note for the selected patient */
// function saveHCPNote() {
//   const patient = S.selectedPatient;
//   if (!patient) return;

//   const textarea = document.getElementById('hcp-note-area');
//   if (!textarea) return;

//   const note = textarea.value;

//   iSv(`hcp_note_${patient.id || ''}`, note);
//   iSv(`evh_pat_note_${patient.id || ''}`, JSON.stringify({
//     note,
//     consultant: S.hcpConsultant?.name || 'Your Consultant',
//     savedAt:    new Date().toLocaleString('en-IN'),
//   }));

//   iLogA('ok', `Clinical note saved for ${patient.name}`, '', 'HCP');
//   intToast('success', 'Note Saved — returning to patient record', `Saved for ${patient.name}`, 'HCP');

//   setTimeout(() => renderPatientDetail(patient, 3), 700);
// }

// /** Marks a confirmed appointment as complete and syncs with the admin portal */
// function hcpCompleteConsult(appointmentId) {
//   if (!confirm('Mark this consultation as complete? This will update the Admin portal.')) return;

//   const appointments  = iLd(IK.ap, []);
//   const appt          = appointments.find(a => a.id === appointmentId);
//   if (!appt) return;

//   appt.status      = 'completed';
//   appt.completedAt = new Date().toLocaleString('en-IN');
//   iSv(IK.ap, appointments);

//   iLogA('ok', 'Consultation completed', appt.patientName, 'HCP');
//   iBcast('appt_complete', appt);
//   intToast('success', 'Consultation Complete', 'Admin portal updated', 'HCP');

//   if (S.selectedPatient) setTimeout(() => renderPatientDetail(S.selectedPatient, 3), 400);
// }

// /** Books an appointment on behalf of the currently selected patient */
// function hcpBookOnBehalf() {
//   const patient = S.selectedPatient;
//   if (!patient) { alert('No patient selected'); return; }

//   // Ensure patient exists in the integration store so booking captures their name
//   const patients = iLd(IK.pt, []);
//   if (!patients.find(p => p.id === patient.id)) {
//     patients.unshift(patient);
//     iSv(IK.pt, patients);
//   }

//   intShowBooking();
//   intToast('info', `Booking on behalf of ${patient.name}`, 'Select consultant, slot and payment', 'HCP');
// }


// // PATIENT DETAIL — TAB SWITCHING

// /** Activates a detail tab by index */
// function switchPDTab(el, index) {
//   document.querySelectorAll('.pd-tab').forEach(t => t.classList.remove('active'));
//   el.classList.add('active');

//   document.querySelectorAll('.pd-tab-content').forEach(t => { t.style.display = 'none'; });
//   document.getElementById(`tab${index}`).style.display = 'block';
// }


// // DOWNLOADS & REPORTS

// /** Downloads a plain-text clinical summary for the selected patient */
// function downloadHCPReport() {
//   const patient = S.selectedPatient;
//   if (!patient) return;

//   const sc     = patient.scores || {};
//   const fsfi   = (sc.FSFI != null) ? ` FSFI=${sc.FSFI} FSDSR=${sc.FSDSR}` : '';
//   const triage = (patient.triage || []).map(t => `  • ${t.action} [${t.sev}]`).join('\n');

//   const lines = [
//     'EvaEraHealth Clinical Report',
//     `Generated: ${new Date().toLocaleString()}`,
//     '',
//     `Patient: ${patient.name} | Age: ${patient.age} | ${patient.stage} | Prakriti: ${patient.prakriti || '-'}`,
//     `Vikriti: ${patient.vikriti || '-'}`,
//     '',
//     `COMPOSITE: ${sc.composite || 0}/100 [${sc.composite_band || '-'}]`,
//     `MenQOL: VM=${sc.MENQOL_vasomotor || 0} Ph=${sc.MENQOL_physical || 0} PS=${sc.MENQOL_psychosocial || 0} Sx=${sc.MENQOL_sexual || 0}`,
//     `PHQ9=${sc.PHQ9 || 0}(${sc.PHQ9_band}) GAD7=${sc.GAD7 || 0}(${sc.GAD7_band}) PSS8=${sc.PSS8 || 0}(${sc.PSS8_band})`,
//     `ISI=${sc.ISI || 0}(${sc.ISI_band})${fsfi}`,
//     '',
//     'TRIAGE:',
//     triage || '  None',
//     '',
//     `Red Flags: ${patient.redFlags?.length ? patient.redFlags.join(', ') : 'None'}`,
//     '',
//     'EvaEraHealth Clinic, Gurugram | +91 80690 50000 | clinic@evaerahealth.in',
//     'AI-generated clinical summary — for qualified HCP use only',
//   ].join('\n');

//   downloadTextFile(lines, `EvaEraHealth_${patient.name.replace(/\s/g, '_')}.txt`);
// }

// /**
//  * Generates an AI-personalised patient wellness report and downloads it as HTML.
//  * NOTE (DEF-01): The Anthropic API call below MUST be proxied via your backend in production.
//  * Never expose an API key in client-side code. Replace the fetch URL with your proxy endpoint.
//  */
// async function downloadUserReport() {
//   const answers = S.answers || {};
//   if (!answers.name || !answers.stage || !answers.mq_v1) {
//     alert('Please complete the wellness assessment first.');
//     return;
//   }

//   const scores   = S.scores || {};
//   const triage   = S.triage || [];
//   const name     = answers.name || 'Patient';
//   const today    = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
//   const band     = getCompositeBandLabel(scores.composite);
//   const bandCol  = getCompositeBandColour(scores.composite);

//   // ── AI Report Generation ──────────────────────────────────────────────────
//   let aiBody = '';
//   try {
//     const prompt  = buildAIReportPrompt(name, answers, scores, band);

//     // DEF-01: Replace URL with your backend proxy endpoint e.g. '/api/ai/message'
//     const response = await fetch('https://api.anthropic.com/v1/messages', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         model:      'claude-sonnet-4-20250514',
//         max_tokens: 1000,
//         messages:   [{ role: 'user', content: prompt }],
//       }),
//     });

//     const data = await response.json();
//     aiBody = data.content?.[0]?.text || '';
//   } catch (e) {
//     console.error('AI report generation failed:', e);
//   }

//   if (!aiBody) aiBody = buildFallbackReport(name, band);

//   // HTML Report Assembly 
//   const html = buildReportHTML({ name, answers, scores, triage, today, band, bandCol, aiBody });
//   downloadTextFile(html, `EvaEraHealth_Report_${name.replace(/\s+/g, '_')}_${today.replace(/[\s,]/g, '')}.html`, 'text/html;charset=utf-8');
// }

// /** Returns a short band label for a composite score */
// function getCompositeBandLabel(composite) {
//   if (composite <= 5)  return 'Optimal Health';
//   if (composite <= 30) return 'Mild Burden';
//   if (composite <= 55) return 'Moderate Burden';
//   if (composite <= 80) return 'Significant Burden';
//   return 'High Burden';
// }

// /** Returns a brand colour hex for a composite score */
// function getCompositeBandColour(composite) {
//   if (composite <= 5)  return '#00695C';
//   if (composite <= 30) return '#2E7D32';
//   if (composite <= 55) return '#E65100';
//   if (composite <= 80) return '#C62828';
//   return '#880E4F';
// }

// /**
//  * Builds the detailed AI prompt for the personalised wellness report.
//  * Pulls wearable correlations, Ayurvedic context, lifestyle risks, and scores.
//  */
// function buildAIReportPrompt(name, answers, scores, band) {
//   const wd = answers.wearable_data || {};

//   // Wearable data summary
//   let wearableSummary = 'No wearable data.';
//   if (answers.wearable && answers.wearable !== 'None / No wearable') {
//     const parts = [
//       wd.avg_steps  ? `Steps: ${wd.avg_steps}${wd.avg_steps < 5000 ? ' (low)' : ''}` : null,
//       wd.avg_sleep  ? `Sleep: ${wd.avg_sleep}h${wd.avg_sleep < 6 ? ' (poor)' : ''}` : null,
//       wd.avg_rhr    ? `RHR: ${wd.avg_rhr}bpm` : null,
//       wd.avg_hrv    ? `HRV: ${wd.avg_hrv}ms${wd.avg_hrv < 30 ? ' (low-stress)' : ''}` : null,
//       wd.avg_stress ? `Stress: ${wd.avg_stress}/100` : null,
//       wd.night_sweats_per_night ? `Night sweats: ${wd.night_sweats_per_night}/night` : null,
//     ].filter(Boolean);
//     if (parts.length) wearableSummary = `Wearable (${answers.wearable}): ${parts.join('; ')}.`;
//   }

//   // Wearable-to-score correlations
//   const correlations = [];
//   if (wd.avg_rhr    > 80)  correlations.push(`RHR ${wd.avg_rhr}bpm (elevated >80) — correlates with vasomotor score ${scores.MENQOL_vasomotor}/20`);
//   if (wd.avg_hrv    < 30)  correlations.push(`HRV ${wd.avg_hrv}ms (low) — matches PSS-8 ${scores.PSS8 || '—'}/32, GAD-7 ${scores.GAD7 || '—'}/21`);
//   if (wd.avg_sleep  < 6.5) correlations.push(`Sleep ${wd.avg_sleep}h (below 7h) — corroborates ISI ${scores.ISI || '—'}/28 (${scores.ISI_band || '—'})`);
//   if (wd.avg_steps  < 5000)correlations.push(`Steps ${wd.avg_steps}/day (very low) — matches Physical MenQOL ${scores.MENQOL_physical || '—'}/20`);
//   if (wd.avg_stress > 50)  correlations.push(`Stress ${wd.avg_stress}/100 — aligns with Psychosocial MenQOL ${scores.MENQOL_psychosocial || '—'}/20`);
//   if (wd.night_sweats_per_night >= 2) correlations.push(`Night sweats ${wd.night_sweats_per_night}/night — corroborates Vasomotor MenQOL ${scores.MENQOL_vasomotor || '—'}/20`);
//   if (wd.avg_spo2   < 95)  correlations.push(`SpO₂ ${wd.avg_spo2}% (low) — possible sleep-disordered breathing; ISI ${scores.ISI || '—'}/28`);

//   // Lifestyle risk factors
//   const smoking = answers.smoking_history || '';
//   const alcohol = answers.alcohol_use || '';
//   const hrt     = answers.hrt_history || '';
//   const lifeParts = [
//     smoking && smoking !== 'Never smoked'   && smoking !== 'Prefer not to say'  ? `SMOKING: ${smoking}. ` : '',
//     alcohol && alcohol !== 'Non-drinker'    && alcohol !== 'Prefer not to say'  ? `ALCOHOL: ${alcohol}. ` : '',
//     hrt     && hrt     !== 'Never used HRT' && hrt     !== 'Not Sure / Prefer not to say' ? `HRT: ${hrt}. ` : '',
//   ];
//   if (answers.height_cm && answers.weight_kg) {
//     const bmi   = (answers.weight_kg / Math.pow(answers.height_cm / 100, 2)).toFixed(1);
//     const bmiN  = parseFloat(bmi);
//     const label = bmiN > 27.5 ? ' (overweight)' : bmiN < 18.5 ? ' (underweight)' : ' (normal)';
//     lifeParts.push(`BMI: ${bmi}${label}. `);
//   }

//   // Family history positives
//   const FAMILY_LABELS = {
//     fam_breast_cancer: 'breast cancer', fam_ovarian_cancer: 'ovarian cancer',
//     fam_osteoporosis: 'osteoporosis', fam_cvd: 'heart disease/stroke',
//     fam_diabetes: 'type 2 diabetes', fam_depression: 'depression/anxiety',
//     fam_early_menopause: 'early menopause <45y',
//   };
//   const famPositives = Object.keys(FAMILY_LABELS).filter(k => answers[k]);
//   const famStr = famPositives.length
//     ? `Family history positive for: ${famPositives.map(k => FAMILY_LABELS[k]).join(', ')}. `
//     : '';

//   // Medications
//   const MED_LABELS = {
//     med_ssri: 'SSRIs/SNRIs', med_antihyp: 'antihypertensives',
//     med_betablocker: 'beta-blockers', med_statin: 'statins',
//     med_thyroid: 'thyroid medication', med_insulin: 'insulin/diabetes medication',
//     med_sleep: 'sleep medication', med_nsaid: 'regular NSAIDs',
//   };
//   const activeMeds = Object.keys(MED_LABELS).filter(k => answers[k]);
//   const medStr = activeMeds.length
//     ? `Current medications: ${activeMeds.map(k => MED_LABELS[k]).join(', ')}. `
//     : '';

//   // Comorbidities
//   const comorbidities  = answers.comorbidities || {};
//   const comorbKeys     = Object.keys(comorbidities).filter(k => comorbidities[k] && comorbidities[k] !== 'no');
//   const comorbStr      = comorbKeys.length
//     ? comorbKeys.map(k => `${k.replace(/_/g, ' ')}(${comorbidities[k]})`).join(', ')
//     : 'None';

//   // Recommended specialists based on scores
//   const specialists = [];
//   if ((scores.MENQOL_psychosocial || 0) >= 8 || (scores.PHQ9 || 0) >= 10) specialists.push('Clinical Psychologist');
//   if ((scores.MENQOL_physical     || 0) >= 10 || (scores.ISI  || 0) >= 8)  specialists.push('Yoga Trainer');
//   if ((scores.MENQOL_physical     || 0) >= 10) specialists.push('Physiotherapist');
//   if ((scores.composite           || 0) >= 35) specialists.push('Nutrition Counsellor', 'Lifestyle Coach');
//   if ((scores.MENQOL_physical     || 0) >= 10) specialists.push('Aerobics Trainer');
//   if ((scores.PSS8                || 0) >= 21) specialists.push('Nature and Harmony Expert');
//   if (S.flags?.psychosexualCompleted && S.flags?.sexuallyActive && (scores.FSFI || 36) <= 26.55)
//     specialists.push('Sexual Wellness Counsellor');

//   // Mental health and sexual health context for prompt
//   const mentalHealthNote = S.flags?.mentalHealthCompleted
//     ? `Mental health assessed: PHQ-9 ${scores.PHQ9}/27 (${scores.PHQ9_band}), GAD-7 ${scores.GAD7}/21 (${scores.GAD7_band}), PSS-8 ${scores.PSS8}/32`
//     : 'Mental health not assessed this visit. Do NOT mention or grade psychological status.';
//   const sexualNote = S.flags?.psychosexualCompleted && scores.FSFI != null
//     ? (S.flags.sexuallyActive
//         ? `Sexual wellbeing assessed: FSFI ${scores.FSFI}/36 (${scores.FSFI_band}), FSDSR ${scores.FSDSR}/52`
//         : 'Sexual questionnaire done; patient not currently sexually active. Mention gently only.')
//     : 'Sexual wellbeing not assessed this visit. Do NOT mention or grade sexual health.';

//   const ayurStr = [
//     answers.prakriti ? `Prakriti: ${answers.prakriti}.` : '',
//     answers.vikriti  ? `Vikriti: ${answers.vikriti.replace(/_/g, ' ')}.` : '',
//   ].filter(Boolean).join(' ');

//   return `You are a senior integrative menopause specialist at EvaEraHealth with expertise in Ayurveda, lifestyle medicine, and modern gynaecology. Write a DEEP PERSONALISED wellness report for ${name} (${answers.age}yrs, ${answers.stage}, ${answers.city}, Prakriti: ${answers.prakriti || 'Tridosha'}, Ethnicity: ${answers.ethnicity || 'not specified'}).

// CLINICAL SCORES:
// Composite: ${scores.composite}/100 (${band}). Vasomotor MenQOL: ${scores.MENQOL_vasomotor}/20. Physical MenQOL: ${scores.MENQOL_physical}/20. Psychosocial MenQOL: ${scores.MENQOL_psychosocial}/20. Sexual MenQOL: ${scores.MENQOL_sexual}/20. ISI Sleep: ${scores.ISI || 0}/28 (${scores.ISI_band || ''}).
// ${mentalHealthNote}.
// ${sexualNote}.

// AYURVEDA: ${ayurStr || 'Prakriti not specified.'}
// WEARABLE DATA: ${wearableSummary}
// ${correlations.length ? `WEARABLE CORRELATIONS: ${correlations.join(' | ')}.` : ''}
// LIFESTYLE RISK FACTORS: ${lifeParts.join('') || 'None reported.'}
// ${famStr}${medStr}
// COMORBIDITIES: ${comorbStr}.
// SPECIALISTS RECOMMENDED: ${specialists.length ? specialists.join(', ') : 'general wellness maintenance'}

// IMPORTANT INSTRUCTIONS:
// 1. Every bullet must reference her SPECIFIC scores, wearable data, or risk factors above — no generic menopause advice.
// 2. For each positive risk factor (smoking, alcohol, family history, medications, BMI, wearable alerts) provide a specific Ayurvedic/integrative remedy.
// 3. Where wearable data corroborates a score, name both in the recommendation.
// 4. For each major symptom provide BOTH a conventional evidence-based option AND an Ayurvedic alternative with specific herbs (Shatavari, Ashwagandha, Brahmi, etc.) and yoga asanas by Sanskrit name.
// 5. Tone: warm, like a caring senior doctor-aunt. Bullet points throughout. Compassionate but clinical.

// Structure EXACTLY (headings on own line):

// DEAR ${name.toUpperCase()},
// [2 sentences acknowledging her specific stage and highest symptom]

// YOUR HEALTH PICTURE TODAY
// [4 bullets citing her specific composite, top domains, wearable insight, key risk]

// WHAT YOUR BODY IS TELLING YOU
// [4 bullets: physical/vasomotor, sleep, mental/emotional (if assessed), Ayurveda Prakriti]

// YOUR RISK FACTORS & NATURAL REMEDIES
// [One bullet per POSITIVE risk factor only — with specific Ayurvedic/natural mitigation]

// YOUR PERSONALISED ACTIVITY PLAN
// [4 bullets: activity citing wearable steps, 2 yoga asanas by Sanskrit name, 1 pranayama by name, avoidance for her Prakriti]

// YOUR PERSONALISED DIET & NUTRITION
// [4 bullets: morning ritual, 3 include foods, 2-3 avoid foods, 2+1 supplement with dosage]

// MIND & EMOTIONAL WELLBEING
// [3 bullets: score-based insight, specific named technique, sleep protocol from ISI + wearable]

// YOUR SPECIALIST CARE TEAM
// [One bullet per specialist citing actual scores]

// YOUR 3 ACTIONS THIS WEEK
// 1. Most urgent action from highest score or wearable alert
// 2. Ayurvedic action for her Prakriti
// 3. Lifestyle action for a specific risk factor

// A PERSONAL NOTE FROM YOUR EVAERAHEALTH TEAM
// [2 warm sentences mentioning her name]

// 680 words max. Every bullet MUST cite her data. Zero generic statements.`;
// }

// /** Simple fallback report if the AI call fails */
// function buildFallbackReport(name, band) {
//   return `Dear ${name},

// Thank you for completing your EvaEraHealth wellness assessment.

// YOUR WELLNESS PICTURE
// Your assessment shows ${band.toLowerCase()}. With the right support and lifestyle adjustments, your journey through menopause can be significantly more comfortable.

// YOUR 3 STEPS THIS WEEK
// 1. Begin a gentle 15-minute morning walk daily
// 2. Establish a consistent sleep schedule and cool sleeping environment
// 3. Book a consultation at EvaEraHealth Clinic — +91 80690 50000

// A GENTLE REMINDER
// You are not alone in this journey — EvaEraHealth is with you every step of the way.`;
// }

// /** Assembles the final HTML report document string */
// function buildReportHTML({ name, answers, scores, triage, today, band, bandCol, aiBody }) {
//   const bandIcon = band.includes('Optimal') ? '🌟' : band.includes('Mild') ? '🌿' : band.includes('Moderate') ? '🌀' : band.includes('Significant') ? '⚠️' : '🆘';

//   // Format AI body into HTML (headings + paragraphs)
//   const formattedAI = formatAIReportBody(aiBody);

//   // Domain score cards
//   const domainCards = buildReportDomainCards(scores);

//   // Triage recommendation cards
//   const triageHtml = buildReportTriageCards(triage);

//   // Mental health scores table (if assessed)
//   const mentalHealthTable = (S.flags?.mentalHealthCompleted) ? buildReportMentalHealthTable(scores) : '';

//   return `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width,initial-scale=1">
//   <title>EvaEraHealth Wellness Report</title>
//   <style>
//     * { box-sizing: border-box; }
//     body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #F8F9FA; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//     @media print { .noprint { display: none; } body { background: white; } }
//     .page { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 4px 40px rgba(0,0,0,.12); }
//   </style>
// </head>
// <body>
// <div class="page">

//   <!-- Header -->
//   <div style="background:linear-gradient(135deg,#880E4F,#C2185B,#AD1457);padding:24px 32px;color:white">
//     <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
//       <div style="display:flex;align-items:center;gap:12px">
//         <div style="width:44px;height:44px;background:rgba(255,255,255,.2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px">🌸</div>
//         <div>
//           <div style="font-family:Georgia,serif;font-size:22px;font-weight:700">EvaEraHealth</div>
//           <div style="font-size:11px;opacity:.7;margin-top:1px">Adaptive Menopause Wellness Platform</div>
//         </div>
//       </div>
//       <span style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:16px;padding:5px 12px;font-size:11px;font-weight:600">Personal Wellness Report</span>
//     </div>
//     <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;background:rgba(0,0,0,.15);border-radius:10px;padding:12px 16px">
//       ${['Patient|' + name, 'Age|' + (answers.age || '—') + ' yrs', 'Stage|' + (answers.stage || '—'), 'Date|' + today]
//         .map(item => { const [label, val] = item.split('|'); return `<div style="text-align:center"><div style="font-size:10px;opacity:.6;font-weight:600;text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px">${label}</div><div style="font-size:13px;font-weight:700">${val}</div></div>`; }).join('')}
//     </div>
//   </div>

//   <!-- AI disclaimer -->
//   <div style="background:#FFF3E0;border-bottom:3px solid #FF9800;padding:10px 32px;display:flex;gap:8px;align-items:center">
//     <span>🤖</span>
//     <span style="font-size:12px;color:#E65100;font-weight:600">AI-Generated Wellness Report — For informational purposes only. Must be reviewed by a qualified clinician before any clinical decision.</span>
//   </div>

//   <div style="padding:24px 32px">

//     <!-- Overall band -->
//     <div style="text-align:center;padding:20px;background:linear-gradient(135deg,#FFF0F5,#F0F9FF);border-radius:14px;margin-bottom:20px">
//       <div style="font-size:52px;margin-bottom:8px">${bandIcon}</div>
//       <div style="font-size:26px;font-weight:800;font-family:Georgia,serif;color:${bandCol};margin-bottom:6px">${band}</div>
//       <div style="font-size:12px;color:#6B7280">Your EvaEraHealth Wellness Level</div>
//     </div>

//     <!-- Domain scores -->
//     <div style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1E3A5F;margin:0 0 10px;padding-bottom:5px;border-bottom:2px solid #FCE4EC">Domain Scores</div>
//     ${domainCards}

//     <!-- Mental health scores -->
//     ${mentalHealthTable}

//     <!-- AI Report -->
//     <div style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1E3A5F;margin:20px 0 10px;padding-bottom:5px;border-bottom:2px solid #FCE4EC">Your Personal Wellness Report</div>
//     <div style="background:#FFFBF5;border:1px solid #FCE4EC;border-radius:12px;padding:20px">${formattedAI}</div>

//     <!-- Triage cards -->
//     ${triage.length ? `
//       <div style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1E3A5F;margin:20px 0 10px;padding-bottom:5px;border-bottom:2px solid #FCE4EC">Personalised Care Recommendations</div>
//       ${triageHtml}
//     ` : ''}

//     <!-- Medical disclaimer -->
//     <div style="background:linear-gradient(135deg,#FFF8E7,#FFF3E0);border:1.5px solid #FFB300;border-radius:12px;padding:16px;margin-top:20px">
//       <div style="font-size:14px;font-weight:800;color:#E65100;margin-bottom:8px">⚕️ Medical Disclaimer</div>
//       <div style="font-size:12px;color:#795548;line-height:1.7">
//         This report is generated by <strong>EvaEraHealth AI (Claude, Anthropic)</strong> and is for
//         <strong>informational and wellness awareness purposes only</strong>. It does not constitute a
//         medical diagnosis, prescription, or clinical advice. All recommendations must be reviewed by a
//         qualified clinician before any action. Scores are self-reported. For emergencies call 112.
//       </div>
//       <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
//         <span style="background:white;border:1px solid #FFB300;border-radius:10px;padding:2px 8px;font-size:10px;font-weight:700;color:#E65100">🤖 AI Generated</span>
//         <span style="background:white;border:1px solid #66BB6A;border-radius:10px;padding:2px 8px;font-size:10px;font-weight:700;color:#2E7D32">🔒 DPDP 2023</span>
//         <span style="background:white;border:1px solid #42A5F5;border-radius:10px;padding:2px 8px;font-size:10px;font-weight:700;color:#1565C0">👩‍⚕️ Clinician Review Required</span>
//       </div>
//     </div>

//   </div>

//   <!-- Footer -->
//   <div style="background:#1E3A5F;color:rgba(255,255,255,.65);padding:14px 32px;display:flex;justify-content:space-between;align-items:center;font-size:11px">
//     <div><span style="color:white;font-weight:700">EvaEraHealth Clinic</span><br>Gurugram Flagship Center</div>
//     <div style="text-align:center">Report ID: EVR-${Date.now().toString(36).toUpperCase()}<br>${today}</div>
//     <div style="text-align:right">📞 +91 80690 50000<br>clinic@evaerahealth.in</div>
//   </div>

//   <!-- Print button (not printed) -->
//   <div class="noprint" style="padding:14px 32px;background:#F3F4F6;text-align:center">
//     <button onclick="window.print()" style="background:#880E4F;color:white;border:none;padding:11px 24px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;margin-right:8px">🖨️ Print / Save as PDF</button>
//     <button onclick="window.close()" style="background:#E5E7EB;color:#374151;border:none;padding:11px 24px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">✕ Close</button>
//   </div>

// </div>
// </body>
// </html>`;
// }

// /** Renders the 5-card domain grid for the HTML report */
// function buildReportDomainCards(scores) {
//   const domains = [
//     { label: 'Vasomotor', value: scores.MENQOL_vasomotor || 0, max: 20, emoji: '🌡', thresholds: [7, 10, 14] },
//     { label: 'Physical',  value: scores.MENQOL_physical  || 0, max: 20, emoji: '💪', thresholds: [7, 10, 14] },
//     { label: 'Emotional', value: scores.MENQOL_psychosocial||0,max: 20, emoji: '🧠', thresholds: [7, 10, 14] },
//     { label: 'Intimate',  value: scores.MENQOL_sexual    || 0, max: 20, emoji: '💙', thresholds: [7, 10, 14] },
//     { label: 'Sleep',     value: scores.ISI              || 0, max: 28, emoji: '😴', thresholds: [8, 15, 22] },
//   ];

//   const cards = domains.map(d => {
//     const [warn, alert] = [d.thresholds[1], d.thresholds[2]];
//     const colour = d.value >= alert ? '#C62828' : d.value >= warn ? '#E65100' : d.value >= d.thresholds[0] ? '#F59E0B' : '#2E7D32';
//     const bandLabel = d.value >= alert ? 'High' : d.value >= warn ? 'Moderate' : d.value >= d.thresholds[0] ? 'Mild' : 'Low';
//     const pct = Math.round((d.value / d.max) * 100);

//     return `
//       <div style="background:#F9FAFB;border:1.5px solid #E5E7EB;border-radius:10px;padding:10px;text-align:center">
//         <div style="font-size:16px">${d.emoji}</div>
//         <div style="font-size:10px;color:#6B7280;font-weight:600;margin:3px 0">${d.label}</div>
//         <div style="font-size:20px;font-weight:900;font-family:Georgia,serif;color:${colour}">
//           ${d.value}<span style="font-size:10px;color:#9CA3AF">/${d.max}</span>
//         </div>
//         <div style="height:5px;background:#E5E7EB;border-radius:3px;margin-top:4px;overflow:hidden">
//           <div style="height:100%;width:${pct}%;background:${colour}"></div>
//         </div>
//         <div style="font-size:9px;font-weight:700;color:${colour};margin-top:3px">${bandLabel}</div>
//       </div>`;
//   }).join('');

//   return `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:20px">${cards}</div>`;
// }

// /** Renders the mental health scores table for the HTML report */
// function buildReportMentalHealthTable(scores) {
//   const rows = [
//     ['PHQ-9', scores.PHQ9, 27, scores.PHQ9_band],
//     ['GAD-7', scores.GAD7, 21, scores.GAD7_band],
//     ['PSS-8', scores.PSS8, 32, scores.PSS8_band],
//   ];

//   const rowsHtml = rows.map(([label, val, max, bandLabel]) => {
//     const colour = ['Severe', 'High'].includes(bandLabel) ? '#C62828'
//                  : ['Moderate', 'Mod-Severe'].includes(bandLabel) ? '#E65100'
//                  : bandLabel === 'Mild' ? '#F59E0B' : '#2E7D32';
//     const pct = Math.round((val / max) * 100);
//     return `
//       <tr>
//         <td style="padding:7px 8px;border-bottom:1px solid #F9FAFB;font-weight:600;font-size:13px">${label}</td>
//         <td style="padding:7px 8px;border-bottom:1px solid #F9FAFB;font-size:18px;font-weight:900;font-family:Georgia,serif;color:${colour};text-align:center">${val}</td>
//         <td style="padding:7px 8px;border-bottom:1px solid #F9FAFB">
//           <div style="width:90px;height:5px;background:#F3F4F6;border-radius:3px;overflow:hidden">
//             <div style="height:100%;width:${pct}%;background:${colour}"></div>
//           </div>
//         </td>
//         <td style="padding:7px 8px;border-bottom:1px solid #F9FAFB;color:${colour};font-weight:700;font-size:12px">${bandLabel}</td>
//       </tr>`;
//   }).join('');

//   return `
//     <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
//       <thead>
//         <tr>
//           <th style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;padding:7px 8px;border-bottom:2px solid #F3F4F6;text-align:left">Instrument</th>
//           <th style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;padding:7px 8px;border-bottom:2px solid #F3F4F6">Score</th>
//           <th style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;padding:7px 8px;border-bottom:2px solid #F3F4F6">Scale</th>
//           <th style="font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;padding:7px 8px;border-bottom:2px solid #F3F4F6">Band</th>
//         </tr>
//       </thead>
//       <tbody>${rowsHtml}</tbody>
//     </table>`;
// }

// /** Renders triage recommendation cards for the HTML report */
// function buildReportTriageCards(triage) {
//   return triage.map(t => {
//     const sevColour = t.sev === 'severe' ? '#C62828' : t.sev === 'moderate' ? '#E65100' : '#2E7D32';
//     const sevBg     = t.sev === 'severe' ? '#FFF1F2' : t.sev === 'moderate' ? '#FFF7ED' : '#F0FDF4';
//     const sevBorder = t.sev === 'severe' ? '#FECDD3' : t.sev === 'moderate' ? '#FED7AA' : '#BBF7D0';

//     return `
//       <div style="display:flex;align-items:flex-start;gap:10px;background:${sevBg};border:1px solid ${sevBorder};border-left:4px solid ${sevColour};border-radius:10px;padding:11px 12px;margin-bottom:8px">
//         <span style="font-size:18px;flex-shrink:0">${TRIAGE_ICONS[t.action] || '✦'}</span>
//         <div style="flex:1">
//           <div style="font-size:13px;font-weight:700;color:#111827;text-transform:capitalize">${t.action.replace(/_/g, ' ')}</div>
//           <div style="font-size:12px;color:#6B7280;margin-top:2px">${TRIAGE_DESCRIPTIONS[t.action] || ''}</div>
//         </div>
//         <span style="font-size:10px;font-weight:800;color:${sevColour};background:white;padding:2px 8px;border-radius:10px;border:1px solid ${sevBorder};flex-shrink:0">
//           ${t.sev.toUpperCase()}
//         </span>
//       </div>`;
//   }).join('');
// }

// /**
//  * Converts the AI-generated plain text report into formatted HTML.
//  * ALL-CAPS lines become section headings; everything else becomes a paragraph.
//  */
// function formatAIReportBody(text) {
//   let html = '';
//   let inParagraph = false;

//   text.split('\n').forEach(line => {
//     const trimmed  = line.trim();
//     if (!trimmed) {
//       if (inParagraph) { html += '</p>'; inParagraph = false; }
//       return;
//     }

//     const isHeading = /^[A-Z][A-Z\s,]+:?$/.test(trimmed) && trimmed.length < 60;
//     const isDear    = trimmed.toUpperCase().startsWith('DEAR ');

//     if (isHeading || isDear) {
//       if (inParagraph) { html += '</p>'; inParagraph = false; }
//       html += `<h3 style="font-family:Georgia,serif;font-size:16px;font-weight:700;color:#880E4F;margin:18px 0 6px;border-bottom:1.5px solid #FCE4EC;padding-bottom:4px">${trimmed}</h3>`;
//     } else {
//       if (!inParagraph) { html += '<p style="margin:0 0 10px;color:#374151;font-size:14px;line-height:1.7">'; inParagraph = true; }
//       html += trimmed + ' ';
//     }
//   });

//   if (inParagraph) html += '</p>';
//   return html;
// }


// // SHARED HTML HELPERS

// /**
//  * Builds a single score row (label + value, with optional abnormal highlight and note).
//  * Skips rows where value is null/undefined/blank/'—'/'Prefer not to say'.
//  */
// function buildScoreRow(label, value, isAbnormal = false, note = '') {
//   if (value == null || value === '' || value === '—' || value === 'Prefer not to say') return '';

//   const colour   = isAbnormal ? '#EF9A9A' : 'rgba(255,255,255,0.85)';
//   const noteSpan = note ? `<span style="font-size:10px;color:#FF9800;margin-left:4px">${note}</span>` : '';

//   return `
//     <div class="score-row">
//       <span class="score-label">${label}</span>
//       <span class="score-val" style="color:${colour}">${value}${noteSpan}</span>
//     </div>`;
// }

// /**
//  * Builds a colour-coded info box (used in the Clinical Summary tab).
//  * @param {string} headerColour  - title text colour
//  * @param {string} borderColour  - box border colour
//  * @param {string} title
//  * @param {string} itemsHtml     - inner HTML of content items
//  * @param {string} [bg]          - background colour (defaults to a light tint of borderColour)
//  * @param {string} [border]      - border colour override
//  * @param {string} [textColour]  - body text colour
//  */
// function buildInfoBox(headerColour, borderColour, title, itemsHtml, bg, border, textColour = 'rgba(255,255,255,0.7)') {
//   const bgColour     = bg     || `rgba(0,0,0,0.08)`;
//   const borderFinal  = border || `rgba(0,0,0,0.25)`;

//   return `
//     <div style="background:${bgColour};border:1px solid ${borderFinal};border-radius:10px;padding:12px;margin-bottom:10px">
//       <div style="font-size:11px;font-weight:800;color:${headerColour};margin-bottom:5px">${title}</div>
//       <div style="color:${textColour}">${itemsHtml}</div>
//     </div>`;
// }

// /** Triggers a browser file download */
// function downloadTextFile(content, filename, mimeType = 'text/plain') {
//   const blob = new Blob([content], { type: mimeType });
//   const a    = document.createElement('a');
//   a.href     = URL.createObjectURL(blob);
//   a.download = filename;
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
//   URL.revokeObjectURL(a.href);
// }


// // BUTTON HELPERS (shared with consent.js)
// // These are duplicated here for self-containment; prefer a shared utils.js

// function setButtonLoading(btn, loadingText) {
//   if (!btn) return;
//   btn._originalText = btn.textContent;
//   btn.textContent   = loadingText;
//   btn.disabled      = true;
// }

// function restoreButton(btn, fallbackText) {
//   if (!btn) return;
//   btn.textContent = fallbackText || btn._originalText || 'Submit';
//   btn.disabled    = false;
// }

// function clearOTPInputs(selector) {
//   const inputs = document.querySelectorAll(selector);
//   inputs.forEach(input => { input.value = ''; });
//   inputs[0]?.focus();
// }


/* HCP Portal — Dashboard, Patient List & Detail */

/** Maps triage action keys to display emoji */
const TRIAGE_ICONS = {
  psychiatric_alert:        '🚨',
  gynecology_referral:      '👩‍⚕️',
  psychologist_referral:    '🧠',
  sexual_therapy_pathway:   '💙',
  sleep_recovery_program:   '😴',
  stress_management_program:'🌿',
  recommend_menopause_program:'🌸',
  gurugram_clinic:          '🏥',
  exercise_program:         '🏃',
  nutrition_guidance:       '🥗',
  sexual_wellbeing_program: '💜',
  activate_psychosexual_module:'💙',
  relationship_counselling: '🤝',
};

/** Maps triage action keys to short descriptions */
const TRIAGE_DESCRIPTIONS = {
  psychiatric_alert:          'Immediate mental health intervention — do not delay',
  psychologist_referral:      'Clinical psychology & evidence-based therapy (CBT/DBT)',
  gynecology_referral:        'Gynaecologist review — EvaEraHealth Clinic Gurugram',
  sexual_therapy_pathway:     'Integrated psychosexual therapy with qualified therapist',
  sexual_wellbeing_program:   'Sexual wellness education and personalised support',
  sleep_recovery_program:     'CBT-I and structured sleep hygiene programme',
  stress_management_program:  'Mindfulness, yoga and structured stress reduction',
  recommend_menopause_program:'EvaEraHealth personalised menopause programme',
  exercise_program:           'Targeted movement prescription with physiotherapist',
  nutrition_guidance:         'Hormonal nutrition plan with certified nutritionist',
  relationship_counselling:   'Couples or individual relationship counselling',
  activate_psychosexual_module:'Psychosexual wellbeing module activation',
  gurugram_clinic:            'In-person consultation — Gurugram Flagship Centre',
};

const WEARABLE_NORMS = {
  avg_rhr: {
    lo: 40, hi: 80, unit: 'bpm', label: 'Resting HR',
    correlation(v, s) {
      if (v > 80) {
        let note = 'Elevated RHR';
        if (s.MENQOL_vasomotor >= 10) note += ` — correlates with vasomotor ${s.MENQOL_vasomotor}/20`;
        return { flag: true, note };
      }
      return { flag: false, note: 'Normal range' };
    },
  },
  avg_hrv: {
    lo: 20, hi: 60, unit: 'ms', label: 'HRV',
    correlation(v, s) {
      if (v < 20) return { flag: true, note: `Severely low — autonomic stress. PSS-8: ${s.PSS8 || '—'}/32, GAD-7: ${s.GAD7 || '—'}/21` };
      if (v < 30) return { flag: true, note: `Low HRV — stress burden present. ISI sleep: ${s.ISI || '—'}/28` };
      return { flag: false, note: 'Adequate autonomic resilience' };
    },
  },
  avg_spo2: {
    lo: 95, hi: 100, unit: '%', label: 'SpO₂',
    correlation(v) {
      if (v < 90) return { flag: true, note: '⚠️ URGENT — below 90%, refer immediately' };
      if (v < 95) return { flag: true, note: 'Below normal — possible sleep apnoea' };
      return { flag: false, note: 'Normal' };
    },
  },
  avg_sleep: {
    lo: 7, hi: 9, unit: 'hrs', label: 'Avg Sleep',
    correlation(v, s, wd) {
      const sweats = wd.night_sweats_per_night || 0;
      if (v < 5)   return { flag: true, note: `Severe deprivation. ISI: ${s.ISI || '—'}/28 (${s.ISI_band || '—'}). Night sweats: ${sweats}/night` };
      if (v < 6.5) return { flag: true, note: `Below target (7–9h). ISI: ${s.ISI || '—'}/28 (${s.ISI_band || '—'})` };
      return { flag: false, note: 'Within target range' };
    },
  },
  avg_steps: {
    lo: 7500, hi: 15000, unit: '/day', label: 'Steps',
    correlation(v, s) {
      if (v < 3000) return { flag: true, note: `Very sedentary — Physical MenQOL: ${s.MENQOL_physical || '—'}/20` };
      if (v < 5000) return { flag: true, note: 'Low activity — target ≥7,500/day' };
      return { flag: false, note: 'Good activity level' };
    },
  },
  avg_stress: {
    lo: 0, hi: 30, unit: '/100', label: 'Stress Score',
    correlation(v, s) {
      if (v > 70) return { flag: true, note: `Very high — PSS-8: ${s.PSS8 || '—'}/32, GAD-7: ${s.GAD7 || '—'}/21` };
      if (v > 50) return { flag: true, note: `Elevated — correlates with psychosocial: ${s.MENQOL_psychosocial || '—'}/20` };
      return { flag: false, note: 'Within normal' };
    },
  },
  night_sweats_per_night: {
    lo: 0, hi: 1, unit: '/night', label: 'Night Sweats',
    correlation(v, s) {
      if (v >= 4) return { flag: true, note: `Severe vasomotor — MenQOL Vasomotor: ${s.MENQOL_vasomotor || '—'}/20` };
      if (v >= 2) return { flag: true, note: 'Significant — correlates with vasomotor domain' };
      return { flag: false, note: 'Mild/absent' };
    },
  },
};

const DEMO_PATIENTS = [
  {
    id: 'P_GYNE', name: 'Meena Iyer', age: 54, city: 'Chennai',
    stage: 'Post-Menopause', prakriti: 'Pitta', vikriti: 'Pitta_excess',
    scores: { composite: 50, composite_band: 'Moderate', MENQOL_vasomotor: 15, MENQOL_physical: 12, MENQOL_psychosocial: 8, MENQOL_sexual: 8, PHQ9: 8, PHQ9_band: 'Mild', GAD7: 7, GAD7_band: 'Mild', PSS8: 16, PSS8_band: 'Moderate', ISI: 7, ISI_band: 'None', FSFI: null, FSDSR: null, FSFI_band: 'Not assessed', FSDSR_band: 'Not assessed', MCSS: 0, rf1: 'Yes', rf2: 'No', rf3: 'Yes', comorbidityMod: 13 },
    triage: [{ action: 'gynecology_referral', sev: 'severe', rules: ['RED_FLAG'] }, { action: 'recommend_menopause_program', sev: 'moderate', rules: ['EVR_VM'] }, { action: 'stress_management_program', sev: 'moderate', rules: ['EVR_PS'] }],
    redFlags: ['Unusual vaginal bleeding', 'Breast changes'],
    flags: { gyneRedFlag: true, menqolPsychTriggered: false, menqolSexualTriggered: false, sleepModerate: false, sleepSevere: false, mentalHealthCompleted: false, psychosexualCompleted: false },
    psychiatricAlert: false, comorbidities: { Hypertension: 'Controlled', Hyperlipidemia: 'Controlled' },
    wearable: { device: 'Garmin Venu 2', period: 'Last 30 days', avg_rhr: 78, avg_hrv: 29, avg_spo2: 96, avg_sleep: 5.8, night_sweats_per_night: 3, avg_steps: 4820, avg_stress: 52, correlations: ['Night sweats 3/night — significant vasomotor activity', 'HRV 29ms (low) — autonomic stress pattern'] },
    timestamp: new Date().toISOString(), sessionId: 'demo',
  },
  {
    id: 'P_PSYCH', name: 'Kavitha Nair', age: 47, city: 'Kochi',
    stage: 'Perimenopause', prakriti: 'Vata', vikriti: 'Vata_excess',
    scores: { composite: 100, composite_band: 'Critical', MENQOL_vasomotor: 18, MENQOL_physical: 15, MENQOL_psychosocial: 18, MENQOL_sexual: 5, PHQ9: 26, PHQ9_band: 'Severe', PHQ9_item9: 2, GAD7: 21, GAD7_band: 'Severe', PSS8: 32, PSS8_band: 'High', ISI: 28, ISI_band: 'Severe', FSFI: null, FSDSR: null, FSFI_band: 'Not assessed', FSDSR_band: 'Not assessed', MCSS: 0, rf1: 'No', rf2: 'No', rf3: 'No', comorbidityMod: 14 },
    triage: [{ action: 'psychiatric_alert', sev: 'severe', rules: ['R1'] }, { action: 'psychologist_referral', sev: 'severe', rules: ['EVR_PHQ9'] }, { action: 'sleep_recovery_program', sev: 'severe', rules: ['EVR_ISI'] }, { action: 'gurugram_clinic', sev: 'severe', rules: ['COMP_HIGH'] }, { action: 'stress_management_program', sev: 'moderate', rules: ['EVR_GAD7', 'EVR_PSS8', 'EVR_PS'] }],
    redFlags: [],
    flags: { gyneRedFlag: false, menqolPsychTriggered: true, menqolSexualTriggered: false, sleepModerate: true, sleepSevere: true, mentalHealthCompleted: true, psychosexualCompleted: false },
    psychiatricAlert: true, comorbidities: { Hypothyroidism: 'Controlled', Anaemia: 'Uncontrolled' },
    wearable: { device: 'Apple Watch Series 9', period: 'Last 30 days', avg_rhr: 88, avg_hrv: 19, avg_spo2: 95, avg_sleep: 4.9, night_sweats_per_night: 4, avg_steps: 3210, avg_stress: 74, correlations: ['HRV 19ms (critically low) — severe autonomic dysregulation', 'Sleep 4.9h — severe deprivation compounding depression'] },
    timestamp: new Date().toISOString(), sessionId: 'demo',
  },
  {
    id: 'P_NORMAL', name: 'Anita Sharma', age: 48, city: 'Pune',
    stage: 'Perimenopause', prakriti: 'Tridosha', vikriti: 'Balanced',
    scores: { composite: 15, composite_band: 'Mild', MENQOL_vasomotor: 5, MENQOL_physical: 5, MENQOL_psychosocial: 5, MENQOL_sexual: 5, PHQ9: 0, PHQ9_band: 'Minimal', GAD7: 0, GAD7_band: 'Minimal', PSS8: 8, PSS8_band: 'Low', ISI: 0, ISI_band: 'None', FSFI: null, FSDSR: null, FSFI_band: 'Not assessed', FSDSR_band: 'Not assessed', MCSS: 0, rf1: 'No', rf2: 'No', rf3: 'No', comorbidityMod: 0 },
    triage: [{ action: 'recommend_menopause_program', sev: 'mild', rules: ['COMP_LOW'] }],
    redFlags: [], flags: { gyneRedFlag: false, menqolPsychTriggered: false, menqolSexualTriggered: false, sleepModerate: false, sleepSevere: false, mentalHealthCompleted: false, psychosexualCompleted: false },
    psychiatricAlert: false, comorbidities: {}, wearable: null,
    timestamp: new Date().toISOString(), sessionId: 'demo',
  },
  {
    id: 'P_PSYCHOSEXUAL', name: 'Rekha Pillai', age: 51, city: 'Bengaluru',
    stage: 'Menopause (<1yr)', prakriti: 'Kapha', vikriti: 'Kapha_excess',
    scores: { composite: 59, composite_band: 'Moderate', MENQOL_vasomotor: 12, MENQOL_physical: 12, MENQOL_psychosocial: 10, MENQOL_sexual: 18, PHQ9: 16, PHQ9_band: 'Moderately Severe', GAD7: 14, GAD7_band: 'Moderate', PSS8: 17, PSS8_band: 'Moderate', ISI: 14, ISI_band: 'Subthreshold', FSFI: 7.2, FSFI_band: 'Sexual Dysfunction', FSDSR: 39, FSDSR_band: 'Clinically Significant Distress', MCSS: 5, rf1: 'No', rf2: 'No', rf3: 'No', comorbidityMod: 20 },
    triage: [{ action: 'sexual_therapy_pathway', sev: 'severe', rules: ['R2'] }, { action: 'psychologist_referral', sev: 'severe', rules: ['EVR_PHQ9'] }, { action: 'activate_psychosexual_module', sev: 'moderate', rules: ['R3'] }, { action: 'sleep_recovery_program', sev: 'moderate', rules: ['EVR_ISI'] }, { action: 'stress_management_program', sev: 'moderate', rules: ['EVR_GAD7'] }],
    redFlags: [], flags: { gyneRedFlag: false, menqolPsychTriggered: true, menqolSexualTriggered: true, sleepModerate: true, sleepSevere: false, mentalHealthCompleted: true, psychosexualCompleted: true },
    psychiatricAlert: false, comorbidities: { Diabetes: 'Controlled', PCOD: 'Controlled' },
    wearable: { device: 'Fitbit Sense 2', period: 'Last 30 days', avg_rhr: 82, avg_hrv: 24, avg_spo2: 94, avg_sleep: 5.4, night_sweats_per_night: 2, avg_steps: 5640, avg_stress: 63, correlations: ['FSDSR 39/52 — extreme sexual distress', 'SpO2 94% — borderline, monitor'] },
    timestamp: new Date().toISOString(), sessionId: 'demo',
  },
  {
    id: 'P_HIGHMQ', name: 'Priya Mehta', age: 45, city: 'Delhi',
    stage: 'Perimenopause', prakriti: 'Vata-Pitta', vikriti: 'Vata_Pitta_excess',
    scores: { composite: 78, composite_band: 'Severe', MENQOL_vasomotor: 18, MENQOL_physical: 18, MENQOL_psychosocial: 18, MENQOL_sexual: 15, PHQ9: 16, PHQ9_band: 'Moderately Severe', GAD7: 14, GAD7_band: 'Moderate', PSS8: 26, PSS8_band: 'High', ISI: 21, ISI_band: 'Moderate', FSFI: 14.4, FSFI_band: 'Sexual Dysfunction', FSDSR: 26, FSDSR_band: 'Clinically Significant Distress', MCSS: 10, rf1: 'No', rf2: 'Occasionally', rf3: 'No', comorbidityMod: 12 },
    triage: [{ action: 'sexual_therapy_pathway', sev: 'severe', rules: ['R2'] }, { action: 'psychologist_referral', sev: 'severe', rules: ['EVR_PHQ9'] }, { action: 'sleep_recovery_program', sev: 'severe', rules: ['EVR_ISI'] }, { action: 'gurugram_clinic', sev: 'severe', rules: ['COMP_HIGH'] }, { action: 'stress_management_program', sev: 'moderate', rules: ['EVR_GAD7', 'EVR_PSS8'] }, { action: 'recommend_menopause_program', sev: 'moderate', rules: ['EVR_VM'] }, { action: 'exercise_program', sev: 'mild', rules: ['EVR_PH'] }],
    redFlags: [], flags: { gyneRedFlag: false, menqolPsychTriggered: true, menqolSexualTriggered: true, sleepModerate: true, sleepSevere: false, mentalHealthCompleted: true, psychosexualCompleted: true },
    psychiatricAlert: false, comorbidities: { Hypertension: 'Controlled', Anaemia: 'Controlled' },
    wearable: { device: 'Samsung Galaxy Watch 6', period: 'Last 30 days', avg_rhr: 84, avg_hrv: 22, avg_spo2: 96, avg_sleep: 5.1, night_sweats_per_night: 4, avg_steps: 6200, avg_stress: 68, correlations: ['Night sweats 4/night — severe vasomotor activity', 'ISI 21 — moderate-severe insomnia compounding all domains'] },
    timestamp: new Date().toISOString(), sessionId: 'demo',
  },
];

// ── SCORE / BAND HELPERS ──────────────────────────────────────────────────────

function compositeBand(composite) {
  if (composite >= 81) return { label: 'Critical', colour: '#B71C1C', cssClass: 'critical', tagClass: 'tag-rose' };
  if (composite >= 56) return { label: 'Severe',   colour: '#EF5350', cssClass: 'severe',   tagClass: 'tag-rose' };
  if (composite >= 31) return { label: 'Moderate', colour: '#FF9800', cssClass: 'moderate', tagClass: 'tag-gold' };
  if (composite >= 6)  return { label: 'Mild',     colour: '#4CAF50', cssClass: 'mild',     tagClass: 'tag-teal' };
  return                      { label: 'Optimal',  colour: '#00695C', cssClass: 'optimal',  tagClass: 'tag-teal' };
}

function scoreColour(value, warnAt, alertAt) {
  if (value >= alertAt) return '#EF5350';
  if (value >= warnAt)  return '#FF9800';
  return '#4CAF50';
}

// ── HCP OTP FLOW ──────────────────────────────────────────────────────────────

function hcpSendOTP() {
  const identifier = document.getElementById('hcp-login-id').value.trim();
  if (!identifier) { alert('Please enter your provider email or ID.'); return; }

  S.authId = identifier;

  const btn = document.querySelector('#hcp-auth-screen .btn-hcp');
  if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }

  fetch(`${OTP_BACKEND_URL}/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, portal: 'hcp' }),
  })
    .then(res => res.json())
    .then(data => {
      if (btn) { btn.textContent = 'Send OTP'; btn.disabled = false; }
      if (data.success) {
        const section = document.getElementById('hcp-otp-section');
        section.style.display = 'block';
        const hint = document.getElementById('hcp-otp-hint');
        if (hint) hint.textContent = `OTP sent to ${identifier}`;
        setTimeout(() => document.querySelector('.hcp-otp-digit')?.focus(), 150);
        // ── Start 30s cooldown on resend button ──
        startResendCooldown('hcp');
      } else {
        alert(data.detail || 'Failed to send OTP. Please try again.');
      }
    })
    .catch(err => {
      if (btn) { btn.textContent = 'Send OTP'; btn.disabled = false; }
      console.error('HCP OTP send error:', err);
      alert('Could not reach the OTP service. Please check your connection.');
    });
}

function hcpOtpNext(el) {
  if (el.value.length !== 1) return;
  const digits = Array.from(document.querySelectorAll('.hcp-otp-digit'));
  const index  = digits.indexOf(el);
  if (index < digits.length - 1) {
    digits[index + 1].focus();
  } else {
    document.getElementById('btn-hcp-verify').click();
  }
}

function hcpVerifyOTP() {
  const digits = Array.from(document.querySelectorAll('.hcp-otp-digit'))
    .map(d => d.value)
    .join('');

  if (digits.length < 4) { alert('Please enter all 4 OTP digits.'); return; }

  const loginId = document.getElementById('hcp-login-id').value.trim();
  const btn     = document.getElementById('btn-hcp-verify');
  if (btn) { btn.textContent = 'Verifying…'; btn.disabled = true; }

  fetch(`${OTP_BACKEND_URL}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: loginId, otp: digits }),
  })
    .then(res => {
      if (!res.ok) return res.json().then(e => { throw new Error(e.detail); });
      return res.json();
    })
    .then(data => {
      if (btn) { btn.textContent = 'Verify & Enter Portal'; btn.disabled = false; }
      if (data.success) {
        const consultants = iLd(IK.cn, []);
        S.hcpConsultant   = consultants.find(c => c.hcpEmail === loginId) || null;
        showHCPDashboard();
      }
    })
    .catch(err => {
      if (btn) { btn.textContent = 'Verify & Enter Portal'; btn.disabled = false; }
      alert(err.message || 'Invalid OTP. Please check and try again.');
      const inputs = document.querySelectorAll('.hcp-otp-digit');
      inputs.forEach(d => { d.value = ''; });
      inputs[0]?.focus();
    });
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────

function showHCPDashboard() {
  showScreen('hcp-portal-screen');
  loadPatients();
  if (S.patients.length === 0) addDemoPatients();

  const container = document.getElementById('hcp-content');
  if (!container) return;

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:300px 1fr;height:calc(100vh - 64px)">
      <div id="patient-list" style="overflow-y:auto;border-right:1px solid rgba(255,255,255,0.06)"></div>
      <div id="patient-detail" style="overflow-y:auto">
        <div style="text-align:center;padding:80px 40px">
          <div style="font-size:64px;margin-bottom:20px;opacity:0.2">🩺</div>
          <div style="font-size:18px;font-weight:700;color:rgba(255,255,255,0.4);margin-bottom:10px;font-family:Cormorant Garamond,serif">Select a Patient</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.2)">Choose from the list to view the full assessment report</div>
        </div>
      </div>
    </div>`;

  renderPatientList();
}

function addDemoPatients() {
  const existingIds = new Set(S.patients.map(p => p.id));
  DEMO_PATIENTS.forEach(demo => {
    if (!existingIds.has(demo.id)) S.patients.push(demo);
  });
  savePatients();
}

// ── PATIENT LIST ──────────────────────────────────────────────────────────────

function renderPatientList() {
  const total  = S.patients.length;
  const severe = S.patients.filter(p => (p.scores?.composite || 0) >= 56).length;
  const alerts = S.patients.filter(p => p.psychiatricAlert || p.redFlags?.length).length;

  let html = buildPatientListHeader(total, severe, alerts);
  html    += buildPatientListItems();

  if (!total) {
    html += `<div style="padding:40px 16px;text-align:center;color:rgba(255,255,255,0.22)"><div style="font-size:28px;margin-bottom:8px">📋</div><div style="font-size:12px">No patients yet.<br>Complete an assessment to see records here.</div></div>`;
  }

  const el = document.getElementById('patient-list');
  if (el) el.innerHTML = html;
}

function buildPatientListHeader(total, severe, alerts) {
  return `
    <div style="background:linear-gradient(135deg,#0D1B2A,#1B2B3A);padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.07)">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center;margin-bottom:10px">
        <div><div style="font-size:24px;font-weight:900;color:#fff">${total}</div><div style="font-size:9px;color:rgba(255,255,255,0.35);font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Total</div></div>
        <div><div style="font-size:24px;font-weight:900;color:#FFCC80">${severe}</div><div style="font-size:9px;color:rgba(255,255,255,0.35);font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Moderate+</div></div>
        <div><div style="font-size:24px;font-weight:900;color:#EF9A9A">${alerts}</div><div style="font-size:9px;color:rgba(255,255,255,0.35);font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Alerts</div></div>
      </div>
      <input class="pl-search" type="text" placeholder="Search patients..." oninput="filterPatients(this.value)">
    </div>`;
}

function buildPatientListItems() {
  const filter  = S._severityFilter;
  const visible = filter
    ? S.patients.filter(p => {
        const comp = (p.scores?.composite || p.composite || 0);
        if (filter === 'critical') return comp >= 81;
        if (filter === 'severe')   return comp >= 56;
        if (filter === 'alerts')   return p.psychiatricAlert || p.redFlags?.length > 0;
        return true;
      })
    : S.patients;
  return visible.map(p => buildPatientRow(p)).join('');
}

function buildPatientRow(patient) {
  const comp     = patient.scores?.composite || patient.composite || 0;
  const band     = compositeBand(comp);
  const isActive = S.selectedPatient?.id === patient.id;
  const initials = (patient.name || '?').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
  const hasAlert = patient.psychiatricAlert || patient.redFlags?.length > 0;
  const flagCls  = patient.psychiatricAlert ? 'red' : hasAlert ? 'orange' : 'green';

  const alertBadges = [
    patient.psychiatricAlert ? '<span style="font-size:9px;background:rgba(183,28,28,0.25);color:#EF9A9A;padding:1px 5px;border-radius:8px;font-weight:700">🚨 Crisis</span>' : '',
    patient.redFlags?.length ? '<span style="font-size:9px;background:rgba(255,152,0,0.2);color:#FFCC80;padding:1px 5px;border-radius:8px;font-weight:700">⚠ Red Flag</span>' : '',
    `<span style="font-size:9px;background:rgba(255,255,255,0.06);color:${band.colour};padding:1px 5px;border-radius:8px;font-weight:700">${band.label}</span>`,
  ].join('');

  return `
    <div class="patient-item${isActive ? ' active' : ''}" onclick="selectPatient('${patient.id}')">
      <span class="pi-flag ${flagCls}"></span>
      <div class="pi-avatar">${initials}</div>
      <div class="pi-info">
        <div class="pi-name"><span>${patient.name}</span><span class="pi-score ${band.cssClass}">${comp}</span></div>
        <div class="pi-meta">${patient.age}y &middot; ${patient.city}</div>
        <div class="pi-meta">${patient.stage}</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px">${alertBadges}</div>
      </div>
    </div>`;
}

function filterPatients(query) {
  document.querySelectorAll('.patient-item').forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(query.toLowerCase()) ? '' : 'none';
  });
}

function selectPatient(id) {
  S.selectedPatient = S.patients.find(p => p.id === id);
  if (!S.selectedPatient) return;
  renderPatientList();
  renderPatientDetail(S.selectedPatient);
}

// ── PATIENT DETAIL ────────────────────────────────────────────────────────────

function renderPatientDetail(patient, openTab) {
  const scores    = patient.scores || {};
  const composite = scores.composite || 0;
  const band      = compositeBand(composite);

  let html = '';
  html += buildDetailHeader(patient, composite, band);
  html += buildAlertBanners(patient);
  html += buildTabBar();
  html += '<div class="pd-body">';
  html += buildTab0_Overview(patient, scores, composite, band);
  html += buildTab1_ClinicalSummary(patient, scores);
  html += buildTab2_ScoresTable(scores);
  html += buildTab3_Triage(patient);
  html += buildTab4_CarePlan(patient);
  html += buildTab5_RawData(patient);
  html += '</div>';

  const el = document.getElementById('patient-detail') || document.getElementById('hcp-content');
  if (el) el.innerHTML = `<div class="pd-panel">${html}</div>`;

  if (typeof openTab !== 'undefined' && openTab >= 0) {
    setTimeout(() => {
      const tabs = document.querySelectorAll('.pd-tab');
      if (tabs[openTab]) switchPDTab(tabs[openTab], openTab);
    }, 50);
  }
}

function buildDetailHeader(patient, composite, band) {
  const assessDate = new Date(patient.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  return `
    <div class="pd-header">
      <div>
        <h2>${patient.name}${patient.psychiatricAlert ? ' <span style="color:#EF5350;font-size:13px">🚨</span>' : ''}</h2>
        <div class="pd-meta">${patient.age} yrs &nbsp;&middot;&nbsp; ${patient.city} &nbsp;&middot;&nbsp; ${patient.stage}<br>Prakriti: ${patient.prakriti}${patient.vikriti ? ` &middot; Vikriti: ${patient.vikriti.replace(/_/g, ' ')}` : ''}</div>
      </div>
      <div class="pd-header-right">
        <span class="tag ${band.tagClass}">${composite}/100 &mdash; ${band.label}</span>
        <div style="font-size:11px;color:rgba(255,255,255,0.25)">${assessDate}</div>
      </div>
    </div>`;
}

function buildAlertBanners(patient) {
  let html = '';
  if (patient.psychiatricAlert) {
    html += `<div class="hcp-alert-banner"><div class="hab-icon">🚨</div><div class="hab-body"><strong>PSYCHIATRIC ALERT</strong> &mdash; PHQ-9 Item 9 positive. Immediate clinical follow-up required. iCall: 9152987821 &middot; Vandrevala: 1860-2662-345</div></div>`;
  }
  if (patient.redFlags?.length) {
    html += `<div class="hcp-alert-banner" style="border-color:rgba(255,152,0,0.4);background:rgba(255,152,0,0.09)"><div class="hab-icon">⚠️</div><div class="hab-body" style="color:#FFCC80"><strong>Red Flags: </strong>${patient.redFlags.join(' &middot; ')}</div></div>`;
  }
  return html;
}

function buildTabBar() {
  return `<div class="pd-tabs">${['Overview','Clinical Summary','Scores','Triage','Care Plan','Data'].map((label, i) => `<div class="pd-tab${i === 0 ? ' active' : ''}" onclick="switchPDTab(this,${i})">${label}</div>`).join('')}</div>`;
}

function buildTab0_Overview(patient, scores, composite, band) {
  let html = '<div class="pd-tab-content" id="tab0">';
  html += `<div class="section-hcp" style="text-align:center;padding:18px"><div style="font-size:54px;font-weight:900;color:${band.colour};line-height:1">${composite}<span style="font-size:18px;color:rgba(255,255,255,0.22)">/100</span></div><div style="font-size:13px;font-weight:700;color:#fff;margin:6px 0 2px">Modified MenQOL Composite Score</div><div style="font-size:11px;color:rgba(255,255,255,0.35)">${band.label} Symptom Burden</div><div class="mc-bar" style="max-width:220px;margin:10px auto 0"><div class="mc-bar-fill" style="width:${composite}%;background:${band.colour}"></div></div></div>`;

  // Domain cards
  const domains = [{ key: 'MENQOL_vasomotor', label: 'Vasomotor', emoji: '🌡', max: 20 }, { key: 'MENQOL_physical', label: 'Physical', emoji: '💪', max: 20 }, { key: 'MENQOL_psychosocial', label: 'Emotional', emoji: '🧠', max: 20 }, { key: 'MENQOL_sexual', label: 'Intimate', emoji: '💙', max: 20 }];
  const isiVal = scores.ISI || 0;
  const isiCol = scoreColour(isiVal, 8, 15);
  let cards = '<div class="metrics-grid">';
  domains.forEach(({ key, label, emoji, max }) => {
    const val = scores[key] || 0; const col = scoreColour(val, 7, 14); const pct = Math.round((val / max) * 100);
    cards += `<div class="metric-card"><div class="mc-label">${emoji} ${label}</div><div class="mc-value" style="color:${col}">${val}</div><div class="mc-sub">/${max}</div><div class="mc-bar"><div class="mc-bar-fill" style="width:${pct}%;background:${col}"></div></div></div>`;
  });
  cards += `<div class="metric-card"><div class="mc-label">😴 Sleep (ISI)</div><div class="mc-value" style="color:${isiCol}">${isiVal}</div><div class="mc-sub">/28 &middot; ${scores.ISI_band || '—'}</div><div class="mc-bar"><div class="mc-bar-fill" style="width:${Math.round((isiVal/28)*100)}%;background:${isiCol}"></div></div></div>`;
  if (scores.PHQ9 != null) { const phqVal = scores.PHQ9 || 0; const phqCol = scoreColour(phqVal, 5, 10); cards += `<div class="metric-card"><div class="mc-label">🧠 PHQ-9</div><div class="mc-value" style="color:${phqCol}">${phqVal}</div><div class="mc-sub">/27 &middot; ${scores.PHQ9_band || ''}</div><div class="mc-bar"><div class="mc-bar-fill" style="width:${Math.round((phqVal/27)*100)}%;background:${phqCol}"></div></div></div>`; }
  if (scores.FSFI != null) { const fsfiCol = scores.FSFI <= 10 ? '#EF5350' : scores.FSFI <= 26.55 ? '#FF9800' : '#4CAF50'; cards += `<div class="metric-card"><div class="mc-label">💙 FSFI</div><div class="mc-value" style="color:${fsfiCol}">${scores.FSFI}</div><div class="mc-sub">/36</div><div class="mc-bar"><div class="mc-bar-fill" style="width:${Math.round((scores.FSFI/36)*100)}%;background:${fsfiCol}"></div></div></div>`; }
  cards += '</div>';
  html += cards;

  // Patient profile
  const pa = patient.answers || {};
  const bmi = (pa.height_cm && pa.weight_kg) ? (pa.weight_kg / Math.pow(pa.height_cm / 100, 2)).toFixed(1) : null;
  html += `<div class="section-hcp"><h4>Patient Profile</h4>`;
  const profileRows = [['Name', patient.name], ['Age', patient.age ? `${patient.age} yrs` : null], ['City', patient.city], ['Stage', patient.stage], ['Prakriti', patient.prakriti], ['Vikriti', patient.vikriti], ['Assessed', new Date(patient.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })]];
  profileRows.filter(([, v]) => v != null && v !== '' && v !== '—' && v !== 'Prefer not to say').forEach(([label, val]) => { html += buildScoreRow(label, val); });
  if (bmi) { const bmiN = parseFloat(bmi); html += buildScoreRow('BMI', `${bmi} kg/m²`, bmiN < 18.5 || bmiN > 27.5, bmiN > 30 ? 'Obese' : bmiN > 27.5 ? 'Overweight' : bmiN < 18.5 ? 'Underweight' : ''); }
  html += '</div>';

  // Comorbidities
  if (patient.comorbidities && Object.keys(patient.comorbidities).length) {
    html += '<div class="section-hcp"><h4>Comorbidities</h4>';
    Object.entries(patient.comorbidities).forEach(([k, v]) => { const col = v === 'Uncontrolled' ? '#EF9A9A' : v === 'Not Sure' ? '#90CAF9' : '#A5D6A7'; html += `<div class="score-row"><span class="score-label">${k}</span><span class="score-val" style="color:${col}">${v}</span></div>`; });
    html += '</div>';
  }

  // Wearable
  html += buildWearableSection(patient);
  html += '</div>';
  return html;
}

function buildWearableSection(patient) {
  const wd = patient.wearable_data || {};
  const scores = patient.scores || {};
  if (!patient.wearable || patient.wearable === 'None / No wearable' || !Object.keys(wd).length) return '';

  const metricRows = []; const alertSummary = [];
  Object.entries(WEARABLE_NORMS).forEach(([key, norm]) => {
    const val = wd[key]; if (val == null || val === '') return;
    const result = norm.correlation(val, scores, wd);
    const colour = result.flag ? '#EF9A9A' : 'rgba(255,255,255,0.75)';
    const flagSpan = result.flag ? `<span style="font-size:10px;color:#FF9800;margin-left:4px">⚠ ${result.note}</span>` : '';
    metricRows.push(`<div class="score-row"><span class="score-label">${norm.label}</span><span class="score-val" style="color:${colour}">${val} <span style="font-size:10px;color:rgba(255,255,255,0.3)">${norm.unit}</span>${flagSpan}</span></div>`);
    if (result.flag) alertSummary.push(`${norm.label}: ${val}${norm.unit} — ${result.note}`);
  });

  let alertBox = '';
  if (alertSummary.length) {
    alertBox = `<div style="background:rgba(239,83,80,0.12);border:1px solid rgba(239,83,80,0.3);border-radius:8px;padding:10px;margin-top:8px"><div style="font-size:11px;font-weight:800;color:#EF5350;margin-bottom:5px">⚠️ WEARABLE ALERTS (${alertSummary.length})</div>${alertSummary.map(a => `<div style="font-size:11px;color:#FFCDD2;padding:2px 0">• ${a}</div>`).join('')}</div>`;
  }
  return `<div class="section-hcp"><h4>⌚ Wearable — ${patient.wearable}</h4>${metricRows.join('')}${alertBox}</div>`;
}

function buildTab1_ClinicalSummary(patient, scores) {
  let html = '<div class="pd-tab-content" id="tab1" style="display:none"><div style="padding:14px">';
  if (patient.redFlags?.length) {
    html += `<div style="background:rgba(211,47,47,0.12);border:1px solid rgba(211,47,47,0.35);border-radius:10px;padding:12px;margin-bottom:10px"><div style="font-size:11px;font-weight:800;color:#EF5350;margin-bottom:5px">🚨 RED FLAGS</div>${patient.redFlags.map(rf => `<div style="font-size:12px;color:#FFCDD2;padding:2px 0">⚠ ${rf}</div>`).join('')}</div>`;
  }
  const savedNote = iLd(`hcp_note_${patient.id || ''}`, '');
  if (savedNote) {
    html += `<div style="background:rgba(0,188,212,0.08);border:1px solid rgba(0,188,212,0.2);border-radius:10px;padding:12px"><div style="font-size:11px;font-weight:800;color:#00BCD4;margin-bottom:5px">📝 LAST CLINICAL NOTE</div><div style="font-size:12px;color:rgba(255,255,255,0.6);white-space:pre-wrap;line-height:1.5">${savedNote}</div></div>`;
  }
  html += '</div></div>';
  return html;
}

function buildTab2_ScoresTable(scores) {
  const rows = [
    { label: 'MenQOL Vasomotor',    value: scores.MENQOL_vasomotor    || 0, max: 20, band: scores.MENQOL_vasomotor    >= 14 ? 'High' : scores.MENQOL_vasomotor    >= 7 ? 'Moderate' : 'Low' },
    { label: 'MenQOL Physical',     value: scores.MENQOL_physical     || 0, max: 20, band: scores.MENQOL_physical     >= 14 ? 'High' : scores.MENQOL_physical     >= 7 ? 'Moderate' : 'Low' },
    { label: 'MenQOL Psychosocial', value: scores.MENQOL_psychosocial || 0, max: 20, band: scores.MENQOL_psychosocial >= 14 ? 'High' : scores.MENQOL_psychosocial >= 7 ? 'Moderate' : 'Low' },
    { label: 'MenQOL Sexual',       value: scores.MENQOL_sexual       || 0, max: 20, band: scores.MENQOL_sexual       >= 14 ? 'High' : scores.MENQOL_sexual       >= 7 ? 'Moderate' : 'Low' },
    { label: 'ISI Sleep',           value: scores.ISI                 || 0, max: 28, band: scores.ISI_band || '' },
  ];
  if (scores.PHQ9 != null) rows.push({ label: 'PHQ-9 Depression', value: scores.PHQ9 || 0, max: 27, band: scores.PHQ9_band || '' }, { label: 'GAD-7 Anxiety', value: scores.GAD7 || 0, max: 21, band: scores.GAD7_band || '' }, { label: 'PSS-8 Stress', value: scores.PSS8 || 0, max: 32, band: scores.PSS8_band || '' });
  if (scores.FSFI != null) rows.push({ label: 'FSFI Sexual Function', value: scores.FSFI || 0, max: 36, band: scores.FSFI_band || '' }, { label: 'FSDSR Sexual Distress', value: scores.FSDSR || 0, max: 52, band: scores.FSDSR_band || '' });
  rows.push({ label: 'Comorbidity Modifier', value: `+${scores.comorbidityMod || 0}`, max: null, band: 'Additive' });

  const rowsHtml = rows.map(r => {
    const numVal = parseFloat(r.value) || 0;
    const colour = r.max ? (numVal / r.max > 0.7 ? '#EF9A9A' : numVal / r.max > 0.4 ? '#FFCC80' : '#A5D6A7') : 'rgba(255,255,255,0.38)';
    const pct    = r.max ? Math.round(Math.min(numVal / r.max, 1) * 100) : 0;
    const bar    = r.max ? `<div style="width:80px;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${colour};border-radius:2px"></div></div>` : '—';
    return `<tr><td>${r.label}</td><td><span style="color:${colour};font-weight:800;font-size:15px">${r.value}</span>${r.max ? `<span style="color:rgba(255,255,255,0.2);font-size:11px"> /${r.max}</span>` : ''}</td><td>${bar}</td><td style="color:${colour};font-size:11px;font-weight:700">${r.band}</td></tr>`;
  }).join('');

  return `<div class="pd-tab-content" id="tab2" style="display:none"><table class="instrument-table"><thead><tr><th>Instrument</th><th>Score</th><th>Bar</th><th>Band</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>`;
}

function buildTab3_Triage(patient) {
  const triage    = patient.triage || [];
  const itemsHtml = triage.length
    ? triage.map(t => {
        const sevClass = t.sev === 'severe' ? 'sev' : t.sev === 'moderate' ? 'mod' : 'norm';
        const sevLabel = t.sev === 'severe' ? 'Urgent' : t.sev === 'moderate' ? 'Recommended' : 'Advisory';
        return `<div class="triage-item ${sevClass}"><div class="ti-icon">${TRIAGE_ICONS[t.action] || '✦'}</div><div class="ti-body"><div class="ti-action">${t.action.replace(/_/g, ' ')}</div><div class="ti-rules">${t.rules.slice(0, 4).join(', ')}</div></div><div class="ti-sev">${sevLabel}</div></div>`;
      }).join('')
    : '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.22);font-size:13px">No triage actions — wellness baseline</div>';

  return `<div class="pd-tab-content" id="tab3" style="display:none"><div style="font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">${triage.length} Actions Triggered</div><div class="triage-list">${itemsHtml}</div></div>`;
}

function buildTab4_CarePlan(patient) {
  const triage    = patient.triage || [];
  const cardsHtml = triage.length
    ? triage.map(t => {
        const colours = t.sev === 'severe' ? { bg: 'rgba(183,28,28,0.14)', border: 'rgba(183,28,28,0.35)', text: '#EF9A9A' } : t.sev === 'moderate' ? { bg: 'rgba(255,152,0,0.10)', border: 'rgba(255,152,0,0.30)', text: '#FFCC80' } : { bg: 'rgba(76,175,80,0.08)', border: 'rgba(76,175,80,0.20)', text: '#A5D6A7' };
        return `<div style="background:${colours.bg};border:1px solid ${colours.border};border-radius:12px;padding:14px 16px"><div style="font-size:13px;font-weight:800;color:#fff;text-transform:capitalize;margin-bottom:3px">${t.action.replace(/_/g, ' ')}</div><div style="font-size:12px;color:rgba(255,255,255,0.45);margin-bottom:8px">${TRIAGE_DESCRIPTIONS[t.action] || ''}</div><span style="background:${colours.border};color:${colours.text};padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700">${t.sev}</span></div>`;
      }).join('')
    : '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.22);font-size:13px">No care actions — wellness maintenance recommended</div>';

  const savedNote    = iLd(`hcp_note_${patient.id || ''}`, '');
  const appointments = iLd(IK.ap, []).filter(a => a.patientId === patient.id || a.patientName === patient.name);
  const latestAppt   = appointments[0];
  let apptBadge = ''; let completeBtn = '';
  if (latestAppt) {
    const isComplete = latestAppt.status === 'completed';
    const badgeBg    = isComplete ? 'rgba(22,101,52,0.12)' : 'rgba(30,64,175,0.12)';
    const badgeColor = isComplete ? '#166534' : '#1E40AF';
    apptBadge = `<span style="padding:7px 12px;background:${badgeBg};border:1px solid ${badgeColor};color:${badgeColor};border-radius:8px;font-size:11px;font-weight:700">💳 Rs ${latestAppt.fee || 0} &middot; ${latestAppt.status}</span>`;
    if (latestAppt.status === 'confirmed') completeBtn = `<button onclick="hcpCompleteConsult(&quot;${latestAppt.id}&quot;)" style="padding:7px 14px;background:rgba(22,101,52,0.15);border:1px solid rgba(22,101,52,0.4);color:#16A34A;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">✅ Mark Consultation Complete</button>`;
  }

  return `
    <div class="pd-tab-content" id="tab4" style="display:none">
      <div style="display:flex;flex-direction:column;gap:8px">${cardsHtml}</div>
      <div style="margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <a href="tel:+918069050000" style="background:var(--rose-deep);color:#fff;text-align:center;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;font-size:13px">📞 +91 80690 50000</a>
        <a href="mailto:clinic@evaerahealth.in" style="background:rgba(0,188,212,0.13);color:#00BCD4;text-align:center;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;border:1px solid rgba(0,188,212,0.3);font-size:13px">✉ Email Clinic</a>
      </div>
      <div style="margin-top:14px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.35);margin-bottom:6px">Post-Consultation Clinical Notes</div>
        <textarea id="hcp-note-area" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:10px 12px;color:rgba(255,255,255,0.8);font-size:12px;resize:vertical;min-height:90px;outline:none;font-family:inherit;line-height:1.5" placeholder="Enter clinical observations, follow-up plan, prescriptions...">${savedNote}</textarea>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
          <button onclick="saveHCPNote()" style="padding:7px 16px;background:rgba(0,188,212,0.15);border:1px solid rgba(0,188,212,0.3);color:#00BCD4;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">💾 Save Note</button>
          ${apptBadge}${completeBtn}
        </div>
      </div>
    </div>`;
}

function buildTab5_RawData(patient) {
  const rawData = { name: patient.name, age: patient.age, stage: patient.stage, prakriti: patient.prakriti, scores: patient.scores, triage: patient.triage, redFlags: patient.redFlags, comorbidities: patient.comorbidities };
  return `
    <div class="pd-tab-content" id="tab5" style="display:none">
      <div class="download-bar">
        <button class="btn-download" onclick="downloadHCPReport()">⬇ Download Report</button>
        <button class="btn-download" onclick="downloadHCPJSON()">{ } Export JSON</button>
        <button onclick="hcpBookOnBehalf()" style="background:linear-gradient(135deg,#C0305A,#9C1B43);color:#fff;border:none;border-radius:10px;padding:9px 16px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px">📅 Book Appointment for Patient</button>
      </div>
      <pre style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px;font-size:11px;color:rgba(255,255,255,0.5);overflow:auto;max-height:400px;line-height:1.5">${JSON.stringify(rawData, null, 2)}</pre>
    </div>`;
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────

function saveHCPNote() {
  const patient = S.selectedPatient; if (!patient) return;
  const textarea = document.getElementById('hcp-note-area'); if (!textarea) return;
  iSv(`hcp_note_${patient.id || ''}`, textarea.value);
  iSv(`evh_pat_note_${patient.id || ''}`, JSON.stringify({ note: textarea.value, consultant: S.hcpConsultant?.name || 'Your Consultant', savedAt: new Date().toLocaleString('en-IN') }));
  iLogA('ok', `Clinical note saved for ${patient.name}`, '', 'HCP');
  intToast('success', 'Note Saved — returning to patient record', `Saved for ${patient.name}`, 'HCP');
  setTimeout(() => renderPatientDetail(patient, 3), 700);
}

function hcpCompleteConsult(appointmentId) {
  if (!confirm('Mark this consultation as complete? This will update the Admin portal.')) return;
  const appointments = iLd(IK.ap, []); const appt = appointments.find(a => a.id === appointmentId); if (!appt) return;
  appt.status = 'completed'; appt.completedAt = new Date().toLocaleString('en-IN');
  iSv(IK.ap, appointments);
  iLogA('ok', 'Consultation completed', appt.patientName, 'HCP');
  iBcast('appt_complete', appt);
  intToast('success', 'Consultation Complete', 'Admin portal updated', 'HCP');
  if (S.selectedPatient) setTimeout(() => renderPatientDetail(S.selectedPatient, 3), 400);
}

function hcpBookOnBehalf() {
  const patient = S.selectedPatient; if (!patient) { alert('No patient selected'); return; }
  const patients = iLd(IK.pt, []);
  if (!patients.find(p => p.id === patient.id)) { patients.unshift(patient); iSv(IK.pt, patients); }
  intShowBooking();
  intToast('info', `Booking on behalf of ${patient.name}`, 'Select consultant, slot and payment', 'HCP');
}

function switchPDTab(el, index) {
  document.querySelectorAll('.pd-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.pd-tab-content').forEach(t => { t.style.display = 'none'; });
  document.getElementById(`tab${index}`).style.display = 'block';
}

// ── DOWNLOADS ─────────────────────────────────────────────────────────────────

function downloadHCPReport() {
  const patient = S.selectedPatient; if (!patient) return;
  const sc = patient.scores || {};
  const lines = ['EvaEraHealth Clinical Report', `Generated: ${new Date().toLocaleString()}`, '', `Patient: ${patient.name} | Age: ${patient.age} | ${patient.stage} | Prakriti: ${patient.prakriti || '-'}`, '', `COMPOSITE: ${sc.composite || 0}/100 [${sc.composite_band || '-'}]`, `MenQOL: VM=${sc.MENQOL_vasomotor || 0} Ph=${sc.MENQOL_physical || 0} PS=${sc.MENQOL_psychosocial || 0} Sx=${sc.MENQOL_sexual || 0}`, `PHQ9=${sc.PHQ9 || 0}(${sc.PHQ9_band}) GAD7=${sc.GAD7 || 0}(${sc.GAD7_band}) PSS8=${sc.PSS8 || 0}(${sc.PSS8_band})`, `ISI=${sc.ISI || 0}(${sc.ISI_band})`, '', 'TRIAGE:', ...(patient.triage || []).map(t => `  • ${t.action} [${t.sev}]`), '', `Red Flags: ${patient.redFlags?.length ? patient.redFlags.join(', ') : 'None'}`, '', 'EvaEraHealth Clinic, Gurugram | +91 80690 50000 | clinic@evaerahealth.in'].join('\n');
  const blob = new Blob([lines], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `EvaEraHealth_${patient.name.replace(/\s/g, '_')}.txt`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
}

function downloadHCPJSON() {
  const patient = S.selectedPatient; if (!patient) return;
  const raw = { name: patient.name, age: patient.age, stage: patient.stage, prakriti: patient.prakriti, scores: patient.scores, triage: patient.triage, redFlags: patient.redFlags, comorbidities: patient.comorbidities };
  const blob = new Blob([JSON.stringify(raw, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `EvaEraHealth_${patient.name.replace(/\s/g, '_')}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
}

// ── SHARED HELPERS ────────────────────────────────────────────────────────────

function buildScoreRow(label, value, isAbnormal = false, note = '') {
  if (value == null || value === '' || value === '—' || value === 'Prefer not to say') return '';
  const colour   = isAbnormal ? '#EF9A9A' : 'rgba(255,255,255,0.85)';
  const noteSpan = note ? `<span style="font-size:10px;color:#FF9800;margin-left:4px">${note}</span>` : '';
  return `<div class="score-row"><span class="score-label">${label}</span><span class="score-val" style="color:${colour}">${value}${noteSpan}</span></div>`;
}