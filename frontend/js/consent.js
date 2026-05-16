/* Consent, Session & Auth */

var OTP_BACKEND_URL = 'http://localhost:8000';

var CONSENT_ITEMS = [
  {id:'c1',title:'Health & Symptom Data',desc:'Collection and processing of your menopause symptom data, clinical scores, and health metrics.',required:true,badge:'Sensitive Data'},
  {id:'c2',title:'Wearable Device Data',desc:'Optional integration of wearable device metrics for enhanced clinical insights.',required:true,badge:'Sensitive Data'},
  {id:'c3',title:'Ayurvedic & Lifestyle Profile',desc:'Your Prakriti type, Vikriti, and lifestyle information for personalised recommendations.',required:true,badge:'Required'},
  {id:'c4',title:'AI Processing & Clinical Scoring',desc:'Automated scoring using MenQOL, PHQ-9, GAD-7, ISI, PSS-8, FSFI, and FSDSAR instruments.',required:true,badge:'Required'},
  {id:'c5',title:'Sharing with Healthcare Professionals',desc:'Sharing your anonymised or identified data with your consulting clinician.',required:true,badge:'Required'},
  {id:'c6',title:'Anonymised Research Contribution',desc:'Optional contribution to menopause research in India (de-identified data only).',required:false,badge:'Optional'},
  {id:'c8',title:'Your Right to Erasure (DPDP §11)',desc:'You may delete all your data at any time using the Delete My Data button, or email dpo@evaerahealth.in. Data deleted within 30 days.',required:false,badge:'Your Right'},
  {id:'c7',title:'Corporate Wellness Reporting',desc:'If enrolled via employer, aggregate anonymised reporting to HR.',required:false,badge:'Optional'},
];

function saveSession(){try{localStorage.setItem('evr_session_v7',JSON.stringify(S.session));}catch(e){}}
function loadSession(){try{var s=localStorage.getItem('evr_session_v7');if(s){S.session=JSON.parse(s);return true;}}catch(e){}return false;}

function savePatients(){
  try{localStorage.setItem('evr_patients_v7',JSON.stringify(S.patients));}catch(e){}
  try{
    var _p=S.patients.map(function(p){
      return{id:p.id,name:p.name,age:p.age,city:p.city,stage:p.stage,
        composite:p.composite||0,
        band:(p.composite<=5?'Optimal':p.composite<=30?'Mild':p.composite<=55?'Moderate':p.composite<=80?'Severe':'Critical'),
        scores:p.scores,triage:p.triage,
        redFlag:p.psychiatricAlert||((p.redFlags||[]).length>0),
        flags:p.flags,comorbidities:p.comorbidities,
        ts:new Date(p.timestamp).toLocaleString('en-IN'),
        submittedAt:new Date(p.timestamp).getTime(),
        authId:p.authId||null
      };
    });
    localStorage.setItem('evh_patients',JSON.stringify(_p));
    try{var _bc=new BroadcastChannel('evh_v7');_bc.postMessage({t:'new_assess',d:_p[0]});_bc.close();}catch(_e){}
  }catch(_e2){}
}

function loadPatients(){try{var p=localStorage.getItem('evr_patients_v7');if(p)S.patients=JSON.parse(p);}catch(e){}}

function showScreen(id){
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  document.getElementById(id).classList.add('active');
}

function authTab(mode){
  S.authMode=mode;
  var existing=document.getElementById('auth-err-banner');
  if(existing)existing.remove();
  document.querySelectorAll('.auth-tab').forEach(function(t,i){
    t.classList.toggle('active',(i===0&&mode==='login')||(i===1&&mode==='register'));
  });
  document.getElementById('auth-login').style.display=mode==='login'?'block':'none';
  document.getElementById('auth-register').style.display=mode==='register'?'block':'none';
  document.getElementById('auth-otp').style.display='none';
}

/* NAME MATCH HELPER
   Returns true if inputName loosely matches storedName.
   Accepts: exact full match OR matching first names (case-insensitive).*/
function _namesMatch(inputName, storedName){
  var a=(inputName||'').trim().toLowerCase();
  var b=(storedName||'').trim().toLowerCase();
  if(!a||!b) return false;
  if(a===b) return true;                          /* exact full match */
  if(a.split(' ')[0]===b.split(' ')[0]) return true; /* first name match */
  return false;
}

