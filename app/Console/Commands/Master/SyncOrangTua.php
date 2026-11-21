<?php

namespace App\Console\Commands\Master;

use App\Models\OrangTua;
use App\Services\MasterDataClient;
use Illuminate\Console\Command;

class SyncOrangTua extends Command
{
    protected $signature = 'master:sync-orang-tua';

    protected $description = 'Sinkronkan Orang Tua/Wali dari REST API Master Data Yayasan (/api/v1/orang-tua)';

    public function handle(MasterDataClient $client): int
    {
        if (! $client->isConfigured()) {
            $this->error('YAYASAN_MASTER_API_TOKEN / YAYASAN_MASTER_API_URL belum diatur di .env.');

            return self::FAILURE;
        }

        $anonim = $client->anonimkan();
        $jumlah = 0;

        foreach ($client->getAllPages('orang-tua') as $o) {
            // NF-02: mode anonim membuang identitas dan kontak, hanya pseudonim yang disimpan.
            OrangTua::query()->updateOrCreate(
                ['mdm_id' => $o['id']],
                [
                    'nama' => $anonim ? "Wali {$o['id']}" : ($o['nama_wali'] ?? $o['nama_ayah'] ?? $o['nama_ibu'] ?? "Wali {$o['id']}"),
                    'telepon' => $anonim ? null : ($o['telepon'] ?? null),
                    'email' => $anonim ? null : ($o['email'] ?? null),
                ],
            );

            $jumlah++;
        }

        $this->info("Selesai. {$jumlah} orang tua/wali disinkronkan".($anonim ? ' (anonim).' : '.'));

        return self::SUCCESS;
    }
}
