<?php

namespace App\Console\Commands\Master;

use App\Models\TahunAjaran;
use App\Services\MasterDataClient;
use Illuminate\Console\Command;

class SyncTahunAjaran extends Command
{
    protected $signature = 'master:sync-tahun-ajaran';

    protected $description = 'Sinkronkan Tahun Ajaran dari REST API Master Data Yayasan (/api/v1/tahun-ajaran)';

    public function handle(MasterDataClient $client): int
    {
        if (! $client->isConfigured()) {
            $this->error('YAYASAN_MASTER_API_TOKEN / YAYASAN_MASTER_API_URL belum diatur di .env.');

            return self::FAILURE;
        }

        $jumlah = 0;

        foreach ($client->getAllPages('tahun-ajaran') as $t) {
            TahunAjaran::query()->updateOrCreate(
                ['kode' => $t['kode']],
                [
                    'nama' => $t['nama'],
                    'semester' => $t['semester'] ?? null,
                    'tanggal_mulai' => $t['tanggal_mulai'],
                    'tanggal_selesai' => $t['tanggal_selesai'],
                    'is_aktif' => (bool) ($t['is_aktif'] ?? false),
                ],
            );

            $jumlah++;
        }

        $this->info("Selesai. {$jumlah} tahun ajaran disinkronkan.");

        return self::SUCCESS;
    }
}
