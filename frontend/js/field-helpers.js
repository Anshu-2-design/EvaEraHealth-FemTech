/* Field Helpers & Step Content Builders */

function computeMenQOLDomain(keys, maxRaw){
  var n=keys.length;
  var total=keys.reduce(function(s,k){return s+(S.answers[k]||1);},0);
  return Math.round((total-n)/(maxRaw-n)*20);
}
function setAns(key,val){S.answers[key]=val;}
function setAnsNum(key,val){S.answers[key]=parseFloat(val)||0;}
function toggleCard(key,val,el){
  S.answers[key]=val;
  var parent=el.parentElement;
  parent.querySelectorAll('.card-opt').forEach(function(c){c.classList.remove('selected');});
  el.classList.add('selected');
}
function toggleChip(key,val,el){
  S.answers[key]=val;
  el.closest('.device-chips').querySelectorAll('.device-chip').forEach(function(c){c.classList.remove('selected');});
  el.classList.add('selected');
}
function setLikert(key,val,btn){
  S.answers[key]=val;
  btn.closest('.likert-scale').querySelectorAll('.likert-btn').forEach(function(b){b.classList.remove('selected');});
  btn.classList.add('selected');
}
function setRadio(key,val,opt){
  S.answers[key]=val;
  opt.closest('.radio-group').querySelectorAll('.radio-opt').forEach(function(o){o.classList.remove('selected');});
  opt.classList.add('selected');
}
function calcBMI(){
  var h=parseFloat(S.answers.height_cm)||0;
  var w=parseFloat(S.answers.weight_kg)||0;
  if(h>0&&w>0){
    var bmi=w/((h/100)*(h/100));
    S.answers.bmi=bmi;
    var d=document.getElementById('bmi-display');
    if(d){d.style.display='block';d.textContent='BMI: '+bmi.toFixed(1)+' kg/m²  ('+(bmi<18.5?'Underweight':bmi<23?'Normal':bmi<27.5?'Overweight':'Obese')+')';}
  }
}
function setComor(cond,val,el){
  if(!S.answers.comorbidities)S.answers.comorbidities={};
  S.answers.comorbidities[cond]=val;
  el.closest('.comor-row').querySelectorAll('.comor-opt').forEach(function(o){
    o.classList.remove('sel-no','sel-ctrl','sel-unctrl');
  });
  el.classList.add(val==='No'?'sel-no':val==='Controlled'?'sel-ctrl':'sel-unctrl');
}
function setWD(key,val){
  if(!S.answers.wearable_data)S.answers.wearable_data={};
  S.answers.wearable_data[key]=parseFloat(val)||val;
}
function buildStepContent(id){
  var a=S.answers;
  if(id==='demographics')      return buildDemographics(a);
  if(id==='red_flags')         return buildRedFlags(a);
  if(id==='menqol_vasomotor')  return buildMenQOLVasomotor(a);
  if(id==='menqol_physical')   return buildMenQOLPhysical(a);
  if(id==='menqol_psychosocial') return buildMenQOLPsychosocial(a);
  if(id==='gate_psych')        return buildGatePsych(a);
  if(id==='mental_health')     return buildMentalHealth(a);
  if(id==='menqol_sexual')     return buildMenQOLSexual(a);
  if(id==='gate_sexual')       return buildGateSexual(a);
  if(id==='sleep')             return buildSleep(a);
  if(id==='gate_sleep')        return buildGateSleep(a);
  if(id==='psychosexual_1')    return buildPsychosexual1(a);
  if(id==='psychosexual_2')    return buildPsychosexual2(a);
  if(id==='psychosexual_3')    return buildPsychosexual3(a);
  if(id==='prakriti')          return buildPrakriti(a);
  if(id==='vikriti')           return buildVikriti(a);
  if(id==='wearable_data')     return buildWearableData(a);
  if(id==='comorbidities')     return buildComorbidities(a);
  return '<p>Section loading...</p>';
}
function buildDemographics(a){
  var html='';
  html+='<div class="field-group"><label class="field-label">Your Name</label>';
  html+='<input class="text-input" placeholder="Full name" value="'+(a.name||'')+'" oninput="setAns(\'name\',this.value)"></div>';
  html+='<div class="field-group"><label class="field-label">Age</label>';
  html+='<input class="text-input" type="number" placeholder="e.g. 47" value="'+(a.age||'')+'" oninput="setAnsNum(\'age\',this.value)"></div>';
  html+='<div class="field-group"><label class="field-label">City</label>';
  html+='<input class="text-input" placeholder="e.g. Delhi, Mumbai, Chennai" value="'+(a.city||'')+'" oninput="setAns(\'city\',this.value)"></div>';
  html+='<div class="field-group"><label class="field-label">Country</label><select class="text-input" onchange="setAns(\'country\',this.value)" style="width:100%"><option value="">Select country</option>';
  ['India','UAE','UK','USA','Canada','Australia','Singapore','Nepal','Bangladesh','Sri Lanka','Other'].forEach(function(opt){html+='<option value="'+opt+'"'+(a.country===opt?' selected':'')+'>'+opt+'</option>';});
  html+='</select></div>';
  html+='<div class="field-group"><label class="field-label">Ethnicity</label><div class="cards">';
  ['South Asian','East Asian','Southeast Asian','Middle Eastern','African / Afro-Caribbean','Caucasian / White European','Mixed / Multi-ethnic','Prefer not to say'].forEach(function(opt){var sel=a.ethnicity===opt?'selected':'';html+='<div class="card-opt '+sel+'" onclick="toggleCard(\'ethnicity\',\''+opt+'\',this)">'+opt+'</div>';});
  html+='</div></div>';
  html+='<div class="field-group"><label class="field-label">Height & Weight (for BMI)</label>';
  html+='<div class="height-weight-row">';
  html+='<input class="text-input" type="number" placeholder="Height (cm)" value="'+(a.height_cm||'')+'" oninput="setAnsNum(\'height_cm\',this.value);calcBMI()">';
  html+='<input class="text-input" type="number" placeholder="Weight (kg)" value="'+(a.weight_kg||'')+'" oninput="setAnsNum(\'weight_kg\',this.value);calcBMI()">';
  html+='</div><div class="bmi-display" id="bmi-display">'+(a.bmi?'BMI: '+a.bmi.toFixed(1)+' kg/m²':'')+'</div></div>';
  if(a.bmi)document.getElementById&&setTimeout(function(){var d=document.getElementById('bmi-display');if(d)d.style.display='block';},10);
  html+='<div class="field-group"><label class="field-label">Menstrual Status</label><div class="cards">';
  [['🟢','Normal Cycle','Regular periods, monitoring symptoms'],['🔴','Perimenopause','Irregular cycles, some symptoms'],['🌸','Menopause (<1yr)','No period for < 1 year'],['🌺','Post-Menopause','No period for > 1 year'],['🌙','Surgical Menopause','After surgery/chemo/radiation']].forEach(function(opt){
    var sel=a.stage===opt[1]?'selected':'';
    html+='<div class="card-opt '+sel+'" onclick="toggleCard(\'stage\',\''+opt[1]+'\',this)"><span class="card-icon">'+opt[0]+'</span>'+opt[1]+'<div class="card-desc">'+opt[2]+'</div></div>';
  });
  html+='</div></div>';
  html+='<div class="field-group"><label class="field-label">Marital Status</label><div class="cards">';
  ['Married','Partner','Single','Separated/Divorced','Widowed','Prefer not to say'].forEach(function(opt){
    var sel=a.marital===opt?'selected':'';
    html+='<div class="card-opt '+sel+'" onclick="toggleCard(\'marital\',\''+opt+'\',this)">'+opt+'</div>';
  });
  html+='</div></div>';
  html+='<div class="field-group"><label class="field-label">Occupation</label>';
  html+='<input class="text-input" placeholder="e.g. Teacher, Doctor, Homemaker" value="'+(a.occupation||'')+'" oninput="setAns(\'occupation\',this.value)"></div>';
  html+='<div class="field-group"><label class="field-label">Highest Education</label><div class="cards">';
  ['Up to 12th','Graduate','Post-Graduate','Doctorate','Prefer not to say'].forEach(function(opt){
    var sel=a.education===opt?'selected':'';
    html+='<div class="card-opt '+sel+'" onclick="toggleCard(\'education\',\''+opt+'\',this)">'+opt+'</div>';
  });
  html+='</div></div>';
  html+='<div class="field-group"><label class="field-label">Smoking History</label><div class="cards">';
  ['Never smoked','Ex-smoker (quit >1 year ago)','Ex-smoker (quit <1 year ago)','Current smoker','Prefer not to say'].forEach(function(opt){
    var sel=a.smoking_history===opt?'selected':'';
    html+='<div class="card-opt '+sel+'" onclick="toggleCard(\'smoking_history\',\''+opt+'\',this)">'+opt+'</div>';
  });
  html+='</div></div>';
  html+='<div class="field-group"><label class="field-label">Alcohol Use</label><div class="cards">';
  ['Non-drinker','Occasional (≤1 drink/week)','Moderate (2–7 drinks/week)','Heavy (>7 drinks/week)','Prefer not to say'].forEach(function(opt){
    var sel=a.alcohol_use===opt?'selected':'';
    html+='<div class="card-opt '+sel+'" onclick="toggleCard(\'alcohol_use\',\''+opt+'\',this)">'+opt+'</div>';
  });
  html+='</div></div>';
  // DEF-13: Family history module
  html+='<div class="field-group"><label class="field-label">Family History</label>';
  html+='<div style="font-size:12px;color:var(--slate);margin-bottom:8px">Select all that apply in first-degree relatives (mother, sisters, daughters)</div>';
  html+='<div class="cards" style="grid-template-columns:1fr 1fr">';
  var famHx=[
    {k:'fam_breast_cancer',l:'Breast cancer'},
    {k:'fam_ovarian_cancer',l:'Ovarian cancer'},
    {k:'fam_osteoporosis',l:'Osteoporosis / Fractures'},
    {k:'fam_cvd',l:'Heart disease / Stroke'},
    {k:'fam_diabetes',l:'Type 2 Diabetes'},
    {k:'fam_depression',l:'Depression / Anxiety'},
    {k:'fam_early_menopause',l:'Early menopause (<45y)'},
    {k:'fam_none',l:'None of the above'}
  ];
  famHx.forEach(function(f){
    var sel=a[f.k]?'selected':'';
    html+='<div class="card-opt '+sel+'" onclick="toggleFamHx(\''+f.k+'\',this)" style="font-size:12px">'+f.l+'</div>';
  });
  html+='</div></div>';
  // DEF-14: HRT history and parity fields
  html+='<div class="field-group"><label class="field-label">HRT / Hormone Therapy History</label><div class="cards">';
  ['Never used HRT','Currently using HRT','Used HRT in the past','Considering HRT','Not Sure / Prefer not to say'].forEach(function(opt){
    var sel=a.hrt_history===opt?'selected':'';
    html+='<div class="card-opt '+sel+'" onclick="toggleCard(\'hrt_history\',\''+opt+'\',this)">'+opt+'</div>';
  });
  html+='</div></div>';
  html+='<div class="field-group"><label class="field-label">Parity (Number of pregnancies / deliveries)</label><div class="cards">';
  ['0 (Nulliparous)','1','2','3','4 or more','Prefer not to say'].forEach(function(opt){
    var sel=a.parity===opt?'selected':'';
    html+='<div class="card-opt '+sel+'" onclick="toggleCard(\'parity\',\''+opt+'\',this)">'+opt+'</div>';
  });
  html+='</div></div>';
  return html;
}
function buildRedFlags(a){
  var html='<div style="background:var(--danger-lt);border:1px solid var(--danger);border-radius:10px;padding:14px;margin-bottom:20px;font-size:13px;color:var(--danger)">⚠️ These questions identify symptoms that require immediate medical attention. Please answer honestly.</div>';
  var qs=[
    {key:'rf1',q:'In the past 6 months, have you had any unusual vaginal bleeding (not your normal period)?',opts:['No','Yes','Not sure']},
    {key:'rf2',q:'Do you experience persistent pelvic pain (not related to your period)?',opts:['No','Occasionally','Frequently']},
    {key:'rf3',q:'Have you noticed any new breast lumps, nipple discharge, or skin changes on your breast?',opts:['No','Yes']},
  ];
  qs.forEach(function(q){
    html+='<div class="field-group"><label class="field-label">'+q.q+'</label><div class="radio-group">';
    q.opts.forEach(function(opt,i){
      var sel=a[q.key]===i?'selected':'';
      html+='<div class="radio-opt '+sel+'" onclick="setRadio(\''+q.key+'\','+i+',this)"><input type="radio" '+(a[q.key]===i?'checked':'')+' readonly><label>'+opt+'</label></div>';
    });
    html+='</div></div>';
  });
  return html;
}
function buildMenQOLVasomotor(a){
  var qs=[
    {k:'mq_v1',q:'Hot flushes (sudden feeling of heat spreading over your body)'},
    {k:'mq_v2',q:'Night sweats (sweating that wakes you at night)'},
    {k:'mq_v3',q:'Sweating during the day'},
    {k:'mq_v4',q:'Feeling cold or chilly despite normal temperature'},
    {k:'mq_v5',q:'Heart pounding or racing (palpitations)'},
    {k:'mq_v6',q:'Feeling flushed or red in the face'},
  ];
  return buildMenQOLItems(qs,a);
}
function buildMenQOLPhysical(a){
  var qs=[
    {k:'mq_p1',q:'Feeling tired or lacking energy'},
    {k:'mq_p2',q:'Difficulty sleeping / waking in the night (not due to sweating)'},
    {k:'mq_p3',q:'Aches and pains in joints or muscles'},
    {k:'mq_p4',q:'Changes in skin — dryness, itching, or ageing faster'},
    {k:'mq_p5',q:'Weight gain'},
    {k:'mq_p6',q:'Frequent headaches'},
    {k:'mq_p7',q:'Hair thinning or increased hair loss'},
    {k:'mq_p8',q:'Changes in physical appearance bothering you'},
  ];
  return buildMenQOLItems(qs,a);
}
function buildMenQOLPsychosocial(a){
  var html='';
  var psKeys=['mq_ps1','mq_ps2','mq_ps3','mq_ps4','mq_ps5','mq_ps6','mq_ps7'];
  var filled=psKeys.filter(function(k){return a[k]!==undefined;}).length;
  if(filled>0){
    var score=computeMenQOLDomain(psKeys,56);
    var band=score<8?'Low':score<14?'Moderate':'High';
    var color=score<8?'var(--ok)':score<14?'var(--warn)':'var(--danger)';
    html+='<div style="background:#f9f9f9;border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:12px;color:var(--slate)">';
    html+='Domain score so far: <strong style="color:'+color+'">'+score+'/20 ('+band+')</strong>';
    html+='<div class="domain-score-bar"><div class="domain-score-fill" style="width:'+(score/20*100)+'%;background:'+color+'"></div></div></div>';
  }
  var qs=[
    {k:'mq_ps1',q:'Feeling anxious or nervous'},
    {k:'mq_ps2',q:'Loss of interest in most things you used to enjoy'},
    {k:'mq_ps3',q:'Feeling depressed or sad'},
    {k:'mq_ps4',q:'Being impatient with others or quick-tempered'},
    {k:'mq_ps5',q:'Feeling overwhelmed'},
    {k:'mq_ps6',q:'Difficulty concentrating or feeling foggy / forgetful'},
    {k:'mq_ps7',q:'Feeling less motivated or not wanting to do anything'},
  ];
  return html+buildMenQOLItems(qs,a);
}
function buildMenQOLSexual(a){
  var html='<div style="background:var(--purple-lt);border:1px solid rgba(106,27,154,0.2);border-radius:10px;padding:12px 14px;margin-bottom:16px;font-size:12px;color:var(--purple)">🔒 Your responses here are strictly confidential and protected under DPDP Act 2023.</div>';
  var qs=[
    {k:'mq_s1',q:'Changes in or lack of sexual desire / interest'},
    {k:'mq_s2',q:'Vaginal dryness, discomfort, or pain during intimacy'},
    {k:'mq_s3',q:'Avoiding intimacy (due to discomfort or loss of interest)'},
  ];
  return html+buildMenQOLItems(qs,a);
}
function buildMenQOLItems(qs,a){
  var html='';
  qs.forEach(function(q){
    html+='<div class="likert-item"><div class="likert-q">'+q.q+'</div><div class="likert-scale">';
    for(var v=1;v<=8;v++){
      var sel=a[q.k]===v?'selected':'';
      html+='<button class="likert-btn '+sel+'" onclick="setLikert(\''+q.k+'\','+v+',this)">'+v+'</button>';
    }
    html+='</div><div class="likert-labels"><span>Not at all</span><span>Extremely</span></div></div>';
  });
  return html;
}
function buildGatePsych(a){
  var score=S.answers._menqol_ps_score||0;
  var band=score<8?'Low':score<14?'Moderate':'High';
  var color=score<8?'ok':score<14?'moderate':'severe';
  return '<div class="gate-card">'+
    '<div style="font-size:40px;text-align:center;margin-bottom:12px">🧠</div>'+
    '<div style="text-align:center"><span class="gate-score-badge '+color+'">Emotional Wellbeing: '+band+' ('+score+'/20)</span></div>'+
    '<p style="text-align:center;font-size:13px;color:var(--slate);margin:12px 0">Your psychosocial domain score suggests '+
    (band==='Low'?'mild emotional changes — common in perimenopause.':
     band==='Moderate'?'some emotional difficulties that may benefit from a detailed mental health check-in.':
     'significant emotional challenges that strongly benefit from a mental health assessment.')+
    '</p>'+
    '<div class="gate-q">Would you like to complete a detailed mental health assessment?<br><span style="font-size:12px;font-weight:400;color:var(--slate)">(PHQ-9 · GAD-7 · PSS-8 — takes ~4 minutes)</span></div>'+
    '<div class="gate-btns">'+
    '<button class="gate-btn-yes" onclick="gateChoice(\'gate_psych\',\'yes\')">Yes, continue</button>'+
    '<button class="gate-btn-no" onclick="gateChoice(\'gate_psych\',\'no\')">Skip for now</button>'+
    '</div>'+
    '<p style="font-size:11px;text-align:center;color:#9ca3af;margin-top:16px">You can complete this section later with your clinician</p>'+
    '</div>';
}
function buildGateSexual(a){
  var score=S.answers._menqol_sx_score||0;
  var band=score<8?'Low':score<14?'Moderate':'High';
  var color=score<8?'ok':score<14?'moderate':'severe';
  return '<div class="gate-card">'+
    '<div style="font-size:40px;text-align:center;margin-bottom:12px">💜</div>'+
    '<div style="text-align:center"><span class="gate-score-badge '+color+'">Sexual Wellbeing: '+band+' ('+score+'/20)</span></div>'+
    '<p style="text-align:center;font-size:13px;color:var(--slate);margin:12px 0">Your intimate wellbeing score indicates '+
    (band==='Low'?'mild changes — often addressed through lifestyle and Ayurvedic support.':
     band==='Moderate'?'some challenges that may benefit from a detailed sexual health assessment.':
     'significant concerns that strongly benefit from specialised sexual health support.')+
    '</p>'+
    '<div class="gate-q">Would you like to complete a detailed sexual wellbeing assessment?<br><span style="font-size:12px;font-weight:400;color:var(--slate)">(FSFI · FSDSR · Relationship — takes ~5 minutes)</span></div>'+
    '<div class="gate-btns">'+
    '<button class="gate-btn-yes" onclick="gateChoice(\'gate_sexual\',\'yes\')">Yes, continue</button>'+
    '<button class="gate-btn-no" onclick="gateChoice(\'gate_sexual\',\'no\')">Skip for now</button>'+
    '</div>'+
    '<p style="font-size:11px;text-align:center;color:#9ca3af;margin-top:16px">All responses are confidential — DPDP Act 2023</p>'+
    '</div>';
}
function buildGateSleep(a){
  var isi=S.answers._isi_score||0;
  var band=isi<8?'No Clinically Significant Insomnia':isi<15?'Subthreshold Insomnia':'Moderate–Severe Insomnia'; // DEF-08: corrected to Bastien 2001 labels
  var color=isi<8?'ok':isi<15?'moderate':'severe';
  return '<div class="gate-card">'+
    '<div style="font-size:40px;text-align:center;margin-bottom:12px">🌙</div>'+
    '<div style="text-align:center"><span class="gate-score-badge '+color+'">Sleep Difficulty: '+band+' (ISI '+isi+'/28)</span></div>'+
    '<p style="text-align:center;font-size:13px;color:var(--slate);margin:12px 0">'+
    (band==='Subthreshold Insomnia'?'Your sleep score suggests subthreshold insomnia — early sleep support can prevent this from worsening.':
     'Your sleep score indicates severe insomnia. A structured sleep recovery programme is strongly recommended.')+
    '</p>'+
    '<div class="gate-q">Would you like a personalised sleep recovery programme included in your care plan?</div>'+
    '<div class="gate-btns">'+
    '<button class="gate-btn-yes" onclick="gateChoice(\'gate_sleep\',\'yes\')">Yes, include it</button>'+
    '<button class="gate-btn-no" onclick="gateChoice(\'gate_sleep\',\'no\')">Continue without</button>'+
    '</div>'+
    '</div>';
}
function buildMentalHealth(a){
  var html='<div class="section-label">PHQ-9 — Depression Screen</div>';
  var phqQs=['Little interest or pleasure in doing things','Feeling down, depressed, or hopeless','Trouble falling or staying asleep, or sleeping too much','Feeling tired or having little energy','Poor appetite or overeating','Feeling bad about yourself — or that you are a failure','Trouble concentrating on things','Moving or speaking so slowly that other people could have noticed, or being fidgety/restless','Thoughts that you would be better off dead, or of hurting yourself'];
  var phqOpts=['Not at all','Several days','More than half the days','Nearly every day'];
  phqQs.forEach(function(q,i){
    html+='<div class="likert-item"><div class="likert-q">'+(i+1)+'. '+q+(i===8?' <strong style="color:var(--danger)">[Important — please answer carefully]</strong>':'')+'</div><div class="radio-group" style="gap:6px">';
    phqOpts.forEach(function(opt,v){
      var sel=a['phq_'+i]===v?'selected':'';
      html+='<div class="radio-opt '+sel+'" onclick="setRadio(\'phq_'+i+'\','+v+',this)"><input type="radio" '+(sel?'checked':'')+' readonly><label>'+opt+'</label></div>';
    });
    html+='</div></div>';
  });
  html+='<div class="section-label" style="margin-top:24px">GAD-7 — Anxiety Screen</div>';
  var gadQs=['Feeling nervous, anxious, or on edge','Not being able to stop or control worrying','Worrying too much about different things','Trouble relaxing','Being so restless that it is hard to sit still','Becoming easily annoyed or irritable','Feeling afraid, as if something awful might happen'];
  gadQs.forEach(function(q,i){
    html+='<div class="likert-item"><div class="likert-q">'+(i+1)+'. '+q+'</div><div class="radio-group" style="gap:6px">';
    phqOpts.forEach(function(opt,v){
      var sel=a['gad_'+i]===v?'selected':'';
      html+='<div class="radio-opt '+sel+'" onclick="setRadio(\'gad_'+i+'\','+v+',this)"><input type="radio" '+(sel?'checked':'')+' readonly><label>'+opt+'</label></div>';
    });
    html+='</div></div>';
  });
  html+='<div class="section-label" style="margin-top:24px">PSS-8 — Perceived Stress</div>';
  html+='<p style="font-size:12px;color:var(--slate);margin-bottom:12px">In the <strong>last month</strong>, how often have you felt…</p>';
  var pssQs=['Upset because of something that happened unexpectedly','Unable to control important things in your life','Nervous and stressed','Confident about your ability to handle personal problems','Felt that things were going your way','Unable to cope with all the things you had to do','Able to control irritations in your life','Felt that you were on top of things'];
  var pssOpts=['Never','Almost Never','Sometimes','Fairly Often','Very Often'];
  var pssRev=[false,false,false,true,true,false,true,true];
  pssQs.forEach(function(q,i){
    html+='<div class="likert-item"><div class="likert-q">'+(i+1)+'. '+q+(pssRev[i]?' <span style="font-size:10px;color:var(--teal)">(reverse)</span>':'')+'</div><div class="likert-scale">';
    for(var v=0;v<=4;v++){
      var sel=a['pss_'+i]===v?'selected':'';
      html+='<button class="likert-btn '+sel+'" onclick="setLikert(\'pss_'+i+'\','+v+',this)" title="'+pssOpts[v]+'">'+v+'</button>';
    }
    html+='</div><div class="likert-labels"><span>Never</span><span>Very Often</span></div></div>';
  });
  return html;
}
function buildSleep(a){
  var html='';
  var qs=[
    {k:'isi_0',q:'Difficulty falling asleep',labels:['None','Mild','Moderate','Severe','Very Severe']},
    {k:'isi_1',q:'Difficulty staying asleep or waking in the middle of the night',labels:['None','Mild','Moderate','Severe','Very Severe']},
    {k:'isi_2',q:'Early morning awakening',labels:['None','Mild','Moderate','Severe','Very Severe']},
    {k:'isi_3',q:'How satisfied / dissatisfied are you with your current sleep pattern?',labels:['Very Satisfied','Satisfied','Neutral','Dissatisfied','Very Dissatisfied']},
    {k:'isi_4',q:'How noticeable to others do you think your sleep problem is in terms of impairing quality of life?',labels:['Not at all','A little','Somewhat','Much','Very Much']},
    {k:'isi_5',q:'How worried / distressed are you about your current sleep problem?',labels:['Not at all','A little','Somewhat','Much','Very Much']},
    {k:'isi_6',q:'To what extent do you consider your sleep problem to interfere with your daily functioning?',labels:['Not at all','A little','Somewhat','Much','Very Much']},
  ];
  qs.forEach(function(q){
    html+='<div class="likert-item"><div class="likert-q">'+q.q+'</div><div class="likert-scale">';
    for(var v=0;v<=4;v++){
      var sel=a[q.k]===v?'selected':'';
      html+='<button class="likert-btn '+sel+'" onclick="setLikert(\''+q.k+'\','+v+',this)" title="'+q.labels[v]+'">'+v+'</button>';
    }
    html+='</div><div class="likert-labels"><span>'+q.labels[0]+'</span><span>'+q.labels[4]+'</span></div></div>';
  });
  return html;
}
function buildPsychosexual1(a){
  var html='';
  html+='<div style="display:flex;gap:6px;margin-bottom:14px;align-items:center"><div style="flex:1;height:4px;background:var(--rose);border-radius:2px"></div><div style="flex:1;height:4px;background:rgba(0,0,0,0.1);border-radius:2px"></div><div style="flex:1;height:4px;background:rgba(0,0,0,0.1);border-radius:2px"></div><span style="font-size:11px;color:var(--slate);white-space:nowrap;margin-left:6px">Page 1 of 3</span></div>';
  html+='<div style="background:var(--purple-lt);border:1px solid rgba(106,27,154,0.2);border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:12px;color:var(--purple)">🔒 Strictly confidential — DPDP Act 2023 §6(1). Based on the past 4 weeks.</div>';
  html+='<div style="background:linear-gradient(135deg,#F0F9FF,#EFF6FF);border:1.5px solid #93C5FD;border-radius:14px;padding:14px 16px;margin-bottom:14px">';
  html+='<div style="font-size:13px;font-weight:700;color:#1E3A5F;margin-bottom:8px">💙 Sexual activity status</div>';
  html+='<div style="font-size:12px;color:var(--slate);margin-bottom:10px">This helps us interpret your responses correctly.</div>';
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  [['sexually_active','Sexually active','Currently engaging in or interested in sexual activity'],['not_active_by_choice','Not active — by choice','Choosing not to be sexually active'],['not_active_health','Not active — health reason','Due to health, pain, or physical reason'],['prefer_not_say','Prefer not to say','Answer without indicating status']].forEach(function(opt){
    var sel=a.sexual_activity_status===opt[0]?'selected':'';
    html+='<div class="card-opt '+sel+'" onclick="setSexualActivityStatus(\''+opt[0]+'\',this)"><strong>'+opt[1]+'</strong><div class="card-desc" style="margin-top:3px;font-size:11px">'+opt[2]+'</div></div>';
  });
  html+='</div></div>';
  html+='<div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:12px"><strong>Rating scale:</strong> <span style="color:var(--slate)">0 = No sexual activity / Did not apply &nbsp;·&nbsp; 1 = Almost never &nbsp;·&nbsp; 3 = Sometimes &nbsp;·&nbsp; 5 = Almost always</span></div>';
  html+='<div class="section-label">💕 Desire (Items 1–2)</div>';
  html+='<div style="font-size:11px;color:var(--slate);margin-bottom:8px">Sexual desire includes wanting to have sex, thinking about sex, or feeling frustrated due to lack of sex.</div>';
  var d=['How often did you feel sexual desire or interest?','How would you rate your level of sexual desire or interest?'];
  d.forEach(function(q,idx){var n=idx+1;html+='<div class="likert-item"><div class="likert-q">'+n+'. '+q+'</div><div class="likert-scale">';for(var v=0;v<=5;v++){var s=a['fsfi_'+n]===v?'selected':'';html+='<button class="likert-btn '+s+'" onclick="setLikert(\'fsfi_'+n+'\','+v+',this)">'+v+'</button>';}html+='</div><div class="likert-labels"><span>Never</span><span>Always</span></div></div>';});
  html+='<div class="section-label" style="margin-top:16px">🌊 Arousal (Items 3–6)</div>';
  html+='<div style="font-size:11px;color:var(--slate);margin-bottom:8px">Sexual arousal is a feeling that includes warmth or tingling in the genitals, lubrication (wetness), or muscle contractions.</div>';
  var ar=['How often did you feel sexually aroused during sexual activity?','How would you rate your level of sexual arousal during sexual activity?','How confident were you about becoming sexually aroused?','How often were you satisfied with your arousal during sexual activity?'];
  ar.forEach(function(q,idx){var n=idx+3;html+='<div class="likert-item"><div class="likert-q">'+n+'. '+q+'</div><div class="likert-scale">';for(var v=0;v<=5;v++){var s=a['fsfi_'+n]===v?'selected':'';html+='<button class="likert-btn '+s+'" onclick="setLikert(\'fsfi_'+n+'\','+v+',this)">'+v+'</button>';}html+='</div><div class="likert-labels"><span>Never</span><span>Always</span></div></div>';});
  return html;
}
function buildPsychosexual2(a){
  var html='';
  html+='<div style="display:flex;gap:6px;margin-bottom:14px;align-items:center"><div style="flex:1;height:4px;background:var(--rose);border-radius:2px"></div><div style="flex:1;height:4px;background:var(--rose);border-radius:2px"></div><div style="flex:1;height:4px;background:rgba(0,0,0,0.1);border-radius:2px"></div><span style="font-size:11px;color:var(--slate);white-space:nowrap;margin-left:6px">Page 2 of 3</span></div>';
  html+='<div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:12px"><strong>Rating:</strong> <span style="color:var(--slate)">0 = No sexual activity &nbsp;·&nbsp; 1 = Almost never &nbsp;·&nbsp; 3 = Sometimes &nbsp;·&nbsp; 5 = Almost always</span></div>';
  html+='<div class="section-label">💧 Lubrication (Items 7–10)</div>';
  html+='<div style="font-size:11px;color:var(--slate);margin-bottom:8px">Lubrication refers to vaginal wetness or moisture during sexual activity.</div>';
  var lub=['How often did you become lubricated (wet) during sexual activity?','How difficult was it to become lubricated (wet) during sexual activity?','How often did you maintain your lubrication until completion?','How difficult was it to maintain your lubrication to completion?'];
  lub.forEach(function(q,idx){var n=idx+7;html+='<div class="likert-item"><div class="likert-q">'+n+'. '+q+'</div><div class="likert-scale">';for(var v=0;v<=5;v++){var s=a['fsfi_'+n]===v?'selected':'';html+='<button class="likert-btn '+s+'" onclick="setLikert(\'fsfi_'+n+'\','+v+',this)">'+v+'</button>';}html+='</div><div class="likert-labels"><span>Never</span><span>Always</span></div></div>';});
  html+='<div class="section-label" style="margin-top:16px">✨ Orgasm (Items 11–13)</div>';
  html+='<div style="font-size:11px;color:var(--slate);margin-bottom:8px">Orgasm is the release of tension that builds during sexual stimulation.</div>';
  var org=['How often did you reach orgasm?','How difficult was it to reach orgasm during sexual stimulation or intercourse?','How satisfied were you with your ability to reach orgasm?'];
  org.forEach(function(q,idx){var n=idx+11;html+='<div class="likert-item"><div class="likert-q">'+n+'. '+q+'</div><div class="likert-scale">';for(var v=0;v<=5;v++){var s=a['fsfi_'+n]===v?'selected':'';html+='<button class="likert-btn '+s+'" onclick="setLikert(\'fsfi_'+n+'\','+v+',this)">'+v+'</button>';}html+='</div><div class="likert-labels"><span>Never</span><span>Always</span></div></div>';});
  html+='<div class="section-label" style="margin-top:16px">🌸 Satisfaction (Items 14–16)</div>';
  html+='<div style="font-size:11px;color:var(--slate);margin-bottom:8px">Satisfaction includes emotional closeness, relationship quality, and your overall sexual experience.</div>';
  var sat=['How satisfied have you been with the emotional closeness during sex?','How satisfied have you been with your sexual relationship with your partner?','How satisfied have you been with your overall sex life?'];
  sat.forEach(function(q,idx){var n=idx+14;html+='<div class="likert-item"><div class="likert-q">'+n+'. '+q+'</div><div class="likert-scale">';for(var v=0;v<=5;v++){var s=a['fsfi_'+n]===v?'selected':'';html+='<button class="likert-btn '+s+'" onclick="setLikert(\'fsfi_'+n+'\','+v+',this)">'+v+'</button>';}html+='</div><div class="likert-labels"><span>Not satisfied</span><span>Very satisfied</span></div></div>';});
  return html;
}
function buildPsychosexual3(a){
  var html='';
  html+='<div style="display:flex;gap:6px;margin-bottom:14px;align-items:center"><div style="flex:1;height:4px;background:var(--rose);border-radius:2px"></div><div style="flex:1;height:4px;background:var(--rose);border-radius:2px"></div><div style="flex:1;height:4px;background:var(--rose);border-radius:2px"></div><span style="font-size:11px;color:var(--slate);white-space:nowrap;margin-left:6px">Page 3 of 3</span></div>';
  html+='<div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:12px"><strong>Rating:</strong> <span style="color:var(--slate)">0 = No sexual activity &nbsp;·&nbsp; 1 = Almost never &nbsp;·&nbsp; 3 = Sometimes &nbsp;·&nbsp; 5 = Almost always</span></div>';
  html+='<div class="section-label">🩹 Pain & Discomfort (Items 17–19)</div>';
  html+='<div style="font-size:11px;color:var(--slate);margin-bottom:8px">These questions ask about any discomfort or pain during or after sexual activity. Select 0 if you had no sexual activity.</div>';
  var pain=['How often did you experience discomfort or pain during vaginal penetration?','How often did you experience discomfort or pain following vaginal penetration?','How would you rate your level of discomfort or pain during or following vaginal penetration?'];
  pain.forEach(function(q,idx){var n=idx+17;html+='<div class="likert-item"><div class="likert-q">'+n+'. '+q+'</div><div class="likert-scale">';for(var v=0;v<=5;v++){var s=a['fsfi_'+n]===v?'selected':'';html+='<button class="likert-btn '+s+'" onclick="setLikert(\'fsfi_'+n+'\','+v+',this)">'+v+'</button>';}html+='</div><div class="likert-labels"><span>Never / No pain</span><span>Always / Severe</span></div></div>';});
  html+='<div class="section-label" style="margin-top:20px">😔 Sexual Distress — FSDSR</div>';
  html+='<div style="font-size:11px;color:var(--slate);margin-bottom:8px">How much has each of the following distressed or bothered you in the past 30 days? &nbsp; 0 = Not at all &nbsp;·&nbsp; 4 = Extremely</div>';
  var fds=['Distressed about your sex life','Unhappy about your sexual relationship','Dissatisfied with your sex life','Unhappy about how often you have sex','Worried that your sexual desire is too low','Experiencing a problem with sexual desire','Self-conscious about your sexuality','Frustrated about your sex life','Bothered by how often you are interested in sex','Difficulty being sexually aroused','Difficulty reaching orgasm','Feel your body does not respond to sexual stimulation','Pain during sexual intercourse'];
  fds.forEach(function(q,i){html+='<div class="likert-item"><div class="likert-q">'+(i+1)+'. '+q+'</div><div class="likert-scale">';for(var v=0;v<=4;v++){var s=a['fsdsr_'+i]===v?'selected':'';html+='<button class="likert-btn '+s+'" onclick="setLikert(\'fsdsr_'+i+'\','+v+',this)">'+v+'</button>';}html+='</div><div class="likert-labels"><span>Not at all</span><span>Extremely</span></div></div>';});
  html+='<div class="section-label" style="margin-top:20px">💑 Relationship Wellbeing</div>';
  html+='<div style="background:#FFF7ED;border:1px solid #FFB300;border-radius:10px;padding:10px 14px;margin-bottom:10px;font-size:12px;color:#92400E"><strong>ℹ Research Note:</strong> These items are EvaEraHealth proprietary, undergoing validation. For wellness awareness only.</div>';
  html+='<div style="font-size:11px;color:var(--slate);margin-bottom:8px">0 = Not at all / Very poor &nbsp;·&nbsp; 4 = Completely / Excellent</div>';
  var mcs=['How satisfied are you with your current intimate relationship?','How well does your partner understand your menopause-related changes?','How much does your intimate relationship support your wellbeing?','How supported do you feel by your partner regarding your health?','Overall, how would you rate the quality of your intimate relationship?'];
  mcs.forEach(function(q,i){html+='<div class="likert-item"><div class="likert-q">'+(i+1)+'. '+q+'</div><div class="likert-scale">';for(var v=0;v<=4;v++){var s=a['mcss_'+(i+1)]===v?'selected':'';html+='<button class="likert-btn '+s+'" onclick="setLikert(\'mcss_'+(i+1)+'\','+v+',this)">'+v+'</button>';}html+='</div><div class="likert-labels"><span>Not at all</span><span>Completely</span></div></div>';});
  html+='<div style="background:linear-gradient(135deg,#F0FDF4,#ECFDF5);border:1px solid #86EFAC;border-radius:12px;padding:14px;margin-top:16px;font-size:12px;color:#166534"><strong>✅ Sexual Wellbeing Assessment complete.</strong> Your responses are strictly confidential and will personalise your care recommendations. 💚</div>';
  return html;
}
function buildPrakriti(a){
  var html='<p style="font-size:13px;color:var(--slate);margin-bottom:16px">Read each description and select the one that has been <strong>most true throughout your life</strong> — not how you feel right now.</p>';
  var prakritis=[
    {v:'Vata',icon:'🌬️',title:'Vata — Air & Space',desc:'Naturally slim, creative, quick-thinking, enthusiastic. Tend to be irregular in habits, get cold easily, experience anxiety under stress. Light sleeper. Skin tends to dry.'},
    {v:'Pitta',icon:'🔥',title:'Pitta — Fire & Water',desc:'Medium build, ambitious, sharp intellect, strong digestion. Can be intense or irritable under stress. Warm body temperature, prone to inflammation. Moderate sleep.'},
    {v:'Kapha',icon:'🌊',title:'Kapha — Earth & Water',desc:'Sturdy build, calm, compassionate, enduring stamina. Tend to gain weight easily, slow metabolism. Deep sleeper. Prone to congestion, feels heavier emotionally.'},
    {v:'Vata-Pitta',icon:'🌀',title:'Vata-Pitta Dual',desc:'Mix of Vata and Pitta qualities — creative and driven, but prone to anxiety and inflammation. Variable energy with bursts of intensity.'},
    {v:'Tridosha',icon:'⚖️',title:'Tridosha — Balanced',desc:'Relatively equal Vata, Pitta and Kapha. Adaptable and resilient. True Tridosha is rare — often indicates uncertainty about type.'},
  ];
  html+='<div class="cards" style="grid-template-columns:1fr">';
  prakritis.forEach(function(p){
    var sel=a.prakriti===p.v?'selected':'';
    html+='<div class="card-opt '+sel+'" onclick="toggleCard(\'prakriti\',\''+p.v+'\',this)" style="text-align:left;padding:16px 18px">';
    html+='<span class="card-icon">'+p.icon+'</span><strong style="font-size:14px">'+p.title+'</strong><div class="card-desc" style="margin-top:6px;font-size:12px;line-height:1.5">'+p.desc+'</div></div>';
  });
  html+='</div>';
  return html;
}
function buildVikriti(a){
  var html='<p style="font-size:13px;color:var(--slate);margin-bottom:16px">Now choose the description that best reflects <strong>how you are feeling right now</strong> — your current imbalance state.</p>';
  var vikritis=[
    {v:'Vata_excess',icon:'🍃',name:'Vata Excess',desc:'Feeling scattered, anxious, dry, cold, restless. Difficulty sleeping, racing thoughts, irregular appetite, joints aching.'},
    {v:'Pitta_excess',icon:'🌶️',name:'Pitta Excess',desc:'Feeling hot, irritable, inflamed, overly critical. Hot flushes intense, skin flushed or sensitive, digestion acidic, perfectionistic.'},
    {v:'Kapha_excess',icon:'🌧️',name:'Kapha Excess',desc:'Feeling heavy, sluggish, foggy, unmotivated. Weight gain, congestion, low mood, wanting to sleep more, emotionally withdrawn.'},
    {v:'Vata_Pitta_excess',icon:'⚡',name:'Vata-Pitta Excess',desc:'Combination of anxiety and heat — restless mind with hot flushes, irritability with fear, disturbed sleep with sweating.'},
    {v:'Mixed',icon:'🌪️',name:'Mixed / Unsure',desc:'Experiencing symptoms from multiple doshas — common during perimenopause when all three can be disturbed simultaneously.'},
    {v:'Balanced',icon:'🌸',name:'Relatively Balanced',desc:'Feeling generally well — perhaps mild symptoms that are manageable. Good energy and mood most days.'},
  ];
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
  vikritis.forEach(function(v){
    var sel=a.vikriti===v.v?'selected':'';
    html+='<div class="vikriti-card '+sel+'" onclick="S.answers.vikriti=\''+v.v+'\';this.closest(\'.field-group\')||this.parentElement.querySelectorAll(\'.vikriti-card\').forEach(function(c){c.classList.remove(\'selected\')});this.classList.add(\'selected\');setAns(\'vikriti\',\''+v.v+'\')">';
    html+='<span class="vikriti-icon">'+v.icon+'</span><div class="vikriti-name">'+v.name+'</div><div class="vikriti-desc">'+v.desc+'</div></div>';
  });
  html+='</div>';
  return html;
}
function buildWearableData(a){
  var wd=a.wearable_data||{};
  var devices=['None / No wearable','Apple Health','Apple Watch','Fitbit','Garmin','Samsung Galaxy Watch','Whoop','Oura Ring','Xiaomi Mi Band','Other'];
  var html='<div style="margin-bottom:16px"><label class="field-label">Your Wearable Device</label><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">';
  devices.forEach(function(d){
    var sel=a.wearable===d;
    html+='<div onclick="setAns(\'wearable\',\''+d+'\');toggleWearableInputs(\''+d+'\');this.parentElement.querySelectorAll(\'div\').forEach(function(x){x.style.borderColor=\'#E5E7EB\';x.style.background=\'#fff\';x.style.color=\'var(--slate)\'});this.style.borderColor=\'var(--teal)\';this.style.background=\'var(--teal-lt)\';this.style.color=\'var(--teal)\'" style="padding:8px 14px;border-radius:20px;border:2px solid '+(sel?'var(--teal)':'#E5E7EB')+';background:'+(sel?'var(--teal-lt)':'#fff')+';color:'+(sel?'var(--teal)':'var(--slate)')+';font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s">'+d+'</div>';
  });
  html+='</div></div>';
  var hasDevice=a.wearable&&a.wearable!=='None / No wearable';
  html+='<div id="wearable-inputs" style="display:'+(hasDevice?'block':'none')+'">';
  html+='<div style="background:linear-gradient(135deg,#E0F7FA,#F0FDF4);border-radius:12px;padding:14px 16px;margin-bottom:14px"><p style="font-size:12px;font-weight:700;color:var(--teal);margin-bottom:4px">📊 Enter 30-day averages from your device app</p><p style="font-size:11px;color:var(--slate)">All fields optional — enter what is available in your app</p></div>';
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
  [{k:'avg_rhr',l:'Resting Heart Rate',u:'bpm',ph:'e.g. 72',h:'Normal: 60–80 bpm'},
   {k:'avg_hrv',l:'HRV (RMSSD)',u:'ms',ph:'e.g. 38',h:'Higher = better recovery'},
   {k:'avg_spo2',l:'Blood Oxygen SpO₂',u:'%',ph:'e.g. 97',h:'Normal: 95–100%'},
   {k:'avg_sleep',l:'Avg Sleep',u:'hrs',ph:'e.g. 6.5',h:'Target: 7–9 hours'},
   {k:'avg_steps',l:'Daily Steps',u:'steps',ph:'e.g. 7500',h:'Target: >8,000/day'},
   {k:'avg_stress',l:'Stress Score',u:'/100',ph:'e.g. 42',h:'Lower = less stressed'},
   {k:'night_sweats_per_night',l:'Night Sweats',u:'per night',ph:'e.g. 2',h:'0 = none'},
   {k:'avg_active_minutes',l:'Active Minutes',u:'min/day',ph:'e.g. 30',h:'Target: ≥30 min'},
   {k:'resp_rate',l:'Resp. Rate',u:'breaths/min',ph:'e.g. 16',h:'Normal: 12–20'},
   {k:'avg_skin_temp',l:'Skin Temp Variation',u:'°C',ph:'e.g. 0.5',h:'Normal: <1°C variation'}
  ].forEach(function(f){
    html+='<div style="background:#fff;border:1.5px solid #E5E7EB;border-radius:10px;padding:12px;transition:border-color 0.2s" onmouseenter="this.style.borderColor=\'var(--teal)\'" onmouseleave="this.style.borderColor=\'#E5E7EB\'">';
    html+='<div style="font-size:10px;font-weight:700;color:var(--slate)">'+f.l+' <span style="color:var(--rose);font-weight:400">'+f.u+'</span></div>';
    html+='<div style="font-size:10px;color:#9CA3AF;margin-bottom:6px">'+f.h+'</div>';
    html+='<input type="number" step="any" value="'+(wd[f.k]||'')+'" placeholder="'+f.ph+'" oninput="setWFld(\''+f.k+'\',this.value)" style="width:100%;border:none;border-top:1px solid #F0F0F0;padding:5px 0 0;font-size:16px;font-weight:700;color:var(--navy);outline:none;background:transparent">';
    html+='</div>';
  });
  html+='</div></div>';
  return html;
}
function setWFld(k,v){if(!S.answers.wearable_data)S.answers.wearable_data={};S.answers.wearable_data[k]=parseFloat(v)||v;}
function toggleWearableInputs(d){var el=document.getElementById('wearable-inputs');if(el)el.style.display=(d&&d!=='None / No wearable')?'block':'none';}
function buildComorbidities(a){
  var comor=a.comorbidities||{};
  var conditions=[
    {n:'Hypertension',icon:'❤️'},{n:'Diabetes',icon:'🩸'},{n:'Hypothyroidism',icon:'🦋'},
    {n:'Hyperthyroidism',icon:'⚡'},{n:'Hyperlipidemia',icon:'💊'},{n:'Anaemia',icon:'🩺'},
    {n:'PCOD',icon:'🌿'},{n:'Osteoporosis',icon:'🦴'},{n:'Heart Disease',icon:'🫀'},
    {n:'CKD',icon:'💧'},{n:'Autoimmune Disorder',icon:'🛡️'},{n:'Stroke (history)',icon:'🧠'},{n:'Cancer (history)',icon:'🎗️'}
  ];
  var opts=['No','Controlled','Uncontrolled','Not Sure'];
  var cols={No:'#2E7D32',Controlled:'#E65100',Uncontrolled:'#C62828','Not Sure':'#5C6BC0'};
  var html='<p style="font-size:12px;color:var(--slate);margin-bottom:14px;line-height:1.5">Select your current status for each condition. Choose <em>Not Sure</em> if uncertain — your clinician will clarify during the consultation.</p>';
  html+='<div style="display:grid;gap:10px">';
  conditions.forEach(function(cond){
    var cur=comor[cond.n]||'';
    var cid='comor_'+cond.n.replace(/[^a-z]/gi,'');
    html+='<div id="'+cid+'" style="background:#FAFBFC;border:2px solid '+(cur&&cur!=='No'?cols[cur]||'#E5E7EB':'#E5E7EB')+';border-radius:12px;padding:12px 14px;transition:all 0.2s">';
    html+='<div style="display:flex;align-items:center;margin-bottom:8px"><span style="font-size:18px;margin-right:8px">'+cond.icon+'</span><span style="font-size:13px;font-weight:600;color:var(--navy)">'+cond.n+'</span></div>';
    html+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">';
    opts.forEach(function(opt){
      var sel=cur===opt; var col=cols[opt];
      html+='<div onclick="setComordiity(\''+cond.n+'\',\''+opt+'\',\''+cid+'\')" style="text-align:center;padding:7px 2px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:700;border:2px solid '+(sel?col:'#E5E7EB')+';background:'+(sel?col+'20':'#fff')+';color:'+(sel?col:'#9CA3AF')+';transition:all 0.15s">'+opt+'</div>';
    });
    html+='</div></div>';
  });
  html+='</div>';
  // DEF-10: Medication history
  html+='<div style="margin-top:20px"><div class="section-label">Current Medications</div>';
  html+='<div style="font-size:12px;color:var(--slate);margin-bottom:10px">Select any medications you are currently taking. This helps clinicians interpret your scores accurately.</div>';
  html+='<div class="cards" style="grid-template-columns:1fr 1fr">';
  var meds=[
    {k:'med_ssri',l:'Antidepressants (SSRIs/SNRIs)'},
    {k:'med_hrt',l:'Hormone Replacement Therapy'},
    {k:'med_betablocker',l:'Beta-blockers'},
    {k:'med_statin',l:'Cholesterol medication (Statins)'},
    {k:'med_thyroid',l:'Thyroid medication'},
    {k:'med_insulin',l:'Insulin / Diabetes medication'},
    {k:'med_antihyp',l:'Blood pressure medication'},
    {k:'med_sleep',l:'Sleep medication / Sedatives'},
    {k:'med_nsaid',l:'Regular pain relief (NSAIDs)'},
    {k:'med_none',l:'No regular medications'}
  ];
  meds.forEach(function(m){
    var sel=a[m.k]?'selected':'';
    html+='<div class="card-opt '+sel+'" onclick="toggleMed(\''+m.k+'\',this)" style="font-size:12px">'+m.l+'</div>';
  });
  html+='</div></div>';
  return html;
}
function setComordiity(name,val,cardId){
  if(!S.answers.comorbidities) S.answers.comorbidities={};
  S.answers.comorbidities[name]=val;
  var card=document.getElementById(cardId);
  if(!card) return;
  var cols={No:'#2E7D32',Controlled:'#E65100',Uncontrolled:'#C62828','Not Sure':'#5C6BC0'};
  var btns=card.querySelectorAll('div[onclick]');
  btns.forEach(function(b){
    var m=b.getAttribute('onclick').match(/'([^']+)','([^']+)'/);
    if(!m) return;
    var bval=m[1]; var col=cols[bval];
    var sel=bval===val;
    b.style.borderColor=sel?col:'#E5E7EB';
    b.style.background=sel?col+'20':'#fff';
    b.style.color=sel?col:'#9CA3AF';
  });
  card.style.borderColor=(val&&val!=='No')?(cols[val]||'#E65100'):'#E5E7EB';
}
