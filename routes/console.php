<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Rasio serapan bergantung waktu, jadi status EWS dievaluasi ulang tiap hari walau tanpa transaksi baru.
Schedule::command('ews:evaluasi')->dailyAt('01:00');
Schedule::command('tagihan:ingatkan')->dailyAt('07:00');
