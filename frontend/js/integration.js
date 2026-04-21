/* Integration Layer, Booking Flow & Admin Portal */

// EvaEraHealth v7 — Integration Layer
// Shared store keys
var IK={pt:'evh_patients',ap:'evh_appointments',cn:'evh_consultants',
  sl:'evh_slots',py:'evh_payments',ac:'evh_activity',au:'evh_audit',cs:'evh_consents'};
function iSv(k,d){try{localStorage.setItem(k,JSON.stringify(d));}catch(e){}}
function iLd(k,d){try{return JSON.parse(localStorage.getItem(k))||d;}catch(e){return d;}}

// BroadcastChannel for cross-tab sync
var iBc;
try{iBc=new BroadcastChannel('evh_v7');}catch(e){iBc={postMessage:function(){}};}
iBc.onmessage=function(e){
  intRAdm();
  var msgs={
    new_assess:'New assessment submitted',
    new_book:'Appointment booked',
    new_con:'Consultant added',
    new_slot:'Slot added'
  };
  if(msgs[e.data.t])intToast('info',msgs[e.data.t],'','Sync');
};
function iBcast(t,d){try{iBc.postMessage({t:t,d:d});}catch(e){}}

// Activity log
function iLogA(icon,title,desc,src){
  var f=iLd(IK.ac,[]);
  f.unshift({icon:icon,title:title,desc:desc,src:src,
    ts:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})});
  if(f.length>60)f.length=60;
  iSv(IK.ac,f);
}

// Toast notifications
function intSendReport(){
  var name=(S.answers&&S.answers.name)||'Patient';
  var email=prompt('Enter email address to send report to:','');
  if(email===null)return;
  if(email&&!/^[^@]+@[^@]+\.[^@]+$/.test(email)){intToast('warn','Invalid email','Please enter a valid email address','');return;}
  var phone=prompt('Enter WhatsApp number (with country code, e.g. +919876543210) — or leave blank to skip:','');
  if(phone===null)return;
  if(!email&&!phone){intToast('warn','Nothing to send to','Please enter email or WhatsApp number','');return;}
  // Simulate sending
  intToast('info','Sending report…','Please wait','');
  setTimeout(function(){
    if(email)intToast('success','Report sent to email',email,'EvaEraHealth');
    if(phone)intToast('success','Report sent via WhatsApp',phone,'EvaEraHealth');
  },1400);
}

function intToast(type,title,msg,src){
  var tc=document.getElementById('int-toast-c');
  if(!tc)return;
  var t=document.createElement('div');
  t.className='int-toast '+type;
  var body=document.createElement('div');body.style.flex='1';
  var ti=document.createElement('div');ti.style.cssText='font-size:12px;font-weight:700;color:#1E293B';ti.textContent=title;
  body.appendChild(ti);
  if(msg){var ms=document.createElement('div');ms.style.cssText='font-size:11px;color:#64748B;margin-top:1px';ms.textContent=msg;body.appendChild(ms);}
  var sr=document.createElement('div');sr.style.cssText='font-size:9px;font-weight:700;opacity:.5;margin-top:2px;text-transform:uppercase';sr.textContent=src;
  body.appendChild(sr);
  var cl=document.createElement('div');cl.style.cssText='cursor:pointer;font-size:14px;color:#64748B;flex-shrink:0';cl.textContent='x';
  cl.onclick=function(){tc.removeChild(t);};
  t.appendChild(body);t.appendChild(cl);
  tc.appendChild(t);
  setTimeout(function(){t.classList.add('out');setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);},300);},4500);
}

// Portal navigation
function intEnter(p){
  document.getElementById('int-launcher').style.display='none';
  if(p==='patient')showScreen('auth-screen');
  else if(p==='hcp')showScreen('hcp-auth-screen');
  else if(p==='admin')showScreen('adm-login-screen');
}
function intShowLauncher(){
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  document.getElementById('int-launcher').style.display='flex';
}

// OTP input auto-advance
function intOTPnx(el,rid){
  if(el.value.length===1){
    var row=document.getElementById(rid);
    var ins=Array.from(row.querySelectorAll('input[maxlength="1"]'));
    var i=ins.indexOf(el);
    if(i<ins.length-1)ins[i+1].focus();
  }
}

// Admin login — Step 1: Password
function admVPass(){
  var em=document.getElementById('adm-em').value.trim();
  var pw=document.getElementById('adm-pw').value;
  if(em!=='admin@evaerahealth.in'||pw!=='Admin@2026'){
    document.getElementById('adm-e1').style.display='block';return;
  }
  document.getElementById('adm-e1').style.display='none';
  document.getElementById('adm-s1').style.display='none';
  document.getElementById('adm-s2').style.display='block';
  var si2=document.getElementById('adm-si2');if(si2)si2.style.background='#C0305A';
  var sl=document.getElementById('adm-step-lbl');if(sl)sl.textContent='Step 2 of 2';
  document.getElementById('ao0').focus();
}

// Admin login — Step 2: TOTP
function admVTOTP(){
  var v=[0,1,2,3,4,5].map(function(i){return document.getElementById('ao'+i).value;}).join('');
  if(v.length<6){document.getElementById('adm-e2').style.display='block';return;}
  document.getElementById('adm-e2').style.display='none';
  showScreen('adm-portal-screen');
  iLogA('ok','Admin logged in','Super Admin authenticated','System');
  intToast('success','Welcome, Super Admin','Admin portal access granted','Admin');
  intRAdm();
}

