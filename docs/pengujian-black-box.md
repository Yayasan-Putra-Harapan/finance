# Pengujian Black Box (Equivalence Partitioning)

Rencana pengujian mengikuti proposal bagian 2.14 dan Bab III (pengujian Increment 1 dan 2).
Status **Lulus** berarti ada test otomatis yang memverifikasi skenario itu dan test tersebut lulus
(`php artisan test`, 106 test lulus per 2026-11-20). Status **Manual** berarti belum ada test otomatis
dan harus diuji lewat antarmuka sebelum dicatat di skripsi. Hasil uji antarmuka (klik di browser)
tidak termasuk di sini.

Data uji: seeder (`php artisan db:seed`) membuat 3 unit sekolah, RAB per unit, dan transaksi bulanan
April–Oktober 2026 (7 bulan) sebagai data simulasi sesuai proposal bagian 3.2.2.

## Increment 1: Modul Pemasukan

| ID   | Skenario                                                     | Partisi masukan              | Hasil diharapkan                      | Test otomatis                                                                                               | Status |
| ---- | ------------------------------------------------------------ | ---------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------ |
| P-01 | Susun RAB pemasukan unit sendiri                             | Valid                        | RAB tersimpan                         | `ModulPemasukanTest::test_bendahara_unit_bisa_menyusun_rab_pemasukan_untuk_unitnya`                         | Lulus  |
| P-02 | Susun RAB unit lain                                          | Tidak valid (hak akses)      | Ditolak                               | `ModulPemasukanTest::test_bendahara_unit_tidak_bisa_menyusun_rab_untuk_unit_lain`                           | Lulus  |
| P-03 | Tagihan baru                                                 | Valid                        | Status `belum_bayar`, sisa = nominal  | `ModulPemasukanTest::test_tagihan_siswa_baru_berstatus_belum_bayar_dengan_sisa_sama_dengan_nominal`         | Lulus  |
| P-04 | Bayar sebagian                                               | Valid (nominal < sisa)       | Status `sebagian`, sisa berkurang     | `ModulPemasukanTest::test_pembayaran_sebagian_mengubah_status_menjadi_sebagian_dan_mengurangi_sisa_piutang` | Lulus  |
| P-05 | Bayar lunas                                                  | Valid (nominal = sisa)       | Status `lunas`                        | `ModulPemasukanTest::test_pelunasan_penuh_mengubah_status_menjadi_lunas`                                    | Lulus  |
| P-06 | Bayar melebihi sisa                                          | Tidak valid (nominal > sisa) | Ditolak validasi                      | `ModulPemasukanTest::test_pembayaran_melebihi_sisa_tagihan_ditolak_validasi`                                | Lulus  |
| P-07 | Filter transaksi per kategori dan periode, paginasi 25 baris | Valid                        | Hanya data sesuai filter              | `ProposalAlignmentTest::test_daftar_transaksi_menyaring_kategori_dan_periode_serta_terpaginasi`             | Lulus  |
| P-08 | Ubah transaksi, saldo dan buku besar menyesuaikan            | Valid                        | Saldo, buku besar, riwayat diperbarui | `ProposalAlignmentTest::test_ubah_transaksi_menyesuaikan_saldo_buku_besar_dan_mencatat_riwayat`             | Lulus  |
| P-09 | Ubah transaksi hasil pembayaran tagihan                      | Tidak valid                  | 403                                   | `ProposalAlignmentTest::test_transaksi_dari_tagihan_siswa_tidak_bisa_diubah`                                | Lulus  |
| P-10 | Hapus transaksi, jejak tetap ada                             | Valid                        | Riwayat `dihapus` tercatat            | `ProposalAlignmentTest::test_hapus_transaksi_tetap_tercatat_di_riwayat`                                     | Lulus  |
| P-11 | Nominal 0 atau negatif, tanggal kosong                       | Tidak valid                  | Pesan validasi                        | (validasi `min:0.01`, `required`)                                                                           | Manual |
| P-12 | Konfigurasi metode pembayaran oleh non-admin                 | Tidak valid (hak akses)      | Ditolak                               |                                                                                                             | Manual |

