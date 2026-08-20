SHORTPRO - SUPABASE READY

A. FILE WEBSITE
- index.html
- login.html
- register.html
- forgot-password.html
- reset-password.html
- dashboard.html
- mission.html
- wallet.html
- profile.html
- referral.html
- withdrawal.html
- deposit.html
- bank.html
- history.html
- admin.html
- contact.html
- privacy.html
- terms.html
- help.html
- supabase-config.js
- supabase_schema.sql

B. CARA MEMASANG
1. Buat project di Supabase.
2. Buka SQL Editor.
3. Jalankan seluruh isi supabase_schema.sql.
4. Setelah akun admin dibuat, jalankan:
   update public.profiles set role='admin' where email='EMAIL_ADMIN_ANDA';
5. Buka supabase-config.js.
6. Isi hanya:
   SUPABASE_URL = URL project Supabase Anda
   SUPABASE_PUBLISHABLE_KEY = Publishable/anon key Anda
7. JANGAN masukkan SUPABASE_SECRET_KEY, service_role, password database, atau connection string PostgreSQL ke GitHub.
8. Upload semua file ke repository GitHub yang sama.
9. Di Supabase Authentication > URL Configuration, masukkan URL GitHub Pages Anda sebagai Site URL dan tambahkan URL reset-password.html sebagai Redirect URL.

C. ALUR DATABASE
Login/Register -> Supabase Auth -> profiles + wallets
Mission -> claim_mission() -> mission_claims + wallets + transactions
Dashboard/Wallet -> membaca wallets.balance yang sama
Profile -> profiles / update_my_profile()
Referral -> referrals
Deposit -> deposits -> admin_set_deposit_status()
Withdrawal -> request_withdrawal() -> withdrawals -> admin_set_withdrawal_status()
History -> transactions
Admin -> profiles, wallets, deposits, withdrawals, transactions

D. REWARD MISSION
- Misi daily: dapat diklaim sekali per hari.
- Misi once: hanya sekali.
- Reward tidak disimpan di localStorage; wallet diubah oleh fungsi database Supabase.
- Misi eksternal (iklan/drama/YouTube) membuka URL lalu member menekan Klaim Reward. Verifikasi tontonan eksternal belum dilakukan oleh browser.
- Misi Dukung Drama 100 Ribu: membutuhkan deposit approved minimal Rp100.000 dan masa program maksimal 360 hari; reward yang dicontohkan adalah Rp8.000/hari sesuai konfigurasi misi.

E. KEAMANAN
- Browser hanya memakai Publishable/anon key.
- Saldo tidak boleh dipercaya dari localStorage.
- Jangan pernah menaruh service_role/secret key di HTML, JS, GitHub, atau browser.


F. SECURITY PATCH AI-MAX
1. Jalankan supabase_schema.sql.
2. Jalankan supabase_security_migration.sql.
   Atau gunakan supabase_schema_secure.sql sebagai pengganti dua langkah di atas.
3. Login sebagai member biasa untuk pengujian.
4. Deposit dibuat pending dan hanya admin RPC yang dapat menambah saldo.
5. Beli AI-MAX memakai saldo wallet Rp100.000.
6. Klaim Rp8.000 hanya 12.00-24.00 WIB dan satu kali per hari.
7. Referral Rp30.000 hanya setelah 3 referral dengan email terverifikasi.
8. Jangan memberi GRANT UPDATE pada profiles/wallets kepada member.

Catatan: jam pada UI hanya indikator. Validasi waktu hadiah dilakukan oleh PostgreSQL menggunakan zona Asia/Jakarta.
