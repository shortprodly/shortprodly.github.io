
"use strict";

const page = location.pathname.split("/").pop() || "index.html";

async function loginPage(){
  const form=document.getElementById("loginForm"); if(!form)return;
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    const identifier=document.getElementById("username").value.trim();
    const password=document.getElementById("password").value;
    if(!identifier||!password) return toastMsg("Email/username dan password wajib diisi.");
    try{
      let email=identifier;
      if(!identifier.includes("@")){
        const {data,error}=await sb.rpc("get_login_email",{p_username:identifier});
        if(error) throw error;
        if(!data) throw new Error("Username tidak ditemukan.");
        email=data;
      }
      const {error}=await sb.auth.signInWithPassword({email,password});
      if(error) throw error;
      location.href="dashboard.html";
    }catch(e){ toastMsg(e.message || "Login gagal."); }
  });
  const {data:{session}}=await sb.auth.getSession();
  if(session) { /* user may still choose to login again */ }
}

async function registerPage(){
  const refInput=document.getElementById("referral");
  if(refInput && !refInput.value) refInput.value=new URLSearchParams(location.search).get("ref")||"";
  window.register=async function(){
    const nama=document.getElementById("nama")?.value.trim();
    const email=document.getElementById("email")?.value.trim();
    const hp=document.getElementById("hp")?.value.trim();
    const password=document.getElementById("password")?.value;
    const referral=document.getElementById("referral")?.value.trim().toUpperCase()||null;
    const err=document.getElementById("error"), ok=document.getElementById("success");
    if(err)err.style.display="none"; if(ok)ok.style.display="none";
    if(!nama||!email||!hp||!password){if(err){err.textContent="Semua data wajib diisi.";err.style.display="block";}return;}
    if(password.length<6){if(err){err.textContent="Password minimal 6 karakter.";err.style.display="block";}return;}
    try{
      const {data,error}=await sb.auth.signUp({
        email,password,
        options:{data:{full_name:nama,phone:hp,referred_by_code:referral}}
      });
      if(error) throw error;
      if(ok){ok.textContent=data.session?"Pendaftaran berhasil.":"Akun dibuat. Silakan cek email untuk verifikasi.";ok.style.display="block";}
      if(data.session) setTimeout(()=>location.href="dashboard.html",700);
    }catch(e){if(err){err.textContent=e.message||"Pendaftaran gagal.";err.style.display="block";}}
  };
}

async function dashboardPage(){
  const s=await initPage(); if(!s)return;
  try{
    const p=await currentProfile(), w=await loadWallet();
    setText("memberName",p.full_name); setText("profileName",p.full_name); setText("profileEmail",p.email);
    setText("balanceValue",moneyIDR(w.balance));
    setText("avatar",(p.full_name||"M").charAt(0).toUpperCase());
    const {count:mc}=await sb.from("user_missions").select("*",{count:"exact",head:true}).eq("user_id",s.user.id).eq("status","completed");
    const {count:rc}=await sb.from("referrals").select("*",{count:"exact",head:true}).eq("referrer_id",s.user.id);
    setText("missionCount",mc||0); setText("refCount",rc||0);
  }catch(e){toastMsg(e.message);}
  window.toggleBalance=async function(){
    const el=document.getElementById("balanceValue"); if(!el)return;
    const w=await loadWallet(); const hidden=el.dataset.hidden==="1";
    el.dataset.hidden=hidden?"0":"1"; el.innerHTML=hidden?`<span>Rp</span>${Number(w.balance||0).toLocaleString("id-ID")}`:"Rp ••••••";
  };
  window.logout=logoutSupabase;
}

async function walletPage(){
  const s=await initPage();if(!s)return;
  const w=await refreshBalance(["amount"]); window.toggleBalance=function(){
    const el=document.getElementById("amount"); const hidden=el.dataset.hidden==="1";
    el.dataset.hidden=hidden?"0":"1"; el.innerHTML=hidden?`<span>Rp</span>${Number(w?.balance||0).toLocaleString("id-ID")}`:"<span>Rp</span>••••••";
  };
}

