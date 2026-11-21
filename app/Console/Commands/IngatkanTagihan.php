<?php

namespace App\Console\Commands;

use App\Models\Siswa;
use App\Models\TagihanSiswa;
use App\Notifications\TagihanJatuhTempo;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class IngatkanTagihan extends Command
{
    protected $signature = 'tagihan:ingatkan {--hari=3 : Ingatkan tagihan yang jatuh tempo dalam N hari ke depan atau sudah lewat}';

    protected $description = 'Kirim pengingat tagihan belum lunas ke email orang tua/wali (dari master data)';

    public function handle(): int
    {
        $batas = now()->addDays((int) $this->option('hari'))->endOfDay();
        $terkirim = 0;

        TagihanSiswa::query()
            ->where('status', '!=', 'lunas')
            ->whereDate('jatuh_tempo', '<=', $batas)
            ->each(function (TagihanSiswa $tagihan) use (&$terkirim) {
                $email = Siswa::query()->where('kode_siswa', $tagihan->kode_siswa)->first()?->orangTua?->email;

                if (! $email) {
                    return;
                }

                Notification::route('mail', $email)->notify(new TagihanJatuhTempo($tagihan));
                $terkirim++;
            });

        $this->info("{$terkirim} pengingat dikirim.");

        return self::SUCCESS;
    }
}
