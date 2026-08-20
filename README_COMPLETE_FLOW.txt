MYSHORT COMPLETE AI-MAX FLOW

1. Member submits deposit. Deposit is pending and does NOT increase wallet.
2. Admin verifies payment and approves deposit. Only the admin RPC adds the approved amount to wallet.
3. Member opens Mission and buys AI-MAX for exactly Rp100.000 from wallet.
4. AI-MAX becomes active and unlocks Rp8.000 daily.
5. Daily claim is valid only 12:00-24:00 Asia/Jakarta and once per calendar day.
6. Referral counts only after referred member has verified email AND bought AI-MAX Rp100.000. Three qualified referrals unlock one Rp30.000 reward.
7. Browser JavaScript is only UI; the database/RPC is authoritative for money, status, time and reward.

SETUP:
- Run supabase_schema_secure.sql for a new database.
- For an existing database, run supabase_security_migration.sql.
- In deposit.html, replace PAYMENT_INFO with your real bank/QRIS instructions.
- Create/verify an admin profile by setting role=admin once from Supabase SQL Editor.
- Never put Supabase service_role key in HTML.