async function missionPage(){
  const s=await initPage();if(!s)return;
  let missions=[];
  async function load(){
    const {data,error}=await sb.from("missions").select("*").eq("active",true).order("id");
    if(error)throw error;
    const {data:done,error:e2}=await sb.from("user_missions").select("mission_id,claimed_reward").eq("user_id",s.user.id).eq("status","completed");
    if(e2)throw e2;
    const doneMap=new Map((done||[]).map(x=>[String(x.mission_id),x]));
    missions=(data||[]).map(m=>({...m,done:doneMap.has(String(m.id))}));
    render("all");
  }
  function render(filter){
    const list=document.getElementById("list"); if(!list)return;
    const ms=missions.filter(m=>filter==="all"||filter==="daily"||filter==="watch"||filter==="deposit");
    let total=0,count=0;
    ms.forEach(m=>{if(m.done){count++;total+=Number(m.reward||0)}});
    setText("reward",moneyIDR(total));setText("count",`${count} / ${missions.length}`);
    list.innerHTML=ms.map(m=>`<article class="mission"><div class="toprow"><div class="icon">✓</div><div style="flex:1"><div class="name">${escapeHTML(m.title)}</div><div class="desc">${escapeHTML(m.description||"Selesaikan misi ini.")}</div></div><div class="reward"><small>Reward</small><b>${moneyIDR(m.reward)}</b></div></div><div class="foot"><span class="status">${m.done?"Sudah selesai":"Belum selesai"}</span><span class="actions"><button class="btn ${m.done?"secondary":""}" ${m.done?"disabled":""} data-claim="${m.id}">${m.done?"Selesai":"Klaim Reward"}</button></span></div></article>`).join("")||"<p>Belum ada misi aktif.</p>";
    list.querySelectorAll("[data-claim]").forEach(b=>b.onclick=async()=>{
      b.disabled=true;
      try{const {error}=await sb.rpc("claim_mission",{p_mission_id:Number(b.dataset.claim)});if(error)throw error;toastMsg("Reward misi masuk ke saldo.");await load();}
      catch(e){b.disabled=false;toastMsg(e.message||"Gagal klaim.");}
    });
  }
  document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.f)}));
  await load();
}

async function profilePage(){
  const s=await initPage();if(!s)return;
  async function load(){
    const p=await currentProfile();if(!p)return;
    setText("headerName",p.full_name);setText("uid",p.uid);setText("statusBadge",String(p.status).toUpperCase());
    setText("nama",p.full_name);setText("email",p.email);setText("phone",p.phone||"—");setText("referral",p.referral_code);setText("status",p.status);setText("level",p.level);
    const n=Number(String(p.level).match(/\d+/)?.[0]||1);setText("levelShort",n);setText("levelName",`LV ${n}`);setText("nextLevel",`Menuju LV ${n+1}`);
    const xp=Number(p.xp||0), next=50; setText("xpText",`${xp} / ${next} XP`);const bar=document.getElementById("xpBar");if(bar)bar.style.width=Math.min(100,xp/next*100)+"%";
    const en=document.getElementById("editNama");if(en)en.value=p.full_name||"";const ep=document.getElementById("editEmail");if(ep)ep.value=p.email||"";const eh=document.getElementById("editPhone");if(eh)eh.value=p.phone||"";
  }
  window.showEdit=()=>document.getElementById("editForm")?.classList.add("show");
  window.hideEdit=()=>document.getElementById("editForm")?.classList.remove("show");
  window.saveProfile=async()=>{
    const full_name=document.getElementById("editNama").value.trim(),email=document.getElementById("editEmail").value.trim(),phone=document.getElementById("editPhone").value.trim();
    if(!full_name||!email)return toastMsg("Nama dan email wajib diisi.");
    try{
      if(email!==s.user.email){const {error}=await sb.auth.updateUser({email});if(error)throw error;}
      const {error}=await sb.from("profiles").update({full_name,email,phone,updated_at:new Date().toISOString()}).eq("id",s.user.id);if(error)throw error;
      toastMsg(email!==s.user.email?"Profil tersimpan. Jika diminta, konfirmasi email baru.":"Profil tersimpan.");hideEdit();await load();
    }catch(e){toastMsg(e.message);}
  };
  await load();
}

async function bankPage(){
  const s=await initPage();if(!s)return;
  async function load(){
    const {data,error}=await sb.from("bank_accounts").select("*").eq("user_id",s.user.id).order("created_at",{ascending:false});if(error)throw error;
    const list=document.getElementById("listBank");list.innerHTML=(data||[]).map(x=>`<div class="bank-item"><b>${escapeHTML(x.method)}</b><br>${escapeHTML(x.account_name)} • ${escapeHTML(x.account_number)} <button class="delete" data-id="${x.id}">Hapus</button></div>`).join("")||"<p>Belum ada rekening.</p>";
    list.querySelectorAll("[data-id]").forEach(b=>b.onclick=async()=>{if(!confirm("Hapus rekening ini?"))return;const {error}=await sb.from("bank_accounts").delete().eq("id",b.dataset.id).eq("user_id",s.user.id);if(error)toastMsg(error.message);else load();});
  }
  window.simpanBank=async()=>{
    const method=document.getElementById("bank").value,name=document.getElementById("nama").value.trim(),number=document.getElementById("rekening").value.trim();
    if(!method||!name||!number)return toastMsg("Lengkapi data rekening.");
    const {error}=await sb.from("bank_accounts").insert({user_id:s.user.id,method,account_name:name,account_number:number,is_default:true});
    if(error)toastMsg(error.message);else{toastMsg("Rekening tersimpan.");document.getElementById("nama").value="";document.getElementById("rekening").value="";load();}
  };
  await load();
}

