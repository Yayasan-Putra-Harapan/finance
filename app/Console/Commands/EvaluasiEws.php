<?php

namespace App\Console\Commands;

use App\Models\Anggaran;
use App\Services\EwsService;
use App\Services\SesService;
use Illuminate\Console\Command;

/**
 * Evaluasi ulang status EWS semua RAB pengeluaran yang disetujui dan simpan proyeksi SES.
 * Dijadwalkan harian: rasio serapan berubah seiring waktu walau tidak ada transaksi baru,
 * dan proyeksi SES diperbarui tiap periode bulanan (proposal Bab III, Increment 2).
 */
class EvaluasiEws extends Command
{
    protected $signature = 'ews:evaluasi';

    protected $description = 'Evaluasi ulang status EWS semua RAB pengeluaran yang disetujui dan simpan proyeksi SES';

    public function handle(EwsService $ews, SesService $ses): int
    {
        $anggarans = Anggaran::query()
            ->where('jenis', 'pengeluaran')
            ->where('status', 'disetujui')
            ->get();

        foreach ($anggarans as $anggaran) {
            $ews->evaluasi($anggaran);
        }

        $anggarans->unique(fn (Anggaran $a) => "{$a->unit_id}|{$a->kategori}")
            ->each(fn (Anggaran $a) => $ses->proyeksikanDanSimpan($a->unit_id, $a->kategori));

        $this->info("{$anggarans->count()} RAB dievaluasi.");

        return self::SUCCESS;
    }
}