// Admin sidebar navigation
function showAdmMod(n,btn){
  document.querySelectorAll('.adm-mod').forEach(function(m){m.classList.remove('on');});
  document.querySelectorAll('.adm-nav').forEach(function(b){b.classList.remove('on');});
  var mod=document.getElementById('admmod-'+n);
  if(mod)mod.classList.add('on');
  if(btn)btn.classList.add('on');
  if(n==='slots'){admFSF();admRSl();}
  if(n==='payments')admRPy();
  if(n==='compliance')admRCp();
}

// Admin — Edit consultant opener
function admOpenEdit(cid){
  var list=iLd(IK.cn,[]);var c=list.find(function(x){return x.id===cid;});if(!c)return;
  var ttl=document.getElementById('adm-con-ttl');if(ttl)ttl.textContent='Edit Consultant';
  var btn=document.getElementById('anc-savebtn');if(btn)btn.textContent='Save Changes';
  document.getElementById('anc-nm').value=c.name||'';
  document.getElementById('anc-ql').value=c.qual||'';
  document.getElementById('anc-la').value=c.lang||'Hindi, English';
  document.getElementById('anc-fe').value=c.fee||1500;
  document.getElementById('anc-exp').value=c.exp||'';
  document.getElementById('anc-eid').value=cid;
  // Set spec
  var sp=document.getElementById('anc-sp');var spFound=false;
  for(var i=0;i<sp.options.length;i++){
    if(sp.options[i].text.replace(/&amp;/g,'&')===c.spec||sp.options[i].value===c.spec){sp.selectedIndex=i;spFound=true;break;}
  }
  if(!spFound){sp.value='custom';var sc2=document.getElementById('anc-sp-c');if(sc2){sc2.style.display='block';sc2.value=c.spec||'';}}
  // Set duration
  var durSel=document.getElementById('anc-dur');var stdDur=['20','30','45','60','90'];
  if(durSel&&c.defaultDur){
    if(stdDur.indexOf(String(c.defaultDur))>=0){durSel.value=String(c.defaultDur);}
    else{durSel.value='c';var dc=document.getElementById('anc-dur-c');if(dc){dc.style.display='block';dc.value=c.defaultDur;}}
  }
  document.getElementById('adm-con-modal').style.display='flex';
}
// Admin — Toggle consultant active state
function admTogCon(cid){
  var list=iLd(IK.cn,[]);var c=list.find(function(x){return x.id===cid;});if(!c)return;
  c.active=!c.active;iSv(IK.cn,list);
  intToast(c.active?'success':'info',c.name+(c.active?' activated':' deactivated'),'','Admin');intRAdm();
}
// Admin — Add/Save Consultant
function admACon(){
  var nm=document.getElementById('anc-nm').value.trim();
  if(!nm){intToast('warn','Name required','','');return;}
  var rawSpec=document.getElementById('anc-sp').value;
  var spec=(rawSpec==='custom')?(document.getElementById('anc-sp-c').value.trim()||'Custom'):rawSpec;
  var rawDur=document.getElementById('anc-dur').value;
  var defaultDur=(rawDur==='c')?(parseInt(document.getElementById('anc-dur-c').value)||30):parseInt(rawDur)||30;
  var editId=document.getElementById('anc-eid').value;
  var list=iLd(IK.cn,[]);
  if(editId){
    var c=list.find(function(x){return x.id===editId;});
    if(c){c.name=nm;c.qual=document.getElementById('anc-ql').value;c.spec=spec;
      c.fee=parseInt(document.getElementById('anc-fe').value)||1500;
      c.lang=document.getElementById('anc-la').value;c.exp=document.getElementById('anc-exp').value;
      c.defaultDur=defaultDur;}
    iSv(IK.cn,list);
    intToast('success','Consultant Updated',nm+' saved','Admin');
  } else {
    var emailSlug=nm.toLowerCase().replace(/dr\.\s*/,'').replace(/\s+/g,'.').replace(/[^a-z.]/g,'');
    var hcpEmail=emailSlug+'@evaerahealth.in';
    var hcpPass='Eva'+Math.random().toString(36).slice(2,6).toUpperCase()+'#'+Math.floor(10+Math.random()*90);
    var c={id:'CON-'+Date.now(),name:nm,qual:document.getElementById('anc-ql').value,spec:spec,
      fee:parseInt(document.getElementById('anc-fe').value)||1500,lang:document.getElementById('anc-la').value,
      exp:document.getElementById('anc-exp').value,defaultDur:defaultDur,active:true,
      hcpEmail:hcpEmail,hcpPass:hcpPass,addedAt:new Date().toLocaleString('en-IN')};
    list.push(c);iSv(IK.cn,list);
    var creds=iLd('evh_hcp_creds',{});creds[hcpEmail]=hcpPass;iSv('evh_hcp_creds',creds);
    iLogA('ok','Consultant added - '+nm,spec+' Rs'+c.fee,'Admin');
    iBcast('new_con',c);
    admShowCred(nm,hcpEmail,hcpPass);
  }
  document.getElementById('adm-con-modal').style.display='none';
  document.getElementById('anc-nm').value='';document.getElementById('anc-eid').value='';
  var ttl=document.getElementById('adm-con-ttl');if(ttl)ttl.textContent='Add Consultant';
  var btn=document.getElementById('anc-savebtn');if(btn)btn.textContent='Add → Visible in Patient Booking Now';
  intRAdm();
}
function admShowCred(name,email,pass){
  var m=document.createElement('div');
  m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  m.innerHTML='<div style="background:#fff;border-radius:16px;padding:24px;max-width:400px;width:100%">'
    +'<div style="font-size:22px;text-align:center;margin-bottom:8px">&#x1F510;</div>'
    +'<div style="font-size:15px;font-weight:800;color:#0F1E3C;text-align:center;margin-bottom:4px">HCP Credentials Generated</div>'
    +'<div style="font-size:12px;color:#64748B;text-align:center;margin-bottom:14px">Share securely with '+name+'</div>'
    +'<div style="background:#F0FDF4;border:1.5px solid #86EFAC;border-radius:10px;padding:14px;margin-bottom:10px">'
    +'<div style="font-size:11px;font-weight:700;color:#166534;margin-bottom:6px">&#x1F4E7; HCP Portal Login</div>'
    +'<div style="font-size:13px;font-weight:700;color:#0F1E3C;font-family:monospace">'+email+'</div>'
    +'<div style="font-size:12px;color:#374151;margin-top:4px">Password / OTP: <strong style="font-family:monospace;color:#166534;font-size:14px">'+pass+'</strong></div>'
    +'<div style="font-size:10px;color:#9CA3AF;margin-top:4px">Enter first 4 digits of password as OTP in demo mode</div>'
    +'</div>'
    +'<div style="font-size:10px;color:#9CA3AF;margin-bottom:12px;text-align:center">&#x26A0; In production: send via encrypted email only.</div>'
    +'<button id="admcred-copy-btn" style="width:100%;padding:10px;background:#0F1E3C;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;margin-bottom:8px">&#x1F4CB; Copy &amp; Close</button>'
    +'<button id="admcred-close-btn" style="width:100%;padding:8px;background:#fff;border:1.5px solid #E2E8F0;border-radius:8px;font-weight:600;cursor:pointer;font-size:12px">Close without copying</button>'
    +'</div>';
  document.body.appendChild(m);
  // Wire buttons safely with closures — no inline quote collision
  var _clb = m.querySelector('#admcred-close-btn');
  if(_clb){ _clb.onclick = function(){ m.remove(); }; }
  var _cb = m.querySelector('#admcred-copy-btn');
  if(_cb){
    var _cem = email, _cpw = pass;
    _cb.onclick = function(){
      try{ navigator.clipboard.writeText('Email: ' + _cem + '\nPassword: ' + _cpw); }catch(e){}
      intToast('success','Credentials copied — share securely','','Admin');
      m.remove();
    };
  }
  // Click outside to dismiss
  m.addEventListener('click', function(ev){ if(ev.target === m) m.remove(); });
}

