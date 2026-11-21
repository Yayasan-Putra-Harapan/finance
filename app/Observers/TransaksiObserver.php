<?php

namespace App\Observers;

use App\Models\Anggaran;
use App\Models\BukuBesar;
use App\Models\KasBankAccount;
use App\Models\Transaksi;
use App\Models\TransaksiRiwayat;
use App\Services\EwsService;

class TransaksiObserver
{
    public function __construct(private readonly EwsService $ewsService) {}

    /**
     * Setiap transaksi disimpan: update saldo kas/bank, catat jurnal buku besar (double entry),
     * perbarui sisa tagihan siswa, catat riwayat, dan evaluasi ulang status EWS RAB terkait.
     */
    public function created(Transaksi $transaksi): void
    {
        $this->perbaruiSaldoKasBank($transaksi->kas_bank_account_id, $transaksi->jenis, (float) $transaksi->nominal, 1);
        $this->catatBukuBesar($transaksi);
        $this->perbaruiTagihanSiswa($transaksi);
        $this->catatRiwayat($transaksi, 'dibuat', $transaksi->getAttributes());
        $this->evaluasiEws($transaksi->anggaran_id, $transaksi->jenis);
    }

    /**
     * Ubah transaksi: balikkan efek lama pada saldo, terapkan efek baru, bangun ulang buku besar.
     * Transaksi yang terhubung ke tagihan siswa dikecualikan di controller.
     */
    public function updated(Transaksi $transaksi): void
    {
        $perubahan = collect($transaksi->getChanges())
            ->except('updated_at')
            ->map(fn ($baru, $kolom) => ['dari' => $transaksi->getOriginal($kolom), 'menjadi' => $baru])
            ->all();

        if ($perubahan === []) {
            return;
        }

        $this->perbaruiSaldoKasBank(
            $transaksi->getOriginal('kas_bank_account_id'),
            $transaksi->getOriginal('jenis'),
            (float) $transaksi->getOriginal('nominal'),
            -1,
        );
        $this->perbaruiSaldoKasBank($transaksi->kas_bank_account_id, $transaksi->jenis, (float) $transaksi->nominal, 1);

        $transaksi->bukuBesars()->delete();
        $transaksi->unsetRelation('kasBankAccount');
        $this->catatBukuBesar($transaksi);

        $this->catatRiwayat($transaksi, 'diubah', $perubahan);

        $this->evaluasiEws($transaksi->getOriginal('anggaran_id'), $transaksi->getOriginal('jenis'));

        if ($transaksi->anggaran_id !== $transaksi->getOriginal('anggaran_id')) {
            $this->evaluasiEws($transaksi->anggaran_id, $transaksi->jenis);
        }
    }

    public function deleted(Transaksi $transaksi): void
    {
        $this->perbaruiSaldoKasBank($transaksi->kas_bank_account_id, $transaksi->jenis, (float) $transaksi->nominal, -1);
        $transaksi->bukuBesars()->delete();
        $this->catatRiwayat($transaksi, 'dihapus', $transaksi->getAttributes());
        $this->evaluasiEws($transaksi->anggaran_id, $transaksi->jenis);
    }

    private function evaluasiEws(?int $anggaranId, string $jenis): void
    {
        if ($anggaranId && $jenis === 'keluar' && ($anggaran = Anggaran::query()->find($anggaranId))) {
            $this->ewsService->evaluasi($anggaran);
        }
    }

    /**
     * @param  array<string, mixed>  $perubahan
     */
    private function catatRiwayat(Transaksi $transaksi, string $aksi, array $perubahan): void
    {
        TransaksiRiwayat::query()->create([
            'transaksi_id' => $transaksi->id,
            'unit_id' => $transaksi->unit_id,
            'user_id' => auth()->id(),
            'aksi' => $aksi,
            'perubahan' => $perubahan,
        ]);
    }

    private function perbaruiSaldoKasBank(?int $kasBankId, string $jenis, float $nominal, int $arah): void
    {
        if (! $kasBankId) {
            return;
        }

        $pengaruh = $jenis === 'masuk' ? $nominal : -$nominal;

        KasBankAccount::query()->whereKey($kasBankId)->increment('saldo', $arah * $pengaruh);
    }

    private function catatBukuBesar(Transaksi $transaksi): void
    {
        $akunKasBank = $transaksi->kas_bank_account_id ? $transaksi->kasBankAccount->nama : 'Kas/Bank';

        if ($transaksi->jenis === 'masuk') {
            $debitAkun = $akunKasBank;
            $kreditAkun = "Pendapatan - {$transaksi->kategori}";
        } else {
            $debitAkun = "Beban - {$transaksi->kategori}";
            $kreditAkun = $akunKasBank;
        }

        BukuBesar::query()->create([
            'transaksi_id' => $transaksi->id,
            'unit_id' => $transaksi->unit_id,
            'tanggal' => $transaksi->tanggal,
            'akun' => $debitAkun,
            'debit' => $transaksi->nominal,
            'kredit' => 0,
        ]);

        BukuBesar::query()->create([
            'transaksi_id' => $transaksi->id,
            'unit_id' => $transaksi->unit_id,
            'tanggal' => $transaksi->tanggal,
            'akun' => $kreditAkun,
            'debit' => 0,
            'kredit' => $transaksi->nominal,
        ]);
    }

    private function perbaruiTagihanSiswa(Transaksi $transaksi): void
    {
        if (! $transaksi->tagihan_siswa_id || $transaksi->jenis !== 'masuk') {
            return;
        }

        $tagihan = $transaksi->tagihanSiswa;
        $sisa = max(0, (float) $tagihan->sisa_tagihan - (float) $transaksi->nominal);

        $tagihan->forceFill([
            'sisa_tagihan' => $sisa,
            'status' => $sisa <= 0 ? 'lunas' : 'sebagian',
        ])->save();
    }
}
