/* Utilities, Privacy, Filters & Toggles */

function exportMyData(){
  var obj={exportedAt:new Date().toISOString(),platform:'EvaEraHealth v10',notice:'DPDP Act 2023 — Data Portability',
    profile:{name:S.answers&&S.answers.name,age:S.answers&&S.answers.age,stage:S.answers&&S.answers.stage},
    scores:S.scores||{},answers:S.answers||{},triage:S.triage||[]};
  var blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='EvaEraHealth_MyData_'+new Date().toISOString().slice(0,10)+'.json';a.click();
  intToast('success','Data Exported','Personal data downloaded as JSON','DPDP');
}
function deleteMyData(){
  if(!confirm('Delete all your EvaEraHealth data permanently? This cannot be undone.')) return;
  ['evr_session_v7','evr_patients_v7','evr_answers_v7'].forEach(function(k){try{localStorage.removeItem(k);}catch(e){}});
  S.patients=[];S.session=null;S.answers={};S.scores={};S.triage=[];
  alert('Your local data has been deleted. For server-side deletion email dpo@evaerahealth.in');
  showScreen('auth-screen');
}
function showPrivacyNotice(){
  var m=document.createElement('div');
  m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  var inner=document.createElement('div');
  inner.style.cssText='background:#fff;border-radius:16px;padding:24px;max-width:500px;width:100%;max-height:80vh;overflow-y:auto';
  inner.innerHTML='<h3 style="font-family:Georgia,serif;color:#1E3A5F;margin:0 0 12px">Privacy Notice</h3>'
    +'<p style="font-size:13px;color:#374151;line-height:1.7">'
    +'<strong>Data Controller:</strong> EvaEraHealth Technology Pvt Ltd, Gurugram<br>'
    +'<strong>DPO:</strong> dpo@evaerahealth.in<br>'
    +'<strong>Purpose:</strong> Menopause wellness assessment and personalised care<br>'
    +'<strong>Legal Basis:</strong> DPDP Act 2023 — your explicit consent<br>'
    +'<strong>Data Retention:</strong> Session data stored locally. Delete anytime.<br>'
    +'<strong>Your Rights:</strong> Access · Correction · Erasure · Portability<br>'
    +'<strong>Grievance:</strong> clinic@evaerahealth.in · +91 80690 50000<br>'
    +'<strong>Regulator:</strong> Data Protection Board of India</p>';
  var btn=document.createElement('button');
  btn.textContent='Close';
  btn.style.cssText='background:#1E3A5F;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-weight:700;cursor:pointer;width:100%;margin-top:12px';
  btn.onclick=function(){m.remove();};
  inner.appendChild(btn); m.appendChild(inner);
  document.body.appendChild(m);
}
function filterBySeverity(level,btn){
  S._severityFilter=level;
  if(btn){btn.closest('div').querySelectorAll('button').forEach(function(b){b.style.opacity='0.55';});btn.style.opacity='1';}
  renderPatientList();
}
function toggleMed(key, el) {
  if(key === 'med_none') {
    // Selecting 'No medications' clears all others
    var meds=['med_ssri','med_hrt','med_betablocker','med_statin','med_thyroid','med_insulin','med_antihyp','med_sleep','med_nsaid'];
    meds.forEach(function(k){ S.answers[k]=false; });
    el.closest('.cards').querySelectorAll('.card-opt').forEach(function(c){c.classList.remove('selected');});
  } else {
    S.answers['med_none'] = false;
  }
  S.answers[key] = !S.answers[key];
  if(S.answers[key]) el.classList.add('selected');
  else el.classList.remove('selected');
}
function toggleFamHx(key, el) {
  if(key === 'fam_none') {
    var all=['fam_breast_cancer','fam_ovarian_cancer','fam_osteoporosis','fam_cvd','fam_diabetes','fam_depression','fam_early_menopause'];
    all.forEach(function(k){ S.answers[k]=false; });
    el.closest('.cards').querySelectorAll('.card-opt').forEach(function(c){c.classList.remove('selected');});
  } else {
    S.answers['fam_none']=false;
  }
  S.answers[key] = !S.answers[key];
  if(S.answers[key]) el.classList.add('selected');
  else el.classList.remove('selected');
}
window.onload = function() {
  var _lastAct=Date.now(),_tWarn=false;
  ['click','keydown','touchstart'].forEach(function(ev){document.addEventListener(ev,function(){_lastAct=Date.now();_tWarn=false;});});
  setInterval(function(){
    var idle=(Date.now()-_lastAct)/1000;
    if(idle>1500&&!_tWarn&&S.currentStep>0){_tWarn=true;
      var t=document.createElement('div');
      t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1E3A5F;color:#fff;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:600;z-index:9999;text-align:center';
      t.textContent='Session expires in 5 minutes — your progress is auto-saved.';
      document.body.appendChild(t);setTimeout(function(){if(t.parentNode)t.remove();},5000);}
    if(idle>1800&&S.session){try{localStorage.setItem('evr_answers_v7',JSON.stringify({answers:S.answers,flags:S.flags,step:S.currentStep,ts:new Date().toISOString()}));}catch(e){}}
  },30000);
  CONSENT_ITEMS.filter(function(i){return i.required;}).forEach(function(i){S.consentData[i.id]=false;});
  if(loadSession()&&S.session){showConsent();}
};