// Admin — Open Add Slot modal
function admOSl(){
  var cons=iLd(IK.cn,[]).filter(function(c){return c.active;});
  var sel=document.getElementById('ans-con');
  sel.innerHTML=cons.length
    ?cons.map(function(c){return '<option value="'+c.id+'">'+c.name+'</option>';}).join('')
    :'<option>No consultants yet</option>';
  var d=document.getElementById('ans-dt');
  if(d&&!d.value)d.value=new Date().toISOString().slice(0,10);
  document.getElementById('adm-slot-modal').style.display='flex';
}

// Admin — Add Slot
function admASl(){
  var cid=document.getElementById('ans-con').value;
  var dt=document.getElementById('ans-dt').value;
  if(!cid||!dt){intToast('warn','Fill all fields','','');return;}
  var con=iLd(IK.cn,[]).find(function(c){return c.id===cid;});
  var sl={
    id:'SLT-'+Date.now(),consultantId:cid,
    consultantName:con?con.name:'',
    date:dt,
    time:document.getElementById('ans-tm').value,
    dur:parseInt(document.getElementById('ans-du').value),
    status:'available',
    addedAt:new Date().toLocaleString('en-IN')
  };
  var sls=iLd(IK.sl,[]);sls.push(sl);iSv(IK.sl,sls);
  iLogA('ok','Slot added - '+(con?con.name:''),dt+' '+sl.time,'Admin');
  iBcast('new_slot',sl);
  document.getElementById('adm-slot-modal').style.display='none';
  intToast('success','Slot Added',dt+' '+sl.time,'Admin');
  intRAdm();
}

// Admin render — Consultants
function admRCon(){
  var list=iLd(IK.cn,[]);var sls=iLd(IK.sl,[]);
  var tb=document.getElementById('adm-con-tb');if(!tb)return;
  if(!list.length){
    tb.innerHTML='<tr><td colspan="6" style="text-align:center;color:#64748B;padding:16px">No consultants yet. Add one to enable patient booking.</td></tr>';
    return;
  }
  var sp={
    'Gynaecologist & Menopause Consultant':'abd-b','Menopause Specialist':'abd-p',
    'Psychiatrist':'abd-r','Clinical Psychologist':'abd-a','Counsellor':'abd-a',
    'Ayurveda Consultant':'abd-g','Clinical Nutritionist':'abd-g','Physiotherapist':'abd-b',
    'Yoga Instructor':'abd-g','Lifestyle Coach':'abd-p','Aerobics & Zumba Expert':'abd-p',
    'Dermatologist':'abd-b','Sexologist':'abd-a','Earth Harmony Expert':'abd-g',
    'Gynaecologist':'abd-b','Psychologist':'abd-a','Ayurvedic Physician':'abd-g'
  };
  tb.innerHTML=list.map(function(c){
    var av=sls.filter(function(s){return s.consultantId===c.id&&s.status==='available';}).length;
    return '<tr>'
      +'<td><strong>'+c.name+'</strong><div style="font-size:10px;color:#64748B">'+c.qual+'</div></td>'
      +'<td><span class="abd '+(sp[c.spec]||'abd-s')+'">'+c.spec+'</span></td>'
      +'<td>Rs '+c.fee+'</td>'
      +'<td><span class="abd '+(av>0?'abd-g':'abd-s')+'">'+av+' available</span></td>'
      +'<td><span class="abd '+(c.active?'abd-g':'abd-s')+'">'+(c.active?'Active':'Off')+'</span></td>'
      +'<td style="white-space:nowrap">'
      +'<button onclick="admOpenEdit(\''+c.id+'\')" style="padding:3px 8px;background:#1E40AF;color:#fff;border:none;border-radius:5px;font-size:10px;cursor:pointer;margin-right:3px">&#x270F; Edit</button>'
      +'<button onclick="admTogCon(\''+c.id+'\')" style="padding:3px 8px;background:'+(c.active?'#7F1D1D':'#166534')+';color:#fff;border:none;border-radius:5px;font-size:10px;cursor:pointer">'+(c.active?'Deactivate':'Activate')+'</button>'
      +'</td>'
      +'</tr>';
  }).join('');
}

