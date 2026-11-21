<?php

namespace Tests\Feature\Keuangan;

use App\Models\Anggaran;
use App\Models\EwsSetting;
use App\Models\KasBankAccount;
use App\Models\OrangTua;
use App\Models\Penggajian;
use App\Models\Siswa;
use App\Models\TagihanSiswa;
use App\Models\TahunAjaran;
use App\Models\Transaksi;
use App\Models\TransaksiRiwayat;
use App\Models\Unit;
use App\Models\User;
use App\Notifications\TagihanJatuhTempo;
use App\Services\EwsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Kesesuaian dengan proposal TA: EWS berbasis proyeksi SES, riwayat/ubah transaksi,
 * filter, eksperimen alpha, scheduler, dan sinkron master data.
 */
class ProposalAlignmentTest extends TestCase
{
    use RefreshDatabase;

    private Unit $unit;

    private User $bendahara;

    private KasBankAccount $bank;

    protected function setUp(): void
    {
        parent::setUp();

        $this->unit = Unit::query()->create(['kode_unit' => 'U1', 'nama' => 'Unit Satu', 'jenjang' => 'SD']);
        $this->bendahara = User::factory()->role(User::ROLE_BENDAHARA_UNIT, $this->unit->id)->create();
        $this->bank = KasBankAccount::query()->create(['unit_id' => $this->unit->id, 'nama' => 'Bank', 'jenis' => 'bank', 'saldo' => 10_000_000]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function rab(float $pagu, string $kategori = 'Operasional'): Anggaran
    {
        return Anggaran::query()->create([
            'unit_id' => $this->unit->id,
            'jenis' => 'pengeluaran',
            'kategori' => $kategori,
            'pagu' => $pagu,
            'periode_mulai' => '2026-01-01',
            'periode_selesai' => '2026-12-31',
            'status' => 'disetujui',
        ]);
    }

    private function catat(?Anggaran $rab, float $nominal, string $tanggal, string $jenis = 'keluar', string $kategori = 'Operasional'): Transaksi
    {
        return Transaksi::query()->create([
            'unit_id' => $this->unit->id,
            'anggaran_id' => $rab?->id,
            'kas_bank_account_id' => $this->bank->id,
            'created_by' => $this->bendahara->id,
            'jenis' => $jenis,
            'kategori' => $kategori,
            'nominal' => $nominal,
            'tanggal' => $tanggal,
        ]);
    }

    /** Enam bulan pengeluaran Rp100.000/bulan (realisasi 600.000, proyeksi SES 100.000). */
    private function enamBulan(Anggaran $rab): void
    {
        foreach (range(1, 6) as $bulan) {
            $this->catat($rab, 100_000, sprintf('2026-%02d-15', $bulan));
        }
    }

    /** @return array<string, array{float, string}> */
    public static function skenarioProyeksi(): array
    {
        // rasio = (600.000 + 100.000) / pagu ; ambang default 0.80 / 0.90 / 1.00
        return [
            'aman' => [1_000_000, EwsService::STATUS_AMAN],         // 0.70
            'waspada' => [800_000, EwsService::STATUS_WASPADA],     // 0.875
            'kritis' => [740_000, EwsService::STATUS_KRITIS],       // 0.946
            'melebihi' => [690_000, EwsService::STATUS_MELEBIHI],   // 1.014
        ];
    }

    #[DataProvider('skenarioProyeksi')]
    public function test_status_ews_mengikuti_rasio_proyeksi_ses(float $pagu, string $status): void
    {
        $rab = $this->rab($pagu);
        $this->enamBulan($rab);

        $rab->refresh();
        $this->assertSame($status, $rab->status_ews);
        $this->assertEqualsWithDelta(700_000 / $pagu, $rab->rasio_proyeksi, 0.001);
    }

    public function test_rasio_proyeksi_kosong_bila_riwayat_kurang_dari_enam_bulan(): void
    {
        $rab = $this->rab(1_000_000);
        $this->catat($rab, 100_000, '2026-01-15');

        $this->assertNull($rab->fresh()->rasio_proyeksi);
    }

    public function test_ambang_proyeksi_dapat_diatur_admin(): void
    {
        $admin = User::factory()->role(User::ROLE_ADMIN)->create();

        $this->actingAs($admin)->put(route('keuangan.ews-setting.update'), [
            'batas_waspada' => 1.0, 'batas_kritis' => 1.2, 'batas_melebihi' => 1.5,
            'proyeksi_waspada' => 0.5, 'proyeksi_kritis' => 0.6, 'proyeksi_melebihi' => 0.7,
            'alpha_ses' => 0.3,
        ])->assertSessionHasNoErrors();

        $this->assertSame(0.5, EwsSetting::current()->proyeksi_waspada);
        $this->assertSame(0.3, EwsSetting::current()->alpha_ses);

        $rab = $this->rab(1_000_000); // rasio 0.70 > 0.7? tidak melebihi, > 0.6 kritis
        $this->enamBulan($rab);
        $this->assertSame(EwsService::STATUS_KRITIS, $rab->fresh()->status_ews);
    }

    public function test_command_evaluasi_memperbarui_status_karena_waktu(): void
    {
        $rab = Anggaran::query()->create([
            'unit_id' => $this->unit->id, 'jenis' => 'pengeluaran', 'kategori' => 'Operasional',
            'pagu' => 1_000_000, 'periode_mulai' => '2026-01-01', 'periode_selesai' => '2026-04-11', 'status' => 'disetujui',
        ]);

        Carbon::setTestNow('2026-01-21'); // hari ke-20 dari 100: pace 0.2
        $this->catat($rab, 400_000, '2026-01-21'); // rasio serapan 2.0 -> melebihi
        $this->assertSame(EwsService::STATUS_MELEBIHI, $rab->fresh()->status_ews);

        Carbon::setTestNow('2026-04-01'); // hari ke-90: pace 0.9, rasio 0.44
        $this->artisan('ews:evaluasi')->assertSuccessful();

        $this->assertSame(EwsService::STATUS_AMAN, $rab->fresh()->status_ews);
    }

    public function test_eksperimen_ses_menampilkan_mape_tiap_alpha_dan_menyimpan_alpha_tetap(): void
    {
        $rab = $this->rab(10_000_000);
        foreach ([100, 120, 90, 130, 110, 140, 100] as $i => $ribu) {
            $this->catat($rab, $ribu * 1000, sprintf('2026-%02d-10', $i + 1));
        }

        $this->artisan('ses:eksperimen', ['--simpan' => true])
            ->expectsOutputToContain('Alpha terbaik')
            ->assertSuccessful();

        $alpha = EwsSetting::current()->alpha_ses;
        $this->assertNotNull($alpha);
        $this->assertGreaterThan(0, $alpha);
        $this->assertLessThan(1, $alpha);
    }

    public function test_ubah_transaksi_menyesuaikan_saldo_buku_besar_dan_mencatat_riwayat(): void
    {
        $t = $this->catat(null, 100_000, '2026-02-01');
        $this->assertEquals(9_900_000, $this->bank->fresh()->saldo);

        $this->actingAs($this->bendahara)->put(route('keuangan.transaksi.update', $t), [
            'kategori' => 'Operasional', 'nominal' => 250_000, 'tanggal' => '2026-02-02',
            'kas_bank_account_id' => $this->bank->id,
        ])->assertRedirect();

        $this->assertEquals(9_750_000, $this->bank->fresh()->saldo);
        $this->assertEquals(250_000, $t->bukuBesars()->sum('debit'));
        $this->assertSame(2, $t->bukuBesars()->count());

        $riwayat = TransaksiRiwayat::query()->where('transaksi_id', $t->id)->orderBy('id')->get();
        $this->assertSame(['dibuat', 'diubah'], $riwayat->pluck('aksi')->all());
        $this->assertSame($this->bendahara->id, $riwayat->last()->user_id);
        $this->assertArrayHasKey('nominal', $riwayat->last()->perubahan);
    }

    public function test_ubah_transaksi_memperbarui_status_ews(): void
    {
        $rab = $this->rab(1_000_000);
        $this->enamBulan($rab);
        $this->assertSame(EwsService::STATUS_AMAN, $rab->fresh()->status_ews);

        $terakhir = Transaksi::query()->orderByDesc('id')->first();
        $this->actingAs($this->bendahara)->put(route('keuangan.transaksi.update', $terakhir), [
            'anggaran_id' => $rab->id, 'kategori' => 'Operasional', 'nominal' => 500_000, 'tanggal' => '2026-06-15',
            'kas_bank_account_id' => $this->bank->id,
        ])->assertRedirect();

        // realisasi 1.000.000 + proyeksi > pagu 1.000.000
        $this->assertSame(EwsService::STATUS_MELEBIHI, $rab->fresh()->status_ews);
    }

    public function test_transaksi_dari_tagihan_siswa_tidak_bisa_diubah(): void
    {
        $tagihan = TagihanSiswa::query()->create([
            'unit_id' => $this->unit->id, 'kode_siswa' => 'S1', 'nama_siswa' => 'A', 'jenis_tagihan' => 'spp',
            'periode' => '2026-01', 'nominal' => 500_000, 'sisa_tagihan' => 500_000, 'status' => 'belum_bayar', 'jatuh_tempo' => '2026-01-31',
        ]);
        $t = $this->catat(null, 500_000, '2026-01-10', 'masuk', 'SPP');
        $t->forceFill(['tagihan_siswa_id' => $tagihan->id])->saveQuietly();

        $this->actingAs($this->bendahara)->put(route('keuangan.transaksi.update', $t), [
            'kategori' => 'SPP', 'nominal' => 1, 'tanggal' => '2026-01-10',
        ])->assertForbidden();
    }

    public function test_hapus_transaksi_tetap_tercatat_di_riwayat(): void
    {
        $t = $this->catat(null, 100_000, '2026-02-01');

        $this->actingAs($this->bendahara)->delete(route('keuangan.transaksi.destroy', $t));

        $this->assertDatabaseMissing('transaksis', ['id' => $t->id]);
        $this->assertDatabaseHas('transaksi_riwayats', ['transaksi_id' => $t->id, 'aksi' => 'dihapus']);

        $this->actingAs($this->bendahara)->get(route('keuangan.transaksi.riwayat'))->assertOk();
    }

    public function test_daftar_transaksi_menyaring_kategori_dan_periode_serta_terpaginasi(): void
    {
        $this->catat(null, 1000, '2026-01-10', 'masuk', 'SPP');
        $this->catat(null, 2000, '2026-02-10', 'masuk', 'BOS');
        $this->catat(null, 3000, '2026-03-10', 'masuk', 'BOS');

        $this->actingAs($this->bendahara)
            ->get(route('keuangan.transaksi.index', ['kategori' => 'BOS', 'dari' => '2026-03-01', 'sampai' => '2026-03-31']))
            ->assertInertia(fn ($page) => $page
                ->has('transaksis.data', 1)
                ->where('transaksis.data.0.kategori', 'BOS')
                ->has('transaksis.links'));

        foreach (range(1, 30) as $i) {
            $this->catat(null, 1000, '2026-04-10');
        }

        $this->actingAs($this->bendahara)->get(route('keuangan.transaksi.index'))
            ->assertInertia(fn ($page) => $page->has('transaksis.data', 25));
    }

    public function test_pembayaran_gaji_masuk_realisasi_rab_gaji(): void
    {
        $rab = $this->rab(10_000_000, 'Gaji');
        $penggajian = Penggajian::query()->create([
            'unit_id' => $this->unit->id, 'nama_pegawai' => 'Guru', 'periode' => '2026-03',
            'gaji_pokok' => 3_000_000, 'tunjangan' => 0, 'potongan' => 0, 'total_gaji' => 3_000_000, 'status' => 'draft',
        ]);

        $this->actingAs($this->bendahara)->post(route('keuangan.penggajian.bayar', $penggajian), [
            'kas_bank_account_id' => $this->bank->id, 'tanggal_bayar' => '2026-03-28',
        ]);

        $this->assertEquals(3_000_000, $rab->fresh()->realisasi());
    }

    public function test_sinkron_tahun_ajaran_dan_orang_tua_anonim_secara_default(): void
    {
        config(['services.yayasan_master.base_url' => 'https://mdm.test/api/v1', 'services.yayasan_master.token' => 'x']);
        Http::fake([
            '*/tahun-ajaran*' => Http::response(['data' => [[
                'id' => 1, 'kode' => 'TA-2026', 'nama' => '2026/2027', 'semester' => 'ganjil',
                'tanggal_mulai' => '2026-07-01', 'tanggal_selesai' => '2026-12-31', 'is_aktif' => true,
            ]], 'meta' => ['last_page' => 1]]),
            '*/orang-tua*' => Http::response(['data' => [[
                'id' => 9, 'nama_ayah' => 'Budi Asli', 'telepon' => '0812', 'email' => 'ortu@example.test',
            ]], 'meta' => ['last_page' => 1]]),
            '*/siswa*' => Http::response(['data' => [[
                'id' => 5, 'nis' => 'N1', 'nama_lengkap' => 'Nama Asli', 'status' => 'aktif', 'orang_tua_id' => 9, 'unit' => ['kode_unit' => 'U1'],
            ]], 'meta' => ['last_page' => 1]]),
        ]);

        $this->artisan('master:sync-tahun-ajaran')->assertSuccessful();
        $this->artisan('master:sync-orang-tua')->assertSuccessful();
        $this->artisan('master:sync-siswa')->assertSuccessful();

        $this->assertTrue(TahunAjaran::query()->where('kode', 'TA-2026')->firstOrFail()->is_aktif);

        $ortu = OrangTua::query()->where('mdm_id', 9)->firstOrFail();
        $this->assertSame('Wali 9', $ortu->nama);
        $this->assertNull($ortu->email);

        $siswa = Siswa::query()->where('kode_siswa', 'N1')->firstOrFail();
        $this->assertSame('Siswa N1', $siswa->nama_siswa);
        $this->assertSame(9, (int) $siswa->orang_tua_mdm_id);
    }

    public function test_sinkron_orang_tua_menyimpan_kontak_bila_anonim_dimatikan(): void
    {
        config([
            'services.yayasan_master.base_url' => 'https://mdm.test/api/v1', 'services.yayasan_master.token' => 'x',
            'services.yayasan_master.anonymize' => false,
        ]);
        Http::fake(['*/orang-tua*' => Http::response(['data' => [['id' => 9, 'nama_ayah' => 'Budi', 'email' => 'ortu@example.test']], 'meta' => ['last_page' => 1]])]);

        $this->artisan('master:sync-orang-tua')->assertSuccessful();

        $this->assertSame('ortu@example.test', OrangTua::query()->firstOrFail()->email);
    }

    public function test_pengingat_tagihan_dikirim_ke_email_orang_tua(): void
    {
        Notification::fake();
        OrangTua::query()->create(['mdm_id' => 9, 'nama' => 'Wali 9', 'email' => 'ortu@example.test']);
        Siswa::query()->create(['kode_siswa' => 'S1', 'nama_siswa' => 'A', 'orang_tua_mdm_id' => 9]);
        TagihanSiswa::query()->create([
            'unit_id' => $this->unit->id, 'kode_siswa' => 'S1', 'nama_siswa' => 'A', 'jenis_tagihan' => 'spp',
            'periode' => '2026-01', 'nominal' => 500_000, 'sisa_tagihan' => 500_000, 'status' => 'belum_bayar', 'jatuh_tempo' => now()->subDay(),
        ]);

        $this->artisan('tagihan:ingatkan')->assertSuccessful();

        Notification::assertSentOnDemand(TagihanJatuhTempo::class);
    }
}