async function depositPage(){
  const s=await initPage();if(!s)return;
  window.kirimDeposit=async()=>{
    const method=document.getElementById("metode").value,amount=Number(document.getElementById("nominal").value),note=document.getElementById("catatan").value.trim();
    if(!method||amount<10000||amount>10000000)return toastMsg("Nominal deposit Rp10.000 - Rp10.000.000.");
    const {error}=await sb.from("deposits").insert({user_id:s.user.id,amount,method,admin_note:note||null,status:"pending"});
    if(error)toastMsg(error.message);else{toastMsg("Pengajuan deposit berhasil. Menunggu verifikasi admin.");document.getElementById("nominal").value="";document.getElementById("catatan").value="";}
  };
}

async function withdrawalPage(){
  const s=await initPage();if(!s)return;
  const w=await loadWallet();setText("saldo",moneyIDR(w.balance));
  document.querySelectorAll('a[href*="dashboard.dana.id"]').forEach(a=>a.style.display="none");
  // Replace old DANA-only link with a real withdrawal form.
  const box=document.querySelector(".container"); if(box){
    const card=document.createElement("div");card.className="card";card.style.marginTop="18px";
    card.innerHTML=`<h3>Ajukan Withdrawal</h3><label>Metode</label><select id="wdMethod"><option>DANA</option><option>BCA</option><option>BRI</option><option>BNI</option><option>Mandiri</option><option>Bank lainnya</option></select><label>Nomor rekening/akun</label><input id="wdNumber" placeholder="Nomor DANA/rekening"><label>Nama pemilik</label><input id="wdName" placeholder="Sesuai rekening"><label>Jumlah</label><input id="wdAmount" type="number" min="10000" placeholder="Minimal Rp10.000"><button id="wdBtn" class="dana-button" type="button">Ajukan Withdrawal</button>`;
    box.appendChild(card);
    document.getElementById("wdBtn").onclick=async()=>{
      const amount=Number(document.getElementById("wdAmount").value),method=document.getElementById("wdMethod").value,number=document.getElementById("wdNumber").value.trim(),name=document.getElementById("wdName").value.trim();
      if(amount<10000||!number||!name)return toastMsg("Lengkapi data withdrawal.");
      try{const {error}=await sb.rpc("request_withdrawal",{p_amount:amount,p_method:method,p_account_number:number,p_account_name:name});if(error)throw error;toastMsg("Withdrawal berhasil diajukan.");setTimeout(()=>location.href="history.html",700);}
      catch(e){toastMsg(e.message||"Withdrawal gagal.");}
    };
  }
}

async function historyPage(){
  const s=await initPage();if(!s)return;
  let rows=[];
  async function loadHistory(filter="all"){
    const {data,error}=await sb.from("transactions").select("*").eq("user_id",s.user.id).order("created_at",{ascending:false});if(error)throw error;
    rows=data||[];
    const deposits=rows.filter(x=>x.type==="deposit").reduce((a,x)=>a+Number(x.amount||0),0);
    const withdraw=rows.filter(x=>["withdrawal","withdrawal_refund"].includes(x.type)).reduce((a,x)=>a+Number(x.type==="withdrawal"?x.amount:-x.amount),0);
    setText("totalDeposit",moneyIDR(deposits));setText("totalWithdraw",moneyIDR(Math.max(0,withdraw)));setText("jumlah",rows.length);
    let shown=filter==="all"?rows:filter==="Deposit"?rows.filter(x=>x.type==="deposit"):rows.filter(x=>x.type==="withdrawal");
    document.getElementById("historyList").innerHTML=shown.map(x=>`<div class="history-item"><b>${escapeHTML(x.description||x.type)}</b><span>${moneyIDR(x.amount)}</span><small>${formatDate(x.created_at)}</small></div>`).join("")||"<p>Belum ada transaksi.</p>";
  }
  window.loadHistory=loadHistory;await loadHistory("all");
}