// Admin render — Slots
function admFSF(){
  var el=document.getElementById('adm-sf');if(!el)return;
  var cons=iLd(IK.cn,[]);
  el.innerHTML='<option value="">All</option>'+cons.map(function(c){
    return '<option value="'+c.id+'">'+c.name+'</option>';
  }).join('');
}
function admRSl(){
  var cid=document.getElementById('adm-sf')?document.getElementById('adm-sf').value:'';
  var sls=iLd(IK.sl,[]);
  if(cid)sls=sls.filter(function(s){return s.consultantId===cid;});
  var tb=document.getElementById('adm-slot-tb');if(!tb)return;
  if(!sls.length){tb.innerHTML='<tr><td colspan="6" style="text-align:center;color:#64748B;padding:16px">No slots yet</td></tr>';return;}
  tb.innerHTML=sls.map(function(s){
    return '<tr>'
      +'<td>'+s.consultantName+'</td><td>'+s.date+'</td><td>'+s.time+'</td>'
      +'<td>'+(s.dur||30)+'min</td>'
      +'<td><span class="abd '+(s.status==='available'?'abd-g':s.status==='booked'?'abd-r':'abd-s')+'">'+s.status+'</span></td>'
      +'<td style="font-size:10px">'+(s.bookedBy||'--')+'</td></tr>';
  }).join('');
}

// Admin render — Appointments
function admRAp(){
  var aps=iLd(IK.ap,[]);
  var b=document.getElementById('adm-apt-badge');if(b)b.textContent=aps.length;
  var ea=document.getElementById('adms-ap');if(ea)ea.textContent=aps.length;
  var tb=document.getElementById('adm-appt-tb');if(!tb)return;
  if(!aps.length){tb.innerHTML='<tr><td colspan="7" style="text-align:center;color:#64748B;padding:16px">No appointments yet</td></tr>';return;}
  tb.innerHTML=aps.map(function(a){
    return '<tr>'
      +'<td style="font-family:monospace;font-size:10px">'+a.id+'</td>'
      +'<td>'+a.patientName+'</td><td>'+a.consultantName+'</td>'
      +'<td>'+a.date+' '+a.time+'</td>'
      +'<td>'+(a.mode==='online'?'Online':'Offline')+'</td>'
      +'<td><span class="abd abd-g">Rs '+a.fee+'</span></td>'
      +'<td><span class="abd '+(a.status==='completed'?'abd-b':a.status==='cancelled'?'abd-r':'abd-g')+'">'+a.status+'</span>'
      +(a.status==='confirmed'?'<button onclick="admMarkApptComplete(&quot;'+a.id+'&quot;)" style="margin-left:5px;padding:2px 7px;background:#1E40AF;color:#fff;border:none;border-radius:5px;font-size:10px;cursor:pointer">&#x2713; Complete</button>':'')
      +'</td></tr>';
  }).join('');
}

// Admin render — Payments
function admMarkApptComplete(apId){
  var aps=iLd(IK.ap,[]);var ap=aps.find(function(a){return a.id===apId;});if(!ap)return;
  ap.status='completed';ap.completedAt=new Date().toLocaleString('en-IN');
  iSv(IK.ap,aps);
  iLogA('ok','Appointment completed',ap.patientName+' with '+ap.consultantName,'Admin');
  intToast('success','Marked Complete',ap.patientName+' consultation done','Admin');
  intRAdm();
}
function admRPy(){
  var pays=iLd(IK.py,[]);
  var ok=pays.filter(function(p){return p.status==='success';});
  var rev=ok.reduce(function(s,p){return s+p.amount;},0);
  var er=document.getElementById('pstat-rv');if(er)er.textContent='Rs '+rev.toLocaleString('en-IN');
  var eo=document.getElementById('pstat-ok');if(eo)eo.textContent=ok.length;
  var ep=document.getElementById('pstat-pe');if(ep)ep.textContent=pays.filter(function(p){return p.status==='pending';}).length;
  var ef=document.getElementById('pstat-fa');if(ef)ef.textContent=pays.filter(function(p){return p.status==='failed';}).length;
  var tb=document.getElementById('adm-pay-tb');if(!tb)return;
  if(!pays.length){tb.innerHTML='<tr><td colspan="6" style="text-align:center;color:#64748B;padding:16px">No transactions yet</td></tr>';return;}
  tb.innerHTML=pays.map(function(p){
    return '<tr>'
      +'<td style="font-family:monospace;font-size:10px">'+p.id+'</td>'
      +'<td>'+p.patientName+'</td><td>Rs '+p.amount+'</td>'
      +'<td>'+(p.method||'').toUpperCase()+'</td>'
      +'<td style="font-size:10px">'+p.ts+'</td>'
      +'<td><span class="abd '+(p.status==='success'?'abd-g':p.status==='failed'?'abd-r':'abd-a')+'">'+p.status+'</span></td>'
      +'</tr>';
  }).join('');
}

