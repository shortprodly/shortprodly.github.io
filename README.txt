SHORTPRO -> SUPABASE

1. Create a Supabase project.
2. Open SQL Editor and run supabase_schema.sql.
3. In Project Settings / API, copy Project URL and Publishable key.
4. Open supabase-config.js and replace the two placeholders.
5. Upload all HTML + supabase-config.js to the same hosting folder (GitHub Pages works).
6. Register a member. If email confirmation is enabled, confirm the email before login.
7. To make an admin, run the commented UPDATE statement at the bottom of supabase_schema.sql.

Files included:
- login.html
- register.html
- dashboard.html
- mission.html
- wallet.html
- referral.html
- profile.html
- withdrawal.html
- admin.html
- history.html (placeholder)
- bank.html (placeholder)
- deposit.html (placeholder)
- supabase-config.js
- supabase_schema.sql

Important:
- Browser code must use only the Supabase Publishable/anon key. Never expose service_role.
- The old localStorage balance/mission/profile storage has been removed from the migrated pages.
- Mission reward and withdrawal use database functions so the wallet change is performed server-side/atomically.
- For real payment/deposit processing, add an admin workflow or a payment provider; do not trust a client-side button to credit money.
