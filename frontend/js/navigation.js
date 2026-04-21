/* Form Navigation, Step Rendering & Validation */

function renderStepDots(){
  var html='';
  STEPS.forEach(function(step,i){
    if(i>0) html+='<div class="step-line'+(i<=S.currentStep?' done':'')+'" id="sline_'+i+'"></div>';
    var cls=i<S.currentStep?'done':i===S.currentStep?'active':step.isGate?'gate':'pending';
    html+='<div class="step-dot '+cls+'" id="sdot_'+i+'" title="'+step.title+'">'+(i<S.currentStep?'✓':(i+1))+'</div>';
  });
  document.getElementById('step-dots').innerHTML=html;
}
function updateDots(){
  STEPS.forEach(function(step,i){
    var dot=document.getElementById('sdot_'+i);
    if(!dot)return;
    dot.className='step-dot '+(i<S.currentStep?'done':i===S.currentStep?'active':step.isGate?'gate':'pending');
    dot.textContent=i<S.currentStep?'✓':(i+1);
    var line=document.getElementById('sline_'+i);
    if(line)line.className='step-line'+(i<=S.currentStep?' done':'');
  });
}
function renderStep(idx){
  var step=STEPS[idx];
  if(!step){startProcessing();return;}
  var pct=Math.round((idx/STEPS.length)*100);
  document.getElementById('overall-prog').style.width=pct+'%';
  document.getElementById('progress-label').textContent='Step '+(idx+1)+' of '+STEPS.length+' — '+step.title;
  var pathLabel='';
  if(S.flags.menqolPsychTriggered&&!S.flags.mentalHealthCompleted) pathLabel='🧠 Mental Health Branch';
  if(S.flags.menqolSexualTriggered&&!S.flags.psychosexualCompleted) pathLabel+=(pathLabel?' · ':'')+'💙 Sexual Wellbeing Branch';
  document.getElementById('progress-path-label').textContent=pathLabel;
  var html='<div class="step-card">';
  html+='<div class="step-header"><div class="step-num">'+step.icon+' Step '+(idx+1)+' of '+STEPS.length+'</div>';
  html+='<h2>'+step.title+'</h2>';
  if(step.subtitle)html+='<p>'+step.subtitle+'</p>';
  html+='</div>';
  html+=buildStepContent(step.id);
  html+='</div>';
  document.getElementById('steps-container').innerHTML=html;
  updateDots();
  window.scrollTo(0,0);
  var isGate=step.isGate;
  document.getElementById('btn-next').style.display=isGate?'none':'block';
  document.getElementById('btn-back').style.display=idx>0?'block':'none';
}
function stepNext(){
  var step=STEPS[S.currentStep];
  var err=validateStep(step.id);
  if(err){showValidationError(err);return;}
  showConfirmModal();
}
function showValidationError(msg){
  var ex=document.getElementById('val-toast');if(ex)ex.remove();
  var t=document.createElement('div');t.id='val-toast';
  t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#C62828,#E53935);color:#fff;padding:13px 20px;border-radius:12px;font-size:14px;font-weight:700;z-index:9999;box-shadow:0 8px 24px rgba(198,40,40,0.4);max-width:340px;text-align:center;display:flex;align-items:center;gap:10px';
  t.innerHTML='<span style="font-size:18px">⚠️</span><span>'+msg+'</span>';
  document.body.appendChild(t);setTimeout(function(){if(t.parentNode)t.remove();},3500);
}
function validateStep(stepId){
  var a=S.answers;
  if(stepId==='demographics'){
    if(!a.name||!a.name.trim()) return 'Please enter your name.';
    if(!a.age||a.age<18||a.age>80) return 'Please enter a valid age (18–80).';
    if(!a.stage) return 'Please select your menstrual / menopause stage.';
    return null;
  }
  if(stepId==='red_flags'){
    if(a.rf1===undefined) return 'Please answer all 3 safety questions.';
    if(a.rf2===undefined) return 'Please answer question 2: pelvic pain.';
    if(a.rf3===undefined) return 'Please answer question 3: breast changes.';
    return null;
  }
  if(stepId==='menqol_vasomotor'){
    var miss=['mq_v1','mq_v2','mq_v3','mq_v4','mq_v5','mq_v6'].filter(function(k){return a[k]===undefined;}).length;
    return miss>0?'Please rate all 6 vasomotor symptoms. ('+miss+' unanswered)':null;
  }
  if(stepId==='menqol_physical'){
    var miss=['mq_p1','mq_p2','mq_p3','mq_p4','mq_p5','mq_p6','mq_p7','mq_p8'].filter(function(k){return a[k]===undefined;}).length;
    return miss>0?'Please rate all 8 physical symptoms. ('+miss+' unanswered)':null;
  }
  if(stepId==='menqol_psychosocial'){
    var miss=['mq_ps1','mq_ps2','mq_ps3','mq_ps4','mq_ps5','mq_ps6','mq_ps7'].filter(function(k){return a[k]===undefined;}).length;
    return miss>0?'Please rate all 7 emotional wellbeing items. ('+miss+' unanswered)':null;
  }
  if(stepId==='menqol_sexual'){
    var miss=['mq_s1','mq_s2','mq_s3'].filter(function(k){return a[k]===undefined;}).length;
    return miss>0?'Please rate all 3 sexual wellbeing items.':null;
  }
  if(stepId==='mental_health'){
    var pm=[0,1,2,3,4,5,6,7,8].filter(function(i){return a['phq_'+i]===undefined;}).length;
    if(pm>0) return 'Please answer all PHQ-9 items. ('+pm+' unanswered)';
    var gm=[0,1,2,3,4,5,6].filter(function(i){return a['gad_'+i]===undefined;}).length;
    if(gm>0) return 'Please answer all GAD-7 items. ('+gm+' unanswered)';
    var sm=[0,1,2,3,4,5,6,7].filter(function(i){return a['pss_'+i]===undefined;}).length;
    if(sm>0) return 'Please answer all PSS-8 items. ('+sm+' unanswered)';
    return null;
  }
  if(stepId==='sleep'){
    var im=[0,1,2,3,4,5,6].filter(function(i){return a['isi_'+i]===undefined;}).length;
    return im>0?'Please answer all 7 sleep quality items. ('+im+' unanswered)':null;
  }
  if(stepId==='psychosexual_1'||stepId==='psychosexual_2'){
    // Pages 1 and 2 just advance — no flags yet
  }
  if(stepId==='psychosexual_3'){
    if(!a.sexual_activity_status) return 'Please indicate your sexual activity status first.';
    if(a.sexual_activity_status==='sexually_active'||a.sexual_activity_status==='prefer_not_say'){
      var fm=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].filter(function(i){return a['fsfi_'+i]===undefined;}).length;
      if(fm>0) return 'Please answer all FSFI items. ('+fm+' unanswered)';
      var dm=[0,1,2,3,4,5,6,7,8,9,10,11,12].filter(function(i){return a['fsdsr_'+i]===undefined;}).length;
      if(dm>0) return 'Please answer all FSDSR items. ('+dm+' unanswered)';
      var cm=[1,2,3,4,5].filter(function(i){return a['mcss_'+i]===undefined;}).length;
      if(cm>0) return 'Please answer all relationship items. ('+cm+' unanswered)';
    }
    return null;
  }
  if(stepId==='prakriti') return !a.prakriti?'Please select your Prakriti constitution.':null;
  if(stepId==='vikriti') return !a.vikriti?'Please select your current Vikriti state.':null;
  return null;
}
function stepBack(){
  if(S.currentStep>0){
    S.currentStep--;
    renderStep(S.currentStep);
  }
}
function showConfirmModal(){
  var step=STEPS[S.currentStep];
  var summary=buildStepSummary(step.id);
  document.getElementById('modal-title').textContent='Review: '+step.title;
  document.getElementById('modal-summary').innerHTML=summary;
  document.getElementById('confirm-modal').classList.add('show');
}
function closeModal(){document.getElementById('confirm-modal').classList.remove('show');}
function confirmStep(){
  closeModal();
  var step=STEPS[S.currentStep];
  var stepId=step.id;
  if(stepId==='red_flags'){
    checkRedFlags();
    if(S.redFlagsTriggered.length>0){showGyneHardStop();return;}
  }
  if(stepId==='mental_health'){
    if((S.answers.phq_8||0)>0){showPsychiatricHardStop();return;}
    S.flags.mentalHealthCompleted=true;
  }
  if(stepId==='psychosexual_1'||stepId==='psychosexual_2'){
    // Pages 1 and 2 just advance — no flags yet
  }
  if(stepId==='psychosexual_3'){
    // Only mark completed if FSFI items actually answered
    var fsfiDone=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].filter(function(i){return S.answers['fsfi_'+i]!==undefined&&S.answers['fsfi_'+i]>0;}).length;
    S.flags.psychosexualCompleted = fsfiDone>=15;
    if(!S.flags.psychosexualCompleted) S.answers.psychosexual_skipped=true;
  }
  if(stepId==='menqol_psychosocial'){
    var psScore=computeMenQOLDomain(['mq_ps1','mq_ps2','mq_ps3','mq_ps4','mq_ps5','mq_ps6','mq_ps7'],56);
    S.answers._menqol_ps_score=psScore;
    if(psScore>=8){  // ≥8/20 = moderate
      S.flags.menqolPsychTriggered=true;
      rebuildSteps();
      renderStepDots();
    }
  }
  if(stepId==='menqol_sexual'){
    var sxScore=computeMenQOLDomain(['mq_s1','mq_s2','mq_s3'],24);
    S.answers._menqol_sx_score=sxScore;
    if(sxScore>=8){  // ≥8/20 = moderate
      S.flags.menqolSexualTriggered=true;
      rebuildSteps();
      renderStepDots();
    }
  }
  if(stepId==='sleep'){
    var isiScore=0;
    for(var i=0;i<7;i++) isiScore+=(S.answers['isi_'+i]||0);
    S.answers._isi_score=isiScore;
    if(isiScore>=15){S.flags.sleepSevere=true;S.flags.sleepModerate=true;}
    else if(isiScore>=8){S.flags.sleepModerate=true;}
    if(S.flags.sleepModerate){rebuildSteps();renderStepDots();}
  }
  if(stepId==='gate_psych'){return;} // handled by gate buttons
  if(stepId==='gate_sexual'){return;}
  if(stepId==='gate_sleep'){return;}
  if(S.currentStep<STEPS.length-1){
    S.currentStep++;
    renderStep(S.currentStep);
  }else{
    startProcessing();
  }
}
function gateChoice(gateId, choice){
  S.answers[gateId+'_choice'] = choice;

  if(gateId === 'gate_psych'){
    if(choice === 'yes'){
      S.flags.mentalHealthCompleted = false; // will be set true when step completed
      rebuildSteps();
      renderStepDots();
    } else {
      // User declined mental health module — ensure no stale scores affect triage
      S.flags.mentalHealthCompleted = false;
      // Clear any partial PHQ/GAD/PSS answers to prevent false scoring
      for(var i=0;i<9;i++) delete S.answers['phq_'+i];
      for(var i=0;i<7;i++) delete S.answers['gad_'+i];
      for(var i=0;i<8;i++) delete S.answers['pss_'+i];
    }
  }

  if(gateId === 'gate_sexual'){
    if(choice === 'yes'){
      S.flags.psychosexualCompleted = false; // will be set true when step confirmed
      S.answers.psychosexual_skipped = false;
      rebuildSteps();
      renderStepDots();
    } else {
      // User declined psychosexual module
      // CRITICAL: set skipped = true so FSFI/MCSS/FSDSR remain null in computeScores
      S.answers.psychosexual_skipped = true;
      S.flags.psychosexualCompleted = false;
      S.flags.sexuallyActive = false;
      // Clear any partial FSFI/FSDSR/MCSS answers that would cause FSFI=0
      for(var i=1;i<=19;i++) delete S.answers['fsfi_'+i];
      for(var i=0;i<13;i++) delete S.answers['fsdsr_'+i];
      for(var i=1;i<=5;i++) delete S.answers['mcss_'+i];
      delete S.answers.sexual_activity_status;
    }
  }

  if(gateId === 'gate_sleep'){
    S.flags.sleepDeepDive = (choice === 'yes');
  }

  if(S.currentStep < STEPS.length-1){
    S.currentStep++;
    renderStep(S.currentStep);
  } else {
    startProcessing();
  }
}