// Admin render — Compliance
function admRCp(){
  var cs=iLd(IK.cs,[]);
  var el=document.getElementById('adm-comp-b');if(!el)return;
  var rows=[
    ['Para 6(1) Informed Consent','8-item consent logged per session','abd-g','Compliant'],
    ['Para 7 Data Minimisation','Only clinically required data','abd-g','Compliant'],
    ['Para 8 Purpose Limitation','Assessment, triage and booking only','abd-g','Compliant'],
    ['Para 11 Right to Erasure','Delete My Data button available','abd-a','Demo mode'],
    ['Para 13 Data Fiduciary','DPO: dpo@evaerahealth.in','abd-g','Compliant'],
    ['DPIA','Data Protection Impact Assessment','abd-r','Required before launch'],
    ['IEC/IRB','Ethics dossier submitted Mar 2026','abd-a','Awaiting approval']
  ];
  var html='';
  rows.forEach(function(r){
    html+='<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #E2E8F0">'
      +'<div><div style="font-size:12px;font-weight:700;color:#0F1E3C">'+r[0]+'</div>'
      +'<div style="font-size:10px;color:#64748B;margin-top:2px">'+r[1]+'</div></div>'
      +'<span class="abd '+r[2]+'" style="flex-shrink:0">'+r[3]+'</span></div>';
  });
  html+='<div style="font-size:10px;color:#64748B;margin-top:8px;padding:9px;background:#F8FAFC;border-radius:8px">Consent records: <strong>'+cs.length+'</strong></div>';
  el.innerHTML=html;
}

// Admin render — Dashboard
function admRDash(){
  var pts=iLd(IK.pt,[]);var aps=iLd(IK.ap,[]);var pays=iLd(IK.py,[]);var cons=iLd(IK.cn,[]);
  var ea=document.getElementById('adms-as');if(ea)ea.textContent=pts.length;
  var eap=document.getElementById('adms-ap');if(eap)eap.textContent=aps.length;
  var er=document.getElementById('adms-rv');
  if(er)er.textContent='Rs '+pays.filter(function(p){return p.status==='success';}).reduce(function(s,p){return s+p.amount;},0).toLocaleString('en-IN');
  var ec=document.getElementById('adms-cn');if(ec)ec.textContent=cons.filter(function(c){return c.active;}).length;
  var feed=iLd(IK.ac,[]);
  var fel=document.getElementById('adm-feed-b');
  if(fel){
    if(feed.length){
      var fhtml='';
      feed.slice(0,8).forEach(function(x){
        fhtml+='<div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid #E2E8F0">'
          +'<div style="width:7px;height:7px;border-radius:50%;background:#0B7B74;flex-shrink:0;margin-top:5px"></div>'
          +'<div><div style="font-size:12px;font-weight:600">'+x.title+'</div>'
          +'<div style="font-size:10px;color:#64748B;margin-top:1px">'+x.desc+' &bull; '+x.ts+' &bull; '+x.src+'</div></div></div>';
      });
      fel.innerHTML=fhtml;
    } else {
      fel.innerHTML='<div style="text-align:center;padding:24px;color:#64748B">Waiting for activity...</div>';
    }
  }
  var ra=document.getElementById('adm-rec-ap');
  if(ra){
    if(aps.length){
      var rhtml='<table class="adm-tbl"><thead><tr><th>Patient</th><th>Consultant</th><th>Date/Time</th><th>Mode</th><th>Status</th></tr></thead><tbody>';
      aps.slice(0,5).forEach(function(a){
        rhtml+='<tr><td>'+a.patientName+'</td><td>'+a.consultantName+'</td>'
          +'<td>'+a.date+' '+a.time+'</td>'
          +'<td>'+(a.mode==='online'?'Online':'Offline')+'</td>'
          +'<td><span class="abd abd-g">'+a.status+'</span></td></tr>';
      });
      ra.innerHTML=rhtml+'</tbody></table>';
    } else {
      ra.innerHTML='<div style="padding:12px;text-align:center;font-size:12px;color:#64748B">No appointments yet</div>';
    }
  }
}

function intRAdm(){
  admRDash();admRCon();admRAp();admRSl();
  if(document.getElementById('admmod-payments')&&document.getElementById('admmod-payments').classList.contains('on'))admRPy();
}

// ── BOOKING FLOW ────────────────────────────────────────────────
var BK={step:1,mode:null,con:null,slot:null,pay:'upi'};

function intShowBooking(){
  BK={step:1,mode:null,con:null,slot:null,pay:'upi'};
  showScreen('int-bk-screen');
  intRBk();
}

function intRBk(){
  var subs=['','Choose appointment type','Select your doctor','Choose a time slot','Payment','Confirmed!'];
  for(var i=1;i<=5;i++){
    var d=document.getElementById('ibpd'+i);var l=document.getElementById('ibpl'+i);
    if(d)d.className='ibpd '+(i<BK.step?'done':i===BK.step?'active':'');
    if(l)l.className='ibpl '+(i<BK.step?'done':'');
  }
  var sub=document.getElementById('int-bk-sub');
  if(sub)sub.textContent='Step '+BK.step+' of 5 - '+subs[BK.step];
  var bb=document.getElementById('ibk-bk');if(bb)bb.style.display=BK.step>1&&BK.step<5?'block':'none';
  var bn=document.getElementById('ibk-nx');if(bn)bn.style.display=BK.step<4?'block':'none';
  intRBkContent();
}

