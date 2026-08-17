// Supabase configuration
// IMPORTANT: use only the Publishable/anon key in browser code. NEVER put service_role here.
const SUPABASE_URL = "https://jywzhwvbyifulqqvgxxd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2leqwU4YWbTg--GCIfQMmA_zOEKKG60";

if (!window.supabase) throw new Error("Supabase JS belum dimuat.");
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
window.sb = sb;

window.moneyIDR = n => new Intl.NumberFormat("id-ID").format(Number(n || 0));
window.toastMsg = (message) => {
  const el = document.getElementById("toast");
  if (!el) return alert(message);
  el.textContent = message; el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
};
window.requireAuth = async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { location.href = "login.html"; return null; }
  return session;
};
window.logoutSupabase = async () => {
  await sb.auth.signOut();
  location.href = "login.html";
};
window.currentProfile = async () => {
  const { data: { user }, error: ue } = await sb.auth.getUser();
  if (ue || !user) return null;
  const { data, error } = await sb.from("profiles").select("*").eq("id", user.id).single();
  if (error) throw error;
  return data;
};
