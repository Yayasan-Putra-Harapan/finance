# Status Pengecekan Proyek

Pengecekan awal: 2026-11-20, dibandingkan dengan PRD dan proposal TA (REVISI 3 FIX).
Pembaruan di hari yang sama: semua kekurangan di daftar awal sudah dikerjakan (lihat bawah).

Kondisi akhir: 106 test lulus, phpstan 0 error, pint bersih, `npm run build` sukses.

## Sudah dikerjakan

| #   | Kekurangan                                   | Perubahan                                                                                                                                                                                                                       |
| --- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Status EWS tidak diperbarui oleh waktu       | Command `ews:evaluasi` dijadwalkan harian 01:00 (`routes/console.php`); sekaligus menyimpan proyeksi SES.                                                                                                                       |
| 2   | phpstan gagal                                | `TransaksiObserver` diperbaiki.                                                                                                                                                                                                 |
| 3   | pint gagal                                   | `FortifyServiceProvider` dan line ending dirapikan.                                                                                                                                                                             |
| 4   | Transaksi tidak bisa diubah, tanpa riwayat   | Rute dan halaman Ubah; tabel `transaksi_riwayats` (dibuat, diubah, dihapus, siapa, apa yang berubah); halaman Riwayat. Transaksi dari tagihan siswa, gaji, dan hutang vendor tidak bisa diubah dari sini.                       |
| 5   | Daftar transaksi dibatasi 200 baris          | Paginasi 25 baris, filter unit, jenis, kategori, periode; daftar kategori baku (SPP, BOS, Infaq, dst.).                                                                                                                         |
| 6   | Sinkron orang tua dan tahun ajaran belum ada | `master:sync-orang-tua`, `master:sync-tahun-ajaran`; siswa menyimpan `orang_tua_mdm_id`.                                                                                                                                        |
| 7   | Anonimisasi hanya manual                     | Sinkron siswa, karyawan, dan orang tua anonim secara default (`YAYASAN_MASTER_ANONYMIZE=true`, kontak dibuang). Set `false` hanya bila pengingat tagihan ke orang tua dibutuhkan.                                               |
| 8   | Postman hanya markdown                       | `docs/postman/` berisi collection dan environment.                                                                                                                                                                              |
| 9   | Rumus EWS tidak sesuai proposal              | Rasio proyeksi = (realisasi + proyeksi SES) / pagu menjadi dasar klasifikasi utama; rasio serapan terhadap pace waktu menjadi cadangan bila riwayat < 6 bulan. Ambang proyeksi (default 0,80 / 0,90 / 1,00) dapat diatur admin. |
| 10  | Tabel MAPE per alpha dan alpha tetap         | Halaman Proyeksi SES menampilkan MAPE tiap alpha; `ses:eksperimen [--simpan]` menghitung MAPE rata-rata lintas deret; `alpha_ses` bisa diatur di Konfigurasi EWS (kosong = alpha terbaik per deret).                            |
| 11  | Notifikasi tagihan ke orang tua belum ada    | `tagihan:ingatkan` dijadwalkan harian 07:00, kirim email ke orang tua (kontak dari master data).                                                                                                                                |
| 12  | Gaji tidak masuk realisasi RAB               | `Penggajian::bayar` menghubungkan transaksi ke RAB Gaji yang berlaku.                                                                                                                                                           |
| 13  | Dokumen pengujian                            | `docs/pengujian-black-box.md`.                                                                                                                                                                                                  |

Test baru: `tests/Feature/Keuangan/ProposalAlignmentTest.php` (17 test).

## Perlu diperhatikan saat deploy

- Server perlu cron `* * * * * php artisan schedule:run`, kalau tidak jadwal harian tidak berjalan. Migrasi baru (`2026_11_20_100000_proposal_alignment`) dijalankan CI lewat `migrate --force`.
- Status EWS yang sudah tersimpan baru ikut rumus baru setelah `php artisan ews:evaluasi` dijalankan sekali.
- Jangan jalankan sinkron anonim di production bila pengingat tagihan dibutuhkan; set `YAYASAN_MASTER_ANONYMIZE=false` di sana.

## Yang masih terbuka (bukan kode)

1. Bagian "Proses Bisnis Saat Ini" di PRD kosong, 5 pertanyaan terbuka belum dijawab yayasan.
2. Data riil yayasan (RAB, pemasukan, pengeluaran minimal 6 bulan) belum ada, baru data simulasi seeder. Nilai MAPE dari seeder bukan akurasi data riil.
3. Skenario "Manual" di `docs/pengujian-black-box.md` (validasi input di antarmuka, hak akses metode pembayaran, kesesuaian dengan format laporan manual yayasan) belum diuji.
4. `PRD*.md` masih menulis rumus EWS lama (pace). Perlu direvisi bila PRD dipakai sebagai lampiran skripsi.
5. Penjelasan di skripsi: alpha dapat tetap (hasil eksperimen) atau otomatis per deret, tergantung pengaturan.
6. Belum dilakukan: uji tampilan halaman baru di browser (Ubah, Riwayat, tabel MAPE, kolom rasio proyeksi). Build sukses, tetapi saya tidak membuka halamannya.
7. Sinkron master data belum diuji terhadap API live (token kosong di `.env`); hanya diuji dengan respons palsu berdasarkan skema OpenAPI di `docs/document.json`.
8. Pembayaran hutang vendor belum dihubungkan ke RAB (kategori "Pembayaran Hutang Vendor" tidak punya RAB), jadi tidak ikut EWS.