// Render booking step content using DOM (avoids string escaping issues)
function intRBkContent(){
  var bc=document.getElementById('int-bk-body');
  if(!bc)return;
  bc.innerHTML='';

  if(BK.step===1){
    var grid=document.createElement('div');
    grid.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:12px';
    ['online','offline'].forEach(function(m){
      var card=document.createElement('div');
      card.style.cssText='border:2px solid #E2E8F0;background:#fff;border-radius:12px;padding:20px;cursor:pointer;text-align:center;transition:.2s';
      card.innerHTML='<div style="font-size:28px;margin-bottom:7px">'+(m==='online'?'🖥️':'🏥')+'</div>'
        +'<div style="font-size:13px;font-weight:700">'+(m==='online'?'Online Video':'In-Person Visit')+'</div>'
        +'<div style="font-size:11px;color:#64748B;margin-top:5px">'+(m==='online'?'Secure video call. Link via WhatsApp. Expires T+60 min.':'Gurugram clinic. QR code entry pass via WhatsApp.')+'</div>';
      card.onclick=function(){
        BK.mode=m;
        bc.querySelectorAll('[data-mode]').forEach(function(x){x.style.borderColor='#E2E8F0';x.style.background='#fff';});
        card.style.borderColor=m==='online'?'var(--teal)':'var(--purple)';
        card.style.background=m==='online'?'var(--teal-lt)':'var(--purple-lt)';
      };
      card.setAttribute('data-mode',m);
      if(BK.mode===m){card.style.borderColor=m==='online'?'var(--teal)':'var(--purple)';card.style.background=m==='online'?'var(--teal-lt)':'var(--purple-lt)';}
      grid.appendChild(card);
    });
    bc.appendChild(grid);
    return;
  }

  if(BK.step===2){
    var cons=iLd(IK.cn,[]).filter(function(c){return c.active;});
    if(!cons.length){
      bc.innerHTML='<div style="text-align:center;padding:32px;color:#64748B"><div style="font-size:28px;margin-bottom:8px">👩‍⚕️</div>No consultants yet.<br>Open Admin Portal and add consultants first.</div>';
      return;
    }
    cons.forEach(function(c,ci){
      var card=document.createElement('div');
      card.style.cssText='border:1.5px solid '+(BK.con&&BK.con.id===c.id?'var(--teal)':'#E2E8F0')+';background:'+(BK.con&&BK.con.id===c.id?'var(--teal-lt)':'#fff')+';border-radius:10px;padding:12px;cursor:pointer;display:flex;align-items:center;gap:10px;margin-bottom:7px;transition:.15s';
      var initials=c.name.replace('Dr. ','').split(' ').map(function(w){return w[0]||'';}).join('').slice(0,2);
      card.innerHTML='<div style="width:38px;height:38px;border-radius:50%;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0">'+initials+'</div>'
        +'<div style="flex:1"><div style="font-size:13px;font-weight:700">'+c.name+'</div>'
        +'<div style="font-size:11px;color:#64748B">'+c.qual+' - '+c.spec+'</div>'
        +'<div style="font-size:11px;color:#64748B">'+c.lang+' - Rs '+c.fee+'</div></div>';
      card.onclick=function(){
        BK.con=c;
        bc.querySelectorAll('[data-cid]').forEach(function(x){x.style.borderColor='#E2E8F0';x.style.background='#fff';});
        card.style.borderColor='var(--teal)';card.style.background='var(--teal-lt)';
      };
      card.setAttribute('data-cid',c.id);
      bc.appendChild(card);
    });
    return;
  }

  if(BK.step===3){
    if(!BK.con){bc.innerHTML='<div style="font-size:12px;color:#64748B">Go back and select a consultant.</div>';return;}
    var slots=iLd(IK.sl,[]).filter(function(s){return s.consultantId===BK.con.id&&s.status==='available';});
    if(!slots.length){
      bc.innerHTML='<div style="text-align:center;padding:32px;color:#64748B"><div style="font-size:28px;margin-bottom:8px">📅</div>No slots for '+BK.con.name+'.<br>Open Admin Portal and add slots.</div>';
      return;
    }
    var lbl=document.createElement('div');lbl.style.cssText='font-size:12px;color:#64748B;margin-bottom:8px';lbl.textContent='Available slots for '+BK.con.name+':';bc.appendChild(lbl);
    var grid2=document.createElement('div');grid2.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:8px';
    slots.forEach(function(s){
      var btn=document.createElement('div');
      btn.style.cssText='padding:9px 5px;border:1.5px solid '+(BK.slot&&BK.slot.id===s.id?'var(--teal)':'#E2E8F0')+';background:'+(BK.slot&&BK.slot.id===s.id?'var(--teal-lt)':'#fff')+';border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;text-align:center;transition:.15s';
      btn.innerHTML=s.date+'<br><strong>'+s.time+'</strong><br>'+(s.dur||30)+'min';
      btn.onclick=function(){
        BK.slot=s;
        grid2.querySelectorAll('div').forEach(function(x){x.style.borderColor='#E2E8F0';x.style.background='#fff';});
        btn.style.borderColor='var(--teal)';btn.style.background='var(--teal-lt)';
      };
      grid2.appendChild(btn);
    });
    bc.appendChild(grid2);
    return;
  }

  if(BK.step===4){
    var summary=document.createElement('div');
    summary.style.cssText='background:var(--amber-lt);border:1px solid #C47A0A;border-radius:10px;padding:13px;margin-bottom:12px';
    summary.innerHTML='<div style="font-size:13px;font-weight:700;margin-bottom:8px">Order Summary</div>'
      +'<div style="font-size:12px">Consultant: <strong>'+(BK.con?BK.con.name:'')+'</strong></div>'
      +'<div style="font-size:12px">Date &amp; Time: <strong>'+(BK.slot?BK.slot.date+' '+BK.slot.time:'')+'</strong></div>'
      +'<div style="font-size:12px">Mode: <strong>'+(BK.mode==='online'?'Online Video':'In-Person')+'</strong></div>'
      +'<div style="font-size:12px;border-top:1px solid rgba(0,0,0,.08);margin-top:8px;padding-top:7px">Fee: <strong style="color:#C47A0A">Rs '+(BK.con?BK.con.fee:1500)+'</strong></div>';
    bc.appendChild(summary);
    var pmLabel=document.createElement('div');pmLabel.style.cssText='font-size:12px;color:#64748B;margin-bottom:8px';pmLabel.textContent='Payment method:';bc.appendChild(pmLabel);
    var pgrid=document.createElement('div');pgrid.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px';
    [{k:'upi',t:'UPI',s:'PhonePe, GPay'},{k:'card',t:'Card',s:'Debit/Credit'},{k:'nb',t:'Net Banking',s:'All banks'},{k:'wallet',t:'Wallet',s:'Paytm, Amazon'}].forEach(function(pm){
      var pcard=document.createElement('div');
      pcard.style.cssText='border:1.5px solid '+(BK.pay===pm.k?'#C47A0A':'#E2E8F0')+';background:'+(BK.pay===pm.k?'var(--amber-lt)':'#fff')+';border-radius:9px;padding:11px;cursor:pointer;transition:.15s';
      pcard.innerHTML='<div style="font-size:12px;font-weight:700">'+pm.t+'</div><div style="font-size:10px;color:#64748B">'+pm.s+'</div>';
      pcard.onclick=function(){
        BK.pay=pm.k;
        pgrid.querySelectorAll('div').forEach(function(x){x.style.borderColor='#E2E8F0';x.style.background='#fff';});
        pcard.style.borderColor='#C47A0A';pcard.style.background='var(--amber-lt)';
      };
      pgrid.appendChild(pcard);
    });
    bc.appendChild(pgrid);
    var paybtn=document.createElement('button');
    paybtn.id='int-pay-b';
    paybtn.style.cssText='width:100%;padding:11px;background:var(--rose);color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer';
    paybtn.textContent='Pay Rs '+(BK.con?BK.con.fee:1500)+' via Razorpay';
    paybtn.onclick=intPay;
    bc.appendChild(paybtn);
    return;
  }

  if(BK.step===5){
    var wrap=document.createElement('div');wrap.style.cssText='text-align:center;padding:20px 10px';
    wrap.innerHTML='<div style="font-size:44px;margin-bottom:10px">🎉</div>'
      +'<div style="font-size:18px;font-weight:800;color:#166534;margin-bottom:5px">Appointment Confirmed!</div>';
    var detDiv=document.createElement('div');detDiv.id='int-cnf-det';detDiv.style.cssText='text-align:left;margin:12px 0';
    wrap.appendChild(detDiv);
    var notif=document.createElement('div');
    notif.style.cssText='background:var(--teal-lt);border:1px solid var(--teal);border-radius:9px;padding:11px;font-size:11px;color:var(--teal);margin-bottom:12px';
    notif.innerHTML='📱 WhatsApp + SMS confirmation sent<br>⏰ Reminder 30 minutes before your appointment<br>'+(BK.mode==='online'?'🔗 Video link expires 60 minutes after start time':'🏥 QR code entry pass sent to WhatsApp');
    wrap.appendChild(notif);
    var backbtn=document.createElement('button');
    backbtn.style.cssText='width:100%;padding:10px;background:#fff;border:1.5px solid #E2E8F0;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer';
    backbtn.textContent='Back to My Results';
    backbtn.onclick=function(){showScreen('results-screen');};
    wrap.appendChild(backbtn);
    bc.appendChild(wrap);
    return;
  }
}

