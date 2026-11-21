<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ambang klasifikasi EWS berbasis rasio proyeksi SES (proposal Bab III, Increment 2)
        // dan alpha tetap hasil eksperimen (null = pilih alpha terbaik per deret).
        Schema::table('ews_settings', function (Blueprint $table) {
            $table->decimal('proyeksi_waspada', 4, 2)->default(0.80);
            $table->decimal('proyeksi_kritis', 4, 2)->default(0.90);
            $table->decimal('proyeksi_melebihi', 4, 2)->default(1.00);
            $table->decimal('alpha_ses', 3, 2)->nullable();
        });

        Schema::table('anggarans', function (Blueprint $table) {
            $table->decimal('rasio_proyeksi', 8, 4)->nullable();
        });

        // Riwayat perubahan transaksi (tambah, ubah, hapus). Tanpa FK agar tetap ada setelah transaksi dihapus.
        Schema::create('transaksi_riwayats', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('transaksi_id')->index();
            $table->unsignedBigInteger('unit_id')->index();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('aksi'); // dibuat | diubah | dihapus
            $table->json('perubahan');
            $table->timestamps();
        });

        Schema::create('tahun_ajarans', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->string('semester')->nullable();
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->boolean('is_aktif')->default(false);
            $table->timestamps();
        });

        Schema::create('orang_tuas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mdm_id')->unique();
            $table->string('nama');
            $table->string('telepon')->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
        });

        Schema::table('siswa', function (Blueprint $table) {
            $table->unsignedBigInteger('orang_tua_mdm_id')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('siswa', fn (Blueprint $t) => $t->dropColumn('orang_tua_mdm_id'));
        Schema::dropIfExists('orang_tuas');
        Schema::dropIfExists('tahun_ajarans');
        Schema::dropIfExists('transaksi_riwayats');
        Schema::table('anggarans', fn (Blueprint $t) => $t->dropColumn('rasio_proyeksi'));
        Schema::table('ews_settings', fn (Blueprint $t) => $t->dropColumn(['proyeksi_waspada', 'proyeksi_kritis', 'proyeksi_melebihi', 'alpha_ses']));
    }
};
