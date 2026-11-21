<?php

namespace App\Console\Commands;

use App\Models\EwsSetting;
use App\Services\SesService;
use Illuminate\Console\Command;

/**
 * Eksperimen peramalan (proposal Bab III, Increment 2): MAPE rata-rata tiap alpha pada seluruh
 * deret pengeluaran unit x kategori (riwayat >= 6 bulan). --simpan menetapkan alpha terbaik
 * sebagai alpha tetap sistem.
 */
class EksperimenSes extends Command
{
    protected $signature = 'ses:eksperimen {--simpan : Simpan alpha terbaik sebagai alpha tetap sistem}';

    protected $description = 'Uji beberapa nilai alpha SES dengan MAPE dan tampilkan hasilnya';

    public function handle(SesService $ses): int
    {
        $hasil = $ses->eksperimen();

        if ($hasil['terbaik'] === null) {
            $this->warn('Belum ada deret dengan riwayat pengeluaran minimal '.SesService::MIN_BULAN_HISTORIS.' bulan.');

            return self::FAILURE;
        }

        $this->info("Jumlah deret diuji: {$hasil['jumlah_deret']}");
        $this->table(
            ['Alpha', 'MAPE rata-rata (%)'],
            array_map(fn ($b) => [number_format($b['alpha'], 1), number_format($b['mape'], 2)], $hasil['per_alpha']),
        );
        $this->info("Alpha terbaik: {$hasil['terbaik']['alpha']} (MAPE ".number_format($hasil['terbaik']['mape'], 2).'%)');

        if ($this->option('simpan')) {
            EwsSetting::current()->update(['alpha_ses' => $hasil['terbaik']['alpha']]);
            $this->info('Alpha tetap sistem disimpan.');
        }

        return self::SUCCESS;
    }
}