/* SEND OTP */
function sendOTP(mode){
  var identifier;

  if(mode==='login'){
    var loginName=(document.getElementById('login-name')?document.getElementById('login-name').value:'').trim();
    identifier=(document.getElementById('login-id').value||'').trim();

    if(!loginName){alert('Please enter your registered name.');return;}
    if(!identifier){alert('Please enter your mobile number or email.');return;}

    var btn=document.querySelector('#auth-login .btn-auth');
    if(btn){btn.textContent='Checking…';btn.disabled=true;}

    /* Step 1: Verify email exists in Supabase sessions */
    fetch(SUPABASE_URL+'/rest/v1/sessions?email_id=eq.'
          +encodeURIComponent(identifier.toLowerCase())
          +'&is_guest=eq.false&select=session_id&limit=1',{
      method:'GET',
      headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json'}
    })
    .then(function(res){return res.json();})
    .then(function(sessionRows){
      if(!sessionRows||sessionRows.length===0){
        /* Email never registered */
        if(btn){btn.textContent='Send OTP →';btn.disabled=false;}
        _showAuthError('No account found for this email. Please register first.');
        return;
      }

      /* We have a session_id — now fetch name from patient_demographics */
      var sessionId=sessionRows[0].session_id;

      /* Step 2: Fetch full_name from patient_demographics via session_id  */
      fetch(SUPABASE_URL+'/rest/v1/patient_demographics?session_id=eq.'
            +encodeURIComponent(sessionId)
            +'&select=full_name&limit=1',{
        method:'GET',
        headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json'}
      })
      .then(function(res2){return res2.json();})
      .then(function(demoRows){
        if(!demoRows||demoRows.length===0||!demoRows[0].full_name){
          /* Demographics not saved yet (assessment not completed) —
             can't verify name, allow through */
          console.log('[Auth] No demographics record yet — skipping name check');
          _doSendOTP(identifier,mode,btn);
          return;
        }

        /* Step 3: Compare entered name against Supabase stored name */
        var storedName=demoRows[0].full_name;
        if(!_namesMatch(loginName,storedName)){
          if(btn){btn.textContent='Send OTP →';btn.disabled=false;}
          _showAuthError('Name does not match our records. Please check and try again.');
          return;
        }

        /* All checks passed — send OTP */
        _doSendOTP(identifier,mode,btn);
      })
      .catch(function(err){
        /* Demographics fetch failed — don't block, fall through */
        console.warn('[Auth] Demographics fetch failed, skipping name check:',err);
        if(btn){btn.textContent='Send OTP →';btn.disabled=false;}
        _doSendOTP(identifier,mode,btn);
      });
    })
    .catch(function(err){
      /* Sessions fetch failed — fall through so OTP still works */
      console.error('[Auth] Session check failed:',err);
      if(btn){btn.textContent='Send OTP →';btn.disabled=false;}
      _doSendOTP(identifier,mode,btn);
    });

  } else {
    /* Register mode — unchanged */
    var name=document.getElementById('reg-name').value.trim();
    var mobileEmail=document.getElementById('reg-mobile').value.trim();
    if(!name){alert('Please enter your full name');return;}
    if(!mobileEmail){alert('Please enter your mobile number or email');return;}
    if(mobileEmail.indexOf('@')!==-1&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mobileEmail)){
      alert('Please enter a valid email address');return;
    }
    identifier=mobileEmail;
    S.regName=name;
    S.regMobile=mobileEmail;
    var btn2=document.querySelector('#auth-register .btn-auth');
    _doSendOTP(identifier,mode,btn2);
  }
}

/* Actually send OTP after all checks pass */
function _doSendOTP(identifier,mode,btn){
  S.authId=identifier;
  var origText=btn?btn.textContent:'Send OTP →';
  if(btn){btn.textContent='Connecting…';btn.disabled=true;}

  fetch(OTP_BACKEND_URL+'/health').catch(function(){}).finally(function(){
    if(btn)btn.textContent='Sending…';
    fetch(OTP_BACKEND_URL+'/send-otp',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({identifier:identifier,portal:'patient'})
    })
    .then(function(res){return res.json();})
    .then(function(data){
      if(btn){btn.textContent=origText;btn.disabled=false;}
      if(data.success){
        document.getElementById('auth-login').style.display='none';
        document.getElementById('auth-register').style.display='none';
        var otpSection=document.getElementById('auth-otp');
        otpSection.style.display='block';
        var hint=document.getElementById('auth-otp-hint');
        if(hint)hint.textContent='OTP sent to '+identifier;
        document.querySelectorAll('#auth-screen .otp-digit')[0].focus();
        startResendCooldown('patient');
      } else {
        alert(data.detail||'Failed to send OTP. Please try again.');
      }
    })
    .catch(function(err){
      if(btn){btn.textContent=origText;btn.disabled=false;}
      console.error('OTP send error:',err);
      alert('Could not reach the OTP service. Please try again in 30 seconds.');
    });
  });
}

