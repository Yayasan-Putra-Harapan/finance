<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Concerns\FlashesToast;
use App\Http\Controllers\Concerns\ScopesToUnit;
use App\Http\Controllers\Controller;
use App\Models\Anggaran;
use App\Models\HutangVendor;
use App\Models\KasBankAccount;
use App\Models\MetodePembayaran;
use App\Models\Penggajian;
use App\Models\Transaksi;
use App\Models\TransaksiRiwayat;
use App\Models\Unit;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransaksiController extends Controller
{
    use FlashesToast, ScopesToUnit;

    /** Kategori baku (proposal: SPP, BOS, infaq, dst.), ditambah kategori yang sudah pernah dipakai. */
    private const KATEGORI_BAKU = ['SPP', 'BOS', 'Infaq', 'Uang Pangkal', 'Boarding Fee', 'Kegiatan', 'Gaji', 'Operasional', 'Pemeliharaan'];

    public function index(Request $request): Response
    {
        $unitId = $this->resolveUnitId($request);
        $jenis = $request->string('jenis')->toString();
        $kategori = $request->string('kategori')->toString();
        $dari = $request->date('dari');
        $sampai = $request->date('sampai');

        $transaksis = Transaksi::query()
            ->with(['unit:id,nama', 'kasBankAccount:id,nama', 'vendor:id,nama', 'anggaran:id,kategori'])
            ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
            ->when($jenis, fn ($q) => $q->where('jenis', $jenis))
            ->when($kategori, fn ($q) => $q->where('kategori', $kategori))
            ->when($dari, fn ($q) => $q->whereDate('tanggal', '>=', $dari))
            ->when($sampai, fn ($q) => $q->whereDate('tanggal', '<=', $sampai))
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (Transaksi $t) => [...$t->toArray(), 'dapat_diubah' => $this->dapatDiubah($t)]);

        return Inertia::render('keuangan/transaksi/index', [
            'transaksis' => $transaksis,
            'units' => Unit::query()->orderBy('nama')->get(['id', 'nama']),
            'vendors' => Vendor::query()->orderBy('nama')->get(['id', 'nama']),
            'kasBankAccounts' => KasBankAccount::query()->when($unitId, fn ($q) => $q->where('unit_id', $unitId))->get(['id', 'nama', 'unit_id']),
            'metodePembayarans' => MetodePembayaran::query()->where('aktif', true)->get(['id', 'nama']),
            'anggarans' => Anggaran::query()
                ->where('status', 'disetujui')
                ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
                ->get(['id', 'kategori', 'jenis', 'unit_id']),
            'filterUnitId' => $unitId,
            'filterJenis' => $jenis,
            'filterKategori' => $kategori,
            'filterDari' => $dari?->format('Y-m-d'),
            'filterSampai' => $sampai?->format('Y-m-d'),
            'kategoriOptions' => collect(self::KATEGORI_BAKU)
                ->merge(Transaksi::query()->distinct()->pluck('kategori'))
                ->unique()->sort()->values(),
        ]);
    }

    /**
     * Transaksi hasil pembayaran tagihan siswa, gaji, atau hutang vendor dikelola dari modul asalnya.
     */
    private function dapatDiubah(Transaksi $t): bool
    {
        return ! $t->tagihan_siswa_id
            && ! Penggajian::query()->where('transaksi_id', $t->id)->exists()
            && ! HutangVendor::query()->where('transaksi_id', $t->id)->exists();
    }

    public function edit(Request $request, Transaksi $transaksi): Response
    {
        $this->authorizeUnit($request, $transaksi->unit_id);
        abort_unless($this->dapatDiubah($transaksi), 403, 'Transaksi ini dikelola dari modul asalnya.');

        return Inertia::render('keuangan/transaksi/edit', [
            'transaksi' => $transaksi,
            'vendors' => Vendor::query()->orderBy('nama')->get(['id', 'nama']),
            'kasBankAccounts' => KasBankAccount::query()->where('unit_id', $transaksi->unit_id)->get(['id', 'nama']),
            'metodePembayarans' => MetodePembayaran::query()->where('aktif', true)->get(['id', 'nama']),
            'anggarans' => Anggaran::query()->where('status', 'disetujui')->where('unit_id', $transaksi->unit_id)->get(['id', 'kategori', 'jenis']),
            'kategoriOptions' => collect(self::KATEGORI_BAKU)->merge(Transaksi::query()->distinct()->pluck('kategori'))->unique()->sort()->values(),
        ]);
    }

    public function update(Request $request, Transaksi $transaksi): RedirectResponse
    {
        $this->authorizeUnit($request, $transaksi->unit_id);
        abort_unless($this->dapatDiubah($transaksi), 403, 'Transaksi ini dikelola dari modul asalnya.');

        $data = $request->validate([
            'anggaran_id' => ['nullable', 'exists:anggarans,id'],
            'kas_bank_account_id' => ['nullable', 'exists:kas_bank_accounts,id'],
            'metode_pembayaran_id' => ['nullable', 'exists:metode_pembayarans,id'],
            'vendor_id' => ['nullable', 'exists:vendors,id'],
            'kategori' => ['required', 'string', 'max:255'],
            'nominal' => ['required', 'numeric', 'min:0.01'],
            'tanggal' => ['required', 'date'],
            'keterangan' => ['nullable', 'string'],
        ]);

        $transaksi->update($data);
        $this->toastSuccess('Transaksi berhasil diperbarui.');

        return to_route('keuangan.transaksi.index');
    }

    /**
     * Riwayat perubahan (dibuat, diubah, dihapus) transaksi, termasuk yang sudah dihapus.
     */
    public function riwayat(Request $request): Response
    {
        $unitId = $this->resolveUnitId($request);

        return Inertia::render('keuangan/transaksi/riwayat', [
            'riwayats' => TransaksiRiwayat::query()
                ->with(['user:id,name', 'unit:id,nama'])
                ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
                ->latest('id')
                ->paginate(30)
                ->withQueryString(),
            'units' => Unit::query()->orderBy('nama')->get(['id', 'nama']),
            'filterUnitId' => $unitId,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'unit_id' => ['required', 'exists:units,id'],
            'anggaran_id' => ['nullable', 'exists:anggarans,id'],
            'kas_bank_account_id' => ['nullable', 'exists:kas_bank_accounts,id'],
            'metode_pembayaran_id' => ['nullable', 'exists:metode_pembayarans,id'],
            'vendor_id' => ['nullable', 'exists:vendors,id'],
            'jenis' => ['required', 'in:masuk,keluar'],
            'kategori' => ['required', 'string', 'max:255'],
            'nominal' => ['required', 'numeric', 'min:0.01'],
            'tanggal' => ['required', 'date'],
            'keterangan' => ['nullable', 'string'],
        ]);

        $this->authorizeUnit($request, (int) $data['unit_id']);

        Transaksi::query()->create([...$data, 'created_by' => $request->user()->id]);
        $this->toastSuccess('Transaksi berhasil dicatat.');

        return to_route('keuangan.transaksi.index');
    }

    public function destroy(Request $request, Transaksi $transaksi): RedirectResponse
    {
        $this->authorizeUnit($request, $transaksi->unit_id);

        $transaksi->delete();
        $this->toastSuccess('Transaksi berhasil dihapus.');

        return to_route('keuangan.transaksi.index');
    }
}
