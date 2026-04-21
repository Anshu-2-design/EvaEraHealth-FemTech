/* Results Rendering & Care Plan */

function startProcessing(){
  showScreen('loading-screen');
  setTimeout(function(){
    S.scores=computeScores();
    S.scores.menqolPsychTriggered=S.flags.menqolPsychTriggered?1:0;
    S.scores.menqolSexualTriggered=S.flags.menqolSexualTriggered?1:0;
    S.scores.sleepModerate=S.flags.sleepModerate?1:0;
    S.scores.gyneRedFlag=S.flags.gyneRedFlag?1:0;
    S.triage=runRuleEngine(S.scores);
    // Merge wearable-triggered actions into triage
    if(S.scores.wearableCorroboration && S.scores.wearableCorroboration.length) {
      var sevOrder2={severe:3,moderate:2,mild:1};
      var wearableActions = calcWearableMod(S.answers).actions;
      wearableActions.forEach(function(wa) {
        var existing = S.triage.find(function(t){return t.action===wa.action;});
        if(existing) {
          if(sevOrder2[wa.sev]>sevOrder2[existing.sev]) existing.sev=wa.sev;
          existing.rules = existing.rules.concat(wa.rules);
        } else {
          S.triage.push(wa);
        }
      });
      S.triage.sort(function(a,b){return sevOrder2[b.sev]-sevOrder2[a.sev];});
    }
    S.psychiatricAlert=S.triage.some(function(t){return t.action==='psychiatric_alert';});
    saveResult();
    if (typeof saveToSupabase === 'function') saveToSupabase();
    setTimeout(function(){showResults();},1500);
  },3000);
}
function showResults(){
  showScreen('results-screen');
  var a=S.answers,sc=S.scores;
  var name=a.name||'there';
  var composite=(sc&&sc.composite!==undefined)?sc.composite:0;
  var band=sc&&sc.composite_band?sc.composite_band:(composite<=5?'Optimal':composite<=30?'Mild':composite<=55?'Moderate':composite<=80?'Severe':'Critical');
  var html='';
  if(S.psychiatricAlert){
    html+='<div class="psychiatric-alert-banner"><div class="pab-icon">🆘</div><div class="pab-body"><h3>Immediate Support Available</h3><p>Our assessment has flagged areas needing urgent attention. Please reach out now.</p><div class="pab-num"><a href="tel:9152987821" style="color:var(--purple)">iCall: 9152987821</a></div><p style="font-size:11px">Vandrevala 24/7: 1860-2662-345 · NIMHANS: 080-46110007</p></div></div>';
  }
  if(S.scores&&S.scores.criticalFlags&&S.scores.criticalFlags.length){var cfArr=S.scores.criticalFlags;var p1f=cfArr.filter(function(f){return f.priority===1;});var p2f=cfArr.filter(function(f){return f.priority===2;});if(p1f.length>0){html+='<div style="background:#FFF0F0;border:2px solid #B71C1C;border-radius:var(--r);padding:14px 18px;margin-bottom:16px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:20px">&#x1F6A8;</span><div style="font-size:14px;font-weight:800;color:#B71C1C">'+p1f.length+' Immediate Action Required</div></div>';p1f.forEach(function(f){html+='<div style="font-size:12px;color:#B71C1C;padding:2px 0">&#x26A0; '+f.label+'</div>';});html+='<div style="font-size:11px;color:#E57373;margin-top:8px">Contact EvaEraHealth: <a href="tel:+918069050000" style="color:#B71C1C;font-weight:700">+91 80690 50000</a></div></div>';}if(p2f.length>0){html+='<div style="background:#FFF8E1;border:1.5px solid #FF8F00;border-radius:var(--r);padding:11px 16px;margin-bottom:14px"><div style="font-size:12px;font-weight:700;color:#FF6F00;margin-bottom:5px">&#x26A0; '+p2f.length+' Clinical Risk Factor'+(p2f.length>1?'s':'')+' Identified</div>';p2f.forEach(function(f){html+='<div style="font-size:11px;color:#E65100;padding:1px 0">&#x2022; '+f.label+'</div>';});html+='</div>';}}
  if(S.redFlagsTriggered&&S.redFlagsTriggered.length){
    html+='<div class="redflag-banner"><div class="rf-icon">⚠️</div><div class="rf-text"><strong>Clinical Red Flags Identified:</strong> '+S.redFlagsTriggered.join(', ')+'. <strong>Please consult a gynaecologist immediately.</strong><div style="margin-top:10px"><a href="tel:+918069050000" style="display:inline-block;background:var(--danger);color:#fff;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;margin-right:8px">📞 +91 80690 50000</a><a href="mailto:clinic@evaerahealth.in?subject=Urgent+Gynaecology" style="display:inline-block;background:var(--rose-deep);color:#fff;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none">✉️ clinic@evaerahealth.in</a></div></div></div>';
  }
  html+='<div class="results-header"><div class="rh-greeting">Your Health Profile & Progress</div><h2>Hello, '+name+' 🌸</h2><div class="rh-sub">Your personalised adaptive wellness assessment — EvaEraHealth Clinic, Gurugram</div></div>';
  var bandColor=composite<=5?'#00695C':composite<=30?'var(--ok)':composite<=55?'var(--warn)':composite<=80?'var(--danger)':'#B71C1C';
  var bandIcon=band==='Optimal'?'🌟':band==='Mild'?'🌿':band==='Moderate'?'🌀':band==='Severe'?'⚠️':'🆘';
  var bandMsg=band==='Optimal'?'Excellent — your health profile shows minimal menopausal burden. Keep up your wellness practices.':
    band==='Mild'?'You have some manageable symptoms. Lifestyle and Ayurvedic support can help.':
    band==='Moderate'?'Your assessment shows a moderate wellness burden. Personalised clinical support is recommended.':
    band==='Severe'?'Your assessment shows significant burden. A specialist programme and multidisciplinary care are advised.':
    'Your assessment indicates urgent clinical attention. Please contact our team today.';
  var pathItems=[];
  if(S.flags.menqolPsychTriggered&&S.flags.mentalHealthCompleted) pathItems.push('🧠 Mental Health');
  if(S.flags.menqolSexualTriggered&&S.flags.psychosexualCompleted) pathItems.push('💙 Sexual Wellbeing');
  if(S.flags.sleepModerate) pathItems.push('🌙 Sleep');
  if(S.flags.gyneRedFlag) pathItems.push('🏥 Gynaecology');
  html+='<div class="composite-band" style="align-items:flex-start;gap:14px">'
    +'<div style="font-size:48px;line-height:1;flex-shrink:0">'+bandIcon+'</div>'
    +'<div class="cb-info"><div class="cb-band" style="color:'+bandColor+';font-size:22px">'+band+'</div>'
    +'<div class="cb-label" style="font-size:13px;color:var(--slate);margin-top:5px;line-height:1.5">'+bandMsg+'</div>'
    +(pathItems.length?'<div style="font-size:11px;color:var(--teal);margin-top:6px">Modules assessed: '+pathItems.join(' \u00b7 ')+'</div>':'')
    +'</div></div>';
  if(S.scores&&S.scores.criticalFlagCount>0){var cfC=S.scores.criticalFlagCount,cfP1=S.scores.hasPriority1Flag;html+='<div style="background:'+(cfP1?'#FFF0F0':'#FFF8E1')+';border:1.5px solid '+(cfP1?'#EF5350':'#FF8F00')+';border-radius:10px;padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px"><span style="font-size:20px">'+(cfP1?'&#x1F6A8;':'&#x26A0;&#xFE0F;')+'</span><div><div style="font-size:13px;font-weight:800;color:'+(cfP1?'#B71C1C':'#E65100')+'">' +cfC+' Critical Flag'+(cfC>1?'s':'')+' Identified</div><div style="font-size:11px;color:'+(cfP1?'#E57373':'#FF8F00')+'">'+S.scores.criticalFlags.slice(0,2).map(function(f){return f.label;}).join(' · ')+(cfC>2?' +more':'')+'</div></div></div>';}
  html+='<div class="ai-message-box"><div class="amb-label">✨ Your Personalised Message</div><div class="amb-text" id="ai-message-text"><span class="ai-spinner"></span> Generating your personalised message…</div></div>';
  html+='<div class="rings-grid">';
  var rings=[
    {label:'Vasomotor',score:Math.max(0,100-(sc.MENQOL_vasomotor||0)*5),color:'#E91E8C'},
    {label:'Physical',score:Math.max(0,100-(sc.MENQOL_physical||0)*3-(sc.ISI||0)*2),color:'#9C27B0'},
    {label:'Emotional',score:Math.max(0,100-(sc.MENQOL_psychosocial||0)*3-(sc.PHQ9||0)*1.5),color:'#3F51B5'},
    {label:'Intimacy',score:Math.max(0,100-(sc.MENQOL_sexual||0)*5-(sc.FSDSR||0)*1),color:'#E64A19'},
  ];
  rings.forEach(function(r){
    var pct=Math.min(100,Math.max(0,r.score));
    var circ=2*Math.PI*36;
    var dash=circ*(pct/100);
    html+='<div class="ring-card"><div class="rc-label">'+r.label+'</div>';
    html+='<svg class="ring-svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" fill="none" stroke="#F0EBE8" stroke-width="8"/>';
    html+='<circle cx="40" cy="40" r="36" fill="none" stroke="'+r.color+'" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+dash.toFixed(1)+' '+circ.toFixed(1)+'" transform="rotate(-90 40 40)"/>';
    html+='<text x="40" y="45" text-anchor="middle" font-size="14" font-weight="700" fill="'+r.color+'">'+Math.round(pct)+'</text></svg>';
    html+='<div class="rc-score">'+Math.round(pct)+'/100</div>';
    html+='<div class="rc-desc">'+(pct>=70?'😊 Good':pct>=40?'🌿 Moderate':'🌱 Needs Care')+'</div></div>';
  });
  html+='</div>';
  html+='<div style="background:#fff;border-radius:var(--r-lg);padding:20px 24px;margin-bottom:24px;box-shadow:var(--shadow)">';
  html+='<h3 style="font-family:\'Cormorant Garamond\',serif;font-size:18px;color:var(--navy);margin-bottom:14px">Clinical Domain Scores</h3>';
  var domainRows=[
    {label:'MenQOL Vasomotor',val:sc.MENQOL_vasomotor,max:20,band:sc.MENQOL_vasomotor<7?'Low':sc.MENQOL_vasomotor<14?'Moderate':'High'},
    {label:'MenQOL Physical',val:sc.MENQOL_physical,max:20,band:sc.MENQOL_physical<7?'Low':sc.MENQOL_physical<14?'Moderate':'High'},
    {label:'MenQOL Psychosocial',val:sc.MENQOL_psychosocial,max:20,band:sc.MENQOL_psychosocial<7?'Low':sc.MENQOL_psychosocial<14?'Moderate':'High'},
    {label:'MenQOL Sexual',val:sc.MENQOL_sexual,max:20,band:sc.MENQOL_sexual<7?'Low':sc.MENQOL_sexual<14?'Moderate':'High'},
  ];
  if(S.flags.mentalHealthCompleted){
    domainRows.push({label:'PHQ-9 Depression',val:sc.PHQ9,max:27,band:sc.PHQ9_band});
    domainRows.push({label:'GAD-7 Anxiety',val:sc.GAD7,max:21,band:sc.GAD7_band});
    domainRows.push({label:'PSS-8 Stress',val:sc.PSS8,max:32,band:sc.PSS8_band});
  }
  domainRows.push({label:'ISI Sleep',val:sc.ISI,max:28,band:sc.ISI_band});
  if(S.flags.psychosexualCompleted){
    domainRows.push({label:'FSFI Total',val:sc.FSFI,max:36,band:sc.FSFI_band||'Not assessed'});
    domainRows.push({label:'FSDSR Sexual Distress',val:sc.FSDSR,max:52,band:sc.FSDSR_band||'Not assessed'});
    if(sc.FSFI_domain){var fdLbls={desire:'Desire',arousal:'Arousal',lubrication:'Lubrication',orgasm:'Orgasm',satisfaction:'Satisfaction',pain:'Pain'};Object.keys(fdLbls).forEach(function(k){var dom=sc.FSFI_domain[k];if(dom)domainRows.push({label:'  FSFI '+fdLbls[k],val:dom.score,max:6,band:dom.impaired?'Impaired':'Normal'});});}
    if(sc.FSFI_impaired_domains>0)domainRows.push({label:'Impaired domains',val:sc.FSFI_impaired_domains,max:6,band:sc.FSFI_impaired_domains>=4?'Severe':sc.FSFI_impaired_domains>=2?'Moderate':'Mild'});
  }
  domainRows.forEach(function(row){
    if(row.val===undefined||row.val===null) return;
    var bandColor2=row.band==='Low'||row.band==='None'||row.band==='Normal'||row.band==='Minimal'?'var(--ok)':row.band==='High'||row.band==='Severe'||row.band==='Dysfunction'||row.band==='Significant'?'var(--danger)':'var(--warn)';
    html+='<div class="score-row"><span class="score-label">'+row.label+'</span><div style="display:flex;align-items:center;gap:8px"><span class="score-val">'+row.val.toFixed(0)+'/'+row.max+'</span><span class="score-band" style="background:'+bandColor2+'22;color:'+bandColor2+'">'+row.band+'</span></div></div>';
  });
  if(a.prakriti||a.vikriti){
    html+='<div style="margin-top:12px;padding-top:12px;border-top:1px solid #f0f0f0;font-size:13px;color:var(--slate)">';
    if(a.prakriti) html+='🌿 Prakriti: <strong style="color:var(--teal)">'+a.prakriti+'</strong> &nbsp;';
    if(a.vikriti) html+='⚖️ Vikriti: <strong style="color:var(--warn)">'+a.vikriti.replace('_',' ')+'</strong>';
    html+='</div>';
  }
  html+='</div>';
  // ── Positive Findings Summary for Patient ──
  var a2=S.answers||{};
  var posFindings=[];
  // Lifestyle risks
  if(a2.smoking_history&&a2.smoking_history!=='Never smoked'&&a2.smoking_history!=='Prefer not to say')
    posFindings.push({icon:'🚬',label:'Smoking',val:a2.smoking_history,note:'Increases cardiovascular and cancer risk during menopause'});
  if(a2.alcohol_use&&a2.alcohol_use!=='Non-drinker'&&a2.alcohol_use!=='Prefer not to say')
    posFindings.push({icon:'🍷',label:'Alcohol',val:a2.alcohol_use,note:'Can worsen hot flushes, disrupt sleep and affect bone density'});
  if(a2.hrt_history&&a2.hrt_history!=='Never used HRT'&&a2.hrt_history!=='Not Sure / Prefer not to say')
    posFindings.push({icon:'💊',label:'HRT History',val:a2.hrt_history,note:'Your consultant will review appropriateness for your symptoms'});
  // Family history positives
  var fhLabels={'fam_breast_cancer':'Family Hx: Breast Cancer','fam_ovarian_cancer':'Family Hx: Ovarian Cancer','fam_osteoporosis':'Family Hx: Osteoporosis','fam_cvd':'Family Hx: Heart Disease','fam_diabetes':'Family Hx: Diabetes','fam_depression':'Family Hx: Depression','fam_early_menopause':'Family Hx: Early Menopause'};
  Object.keys(fhLabels).forEach(function(k){if(a2[k])posFindings.push({icon:'🧬',label:fhLabels[k],val:'Positive',note:'Genetic predisposition — discuss with your specialist'});});
  // Medications
  var mLabels={'med_ssri':'On Antidepressants','med_antihyp':'On Antihypertensives','med_betablocker':'On Beta-blockers','med_statin':'On Statins','med_thyroid':'On Thyroid Medication','med_insulin':'On Insulin/Diabetes Medication','med_sleep':'On Sleep Medication','med_nsaid':'Regular NSAIDs'};
  Object.keys(mLabels).forEach(function(k){if(a2[k])posFindings.push({icon:'💊',label:mLabels[k],val:'Confirmed',note:'Inform your consultant — may affect assessment interpretation'});});
  // BMI
  var bmiV=(a2.height_cm&&a2.weight_kg)?(a2.weight_kg/Math.pow(a2.height_cm/100,2)):null;
  if(bmiV&&(bmiV>27.5||bmiV<18.5))posFindings.push({icon:'⚖️',label:'BMI',val:bmiV.toFixed(1)+' kg/m²',note:bmiV>30?'Obesity increases cardiovascular and metabolic risk':bmiV>27.5?'Overweight — affects hormonal balance':'Underweight — bone health concern'});
  // Wearable abnormals
  var wd6=a2.wearable_data||{};
  if(wd6.avg_rhr&&wd6.avg_rhr>80)posFindings.push({icon:'❤️',label:'Elevated Resting HR',val:wd6.avg_rhr+' bpm',note:'Normal <80 bpm — may reflect vasomotor or stress burden'});
  if(wd6.avg_hrv&&wd6.avg_hrv<30)posFindings.push({icon:'📊',label:'Low HRV',val:wd6.avg_hrv+' ms',note:'Low heart rate variability indicates high stress and poor recovery'});
  if(wd6.avg_sleep&&wd6.avg_sleep<6.5)posFindings.push({icon:'😴',label:'Insufficient Sleep',val:wd6.avg_sleep+' hrs avg',note:'Below recommended 7-9 hrs — correlates with your ISI sleep score'});
  if(wd6.avg_steps&&wd6.avg_steps<5000)posFindings.push({icon:'🚶',label:'Low Daily Steps',val:wd6.avg_steps.toLocaleString()+' /day',note:'Below 7,500 target — increases bone loss and metabolic risk in menopause'});
  if(wd6.avg_stress&&wd6.avg_stress>50)posFindings.push({icon:'🌀',label:'High Stress Score',val:wd6.avg_stress+'/100',note:'Elevated autonomic stress — correlates with mood and sleep symptoms'});
  if(wd6.night_sweats_per_night&&wd6.night_sweats_per_night>=2)posFindings.push({icon:'🌡',label:'Frequent Night Sweats',val:wd6.night_sweats_per_night+' /night',note:'Significant vasomotor activity — confirmed by wearable'});
  if(posFindings.length){
    html+='<div style="background:#fff;border-radius:var(--r-lg);padding:20px 24px;margin-bottom:24px;box-shadow:var(--shadow);border-left:4px solid var(--danger)">';
    html+='<h3 style="font-family:Cormorant Garamond,serif;font-size:18px;color:var(--navy);margin-bottom:6px">⚠️ Findings That Need Your Attention</h3>';
    html+='<div style="font-size:12px;color:var(--slate);margin-bottom:14px">These positive findings from your assessment are important for your health team to know about.</div>';
    html+='<div style="display:flex;flex-direction:column;gap:8px">';
    posFindings.forEach(function(f){
      html+='<div style="background:#FFF8F8;border:1px solid #FECACA;border-radius:10px;padding:10px 14px;display:flex;gap:10px;align-items:flex-start">'
        +'<span style="font-size:18px;flex-shrink:0">'+f.icon+'</span>'
        +'<div><div style="font-size:13px;font-weight:700;color:var(--navy)">'+f.label+' <span style="color:var(--danger)">— '+f.val+'</span></div>'
        +'<div style="font-size:11px;color:var(--slate);margin-top:2px">'+f.note+'</div></div></div>';
    });
    html+='</div></div>';
  }
  html+='<div class="care-plan-section"><h3>Your Personalised Care Plan</h3><div class="section-sub">Based on your adaptive assessment — '+STEPS.length+' sections completed</div><div class="care-cards">';
  // ── PRAKRITI/VIKRITI HELPER 
  // Used by every care card to personalise recommendations
  function _pk(){return (S.answers&&S.answers.prakriti)||'';}
  function _vk(){return (S.answers&&S.answers.vikriti)||'';}
  function _sc(){return S.scores||{};}
  function _wd(){return (S.answers&&S.answers.wearable_data)||{};}
  // Generates a Prakriti+Vikriti clinical note suffix for any care card
  function _ayurNote(){
    var pk=_pk(),vk=_vk(),lines=[];
    if(!pk)return '';
    // Prakriti-specific clinical note
    if(pk.indexOf('Vata-Pitta')>=0)
      lines.push('Vata-Pitta constitution: needs both grounding (Ashwagandha, Sesame oil Abhyanga) and cooling (Shatavari, Brahmi). Avoid excessive heat AND cold stimuli.');
    else if(pk.indexOf('Vata')>=0)
      lines.push('Vata constitution: prioritise warmth, stability and routine. Ashwagandha, warm Abhyanga oil massage, and a consistent daily schedule (Dinacharya) are foundational.');
    else if(pk.indexOf('Pitta')>=0)
      lines.push('Pitta constitution: requires cooling, calming approach. Shatavari, Brahmi, moon-bathing, and avoidance of spicy food, overheating and competitive pressure.');
    else if(pk.indexOf('Kapha')>=0)
      lines.push('Kapha constitution: needs stimulation and lightness. Trikatu (ginger-pepper-pippali), vigorous morning movement, light warming diet and avoidance of daytime sleep.');
    // Vikriti-specific active imbalance note
    if(vk){
      if(vk.indexOf('Vata')>=0&&vk.indexOf('Pitta')>=0)
        lines.push('Vikriti Vata-Pitta excess: the active imbalance combines anxiety-driven dryness with inflammatory heat — requires simultaneous grounding AND cooling protocols.');
      else if(vk.indexOf('Vata')>=0)
        lines.push('Active Vata imbalance: counter with warm, oily, heavy foods; oil pulling, Sesame Abhyanga, Ashwagandha 600mg/day and Triphala at bedtime.');
      else if(vk.indexOf('Pitta')>=0)
        lines.push('Active Pitta imbalance: reduce heat exposures, prioritise Shatavari, Amalaki, cooling pranayama (Sheetali, Sitali) and afternoon rest.');
      else if(vk.indexOf('Kapha')>=0)
        lines.push('Active Kapha imbalance: stimulate Agni with Trikatu churna before meals, vigorous Surya Namaskar, and dry brushing (Garshana) to move lymph.');
      else if(vk.indexOf('Mixed')>=0)
        lines.push('Mixed Vikriti: assess the most predominant dosha symptom and address that first — avoid aggressive treatments targeting all doshas simultaneously.');
    }
    return lines.length ? ' <em style="color:var(--teal);font-size:11px">🌿 '+lines.join(' ')+'</em>' : '';
  }

  var actionMeta={
    psychiatric_alert:{icon:'🆘',title:'Immediate Mental Health Support',
      desc:(function(){
        var sc=_sc(),pk=_pk(),vk=_vk();
        var d='<strong>Please contact a mental health professional today.</strong> Your assessment has identified an urgent mental health concern requiring immediate attention.';
        if(sc.PHQ9_item9>0) d+=' Suicidal ideation has been flagged — please call iCall: 9152987821 or Vandrevala Foundation: 1860-2662-345 (24/7).';
        if(pk.indexOf('Vata')>=0) d+=' For Vata types in acute distress: Ashwagandha and Brahmi are calming, but must not replace professional care. Avoid isolation.';
        else if(pk.indexOf('Pitta')>=0) d+=' For Pitta types: the intensity of Pitta can make mental health crises feel overwhelmingly urgent — this is treatable with the right support.';
        return d;
      })(),
      cta:'📞 Book Now: +91 80690 50000',ctaHref:'tel:+918069050000'},

    psychologist_referral:{icon:'🧠',title:'Expert Referral — Psychologist',
      desc:(function(){
        var sc=_sc(),pk=_pk(),vk=_vk();
        var d='';
        // Score-specific context
        if(sc.PHQ9>=20) d='Your PHQ-9 of '+sc.PHQ9+'/27 (Severe depression range) indicates a significant mental health burden. ';
        else if(sc.PHQ9>=15) d='PHQ-9: '+sc.PHQ9+'/27 (Moderately-Severe) — specialist psychological support is indicated. ';
        else if(sc.GAD7>=15) d='GAD-7: '+sc.GAD7+'/21 (Severe anxiety) — cognitive-behavioural therapy for anxiety is strongly recommended. ';
        else if(sc.PSS8>=22) d='PSS-8: '+sc.PSS8+'/32 (High stress) — structured stress reduction with a psychologist is recommended. ';
        else d='Your assessment indicates moderate psychological burden that would benefit from professional psychological support. ';
        if(sc.PHQ9>=5&&S.answers&&S.answers.med_ssri) d+='Note: You are on SSRIs — your true PHQ-9 burden may be higher than measured. ';
        // Prakriti-specific therapy approach
        if(pk.indexOf('Vata')>=0) d+='For Vata constitution: CBT combined with somatic grounding practices (body scan, yoga nidra, Ashwagandha) addresses the anxiety-grief pattern common in Vata during menopause.';
        else if(pk.indexOf('Pitta')>=0) d+='For Pitta constitution: therapy should focus on self-compassion, perfectionism and anger — ACT (Acceptance & Commitment Therapy) suits Pitta temperament. Brahmi 300mg helps.';
        else if(pk.indexOf('Kapha')>=0) d+='For Kapha constitution: behavioural activation therapy (BAT) works well — structured daily schedule, social engagement and gentle stimulation counter Kapha withdrawal.';
        else if(pk.indexOf('Vata-Pitta')>=0) d+='Vata-Pitta profile: DBT (Dialectical Behaviour Therapy) skills — emotion regulation for Pitta intensity + mindfulness for Vata anxiety — are well matched.';
        if(vk.indexOf('Vata')>=0) d+=' Current Vata excess: racing thoughts and anxiety are a Vata disturbance — Ashwagandha and Shirodhara (forehead oil therapy) can complement therapy.';
        else if(vk.indexOf('Pitta')>=0) d+=' Current Pitta excess: irritability and emotional inflammation may intensify psychological symptoms — cooling Brahmi and Amalaki are adjunct supports.';
        return d;
      })(),
      cta:'📞 Book Now: +91 80690 50000',ctaHref:'tel:+918069050000'},

    gynecology_referral:{icon:'👩‍⚕️',title:'Expert Referral — Gynaecologist',
      desc:(function(){
        var sc=_sc(),pk=_pk(),vk=_vk(),a=S.answers||{};
        var d='';
        // Reason-specific context
        if(sc.rf1==='Yes') d='<strong>Abnormal bleeding flagged</strong> — requires prompt gynaecological assessment to rule out pathology. ';
        else if(sc.rf3==='Yes') d='<strong>Breast change reported</strong> — clinical examination and imaging are indicated. ';
        else if(a.fam_breast_cancer||a.fam_ovarian_cancer) d='Family history of breast/ovarian cancer — genetic counselling and preventive screening are recommended. ';
        else d='Your menopause assessment indicates benefit from a specialist gynaecological review for symptom management and HRT evaluation. ';
        if(sc.MENQOL_vasomotor>=14) d+='Vasomotor score '+sc.MENQOL_vasomotor+'/20 — HRT candidacy assessment is appropriate. ';
        // Prakriti-specific surgical/hormonal considerations
        if(pk.indexOf('Pitta')>=0) d+='Pitta constitution: prone to inflammatory conditions — pre-HRT assessment should include inflammatory markers (CRP, ESR). Cooling Shatavari supports hormonal balance naturally.';
        else if(pk.indexOf('Vata')>=0) d+='Vata constitution: bone density screening is a priority — Vata types have higher osteoporosis risk during menopause. Ashwagandha and calcium supplementation are appropriate alongside HRT discussion.';
        else if(pk.indexOf('Kapha')>=0) d+='Kapha constitution: metabolic profile (thyroid, lipids, insulin) should be assessed during gynaecological review — Kapha is prone to hypothyroid-like symptoms.';
        if(vk.indexOf('Pitta')>=0) d+=' Active Pitta Vikriti: inflammatory conditions (fibroids, endometriosis risk) are heightened — discuss this with your gynaecologist.';
        return d;
      })(),
      cta:'📞 Book Now: +91 80690 50000',ctaHref:'tel:+918069050000'},

    gurugram_clinic:{icon:'🏥',title:'EvaEraHealth Clinic — Gurugram',
      desc:(function(){
        var sc=_sc(),pk=_pk(),vk=_vk();
        var comp=sc.composite||0;
        var d='';
        // Severity-appropriate urgency
        if(comp>=76) d='<strong>Your EvaEraHealth assessment places you in the Critical category.</strong> An in-person consultation is strongly recommended — same week. ';
        else if(comp>=56) d='Your Severe wellness level warrants an in-person consultation with our multidisciplinary menopause team. ';
        else d='An in-person consultation at EvaEraHealth Gurugram is recommended based on your assessment findings. ';
        // Prakriti-specific clinic services
        if(pk.indexOf('Vata-Pitta')>=0) d+='Your Vata-Pitta profile will receive a combined Ayurvedic-integrative plan: Panchakarma consultation, HRT assessment and Nadi Pariksha pulse diagnosis.';
        else if(pk.indexOf('Vata')>=0) d+='For your Vata constitution: the clinic offers Shirodhara (forehead oil therapy), Basti (enema therapy for Vata) and Ayurvedic consultation alongside conventional menopause care.';
        else if(pk.indexOf('Pitta')>=0) d+='For your Pitta constitution: the clinic provides Virechana (therapeutic purgation), Pitta-pacifying Panchakarma and cooling herbal therapies alongside conventional care.';
        else if(pk.indexOf('Kapha')>=0) d+='For your Kapha constitution: Udwartanam (dry herbal massage), Kapha-reducing Panchakarma and metabolic support are available.';
        if(vk&&vk!=='Balanced') d+=' Your current Vikriti ('+vk.replace(/_/g,' ')+') will be addressed with targeted dosha-specific treatment alongside your primary menopause care plan.';
        return d;
      })(),
      cta:'📞 +91 80690 50000',ctaHref:'tel:+918069050000'},

    sexual_therapy_pathway:{icon:'💜',title:'Sexual Therapy Pathway',
      desc:(function(){
        var sc=_sc(),pk=_pk(),vk=_vk();
        var d='';
        if(sc.FSFI!==null&&sc.FSFI!==undefined) d='FSFI score '+sc.FSFI+'/36 ('+sc.FSFI_band+') — ';
        else if(sc.MENQOL_sexual>=14) d='Sexual domain score '+sc.MENQOL_sexual+'/20 — ';
        else d='Your sexual wellbeing assessment indicates ';
        d+='integrated psychosexual therapy is recommended. This combines CBT, body-awareness techniques, and couples work where applicable. ';
        // Prakriti-specific sexual health approach
        if(pk.indexOf('Vata')>=0) d+='For Vata constitution: sexual dysfunction is often rooted in anxiety, dryness and disconnection. Shatavari (800mg/day) lubricates tissues; warm Abhyanga, intimacy-focused yoga (Ananda Balasana) and sensate focus therapy address Vata pattern.';
        else if(pk.indexOf('Pitta')>=0) d+='For Pitta constitution: sexual difficulties often involve performance pressure, self-criticism or physical discomfort from heat. Cooling Shatavari, Brahmi, and non-goal-oriented sensate focus work well for Pitta.';
        else if(pk.indexOf('Kapha')>=0) d+='For Kapha constitution: low libido and withdrawal are classic Kapha patterns. Saffron-infused warm milk, Ashwagandha, and graduated intimacy exercises with partner involvement help rekindle Kapha energy.';
        else if(pk.indexOf('Vata-Pitta')>=0) d+='Vata-Pitta sexual challenges combine dryness-anxiety (Vata) with heat-irritability (Pitta) — Shatavari addresses both; therapy should work with both patterns.';
        if(vk.indexOf('Vata')>=0) d+=' Vata Vikriti: vaginal dryness and low desire are Vata manifestations — Sesame Yoni Pichu (topical oil application) and Shatavari 800mg are Ayurvedic first-line.';
        else if(vk.indexOf('Kapha')>=0) d+=' Kapha Vikriti: emotional withdrawal from intimacy — warmth, stimulation and Ashwagandha 600mg can re-engage Kapha energy.';
        return d;
      })(),
      cta:'📞 Book Now: +91 80690 50000',ctaHref:'tel:+918069050000'},

    sexual_wellbeing_program:{icon:'🌺',title:'Sexual Wellness Programme',
      desc:(function(){
        var sc=_sc(),pk=_pk(),vk=_vk();
        var d='Specialised support for sexual health through education, therapy and community. ';
        if(pk.indexOf('Vata')>=0) d+='Vata focus: pelvic floor physiotherapy, vaginal moisturisers, Shatavari Ghee, and intimacy-rebuilding exercises.';
        else if(pk.indexOf('Pitta')>=0) d+='Pitta focus: managing peri-menopausal libido changes with cooling herbs (Shatavari, Rose water), and reducing performance anxiety.';
        else if(pk.indexOf('Kapha')>=0) d+='Kapha focus: behavioural activation for intimacy, Ashwagandha supplementation, and partner communication skills.';
        else d+='Education about hormonal changes, evidence-based options (lubricants, local oestrogen, Shatavari), and peer support.';
        return d;
      })()},

    relationship_counselling:{icon:'💑',title:'Relationship Counselling',
      desc:(function(){
        var pk=_pk(),vk=_vk();
        var d='Couples or individual counselling to navigate intimacy, communication and emotional changes during menopause. ';
        if(pk.indexOf('Vata')>=0) d+='For Vata: focus on reassurance, consistent emotional availability and communication — Vata fears abandonment and instability.';
        else if(pk.indexOf('Pitta')>=0) d+='For Pitta: focus on softening criticism and perfectionism in the relationship — Pitta\'s intensity can create friction. Compassionate communication techniques help.';
        else if(pk.indexOf('Kapha')>=0) d+='For Kapha: focus on re-engagement and social connection — Kapha\'s withdrawal can be misread as rejection. Structured shared activities re-establish intimacy.';
        if(vk.indexOf('Pitta')>=0) d+=' Pitta Vikriti: anger and irritability may be projecting into the relationship — therapy can help distinguish hormonal from relational drivers.';
        return d;
      })()},

    sleep_recovery_program:{icon:'🌙',title:'Sleep Recovery Programme',
      desc:(function(){
        var sc=_sc(),pk=_pk(),vk=_vk(),wd=_wd();
        var d='';
        // Score-specific
        if(sc.ISI>=22) d='ISI score '+sc.ISI+'/28 (Severe insomnia) — CBT-I (Cognitive Behavioural Therapy for Insomnia) is the gold-standard first-line treatment. ';
        else if(sc.ISI>=15) d='ISI score '+sc.ISI+'/28 (Moderate insomnia) — sleep hygiene and structured relaxation protocols are indicated. ';
        else d='Your sleep assessment indicates benefit from structured sleep support. ';
        if(wd.avg_sleep&&wd.avg_sleep<6) d+='Wearable confirms average '+wd.avg_sleep+'h — significantly below the 7-9h target. ';
        if(wd.night_sweats_per_night&&wd.night_sweats_per_night>=2) d+='Wearable: '+wd.night_sweats_per_night+' night sweats/night are disrupting sleep continuity. ';
        // Prakriti-specific sleep protocols
        if(pk.indexOf('Vata')>=0) d+='Vata sleep protocol: Abhyanga warm sesame oil on feet/scalp before bed, Brahmi Ghee, Jatamansi 500mg, warm milk with nutmeg. Keep room dark, warm and silent. Avoid screens 90min before bed.';
        else if(pk.indexOf('Pitta')>=0) d+='Pitta sleep protocol: Cool bedroom (18-20°C), Brahmi+Shatavari at night, lavender/sandalwood diffusion, avoid stimulating conversations or work after 7pm. Sheetali pranayama before bed.';
        else if(pk.indexOf('Kapha')>=0) d+='Kapha sleep protocol: avoid sleeping more than 7.5h (increases Kapha heaviness), keep consistent wake time, morning exercise by 7am. Trikatu tea in the morning activates Agni. Reduce daytime napping.';
        else if(pk.indexOf('Vata-Pitta')>=0) d+='Vata-Pitta sleep protocol: combine cooling (lavender, Brahmi) with grounding (warm Abhyanga, Ashwagandha) — address both the racing thoughts (Vata) and late-night intensity (Pitta) aspects.';
        // Vikriti-specific additions
        if(vk.indexOf('Vata')>=0) d+=' Vata Vikriti: Ashwagandha 600mg + Jatamansi at bedtime — addresses the anxiety-driven insomnia of active Vata imbalance.';
        else if(vk.indexOf('Pitta')>=0) d+=' Pitta Vikriti: Brahmi 500mg + Amalaki at bedtime — cooling support for the overheating, ruminating mind of Pitta excess.';
        return d;
      })()},

    stress_management_program:{icon:'🧘',title:'Stress Management Programme',
      desc:(function(){
        var sc=_sc(),pk=_pk(),vk=_vk(),wd=_wd();
        var d='';
        // Score-specific
        if(sc.PSS8>=22) d='PSS-8: '+sc.PSS8+'/32 (High stress) — ';
        else if(sc.GAD7>=10) d='GAD-7: '+sc.GAD7+'/21 — ';
        else if(sc.PHQ9>=10) d='PHQ-9: '+sc.PHQ9+'/27 — ';
        else d='Your stress assessment indicates — ';
        d+='structured stress management is recommended alongside any clinical treatment. ';
        if(wd.avg_hrv&&wd.avg_hrv<30) d+='Wearable HRV '+wd.avg_hrv+'ms (low) confirms elevated autonomic stress load. ';
        if(wd.avg_stress&&wd.avg_stress>60) d+='Device stress score '+wd.avg_stress+'/100 corroborates chronic stress burden. ';
        // Prakriti-specific stress techniques
        if(pk.indexOf('Vata')>=0) d+='For Vata constitution: Nadi Shodhana (alternate nostril breathing) 10min twice daily, Yoga Nidra, Ashwagandha KSM-66 600mg. Grounding practices: walking barefoot on grass, gardening, warm baths. Avoid over-scheduling.';
        else if(pk.indexOf('Pitta')>=0) d+='For Pitta constitution: Sheetali pranayama, Chandra Bhedana (moon breath), Brahmi 500mg. Channel Pitta energy through creative outlets, gentle walks in nature. Avoid competitive or high-stakes activities during peak stress.';
        else if(pk.indexOf('Kapha')>=0) d+='For Kapha constitution: vigorous exercise (Surya Namaskar, brisk walks) is the best stress reliever — Kapha needs movement. Social engagement, Trikatu adaptogen and challenging mental tasks help lift Kapha depression-stress.';
        else if(pk.indexOf('Vata-Pitta')>=0) d+='Vata-Pitta stress programme: Nadi Shodhana for Vata anxiety + Sheetali for Pitta heat. Ashwagandha for Vata, Brahmi for Pitta — these two herbs work synergistically for this dual constitution.';
        // Vikriti-specific
        if(vk.indexOf('Vata')>=0) d+=' Vata Vikriti: this active imbalance amplifies anxiety — Ashwagandha 600mg/day is clinically validated for stress reduction and is Vata-pacifying.';
        else if(vk.indexOf('Pitta')>=0) d+=' Pitta Vikriti: inflammatory stress response — reduce Pitta foods (spicy, acidic, fermented), add Shatavari and Amalaki to cool the physiological stress reaction.';
        else if(vk.indexOf('Kapha')>=0) d+=' Kapha Vikriti: sluggishness masks stress as low motivation — Trikatu and stimulating exercise (20min morning vigorous activity) shifts Kapha state.';
        return d;
      })()},

    recommend_menopause_program:{icon:'🌸',title:'Menopause Wellness Programme',
      desc:(function(){
        var sc=_sc(),pk=_pk(),vk=_vk(),a=S.answers||{};
        var d='';
        var comp=sc.composite||0;
        // Severity-appropriate framing
        if(comp>=81) d='<strong>Critical — your wellness assessment indicates urgent care</strong> — your personalised menopause programme will be intensive and multidisciplinary. ';
        else if(comp>=56) d='Your Severe assessment ('+comp+'/100) indicates significant menopausal burden. Your programme will be comprehensive. ';
        else if(comp>=31) d='Moderate wellness burden detected — your programme focuses on targeted symptom relief and prevention. ';
        else d='Your menopause wellness programme will build on your current health foundations. ';
        // Vasomotor burden note
        if(sc.MENQOL_vasomotor>=14) d+='Vasomotor score '+sc.MENQOL_vasomotor+'/20 is high — your programme will prioritise hot flush management. ';
        // Full Prakriti programme description
        if(pk.indexOf('Vata-Pitta')>=0)
          d+='Vata-Pitta programme: Shatavari 800mg + Ashwagandha 600mg daily (addresses both doshas). Abhyanga with cooling-grounding sesame-coconut oil blend. Avoid both extreme heat AND cold. Yoga: Restorative poses (Supta Baddha Konasana, Legs-up-wall) balance Vata and Pitta simultaneously. Chandraprabha Vati supports genitourinary symptoms.';
        else if(pk.indexOf('Vata')>=0)
          d+='Vata programme: Ashwagandha 600mg, Shatavari 500mg, Triphala (bedtime). Daily Abhyanga with warm sesame oil. Regular meals — no fasting. Yoga: Grounding poses (Tadasana, Virabhadrasana, Balasana). Warm, oily, nourishing diet. Avoid cold, raw foods and erratic schedules.';
        else if(pk.indexOf('Pitta')>=0)
          d+='Pitta programme: Shatavari 800mg + Brahmi 500mg + Amalaki daily. Moon-bathing and evening walks. Yoga: Cooling poses (Chandra Namaskar, Sitali pranayama, Shavasana). Avoid spicy, sour, fermented foods. Coconut oil Abhyanga with sandalwood/rose essential oils. Chandraprabha Vati for hot flushes.';
        else if(pk.indexOf('Kapha')>=0)
          d+='Kapha programme: Trikatu churna before meals, Guggul (Triphala Guggul) for metabolism, Ginger + Cinnamon tea daily. Morning Surya Namaskar (12 rounds) and Garshana dry brushing. Avoid heavy, cold, sweet foods. Yoga: Dynamic poses (Trikonasana, Navasana). Stimulation and social engagement are medicine for Kapha.';
        else
          d+='Your personalised EvaEraHealth menopause programme includes Ayurvedic constitution assessment, integrative lifestyle protocols, and evidence-based menopause management.';
        // Stage-specific note
        if(a.stage==='Surgical Menopause') d+=' Surgical menopause: abrupt hormone loss requires more intensive support — your programme will address rapid oestrogen withdrawal specifically.';
        // Vikriti integration
        if(vk&&vk!=='Balanced')
          d+=' Your current imbalance ('+vk.replace(/_/g,' ')+') is addressed with targeted protocols within the programme.';
        return d;
      })()},

    exercise_program:{icon:'🏃\u200d\u2640\ufe0f',title:'Movement & Exercise',
      desc:(function(){
        var sc=_sc(),pk=_pk(),vk=_vk(),wd=_wd();
        var d='';
        var steps=wd.avg_steps;
        if(steps&&steps<3000) d='🚨 Wearable: only '+Number(steps).toLocaleString()+' steps/day — critically low for menopausal bone and metabolic health. ';
        else if(steps&&steps<5000) d='⚠️ Wearable: '+Number(steps).toLocaleString()+' steps/day — below the 7,500 menopause target. ';
        else if(steps&&steps>=7500) d='✅ Wearable confirms '+Number(steps).toLocaleString()+' steps/day — maintain this as a minimum baseline. ';
        // Prakriti-specific exercise prescriptions
        if(pk.indexOf('Vata')>=0)
          d+='Vata exercise Rx: gentle, grounding movement. Yoga (Hatha, Restorative), walking in nature, swimming. 30min daily at moderate intensity. AVOID: high-impact HIIT, endurance running, hot yoga — these aggravate Vata dryness and depletion. Best times: 6-10am (Kapha hours, stabilising for Vata).';
        else if(pk.indexOf('Pitta')>=0)
          d+='Pitta exercise Rx: cooling, non-competitive exercise. Swimming, evening walks, restorative yoga, cycling. 45min daily. AVOID: midday workouts in heat, competitive sports that trigger Pitta intensity, Bikram yoga. Best times: 6-10am or 6-10pm (avoid 10am-2pm Pitta hours).';
        else if(pk.indexOf('Kapha')>=0)
          d+='Kapha exercise Rx: vigorous, stimulating movement is medicine. Brisk walking 45min, strength training 3×/week, aerobics classes, Surya Namaskar 12 rounds. Kapha needs intensity and variety to shift stagnation. Best times: 6-10am (Kapha hours — movement during this time maximally reduces Kapha buildup).';
        else if(pk.indexOf('Vata-Pitta')>=0)
          d+='Vata-Pitta exercise Rx: moderate-intensity, cooling and grounding. Yoga (Hatha/Vinyasa), swimming, morning walks. 40min daily. Avoid extremes in both intensity (HIIT) and heat (Bikram yoga). Consistency over intensity.';
        else
          d+='Target 7,500 steps/day minimum, 150min moderate aerobic activity/week, and 2× weekly strength training to protect bone density during menopause.';
        // Vikriti-specific modification
        if(vk.indexOf('Vata')>=0) d+=' Vata excess active: reduce exercise intensity temporarily until symptoms stabilise — over-exertion worsens Vata depletion.';
        else if(vk.indexOf('Pitta')>=0) d+=' Pitta excess active: avoid exercising in heat or when irritable — this amplifies Pitta. Morning swimming or gentle yoga are safest.';
        else if(vk.indexOf('Kapha')>=0) d+=' Kapha excess active: this is the time to push through resistance — vigorous exercise is the single most effective Kapha-reducing intervention.';
        return d;
      })()},

    nutrition_guidance:{icon:'🥗',title:'Nutrition & Diet',
      desc:(function(){
        var sc=_sc(),pk=_pk(),vk=_vk(),wd=_wd(),a=S.answers||{};
        var d='';
        var bmi=(a.height_cm&&a.weight_kg)?(a.weight_kg/Math.pow(a.height_cm/100,2)).toFixed(1):null;
        // Wearable-informed specifics
        if(wd.avg_stress&&wd.avg_stress>60) d+='Wearable stress '+wd.avg_stress+'/100 — magnesium glycinate 400mg at night, Ashwagandha adaptogen and B-vitamin complex help buffer cortisol. ';
        if(wd.avg_sleep&&wd.avg_sleep<5.5) d+='Wearable sleep '+wd.avg_sleep+'h — add tryptophan-rich evening foods: warm golden milk (turmeric+ashwagandha), dates, almonds, nutmeg per Ayurvedic Dinacharya. ';
        if(bmi&&parseFloat(bmi)>30) d+='BMI '+bmi+' — prioritise anti-inflammatory, low-glycaemic diet to reduce menopausal metabolic risk. ';
        else if(bmi&&parseFloat(bmi)>27.5) d+='BMI '+bmi+' — include high-fibre foods (psyllium, flaxseed) and time-restricted eating to support metabolic health. ';
        // Prakriti-specific full diet prescriptions
        if(pk.indexOf('Vata-Pitta')>=0)
          d+='Vata-Pitta diet: warm, mildly spiced, nourishing AND non-inflammatory. Ghee + warm sesame oil (Vata), coconut water + cooling herbs (Pitta). Include: khichdi, warm soups, pomegranate, coriander chutney, Shatavari Kalpa powder. Avoid: cold raw foods (Vata), spicy curries (Pitta), fermented foods.';
        else if(pk.indexOf('Vata')>=0)
          d+='Vata diet Rx: warm, oily, grounding, sweet-sour-salty tastes. Ghee 1 tsp/day, sesame seeds, root vegetables (sweet potato, beets), warm lentil soups, dates and figs. Herbs: Ashwagandha, Shatavari, Triphala (bedtime). AVOID: cold/raw foods, fasting >4h, bitter/astringent/pungent tastes.';
        else if(pk.indexOf('Pitta')>=0)
          d+='Pitta diet Rx: cooling, anti-inflammatory, sweet-bitter-astringent tastes. Coconut water, pomegranate, coriander, fennel, cucumber, leafy greens. Herbs: Shatavari 800mg, Amalaki, Brahmi, Rose water. AVOID: spicy foods, alcohol, acidic/fermented foods, excessive red meat. Reduce salt.';
        else if(pk.indexOf('Kapha')>=0)
          d+='Kapha diet Rx: light, warming, spicy-bitter-astringent tastes. Fresh ginger tea, mustard seeds, pepper, leafy greens, legumes. Herbs: Trikatu, Guggul, Cinnamon. AVOID: dairy, sweet/heavy/oily foods, cold drinks, daytime napping after meals. Eat largest meal at noon.';
        else
          d+='Balanced menopause diet: calcium 1200mg/day (sesame, almonds, leafy greens), Vitamin D3 2000IU, omega-3 (walnuts, flaxseed, fatty fish), phytoestrogens (edamame, flaxseed, chickpeas), and Shatavari as an adaptogenic herb.';
        // Vikriti-specific add-on
        if(vk.indexOf('Vata')>=0) d+=' Vata imbalance: increase Ama-reducing foods — Triphala at bedtime, warm cumin-coriander-fennel tea (CCF tea) after meals.';
        else if(vk.indexOf('Pitta')>=0) d+=' Pitta imbalance: add Amalaki churna 3g/day — a Pitta-pacifying Rasayana that also supports liver detoxification and hormonal clearance.';
        else if(vk.indexOf('Kapha')>=0) d+=' Kapha imbalance: Trikatu churna 500mg before meals stimulates Agni and reduces Kapha mucus buildup.';
        return d;
      })()},

    activate_psychosexual_module:{icon:'💭',title:'Psychosexual Wellbeing Support',
      desc:(function(){
        var sc=_sc(),pk=_pk(),vk=_vk();
        var d='An integrated mind-body assessment for sexual and psychological wellbeing during menopause. ';
        if(sc.MENQOL_sexual>=12) d+='Your sexual wellbeing domain score ('+sc.MENQOL_sexual+'/20) suggests meaningful sexual health impact. ';
        if(pk.indexOf('Vata')>=0) d+='Vata sexual wellbeing: addresses vaginal dryness, low libido and anxiety around intimacy. Shatavari Ghee and pelvic floor work are first-line Ayurvedic support.';
        else if(pk.indexOf('Pitta')>=0) d+='Pitta sexual wellbeing: manages performance pressure, physical discomfort and emotional intensity in intimacy. Cooling Shatavari and sensate focus therapy are recommended.';
        else if(pk.indexOf('Kapha')>=0) d+='Kapha sexual wellbeing: addresses low libido and emotional withdrawal. Ashwagandha, partner communication and graduated intimacy exercises reawaken Kapha desire.';
        return d;
      })()},
  };
  var shown=0;
  (S.triage||[]).forEach(function(t){
    if(shown>=7)return;
    var m=actionMeta[t.action];
    if(!m)return;
    var sevClass=t.sev==='severe'?'urgent':t.sev==='moderate'?'moderate':'mild';
    html+='<div class="care-card '+sevClass+'">';
    html+='<div class="cc-icon">'+m.icon+'</div>';
    html+='<div class="cc-title">'+m.title+'</div>';
    html+='<div class="cc-desc">'+m.desc+'</div>';
    var _pLbl=t.sev==='severe'?'Recommended Action':t.sev==='moderate'?'Suggested Support':'Wellness Tip';
    var _pIco=t.sev==='severe'?'📋':t.sev==='moderate'?'💡':'✅';
    html+='<span class="cc-badge" style="background:rgba(0,0,0,0.04);color:var(--slate);font-weight:600">'+_pIco+' '+_pLbl+'</span>';
    if(m.cta){
      var isBookable=['gynecology_referral','psychologist_referral','gurugram_clinic','sexual_therapy_pathway','psychiatric_alert'].indexOf(t.action)>=0;
      if(isBookable){
        html+='<button onclick="intShowBooking()" class="cc-cta" style="border:none;cursor:pointer;">&#x1F4C5; '+m.cta+'</button>';
      } else {
        html+='<a href="'+m.ctaHref+'" class="cc-cta">'+m.cta+'</a>';
      }
    }
    html+='</div>';
    shown++;
  });
  if(shown===0){html+='<div class="care-card mild"><div class="cc-icon">✨</div><div class="cc-title">Wellness Maintenance</div><div class="cc-desc">Your results look positive. Continue your healthy lifestyle and schedule regular check-ins.</div></div>';}
  html+='</div></div>';
  html+='<div style="background:linear-gradient(135deg,#FFF8E7,#FFF3E0);border:2px solid #FFB300;border-radius:14px;padding:16px 18px;margin-top:20px">' +
    '<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px"><span style="font-size:20px">⚕️</span><div>' +
    '<div style="font-size:12px;font-weight:800;color:#E65100;margin-bottom:4px">AI-Generated Report — Medical Disclaimer</div>' +
    '<div style="font-size:11px;color:#795548;line-height:1.6">Generated by EvaEraHealth AI (Claude, Anthropic). <strong>Not a medical diagnosis.</strong> All insights must be reviewed by a qualified clinician before any action. For emergencies, call 112.</div>' +
    '</div></div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
    '<span style="background:#fff;border:1px solid #FFB300;border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;color:#E65100">🤖 AI Generated</span>' +
    '<span style="background:#fff;border:1px solid #66BB6A;border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;color:#2E7D32">🔒 DPDP Compliant</span>' +
    '<span style="background:#fff;border:1px solid #42A5F5;border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;color:#1565C0">👩‍⚕️ Clinician Review Required</span>' +
    '</div></div>';
  // Book CTA + floating button
  html+='<div style="background:linear-gradient(135deg,#FFF0F5,#F3E5F5);border:2px solid var(--rose);border-radius:16px;padding:20px 22px;margin-top:20px;text-align:center">'
    +'<div style="font-size:22px;margin-bottom:6px">&#x1F4C5;</div>'
    +'<div style="font-size:16px;font-weight:800;color:var(--navy);margin-bottom:4px">Ready to speak with a specialist?</div>'
    +'<div style="font-size:12px;color:var(--slate);margin-bottom:14px">Book an online video consultation or in-person visit at EvaEraHealth Clinic, Gurugram.</div>'
    +'<button onclick="intShowBooking()" style="background:linear-gradient(135deg,var(--rose-deep),var(--rose));color:#fff;border:none;padding:13px 32px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;width:100%;max-width:320px">&#x1F4C5; Book Appointment &rarr;</button>'
    +'<div style="font-size:10px;color:var(--slate);margin-top:8px">Gynaecologist &middot; Psychologist &middot; Menopause Specialist &middot; Ayurvedic Physician</div>'
    +'</div>';
  html+='<div style="text-align:center;margin-top:20px">';
  html+='<button class="btn-primary" style="max-width:280px;margin:0 auto 10px;display:block" onclick="startForm()">&#x1F504; Retake Assessment</button>';
  html+='<button class="btn-secondary" style="max-width:280px;margin:0 auto;display:block" onclick="downloadUserReport()">&#x1F4C4; Download My Report</button>';
  html+='<button class="btn-secondary" style="max-width:280px;margin:0 auto;display:block;margin-top:8px;border-color:var(--teal);color:var(--teal)" onclick="intSendReport()">&#x1F4E7; Send Report to Email / WhatsApp</button>';
  html+='</div>';
  html+='<div id="results-float-book" style="position:fixed;bottom:24px;right:20px;z-index:999">';
  html+='<button onclick="intShowBooking()" style="background:linear-gradient(135deg,var(--rose-deep),var(--rose));color:#fff;border:none;padding:12px 20px;border-radius:50px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 6px 24px rgba(136,14,79,0.45);display:flex;align-items:center;gap:7px">';
  html+='<span style="font-size:16px">&#x1F4C5;</span> Book Appointment</button></div>';
  html+='<div style="background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:16px 18px;margin-top:20px">'
    +'<div style="font-size:12px;font-weight:800;color:#0F1E3C;margin-bottom:10px">&#x1F512; Your Data Rights — DPDP Act 2023</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">'
    +'<button onclick="showPrivacyNotice()" style="padding:9px 10px;background:#F0E8FA;border:none;border-radius:9px;font-size:11px;font-weight:700;color:#6A1B9A;cursor:pointer;text-align:left">&#x1F4CB; Privacy Notice</button>'
    +'<button onclick="deleteMyData()" style="padding:9px 10px;background:#FEE2E2;border:none;border-radius:9px;font-size:11px;font-weight:700;color:#991B1B;cursor:pointer;text-align:left">&#x1F5D1; Delete All My Data</button>'
    +'<button onclick="exportMyData()" style="padding:9px 10px;background:#DBEAFE;border:none;border-radius:9px;font-size:11px;font-weight:700;color:#1E40AF;cursor:pointer;text-align:left">&#x1F4E4; Export My Data (JSON)</button>'
    +'<a href="mailto:dpo@evaerahealth.in?subject=Data+Erasure+Request" style="padding:9px 10px;background:#F0FDF4;border:none;border-radius:9px;font-size:11px;font-weight:700;color:#166534;cursor:pointer;text-align:left;display:block;text-decoration:none">&#x2709; Email DPO for Erasure</a>'
    +'</div>'
    +'<div style="font-size:10px;color:#9ca3af;line-height:1.5">Under DPDP Act 2023 §11–13, you have the right to access, correct and erase your personal data. DPO: dpo@evaerahealth.in</div>'
    +'</div>';
html+='<p style="font-size:11px;text-align:center;color:#9ca3af;margin-top:16px">app.evaerahealth.com · EvaEraHealth Clinic, Gurugram Flagship Center · DPDP Act 2023 Compliant</p>';
  document.getElementById('results-screen').innerHTML=html;
  generateAIMessage(name,sc);
}
async function generateAIMessage(name, sc) {
  if(!sc||(sc.composite===0&&!S.answers.mq_v1)){var el=document.getElementById('ai-message-text');if(el)el.innerHTML='"Complete the full assessment to receive your personalised wellness message."';
return;
}
  var band = sc.composite<=5?'optimal':sc.composite<=30?'mild':sc.composite<=55?'moderate':sc.composite<=80?'significant':'high';
    var wNote='';
  if(S.answers&&S.answers.wearable&&S.answers.wearable!=='None / No wearable'&&sc&&sc.wearableNotes&&sc.wearableNotes.length){
    wNote=' Wearable device ('+S.answers.wearable+') corroboration: '+sc.wearableNotes.slice(0,2).join('; ')+'.';
  }
  // ISSUE-01 fix: pass red flag status, dominant domain, max severity to prompt
  var redFlagActive = S.answers && (S.answers.rf1===1||S.answers.rf3===1||(S.answers.rf2===2));
  var psychiatricAlert = sc.PHQ9_item9 > 0;
  // Compute dominant domain (highest scoring) for ISSUE-03 fix
  var domainScores = [
    {name:'vasomotor symptoms (hot flushes and night sweats)',score:sc.MENQOL_vasomotor||0,max:20},
    {name:'physical symptoms (fatigue and joint pain)',score:sc.MENQOL_physical||0,max:20},
    {name:'emotional wellbeing (anxiety and mood)',score:sc.MENQOL_psychosocial||0,max:20},
    {name:'sleep quality',score:(sc.ISI||0)/28*20,max:20},
    {name:'depression',score:(sc.PHQ9||0)/27*20,max:20},
    {name:'anxiety',score:(sc.GAD7||0)/21*20,max:20},
  ];
  var topDomain = domainScores.sort(function(a,b){return b.score-a.score;})[0];
  // Compute max triage severity for ISSUE-02 fix
  var maxTriageSev = 'mild';
  if(S.triage && S.triage.length) {
    var sevMap={severe:3,moderate:2,mild:1};
    S.triage.forEach(function(t){if(sevMap[t.sev||t[1]]>sevMap[maxTriageSev])maxTriageSev=t.sev||t[1];});
  }
  // Build clinical urgency override string
  var urgencyNote='';
  if(redFlagActive){
    urgencyNote=' CRITICAL INSTRUCTION: This woman has reported a gynaecological concern (unusual bleeding or breast change). Your FIRST sentence MUST be: "Your assessment has flagged something that needs prompt medical attention — please contact the EvaEraHealth clinic today at +91 80690 50000." Do not start with any other sentence.';
  } else if(psychiatricAlert){
    urgencyNote=' CRITICAL: She reported suicidal thoughts (PHQ-9 item 9). Begin with: "I want you to know that support is available right now — please call iCall at 9152987821 or Vandrevala Foundation at 1860-2662-345."';
  } else if(maxTriageSev==='severe'){
    urgencyNote=' IMPORTANT: Her assessment includes at least one SEVERE clinical recommendation. Your message should be warm but clearly encourage her to seek specialist support, naming the specific concern: '+topDomain.name+'. Do not be alarming but do be clear that professional support is strongly recommended.';
  }
  // ISSUE-03 fix: specify dominant domain for personalisation
  var domainInstruction = ' Her primary area of concern is '+topDomain.name+' (score '+Math.round(topDomain.score)+'/20 equivalent). Sentence 2 should specifically address this domain with an empathetic acknowledgement and one practical suggestion.';
  var prompt = 'You are a warm, compassionate AI wellness companion for EvaEraHealth, an AI-powered perimenopause and menopause platform for Indian women.'
    +urgencyNote
    +' Write a personalised, empathetic 3-sentence wellness message for a woman named '+name
    +'. Her assessment: composite '+sc.composite+'/100 ('+band+' burden),'
    +' PHQ-9:'+sc.PHQ9+', GAD-7:'+sc.GAD7+', ISI:'+sc.ISI+', FSFI:'+sc.FSFI+'.'
    +domainInstruction
    +' Assessment modules completed: '+(S.flags&&S.flags.mentalHealthCompleted?'mental health, ':'')+''+(S.flags&&S.flags.psychosexualCompleted?'sexual wellbeing, ':'')+'sleep.'
    +(wNote?' '+wNote:'')
    +' RULES: Warm encouraging English only. No clinical jargon. No bullet points. Under 80 words.'
    +' Only reference domains that were assessed. Do NOT mention or grade modules that are marked as not completed this session.';
  try {
    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        model:'claude-sonnet-4-20250514',
        max_tokens:1000,
        messages:[{role:'user',content:prompt}]
      })
    });
    var data = await response.json();
    var text = data.content && data.content[0] ? data.content[0].text : 'Your wellbeing journey is unique and deeply personal. EvaEraHealth is here to walk alongside you every step of the way. Today, take one small, gentle action for yourself — you deserve it.';
    var el = document.getElementById('ai-message-text');
    if(el) el.innerHTML = '"'+text+'"';
  } catch(e) {
    var el = document.getElementById('ai-message-text');
    if(el) el.innerHTML = '"Your wellbeing journey is unique and deeply personal. EvaEraHealth is here to walk alongside you every step of the way. Today, take one small, gentle action for yourself — you deserve it."';
  }
}