/* Auth error banner */
function _showAuthError(msg){
  var existing=document.getElementById('auth-err-banner');
  if(existing)existing.remove();
  var div=document.createElement('div');
  div.id='auth-err-banner';
  div.style.cssText=[
    'background:#FEE2E2','border:1.5px solid #F87171','border-radius:10px',
    'padding:10px 14px','font-size:13px','color:#B91C1C','font-weight:600',
    'margin-top:10px','text-align:center','line-height:1.5'
  ].join(';');
  div.innerHTML='⚠️ '+msg
    +'<br><span style="font-size:11px;font-weight:400;color:#7F1D1D">'
    +'Switch to the <strong style="cursor:pointer;text-decoration:underline" onclick="authTab(\'register\')">'
    +'Register</strong> tab to create a new account.</span>';
  var loginDiv=document.getElementById('auth-login');
  if(loginDiv)loginDiv.appendChild(div);
  setTimeout(function(){if(div.parentNode)div.remove();},6000);
}

function otpNext(el){
  if(el.value.length===1){var n=el.nextElementSibling;if(n&&n.classList.contains('otp-digit'))n.focus();}
}

/* VERIFY OTP */
function verifyOTP(){
  var digits=Array.from(document.querySelectorAll('#auth-screen .otp-digit'))
    .map(function(i){return i.value;}).join('');
  if(digits.length<4){alert('Please enter all OTP digits.');return;}

  var btn=document.querySelector('#auth-otp .btn-auth');
  if(btn){btn.textContent='Verifying…';btn.disabled=true;}

  fetch(OTP_BACKEND_URL+'/verify-otp',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({identifier:S.authId,otp:digits})
  })
  .then(function(res){
    if(!res.ok)return res.json().then(function(e){throw new Error(e.detail);});
    return res.json();
  })
  .then(function(data){
    if(btn){btn.textContent='Verify & Continue →';btn.disabled=false;}
    if(data.success){
      S.session={
        id:'user_'+Date.now(),
        ts:new Date().toISOString(),
        authId:S.authId,
        name:S.regName||null,
        mobile:S.regMobile||null
      };
      delete S.regName;
      delete S.regMobile;
      saveSession();
      saveSessionToSupabase();

      var isLoginMode=(S.authMode==='login');
      if(isLoginMode){
        _routeReturningPatient(S.authId);
      } else {
        showConsent();
      }
    }
  })
  .catch(function(err){
    if(btn){btn.textContent='Verify & Continue →';btn.disabled=false;}
    alert(err.message||'Invalid OTP. Please try again.');
    document.querySelectorAll('#auth-screen .otp-digit').forEach(function(d){d.value='';});
    document.querySelectorAll('#auth-screen .otp-digit')[0].focus();
  });
}

/* ROUTING: login mode only
   1. localStorage  (fast, same device)
   2. Supabase assessments (cross-device)
   3. Fallback → consent*/
