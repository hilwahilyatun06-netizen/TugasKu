# TugasKu (Versi Statis + Supabase)

Versi ini tampilan dan fiturnya sama persis dengan TugasKu versi Java, tapi
tanpa server Java — semua data disimpan di Supabase (database + storage
gratis), jadi bisa di-hosting di **GitHub Pages** atau **Netlify**.

## Fitur (sama seperti versi asli)
- Beranda mahasiswa
- Pengumpulan tugas berupa file (PDF, DOC, DOCX, ZIP, maks 10MB)
- Pengumpulan tugas berupa link
- Riwayat tugas
- Unduh file / buka link
- Hapus tugas
- Halaman dosen (lihat semua tugas, read-only)
- Statistik tugas, file, dan link

## Langkah 1 — Buat Project Supabase (gratis)

1. Buka https://supabase.com dan daftar/login (bisa pakai akun GitHub/Google).
2. Klik **New Project**. Isi nama project bebas, buat password database
   (simpan, tidak perlu diingat-ingat lagi setelah ini), pilih region terdekat
   (misal Singapore), lalu klik **Create new project**. Tunggu ± 1-2 menit.

## Langkah 2 — Jalankan Setup Database & Storage

1. Di sidebar project, klik **SQL Editor** → **New query**.
2. Buka file `supabase-setup.sql` yang ada di folder ini, copy semua isinya,
   paste ke SQL Editor.
3. Klik **Run**. Ini akan otomatis membuat:
   - Tabel `tugas` untuk menyimpan data
   - Bucket storage `files` untuk menyimpan file upload
   - Izin akses (policy) supaya web bisa baca/tulis data

## Langkah 3 — Ambil URL & API Key

1. Di sidebar, klik ikon gear ⚙️ **Project Settings** → **API**.
2. Copy nilai **Project URL** dan **anon public** key.
3. Buka file `js/config.js` di folder ini, ganti dua baris berikut:

```js
const SUPABASE_URL = "GANTI_DENGAN_PROJECT_URL_SUPABASE";
const SUPABASE_ANON_KEY = "GANTI_DENGAN_ANON_KEY_SUPABASE";
```

dengan nilai yang tadi kamu copy.

## Langkah 4 — Hosting

### Opsi A: Netlify (drag & drop, paling gampang)
1. Buka https://app.netlify.com
2. Login, lalu pada halaman dashboard cari kotak **"Drag and drop your site output folder here"**
3. Drag seluruh folder `TugasKu-Web` (folder ini) ke kotak itu
4. Tunggu proses upload, situs langsung online dengan URL `nama-acak.netlify.app`

### Opsi B: GitHub Pages
1. Buat repository baru di GitHub, misalnya `tugasku-web`
2. Upload semua isi folder ini ke repository tersebut
3. Di repo, buka **Settings → Pages**
4. Di bagian **Branch**, pilih `main` dan folder `/ (root)`, klik **Save**
5. Tunggu 1-2 menit, situs akan online di `https://username.github.io/tugasku-web/`

## Catatan Penting

- **Keamanan**: karena tidak ada sistem login (sama seperti versi Java aslinya),
  siapa pun yang tahu link web ini bisa menambah/menghapus tugas. Ini cukup
  untuk keperluan tugas kuliah/demo, tapi kalau mau dipakai sungguhan sebaiknya
  ditambah autentikasi (Supabase Auth bisa dipakai untuk ini nanti).
- **Batas gratis Supabase**: 500MB database + 1GB storage file, lebih dari
  cukup untuk tugas kuliah.
- Kalau tabel/halaman kosong terus padahal sudah setup, cek dulu:
  - Apakah `js/config.js` sudah diisi URL & key yang benar
  - Buka Console browser (F12) untuk lihat pesan error