function intBkNx(){
  if(BK.step===1&&!BK.mode){intToast('warn','Please select Online or In-Person first','','');return;}
  if(BK.step===2&&!BK.con){intToast('warn','Please select a consultant','','');return;}
  if(BK.step===3&&!BK.slot){intToast('warn','Please select an available slot','','');return;}
  BK.step++;intRBk();
}
function intBkPv(){if(BK.step>1&&BK.step<5){BK.step--;intRBk();}}

function intPay(){
  var btn=document.getElementById('int-pay-b');
  if(btn){btn.textContent='Processing via Razorpay...';btn.disabled=true;}
  setTimeout(function(){
    var pts=iLd(IK.pt,[]);
    var pat=pts[0]||{id:'GUEST-'+Date.now(),name:'Patient'};
    var ap={
      id:'EVH-'+Date.now(),
      patientId:pat.id,patientName:pat.name,
      consultantId:BK.con.id,consultantName:BK.con.name,
      date:BK.slot.date,time:BK.slot.time,
      mode:BK.mode,dur:BK.slot.dur||30,
      fee:BK.con.fee||1500,payMethod:BK.pay,
      payId:'RZP-'+Math.random().toString(36).substr(2,8).toUpperCase(),
      status:'confirmed',
      videoLink:BK.mode==='online'?'https://meet.evaerahealth.in/'+Math.random().toString(36).substr(2,8):null,
      ts:new Date().toLocaleString('en-IN'),bookedAt:Date.now()
    };
    var aps=iLd(IK.ap,[]);aps.unshift(ap);iSv(IK.ap,aps);
    var pays=iLd(IK.py,[]);
    pays.unshift({id:ap.payId,patientName:ap.patientName,consultantName:ap.consultantName,amount:ap.fee,method:BK.pay,status:'success',ts:ap.ts});
    iSv(IK.py,pays);
    var sls=iLd(IK.sl,[]);
    var sl=sls.find(function(s){return s.id===BK.slot.id;});
    if(sl){sl.status='booked';sl.bookedBy=ap.patientName;iSv(IK.sl,sls);}
    iLogA('ok','Appointment booked - '+ap.patientName,(BK.mode==='online'?'Online':'Offline')+' with '+ap.consultantName+' on '+ap.date+' '+ap.time,'Patient');
    iLogA('ok','Payment received - Rs '+ap.fee,ap.payId+' '+BK.pay.toUpperCase(),'Razorpay');
    iBcast('new_book',ap);
    BK.step=5;intRBk();
    var cd=document.getElementById('int-cnf-det');
    if(cd){
      var rows=[
        ['Booking ID','<span style="font-family:monospace;font-size:10px">'+ap.id+'</span>'],
        ['Consultant',ap.consultantName],
        ['Date & Time',ap.date+' '+ap.time],
        ['Mode',BK.mode==='online'?'Online Video':'In-Person']
      ];
      if(ap.videoLink)rows.push(['Video Link','<span style="font-size:10px;color:var(--teal)">'+ap.videoLink+'</span>']);
      rows.push(['Payment','<strong style="color:#166534">Rs '+ap.fee+' Paid</strong>']);
      var detHtml='<div style="background:#F8FAFC;border-radius:9px;padding:12px;display:grid;gap:6px;font-size:12px">';
      rows.forEach(function(r){detHtml+='<div style="display:flex;justify-content:space-between"><span>'+r[0]+'</span>'+r[1]+'</div>';});
      detHtml+='</div>';
      cd.innerHTML=detHtml;
    }
    intRAdm();
    intToast('success','Appointment Confirmed!',ap.consultantName+' on '+ap.date+' '+ap.time,'EvaEraHealth');
  },1800);
}