function _routeReturningPatient(authId){
  if(!authId){showConsent();return;}
  var normalised=authId.trim().toLowerCase();

  /* The name the patient entered at login — used to find their specific record.
     S.loginName is set in sendOTP before calling this. */
  var loginName=(S.loginName||'').trim().toLowerCase();

  /* Step 1: Fetch the correct name from Supabase patient_demographics 
     This is the source of truth — find the demographics row for this email,
     get the stored full_name, then use it to find the right local record. */
  fetch(SUPABASE_URL+'/rest/v1/sessions?email_id=eq.'
        +encodeURIComponent(normalised)
        +'&is_guest=eq.false&select=session_id&limit=1',{
    method:'GET',
    headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json'}
  })
  .then(function(res){return res.json();})
  .then(function(sessionRows){
    if(!sessionRows||sessionRows.length===0){showConsent();return;}
    var sessionId=sessionRows[0].session_id;

    /* Fetch name from patient_demographics */
    return fetch(SUPABASE_URL+'/rest/v1/patient_demographics?session_id=eq.'
          +encodeURIComponent(sessionId)
          +'&select=full_name&limit=1',{
      method:'GET',
      headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json'}
    })
    .then(function(res2){return res2.json();})
    .then(function(demoRows){
      /* The canonical name from Supabase */
      var canonicalName=(demoRows&&demoRows.length>0&&demoRows[0].full_name)
        ? demoRows[0].full_name.trim().toLowerCase()
        : loginName; /* fallback to what they typed if no demographics yet */

      /* ── Step 2: Find exact local record — session_id first, then name ── */
      var matchedPatient=null;
      try{
        var stored=localStorage.getItem('evr_patients_v7');
        if(stored){
          var patients=JSON.parse(stored);

          /* Priority 1: match by session_id (most precise — same browser session) */
          var bySession=patients.filter(function(p){
            return p.sessionId===sessionId;
          }).sort(function(a,b){return new Date(b.timestamp)-new Date(a.timestamp);});

          if(bySession.length>0){
            matchedPatient=bySession[0];
          } else {
            /* Priority 2: authId + canonical name match */
            var byEmail=patients.filter(function(p){
              return p.authId&&p.authId.trim().toLowerCase()===normalised;
            });
            var byName=byEmail.filter(function(p){
              return _namesMatch(p.name||'',canonicalName);
            }).sort(function(a,b){return new Date(b.timestamp)-new Date(a.timestamp);});

            if(byName.length>0){
              matchedPatient=byName[0];
            }
            /* Do NOT fall back to byEmail[0] alone — that causes the wrong
               patient (Nisha) to appear when multiple records share one authId */
          }
        }
      }catch(e){console.warn('[Auth] localStorage check error:',e);}

      if(matchedPatient&&matchedPatient.answers){
        /* Re-run the real HCP scoring engine on the stored answers 
           This guarantees patient dashboard == HCP dashboard every time.
           computeScores() and runRuleEngine() are loaded from scoring.js.*/
        /* Set authoritative name from Supabase demographics */
        if(demoRows&&demoRows.length>0&&demoRows[0].full_name){
          matchedPatient.name=demoRows[0].full_name;
        }
        matchedPatient.authId=authId;

        /* Re-score using the exact same engine as HCP portal */
        if(typeof computeScores==='function'&&typeof runRuleEngine==='function'){
          /* Temporarily set S.answers, S.flags so computeScores() works */
          var _prevAnswers=S.answers;
          var _prevFlags=S.flags;
          S.answers=matchedPatient.answers||{};
          S.flags=matchedPatient.flags||{
            psychosexualCompleted:false,sexuallyActive:false,
            mentalHealthCompleted:false,sleepModerate:false,sleepSevere:false,
            gyneRedFlag:false,menqolPsychTriggered:false,menqolSexualTriggered:false
          };
          try{
            var freshScores=computeScores();
            var freshTriage=runRuleEngine(freshScores);
            matchedPatient.scores=freshScores;
            matchedPatient.triage=freshTriage;
            matchedPatient.composite=freshScores.composite;
            matchedPatient.psychiatricAlert=freshScores.PHQ9_item9>0;
          }catch(scoreErr){
            console.warn('[Route] Re-score failed, using stored scores:',scoreErr);
            matchedPatient.composite=matchedPatient.scores?matchedPatient.scores.composite:0;
          }
          S.answers=_prevAnswers;
          S.flags=_prevFlags;
        } else {
          /* scoring.js not loaded — use stored scores as fallback */
          matchedPatient.composite=(matchedPatient.scores&&matchedPatient.scores.composite)||0;
        }

        console.log('[Route] HCP engine scores — name:',matchedPatient.name,'composite:',matchedPatient.composite);
        showPatientDashboard(matchedPatient);
        return;
      }

      /* Step 3: No local record — show minimal shell from Supabase */
      var displayName=(demoRows&&demoRows.length>0&&demoRows[0].full_name)
        ? demoRows[0].full_name
        : (loginName||'Patient');

      var shell={
        id:'sb_'+Date.now(),
        name:displayName,
        authId:authId,
        sessionId:sessionId,
        scores:{composite:0},
        triage:[],
        timestamp:new Date().toISOString(),
        _fromSupabase:true
      };
      showPatientDashboard(shell);
    });
  })
  .catch(function(err){
    console.warn('[Auth] Routing check failed, falling to consent:',err);
    showConsent();
  });
}

/* RESEND COOLDOWN */
var _resendTimers={patient:null,hcp:null};

