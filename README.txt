MYSHORT APP - VERSI SUPABASE

File ini adalah paket website MyShort App yang menggunakan Supabase sebagai backend.

LANGKAH PEMASANGAN
1. Upload seluruh file website ini ke repository GitHub Anda.
2. Di Supabase Dashboard buka project yang akan dipakai.
3. Buka Editor SQL -> kueri baru.
4. Buka supabase_schema.sql, copy seluruh isinya, paste ke Editor SQL, lalu Jalankan.
   Versi SQL ini tidak memakai DROP TABLE/DROP POLICY/DROP TRIGGER sehingga lebih aman untuk project baru.
5. Buat akun member pertama melalui register.html.
6. Setelah akun pertama berhasil dibuat, jadikan akun Anda sebagai admin dengan menjalankan:
   update public.profiles set role='admin' where email='EMAIL_ADMIN_ANDA';
7. Pastikan Supabase Auth -> Email sesuai kebutuhan. Jika Confirm email aktif, member perlu verifikasi email + pembelian AI-MAX Rp100.000.
8. Buka index.html untuk login.

FITUR
- Login email atau username.
- Registrasi dengan referral: register.html?ref=KODE_REFERRAL.
- Bonus referral Rp5.000 otomatis masuk ke wallet pemilik kode ketika member baru berhasil dibuat.
- Dashboard, wallet, profil, rekening bank, mission, deposit, withdrawal, history transaksi, referral, dan admin.
- Reward mission masuk ke wallet dan tercatat sebagai transaksi.
- Deposit baru menambah saldo setelah admin menyetujui.
- Withdrawal mengurangi saldo saat diajukan; jika ditolak admin, saldo dikembalikan otomatis.
- RLS Supabase untuk membatasi data member.

PENTING
- supabase-config.js menggunakan Publishable/anon key yang aman untuk frontend. Jangan pernah menaruh service_role/secret key di browser atau GitHub.
- Jika Anda memakai project Supabase lain, ganti SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY di supabase-config.js.
- Nama brand di seluruh halaman sudah menjadi MyShort App.


MYSHORT PREMIUM REBUILD
- Logo utama: logo.png menggunakan ikon yang diberikan pengguna.
- Semua halaman HTML diberi tema hitam premium + gold dan branding logo.
- Ditambahkan forgot-password.html dan reset-password.html.
- Lupa password menggunakan Supabase Auth resetPasswordForEmail.

PENTING SUPABASE RESET PASSWORD
Tambahkan URL GitHub Pages Anda + /reset-password.html ke Supabase Dashboard > Authentication > URL Configuration > Redirect URLs.
Contoh: https://USERNAME.github.io/REPOSITORY/reset-password.html

Keamanan: tetap gunakan SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY di frontend. Jangan masukkan secret/service_role/database password ke GitHub.


SECURITY PATCH - AI-MAX
=======================
Tambahan file:
- supabase_security_migration.sql

Jalankan supabase_schema.sql terlebih dahulu, lalu jalankan supabase_security_migration.sql di Supabase SQL Editor.

Perubahan keamanan:
- Role, XP, referral_code, status, dan kolom sensitif profile tidak lagi dapat diubah langsung oleh member dari browser.
- Perubahan nama/nomor HP melalui RPC update_my_profile().
- Deposit dibuat melalui RPC request_deposit() sehingga member tidak dapat membuat deposit dengan status approved.
- RPC claim_mission() lama dinonaktifkan agar reward lama tidak dapat diklaim di luar aturan baru.
- AI-MAX Rp100.000 diaktifkan melalui purchase_ai_max() dan saldo dipotong secara atomik.
- Hadiah AI-MAX Rp8.000/hari hanya dapat diklaim 12.00-24.00 WIB berdasarkan waktu database.
- Satu user hanya dapat menerima satu klaim AI-MAX per tanggal.
- Hadiah referral Rp30.000 hanya dapat diklaim satu kali setelah minimal 3 referral terverifikasi email + pembelian AI-MAX Rp100.000.
- Referral baru tidak lagi memberi bonus Rp5.000 otomatis.
- Reward dan saldo tidak dipercaya dari JavaScript/localStorage.

PENTING:
HTML/JavaScript tetap dapat dimodifikasi oleh pengguna. Keamanan berasal dari RLS dan RPC security-definer di Supabase. Jangan menaruh service_role/secret key di browser.