// Patch loadPatients so HCP can see patients from integration store
var _oLP=typeof loadPatients==='function'?loadPatients:function(){};
loadPatients=function(){
  _oLP();
  try{
    var ip=iLd(IK.pt,[]);
    if(ip&&ip.length){
      ip.forEach(function(p){
        if(!S.patients.find(function(x){return x.id===p.id;}))S.patients.push(p);
      });
    }
  }catch(e){}
};

// Seed dummy consultants & slots if none exist (for demo — booking works immediately)
function seedDummyData(){
  var cons=iLd(IK.cn,[]);
  if(cons.length>0)return; // already seeded
  var dummyCons=[
    {id:'CON-D001',name:'Dr. Priya Sharma',qual:'MBBS, MD (Obs & Gyn)',spec:'Gynaecologist',fee:2000,lang:'Hindi, English',active:true,rating:'4.9',exp:'14 yrs',addedAt:'Demo'},
    {id:'CON-D002',name:'Dr. Meera Iyer',qual:'MBBS, MD (Psychiatry)',spec:'Psychologist',fee:1800,lang:'English, Tamil',active:true,rating:'4.8',exp:'10 yrs',addedAt:'Demo'},
    {id:'CON-D003',name:'Dr. Sunita Kapoor',qual:'MBBS, DNB, Menopause Cert.',spec:'Menopause Specialist',fee:2500,lang:'Hindi, English, Punjabi',active:true,rating:'5.0',exp:'18 yrs',addedAt:'Demo'},
    {id:'CON-D004',name:'Dr. Kavya Nair',qual:'BAMS, MD (Ayurveda)',spec:'Ayurvedic Physician',fee:1200,lang:'Malayalam, English, Hindi',active:true,rating:'4.7',exp:'8 yrs',addedAt:'Demo'}
  ];
  iSv(IK.cn,dummyCons);
  // Generate slots: next 7 days, 3 slots/day per consultant
  var sls=[];
  var times=['10:00 AM','02:00 PM','04:30 PM'];
  dummyCons.forEach(function(c){
    for(var d=0;d<7;d++){
      var dt=new Date();dt.setDate(dt.getDate()+d+1);
      var ds=dt.toISOString().slice(0,10);
      times.forEach(function(tm,ti){
        // stagger consultants so not all slots same time
        var tIdx=(ti+(dummyCons.indexOf(c)))%times.length;
        sls.push({id:'SLT-D'+Date.now()+'-'+c.id+'-'+d+'-'+ti,
          consultantId:c.id,consultantName:c.name,
          date:ds,time:times[tIdx],dur:60,status:'available',addedAt:'Demo'});
      });
    }
  });
  iSv(IK.sl,sls);
}

// Init on page load
window.addEventListener('load',function(){
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  var lnc=document.getElementById('int-launcher');
  if(lnc)lnc.style.display='flex';
  ['adm-con-modal','adm-slot-modal'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.addEventListener('click',function(e){if(e.target===el)el.style.display='none';});
  });
  seedDummyData();
  setInterval(function(){intRAdm();},3000);
});