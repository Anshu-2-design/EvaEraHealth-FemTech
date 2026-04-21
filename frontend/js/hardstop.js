/* Hard Stop Screens & Step Summary */

function checkRedFlags(){
  var a=S.answers;
  var opts=[['No','Yes','Not sure'],['No','Occasionally','Frequently'],['No','Yes']];
  S.redFlagsTriggered=[];
  if(a.rf1!==undefined&&opts[0][a.rf1]==='Yes') S.redFlagsTriggered.push('Unusual vaginal bleeding');
  if(a.rf2!==undefined&&opts[1][a.rf2]==='Frequently') S.redFlagsTriggered.push('Persistent pelvic pain');
  if(a.rf3!==undefined&&opts[2][a.rf3]==='Yes') S.redFlagsTriggered.push('Breast changes');
}
function showGyneHardStop(){
  S.flags.gyneRedFlag=true;
  showScreen('gyne-stop-screen');
  var flagList=S.redFlagsTriggered.map(function(f){return '<li>'+f+'</li>';}).join('');
  document.getElementById('gyne-stop-body').innerHTML=
    '<div class="hard-stop-card">'+
    '<span class="hs-icon">🏥</span>'+
    '<h2>Immediate Gynaecology Consultation Required</h2>'+
    '<p>Your responses indicate symptoms that require prompt medical evaluation. For your safety, please see a gynaecologist before continuing this wellness assessment.</p>'+
    '<div class="hs-flags"><strong>Symptoms flagged:</strong><ul>'+flagList+'</ul></div>'+
    '<div style="margin-bottom:10px">'+
    '<a href="tel:+918069050000" style="display:block;background:var(--rose-deep);color:#fff;text-align:center;padding:14px 20px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:8px">📞 Call EvaEraHealth Clinic: +91 80690 50000</a>'+
    '<a href="mailto:clinic@evaerahealth.in?subject=Urgent+Gynaecology+Consultation" style="display:block;background:var(--teal);color:#fff;text-align:center;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none">✉️ Email: clinic@evaerahealth.in</a>'+
    '</div>'+
    '<div style="margin-top:20px;display:flex;flex-direction:column;gap:10px;align-items:center">'+
    '<button onclick="overrideGyneStop()" style="background:linear-gradient(135deg,var(--rose-deep),var(--rose));color:#fff;border:none;padding:14px 28px;border-radius:24px;font-size:15px;font-weight:700;cursor:pointer;width:100%;max-width:340px">→ Continue Assessment (Red Flag Retained)</button>'+
    '<div style="font-size:12px;color:var(--slate)">Gynaecology referral will appear in your care plan</div>'+
    '<button onclick="startProcessing()" style="background:transparent;color:var(--teal);border:1.5px solid var(--teal);padding:10px 24px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;width:100%;max-width:340px">📋 View Partial Wellness Report</button>'+
    '</div>'+
    '</div>';
}
function overrideGyneStop(){
  showScreen('form-screen');
  S.currentStep++;
  if(S.currentStep>=STEPS.length){startProcessing();return;}
  renderStepDots();renderStep(S.currentStep);updateDots();
}
function showPsychiatricHardStop(){
  showScreen('psych-stop-screen');
  document.getElementById('psych-stop-body').innerHTML=
    '<div class="hard-stop-card">'+
    '<span class="hs-icon">💙</span>'+
    '<h2>You Are Not Alone</h2>'+
    '<p>You mentioned thoughts about self-harm. This takes courage to share. Please reach out for immediate support — trained counsellors are available right now.</p>'+
    '<div class="crisis-box">'+
    '<h3>🆘 Immediate Support Lines</h3>'+
    '<div class="crisis-num">iCall: <a href="tel:9152987821" style="color:var(--danger)">9152987821</a></div>'+
    '<p>Vandrevala Foundation 24/7: <strong><a href="tel:18602662345" style="color:var(--danger)">1860-2662-345</a></strong></p>'+
    '<p>NIMHANS Helpline: <strong><a href="tel:08046110007" style="color:var(--danger)">080-46110007</a></strong></p>'+
    '<p>SNEHI: <strong><a href="tel:04424640050" style="color:var(--danger)">044-24640050</a></strong></p>'+
    '</div>'+
    '<div style="margin-bottom:10px">'+
    '<a href="tel:+918069050000" style="display:block;background:#6A1B9A;color:#fff;text-align:center;padding:14px 20px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:8px">📞 EvaEraHealth Clinic: +91 80690 50000</a>'+
    '<a href="mailto:clinic@evaerahealth.in?subject=Urgent+Mental+Health+Consultation" style="display:block;background:var(--teal);color:#fff;text-align:center;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none">✉️ clinic@evaerahealth.in</a>'+
    '</div>'+
    '<div style="margin-top:16px;display:flex;flex-direction:column;gap:10px;align-items:center">'+
    '<button onclick="overridePsychStop()" style="background:linear-gradient(135deg,#4A148C,#7B1FA2);color:#fff;border:none;padding:14px 28px;border-radius:24px;font-size:15px;font-weight:700;cursor:pointer;width:100%;max-width:340px">→ Continue Assessment (Crisis Flag Retained)</button>'+
    '<button onclick="startProcessing()" style="background:transparent;color:var(--teal);border:1.5px solid var(--teal);padding:10px 24px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;width:100%;max-width:340px">📋 View Partial Wellness Report</button>'+
    '</div>'+
    '</div>';
}
function overridePsychStop(){
  showScreen('form-screen');
  S.psychiatricHardStop=true;
  S.currentStep++;
  if(S.currentStep>=STEPS.length){startProcessing();return;}
  renderStepDots();renderStep(S.currentStep);updateDots();
}
function buildStepSummary(stepId){
  var a=S.answers; var lines=[];
  if(stepId==='demographics'){
    var flds=[['name','Name'],['age','Age','years'],['city','City'],['stage','Stage'],['prakriti','Prakriti']];
    flds.forEach(function(f){if(a[f[0]]!==undefined&&a[f[0]]!=='')lines.push({l:f[1],v:a[f[0]]+(f[2]?' '+f[2]:'')});});
    if(a.height_cm&&a.weight_kg){var bmi=a.weight_kg/((a.height_cm/100)*(a.height_cm/100));lines.push({l:'BMI',v:bmi.toFixed(1)+' kg/m²'});}
  }else if(stepId==='red_flags'){
    var rfOpts=[['No','Yes','Not sure'],['No','Occasionally','Frequently'],['No','Yes']];
    var rfQ=['Unusual vaginal bleeding','Persistent pelvic pain','Breast changes'];
    ['rf1','rf2','rf3'].forEach(function(id,i){if(a[id]!==undefined){var v=rfOpts[i][a[id]]||'-';lines.push({l:rfQ[i],v:v,flag:v==='Yes'||v==='Frequently'});}});
  }else if(stepId.startsWith('menqol_')){
    var qMap={menqol_vasomotor:['Hot flushes','Night sweats','Sweating','Feeling flushed','Chills','Heart racing'],menqol_physical:['Aches & pains','Feel tired','Poor sleep','Decreased fitness','Bloating','Low backache','Urinary frequency','Vaginal dryness'],menqol_psychosocial:['Low patience','Anxious/nervous','Memory lapses','Low confidence','Mood changes','Feeling depressed','Want to be alone'],menqol_sexual:['Vaginal dryness (sex)','Avoid intimacy','Low interest']};
    var kMap={menqol_vasomotor:['mq_v1','mq_v2','mq_v3','mq_v4','mq_v5','mq_v6'],menqol_physical:['mq_p1','mq_p2','mq_p3','mq_p4','mq_p5','mq_p6','mq_p7','mq_p8'],menqol_psychosocial:['mq_ps1','mq_ps2','mq_ps3','mq_ps4','mq_ps5','mq_ps6','mq_ps7'],menqol_sexual:['mq_s1','mq_s2','mq_s3']};
    var qs=qMap[stepId]||[];var ks=kMap[stepId]||[];
    qs.forEach(function(q,i){var v=a[ks[i]];if(v!==undefined)lines.push({l:q,v:v+'/8 '+(v<=3?'Low':v<=5?'Moderate':'High'),flag:v>=6});});
  }else if(stepId==='mental_health'){
    var phqQ=['Little interest/pleasure','Feeling down','Sleep problems','Feeling tired','Appetite','Feel bad about self','Concentration','Slowed/restless','Thoughts of self-harm'];
    var gadQ=['Feeling nervous','Uncontrollable worry','Worry too much','Trouble relaxing','Too restless','Easily annoyed','Feeling afraid'];
    phqQ.forEach(function(q,i){var v=a['phq_'+i];if(v!==undefined)lines.push({l:'PHQ: '+q,v:['Never','Few days','>Half days','Nearly daily'][v]||v,flag:i===8&&v>0});});
    gadQ.forEach(function(q,i){var v=a['gad_'+i];if(v!==undefined)lines.push({l:'GAD: '+q,v:['Never','Few days','>Half days','Nearly daily'][v]||v});});
  }else if(stepId==='sleep'){
    var isiQ=['Falling asleep','Staying asleep','Waking early','Sleep satisfaction','Others notice','Worry about sleep','Daytime impact'];
    isiQ.forEach(function(q,i){var v=a['isi_'+i];if(v!==undefined)lines.push({l:q,v:v+'/4'});});
  }else if(stepId==='psychosexual'){
    lines.push({l:'FSFI (19 items)',v:'Completed'});lines.push({l:'FSDSR (13 items)',v:'Completed'});lines.push({l:'Relationship (5 items)',v:'Completed'});
  }else if(stepId==='prakriti'){if(a.prakriti)lines.push({l:'Your Prakriti',v:a.prakriti});
  }else if(stepId==='vikriti'){if(a.vikriti)lines.push({l:'Your Vikriti',v:a.vikriti.replace(/_/g,' ')});
  }else if(stepId==='wearable_data'){
    if(!a.wearable||a.wearable==='None / No wearable'){lines.push({l:'Device',v:'None'});}
    else{var wd=a.wearable_data||{};lines.push({l:'Device',v:a.wearable});if(wd.avg_rhr)lines.push({l:'Resting HR',v:wd.avg_rhr+' bpm'});if(wd.avg_sleep)lines.push({l:'Avg Sleep',v:wd.avg_sleep+'h'});if(wd.avg_steps)lines.push({l:'Daily Steps',v:wd.avg_steps.toLocaleString()});}
  }else if(stepId==='comorbidities'){
    var comor=a.comorbidities||{};var active=Object.entries(comor).filter(function(e){return e[1]&&e[1]!=='No';});
    if(active.length)active.forEach(function(e){lines.push({l:e[0],v:e[1],flag:e[1]==='Uncontrolled'});});
    else lines.push({l:'Comorbidities',v:'None reported'});
  }else{lines.push({l:'Section',v:'Responses recorded'});}
  if(!lines.length)lines.push({l:'Status',v:'All responses recorded'});
  return '<div style="max-height:300px;overflow-y:auto">'+lines.map(function(l){
    var col=l.flag?'#C62828':'#1E3A5F';
    return '<div style="display:flex;justify-content:space-between;padding:7px 2px;border-bottom:1px solid #F0F0F0"><span style="font-size:12px;color:#555;flex:1">'+l.l+'</span><span style="font-size:13px;font-weight:700;color:'+col+';margin-left:12px">'+l.v+'</span></div>';
  }).join('')+'</div><div style="margin-top:10px;padding:8px 12px;background:#FFF8E7;border-radius:8px;font-size:11px;color:#795548;text-align:center">✏️ Click <strong>← Edit</strong> to change any answer before confirming</div>';
}