## Increment 2: Modul Pengeluaran dan EWS

| ID   | Skenario                                                  | Partisi masukan         | Hasil diharapkan                                      | Test otomatis                                                                                                                                        | Status |
| ---- | --------------------------------------------------------- | ----------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| E-01 | Alur RAB draft, diajukan, disetujui                       | Valid                   | Status berubah, `approved_by` terisi                  | `ModulPengeluaranTest::test_alur_persetujuan_rab_dari_draft_sampai_disetujui`                                                                        | Lulus  |
| E-02 | Bendahara menyetujui RAB sendiri                          | Tidak valid (hak akses) | Ditolak                                               | `ModulPengeluaranTest::test_bendahara_tidak_bisa_menyetujui_rab_sendiri`                                                                             | Lulus  |
| E-03 | Setujui RAB yang belum diajukan                           | Tidak valid (status)    | Ditolak                                               | `ModulPengeluaranTest::test_pimpinan_tidak_bisa_menyetujui_rab_yang_belum_diajukan`                                                                  | Lulus  |
| E-04 | Transaksi pengeluaran                                     | Valid                   | Saldo berkurang, buku besar debit beban               | `ModulPengeluaranTest::test_transaksi_pengeluaran_mengurangi_saldo_dan_mencatat_buku_besar_debit_beban`                                              | Lulus  |
| E-05 | Bayar gaji                                                | Valid                   | Transaksi pengeluaran dibuat, status `dibayar`        | `ModulPengeluaranTest::test_bayar_penggajian_membuat_transaksi_pengeluaran_dan_menandai_dibayar`                                                     | Lulus  |
| E-06 | Bayar gaji masuk realisasi RAB Gaji                       | Valid                   | Realisasi RAB bertambah                               | `ProposalAlignmentTest::test_pembayaran_gaji_masuk_realisasi_rab_gaji`                                                                               | Lulus  |
| E-07 | Ubah gaji yang sudah dibayar                              | Tidak valid             | Ditolak                                               | `ModulPengeluaranTest::test_penggajian_yang_sudah_dibayar_tidak_bisa_diubah`                                                                         | Lulus  |
| E-08 | Lunasi hutang vendor                                      | Valid                   | Transaksi dibuat, status `lunas`                      | `ModulPengeluaranTest::test_pelunasan_hutang_vendor_membuat_transaksi_dan_menandai_lunas`                                                            | Lulus  |
| E-09 | EWS proyeksi SES, rasio 0.70                              | Partisi Aman            | Aman                                                  | `ProposalAlignmentTest::test_status_ews_mengikuti_rasio_proyeksi_ses` (aman)                                                                         | Lulus  |
| E-10 | EWS proyeksi SES, rasio 0.875                             | Partisi Waspada         | Waspada                                               | idem (waspada)                                                                                                                                       | Lulus  |
| E-11 | EWS proyeksi SES, rasio 0.946                             | Partisi Kritis          | Kritis                                                | idem (kritis)                                                                                                                                        | Lulus  |
| E-12 | EWS proyeksi SES, rasio 1.014                             | Partisi Melebihi        | Melebihi Anggaran                                     | idem (melebihi)                                                                                                                                      | Lulus  |
| E-13 | Riwayat kurang dari 6 bulan                               | Batas data              | Rasio proyeksi kosong, pakai rasio serapan (cadangan) | `ProposalAlignmentTest::test_rasio_proyeksi_kosong_bila_riwayat_kurang_dari_enam_bulan`                                                              | Lulus  |
| E-14 | EWS cadangan (rasio serapan) Aman/Waspada/Kritis/Melebihi | 4 partisi               | Sesuai ambang                                         | `EarlyWarningSystemTest::test_status_*`                                                                                                              | Lulus  |
| E-15 | Realisasi melebihi pagu                                   | Batas                   | Melebihi Anggaran                                     | `EarlyWarningSystemTest::test_status_melebihi_anggaran_dipaksa_ketika_realisasi_lewati_pagu_meski_rasio_kecil`                                       | Lulus  |
| E-16 | Ambang dan alpha diatur admin tanpa ubah kode             | Valid                   | Klasifikasi mengikuti ambang baru                     | `ProposalAlignmentTest::test_ambang_proyeksi_dapat_diatur_admin`, `EarlyWarningSystemTest::test_threshold_bisa_dikonfigurasi_tanpa_ubah_kode`        | Lulus  |
| E-17 | Notifikasi hanya saat naik level                          | Valid                   | Notifikasi ke pimpinan sekali                         | `EarlyWarningSystemTest::test_notifikasi_hanya_dikirim_ke_pimpinan_yayasan_saat_status_naik_level`, `..._tidak_dikirim_ulang_saat_status_tetap_sama` | Lulus  |
| E-18 | Perubahan transaksi memperbarui status EWS                | Valid                   | Status mengikuti nominal baru                         | `ProposalAlignmentTest::test_ubah_transaksi_memperbarui_status_ews`                                                                                  | Lulus  |
| E-19 | Evaluasi terjadwal harian                                 | Valid                   | Status diperbarui karena waktu                        | `ProposalAlignmentTest::test_command_evaluasi_memperbarui_status_karena_waktu`                                                                       | Lulus  |