function startResendCooldown(portal){
  var btnId=portal==='hcp'?'hcp-resend-btn':'patient-resend-btn';
  var btn=document.getElementById(btnId);
  if(!btn)return;
  var secs=30;
  btn.disabled=true;
  btn.textContent='↺ Resend OTP ('+secs+'s)';
  clearInterval(_resendTimers[portal]);
  _resendTimers[portal]=setInterval(function(){
    secs--;
    if(secs>0){
      btn.textContent='↺ Resend OTP ('+secs+'s)';
    } else {
      clearInterval(_resendTimers[portal]);
      btn.textContent='↺ Resend OTP';
      btn.disabled=false;
    }
  },1000);
}

/* RESEND OTP */
function resendOTP(portal){
  var identifier=S.authId||'';
  if(!identifier){
    var hcpInput=document.getElementById('hcp-login-id');
    if(hcpInput)identifier=hcpInput.value.trim();
  }
  if(!identifier){alert('Please enter your email or mobile first.');return;}

  var btnId=portal==='hcp'?'hcp-resend-btn':'patient-resend-btn';
  var btn=document.getElementById(btnId);
  if(btn){btn.textContent='Sending…';btn.disabled=true;}

  fetch(OTP_BACKEND_URL+'/resend-otp',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({identifier:identifier,portal:portal})
  })
  .then(function(res){return res.json();})
  .then(function(data){
    if(data.success){
      var cls=portal==='hcp'?'.hcp-otp-digit':'#auth-screen .otp-digit';
      document.querySelectorAll(cls).forEach(function(d){d.value='';});
      document.querySelectorAll(cls)[0].focus();
      var hintId=portal==='hcp'?'hcp-otp-hint':'auth-otp-hint';
      var hint=document.getElementById(hintId);
      if(hint)hint.textContent='New OTP sent to '+identifier;
      startResendCooldown(portal);
    } else {
      if(btn){btn.textContent='↺ Resend OTP';btn.disabled=false;}
      alert(data.detail||'Failed to resend OTP. Please try again.');
    }
  })
  .catch(function(){
    if(btn){btn.textContent='↺ Resend OTP';btn.disabled=false;}
    alert('Could not reach OTP service. Please try again.');
  });
}

/* GUEST & CONSENT */
function startGuest(){
  S.session={id:'guest_'+Date.now(),ts:new Date().toISOString()};
  saveSessionToSupabase();
  showConsent();
}

function showConsent(){showScreen('consent-screen');renderConsent();}

function renderConsent(){
  var html='';
  CONSENT_ITEMS.forEach(function(item){
    var checked=S.consentData[item.id]?'checked':'';
    var badgeClass=item.badge==='Sensitive Data'?'sensitive':item.badge==='Required'?'required':'optional';
    html+='<div class="consent-item"><input type="checkbox" id="ci_'+item.id+'" '+(item.required?'required':'')+' '+checked+' onchange="consentChange(\''+item.id+'\',this.checked)">';
    html+='<div class="ci-body"><div class="ci-title">'+item.title+'<span class="ci-badge '+badgeClass+'">'+item.badge+'</span></div>';
    html+='<div class="ci-desc">'+item.desc+'</div></div></div>';
  });
  document.getElementById('consent-items-container').innerHTML=html;
  checkConsentBtn();
}

function consentChange(id,val){S.consentData[id]=val;checkConsentBtn();}

function checkConsentBtn(){
  var allRequired=CONSENT_ITEMS.filter(function(i){return i.required;}).every(function(i){return S.consentData[i.id];});
  document.getElementById('btn-consent-proceed').disabled=!allRequired;
}

function quickAcceptConsent(){
  CONSENT_ITEMS.forEach(function(i){S.consentData[i.id]=true;});
  proceedAfterConsent();
}

function proceedAfterConsent(){
  S.consentGiven=true;
  S.consentTimestamp=new Date().toISOString();
  saveConsentToSupabase();
  startForm();
}

function startForm(){
  S.currentStep=0;
  S.answers={};
  S.scores={};
  S.triage=[];
  S.redFlagsTriggered=[];
  S.psychiatricAlert=false;
  S.psychiatricHardStop=false;
  S.flags={menqolPsychTriggered:false,menqolSexualTriggered:false,sleepModerate:false,sleepSevere:false,gyneRedFlag:false,mentalHealthCompleted:false,psychosexualCompleted:false,sleepDeepDive:false};
  rebuildSteps();
  showScreen('form-screen');
  renderStepDots();
  renderStep(0);
}

/* LEGACY SHIM */
function checkReturningPatient(){
  _routeReturningPatient(S.session&&S.session.authId?S.session.authId:null);
}