async function referralPage(){
  window.claimReward=()=>toastMsg("Bonus referral otomatis masuk ke wallet.");
  const s=await initPage();if(!s)return;
  const p=await currentProfile();
  const url=location.origin+location.pathname.replace(/[^/]+$/,"")+"register.html?ref="+encodeURIComponent(p.referral_code);
  setText("kode",p.referral_code);setText("link",url);
  window.copyLink=async()=>{try{await navigator.clipboard.writeText(url);toastMsg("Link referral disalin.");}catch(e){toastMsg(url);}};
  async function load(){
    const {data,error}=await sb.from("referrals").select("id,referred_id,status,reward,created_at").eq("referrer_id",s.user.id).order("created_at",{ascending:false});if(error)throw error;
    const ids=(data||[]).map(x=>x.referred_id);
    let names={};
    if(ids.length){const {data:ps}=await sb.from("profiles").select("id,full_name,email").in("id",ids);(ps||[]).forEach(x=>names[x.id]=x);}
    const list=document.getElementById("listMember");list.innerHTML=(data||[]).map(x=>`<div class="member"><b>${escapeHTML(names[x.referred_id]?.full_name||"Member")}</b><br>Bonus: ${moneyIDR(x.reward)} • ${escapeHTML(x.status)}</div>`).join("")||'<div class="empty">Belum ada referral.</div>';
    setText("anggota",(data||[]).length);setText("bonus",moneyIDR((data||[]).reduce((a,x)=>a+Number(x.reward||0),0)));
    const btn=document.getElementById("claimBtn");if(btn){btn.disabled=true;btn.textContent="Bonus otomatis masuk ke wallet";}
    const rs=document.getElementById("rewardStatus");if(rs)rs.textContent="Bonus referral diberikan otomatis saat member baru berhasil mendaftar dengan kode Anda.";
  }
  await load();
}

async function adminPage(){
  const s=await initPage();if(!s)return;
  const p=await currentProfile();if(p.role!=="admin"){toastMsg("Akses admin diperlukan.");setTimeout(()=>location.href="dashboard.html",700);return;}
  const root=document.getElementById("adminRoot");
  async function load(){
    const [{data:ws},{data:ds},{data:wd}]=await Promise.all([
      sb.from("profiles").select("id,uid,full_name,email,role,status,created_at").order("created_at",{ascending:false}),
      sb.from("deposits").select("*").order("created_at",{ascending:false}).limit(50),
      sb.from("withdrawals").select("*").order("created_at",{ascending:false}).limit(50)
    ]);
    root.innerHTML=`<h2>Admin Panel</h2><h3>Member</h3><div class="table">${(ws||[]).map(x=>`<div class="row"><span>${escapeHTML(x.full_name)}<small>${escapeHTML(x.email)} • ${x.role}</small></span><b>${x.status}</b></div>`).join("")}</div><h3>Deposit</h3><div class="table">${(ds||[]).map(x=>`<div class="row"><span>#${x.id} • ${moneyIDR(x.amount)}<small>${x.method} • ${formatDate(x.created_at)}</small></span><span>${x.status==="pending"?`<button data-dep="${x.id}" data-st="approved">Setujui</button> <button data-dep="${x.id}" data-st="rejected">Tolak</button>`:x.status}</span></div>`).join("")||"Tidak ada"}</div><h3>Withdrawal</h3><div class="table">${(wd||[]).map(x=>`<div class="row"><span>#${x.id} • ${moneyIDR(x.amount)}<small>${escapeHTML(x.method)} ${escapeHTML(x.account_number)} • ${formatDate(x.created_at)}</small></span><span>${x.status==="pending"?`<button data-wd="${x.id}" data-st="approved">Setujui</button> <button data-wd="${x.id}" data-st="rejected">Tolak</button>`:x.status}</span></div>`).join("")||"Tidak ada"}</div>`;
    root.querySelectorAll("[data-dep]").forEach(b=>b.onclick=async()=>{const {error}=await sb.rpc("admin_set_deposit_status",{p_id:Number(b.dataset.dep),p_status:b.dataset.st,p_note:null});if(error)toastMsg(error.message);else load();});
    root.querySelectorAll("[data-wd]").forEach(b=>b.onclick=async()=>{const {error}=await sb.rpc("admin_set_withdrawal_status",{p_id:Number(b.dataset.wd),p_status:b.dataset.st,p_note:null});if(error)toastMsg(error.message);else load();});
  }
  await load();
}

document.addEventListener("DOMContentLoaded",async()=>{
  try{
    if(page==="index.html"||page==="") await loginPage();
    else if(page==="register.html") await registerPage();
    else if(page==="dashboard.html") await dashboardPage();
    else if(page==="wallet.html") await walletPage();
    else if(page==="mission.html") await missionPage();
    else if(page==="profile.html") await profilePage();
    else if(page==="bank.html") await bankPage();
    else if(page==="deposit.html") await depositPage();
    else if(page==="withdrawal.html") await withdrawalPage();
    else if(page==="history.html") await historyPage();
    else if(page==="referral.html") await referralPage();
    else if(page==="admin.html") await adminPage();
  }catch(e){console.error(e);toastMsg(e.message||"Terjadi kesalahan.");}
});
