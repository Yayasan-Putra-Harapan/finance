<?php

namespace App\Notifications;

use App\Models\TagihanSiswa;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Pengingat tagihan ke orang tua/wali (kontak dari master data). Dikirim lewat Notification::route('mail', ...).
 */
class TagihanJatuhTempo extends Notification
{
    use Queueable;

    public function __construct(public TagihanSiswa $tagihan) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $t = $this->tagihan;

        return (new MailMessage)
            ->subject("Pengingat Tagihan {$t->jenis_tagihan} - {$t->periode}")
            ->greeting('Yth. Orang Tua/Wali')
            ->line("Tagihan {$t->jenis_tagihan} periode {$t->periode} untuk {$t->nama_siswa} belum lunas.")
            ->line('Sisa tagihan: Rp '.number_format((float) $t->sisa_tagihan, 0, ',', '.'))
            ->line('Jatuh tempo: '.$t->jatuh_tempo->format('d M Y'));
    }
}
