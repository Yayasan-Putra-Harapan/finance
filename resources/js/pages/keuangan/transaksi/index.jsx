import { Form, Head, Link } from '@inertiajs/react';
import TransaksiController from '@/actions/App/Http/Controllers/Keuangan/TransaksiController';
import { UnitFilter } from '@/components/unit-filter';
import Heading from '@/components/heading';
import { Pagination } from '@/components/pagination';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { formatRupiah } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    edit as transaksiEdit,
    index as transaksiIndex,
    riwayat as transaksiRiwayat,
} from '@/routes/keuangan/transaksi';
export default function TransaksiIndex({
    transaksis,
    units,
    vendors,
    kasBankAccounts,
    metodePembayarans,
    anggarans,
    filterUnitId,
    filterJenis,
    filterKategori,
    filterDari,
    filterSampai,
    kategoriOptions,
}) {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <Head title="Transaksi" />

            <Heading
                title="Transaksi Pemasukan & Pengeluaran"
                description="Catat seluruh transaksi keuangan unit. Buku besar & saldo kas/bank diperbarui otomatis."
            />

            <UnitFilter
                units={units}
                value={filterUnitId}
                action={transaksiIndex().url}
            />

            <form
                method="get"
                action={transaksiIndex().url}
                className="flex flex-wrap items-end gap-3"
            >
                {filterUnitId && (
                    <input type="hidden" name="unit_id" value={filterUnitId} />
                )}
                <div className="grid gap-1">
                    <label className="text-sm font-medium" htmlFor="f_jenis">
                        Jenis
                    </label>
                    <NativeSelect id="f_jenis" name="jenis" defaultValue={filterJenis ?? ''}>
                        <option value="">Semua</option>
                        <option value="masuk">Pemasukan</option>
                        <option value="keluar">Pengeluaran</option>
                    </NativeSelect>
                </div>
                <div className="grid gap-1">
                    <label className="text-sm font-medium" htmlFor="f_kategori">
                        Kategori
                    </label>
                    <NativeSelect id="f_kategori" name="kategori" defaultValue={filterKategori ?? ''}>
                        <option value="">Semua</option>
                        {kategoriOptions.map((k) => (
                            <option key={k} value={k}>
                                {k}
                            </option>
                        ))}
                    </NativeSelect>
                </div>
                <div className="grid gap-1">
                    <label className="text-sm font-medium" htmlFor="f_dari">
                        Dari
                    </label>
                    <Input id="f_dari" name="dari" type="date" defaultValue={filterDari ?? ''} />
                </div>
                <div className="grid gap-1">
                    <label className="text-sm font-medium" htmlFor="f_sampai">
                        Sampai
                    </label>
                    <Input id="f_sampai" name="sampai" type="date" defaultValue={filterSampai ?? ''} />
                </div>
                <Button type="submit" variant="outline">
                    Terapkan
                </Button>
                <Button variant="ghost" asChild>
                    <Link href={transaksiRiwayat().url}>Riwayat perubahan</Link>
                </Button>
            </form>

            <Form
                {...TransaksiController.store.form()}
                resetOnSuccess
                className="grid grid-cols-1 gap-4 rounded-xl border p-4 md:grid-cols-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-1.5">
                            <label
                                className="text-sm font-medium"
                                htmlFor="unit_id"
                            >
                                Unit
                            </label>
                            <NativeSelect
                                id="unit_id"
                                name="unit_id"
                                defaultValue={filterUnitId ?? ''}
                                required
                            >
                                <option value="" disabled>
                                    Pilih unit
                                </option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.nama}
                                    </option>
                                ))}
                            </NativeSelect>
                            <InputError message={errors.unit_id} />
                        </div>
                        <div className="grid gap-1.5">
                            <label
                                className="text-sm font-medium"
                                htmlFor="jenis"
                            >
                                Jenis
                            </label>
                            <NativeSelect
                                id="jenis"
                                name="jenis"
                                defaultValue="keluar"
                                required
                            >
                                <option value="masuk">Pemasukan</option>
                                <option value="keluar">Pengeluaran</option>
                            </NativeSelect>
                        </div>
                        <div className="grid gap-1.5">
                            <label
                                className="text-sm font-medium"
                                htmlFor="kategori"
                            >
                                Kategori
                            </label>
                            <Input
                                id="kategori"
                                name="kategori"
                                list="kategori-list"
                                placeholder="Operasional / SPP"
                                required
                            />
                            <datalist id="kategori-list">
                                {kategoriOptions.map((k) => (
                                    <option key={k} value={k} />
                                ))}
                            </datalist>
                            <InputError message={errors.kategori} />
                        </div>
                        <div className="grid gap-1.5">
                            <label
                                className="text-sm font-medium"
                                htmlFor="nominal"
                            >
                                Nominal
                            </label>
                            <Input
                                id="nominal"
                                name="nominal"
                                type="number"
                                min={0.01}
                                step="0.01"
                                required
                            />
                            <InputError message={errors.nominal} />
                        </div>
                        <div className="grid gap-1.5">
                            <label
                                className="text-sm font-medium"
                                htmlFor="tanggal"
                            >
                                Tanggal
                            </label>
                            <Input
                                id="tanggal"
                                name="tanggal"
                                type="date"
                                defaultValue={new Date()
                                    .toISOString()
                                    .slice(0, 10)}
                                required
                            />
                            <InputError message={errors.tanggal} />
                        </div>
                        <div className="grid gap-1.5">
                            <label
                                className="text-sm font-medium"
                                htmlFor="kas_bank_account_id"
                            >
                                Akun Kas/Bank
                            </label>
                            <NativeSelect
                                id="kas_bank_account_id"
                                name="kas_bank_account_id"
                                defaultValue=""
                            >
                                <option value="">-</option>
                                {kasBankAccounts.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.nama}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>
                        <div className="grid gap-1.5">
                            <label
                                className="text-sm font-medium"
                                htmlFor="anggaran_id"
                            >
                                RAB Terkait
                            </label>
                            <NativeSelect
                                id="anggaran_id"
                                name="anggaran_id"
                                defaultValue=""
                            >
                                <option value="">-</option>
                                {anggarans.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.kategori} ({a.jenis})
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>
                        <div className="grid gap-1.5">
                            <label
                                className="text-sm font-medium"
                                htmlFor="vendor_id"
                            >
                                Vendor
                            </label>
                            <NativeSelect
                                id="vendor_id"
                                name="vendor_id"
                                defaultValue=""
                            >
                                <option value="">-</option>
                                {vendors.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.nama}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>
                        <div className="grid gap-1.5">
                            <label
                                className="text-sm font-medium"
                                htmlFor="metode_pembayaran_id"
                            >
                                Metode Pembayaran
                            </label>
                            <NativeSelect
                                id="metode_pembayaran_id"
                                name="metode_pembayaran_id"
                                defaultValue=""
                            >
                                <option value="">-</option>
                                {metodePembayarans.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.nama}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>
                        <div className="grid gap-1.5 md:col-span-2">
                            <label
                                className="text-sm font-medium"
                                htmlFor="keterangan"
                            >
                                Keterangan
                            </label>
                            <Input
                                id="keterangan"
                                name="keterangan"
                                placeholder="opsional"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button disabled={processing} className="w-full">
                                Catat Transaksi
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="p-3 font-medium">Tanggal</th>
                            <th className="p-3 font-medium">Unit</th>
                            <th className="p-3 font-medium">Jenis</th>
                            <th className="p-3 font-medium">Kategori</th>
                            <th className="p-3 font-medium">Nominal</th>
                            <th className="p-3 font-medium">Akun</th>
                            <th className="p-3 font-medium">Keterangan</th>
                            <th className="p-3 font-medium">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transaksis.data.map((t) => (
                            <tr key={t.id} className="border-t">
                                <td className="p-3 text-xs">{t.tanggal}</td>
                                <td className="p-3">{t.unit.nama}</td>
                                <td
                                    className={`p-3 font-medium ${t.jenis === 'masuk' ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    {t.jenis === 'masuk' ? 'Masuk' : 'Keluar'}
                                </td>
                                <td className="p-3">{t.kategori}</td>
                                <td className="p-3">
                                    {formatRupiah(t.nominal)}
                                </td>
                                <td className="p-3">
                                    {t.kas_bank_account?.nama ?? '-'}
                                </td>
                                <td className="p-3 text-xs text-muted-foreground">
                                    {t.keterangan ?? '-'}
                                </td>
                                <td className="flex gap-2 p-3">
                                    {t.dapat_diubah && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={transaksiEdit(t.id).url}>
                                                Ubah
                                            </Link>
                                        </Button>
                                    )}
                                    <Form
                                        {...TransaksiController.destroy.form(
                                            t.id,
                                        )}
                                        onSubmit={(e) => {
                                            if (
                                                !confirm(
                                                    'Hapus transaksi ini? Saldo kas/bank & buku besar akan disesuaikan.',
                                                )
                                            )
                                                e.preventDefault();
                                        }}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                variant="destructive"
                                                size="sm"
                                                disabled={processing}
                                            >
                                                Hapus
                                            </Button>
                                        )}
                                    </Form>
                                </td>
                            </tr>
                        ))}
                        {transaksis.data.length === 0 && (
                            <tr>
                                <td
                                    className="p-3 text-muted-foreground"
                                    colSpan={8}
                                >
                                    Belum ada transaksi.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination links={transaksis.links} />
        </div>
    );
}
TransaksiIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Transaksi',
            href: transaksiIndex(),
        },
    ],
};
