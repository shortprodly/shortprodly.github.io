// Supabase client configuration.
// This file uses the browser-safe Publishable/anon key only.
const SUPABASE_URL = "https://jywzhwvbyifulqqvgxxd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2leqwU4YWbTg--GCIfQMmA_zOEKKG60";

if (!window.supabase) throw new Error("Supabase JS belum dimuat.");
window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

window.moneyIDR = n => "Rp " + new Intl.NumberFormat("id-ID").format(Number(n || 0));
window.escapeHTML = s => String(s ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[c]));
window.toastMsg = msg => {
  const el = document.getElementById("toast");
  if (el) { el.textContent = msg; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),2200); }
  else alert(msg);
};
window.getSession = async () => {
  const { data, error } = await sb.auth.getSession();
  if (error) throw error;
  return data.session;
};
window.requireAuth = async () => {
  const session = await getSession();
  if (!session) { location.href = "index.html"; return null; }
  return session;
};
window.currentUser = async () => {
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
};
window.currentProfile = async () => {
  const u = await currentUser();
  if (!u) return null;
  const { data, error } = await sb.from("profiles").select("*").eq("id",u.id).single();
  if (error) throw error;
  return data;
};
window.logoutSupabase = async () => { await sb.auth.signOut(); location.href="index.html"; };
window.loadWallet = async () => {
  const u = await currentUser(); if (!u) return null;
  const { data, error } = await sb.from("wallets").select("*").eq("user_id",u.id).single();
  if (error) throw error; return data;
};
window.moneyNumber = n => Number(n || 0);