## Laporan

| ID   | Skenario                                                        | Hasil diharapkan  | Test otomatis                                                                   | Status                                        |
| ---- | --------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------- | --------------------------------------------- |
| L-01 | Laporan per unit hanya menjumlahkan unit itu                    | Total sesuai data | `LaporanTest::test_laporan_per_unit_hanya_menjumlahkan_transaksi_unit_tersebut` | Lulus                                         |
| L-02 | Bendahara unit melihat laporan unit lain                        | Ditolak           | `LaporanTest::test_bendahara_unit_tidak_bisa_melihat_laporan_unit_lain`         | Lulus                                         |
| L-03 | Konsolidasi menjumlahkan semua unit                             | Total sesuai data | `LaporanTest::test_laporan_konsolidasi_menjumlahkan_seluruh_unit`               | Lulus                                         |
| L-04 | Bendahara unit mengakses konsolidasi                            | Ditolak           | `LaporanTest::test_bendahara_unit_tidak_bisa_mengakses_laporan_konsolidasi`     | Lulus                                         |
| L-05 | Kesesuaian laporan dengan format laporan manual yayasan (NF-01) | Cocok             |                                                                                 | Manual (menunggu contoh laporan dari yayasan) |

## Eksperimen peramalan (dilaporkan terpisah dari uji fungsional)

Sesuai proposal, hasil eksperimen MAPE dilaporkan terpisah dari uji fungsional.

1. Muat data: `php artisan migrate:fresh --seed` (data simulasi) atau data riil yang sudah dianonimkan.
2. Jalankan `php artisan ses:eksperimen`. Keluaran: tabel MAPE rata-rata untuk α 0,1–0,9 dan α terbaik.
3. `php artisan ses:eksperimen --simpan` menetapkan α terbaik sebagai α tetap sistem
   (juga bisa diatur manual di Konfigurasi EWS; kosongkan untuk memilih α terbaik per deret).
4. Halaman Proyeksi SES per unit menampilkan MAPE tiap α untuk satu kategori.

Catatan: data seeder bersifat simulasi, jadi nilai MAPE dari seeder tidak boleh dilaporkan sebagai akurasi data riil yayasan.

## Pengujian API (Postman)

Import `docs/postman/keuangan-yayasan.postman_collection.json` dan `docs/postman/lokal.postman_environment.json`.
Isi variabel `token` dengan token Klien API. Collection berisi 5 endpoint sukses dan 2 skenario negatif (401, 422).
Test otomatis untuk endpoint yang sama ada di `tests/Feature/Keuangan/*ApiTest.php`.
