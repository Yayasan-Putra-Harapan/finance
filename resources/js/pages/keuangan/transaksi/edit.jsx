import { Form, Head, Link } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import TransaksiController from '@/actions/App/Http/Controllers/Keuangan/TransaksiController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { dashboard } from '@/routes';
import { index as transaksiIndex } from '@/routes/keuangan/transaksi';

function Field({ id, label, error, children }) {
    return (
        <div className="grid gap-1.5">
            <Label className="text-sm font-medium" htmlFor={id}>
                {label}
            </Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function Pilihan({ id, label, error, value, items, render }) {
    return (
        <Field id={id} label={label} error={error}>
            <NativeSelect id={id} name={id} defaultValue={value ?? ''}>
                <option value="">-</option>
                {items.map((item) => (
                    <option key={item.id} value={item.id}>
                        {render(item)}
                    </option>
                ))}
            </NativeSelect>
        </Field>
    );
}

export default function TransaksiEdit({
    transaksi,
    vendors,
    kasBankAccounts,
    metodePembayarans,
    anggarans,
    kategoriOptions,
}) {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <Head title="Ubah Transaksi" />
            <Heading
                title={`Ubah Transaksi #${transaksi.id}`}
                description="Saldo kas/bank, buku besar, status EWS, dan riwayat perubahan diperbarui otomatis."
            />
            <Form
                {...TransaksiController.update.form(transaksi.id)}
                className="grid max-w-3xl grid-cols-1 gap-4 rounded-xl border p-4 md:grid-cols-2"
            >
                {({ processing, errors }) => (
                    <>
                        <Field
                            id="kategori"
                            label="Kategori"
                            error={errors.kategori}
                        >
                            <Input
                                id="kategori"
                                name="kategori"
                                list="kategori-list"
                                defaultValue={transaksi.kategori}
                                required
                            />
                            <datalist id="kategori-list">
                                {kategoriOptions.map((k) => (
                                    <option key={k} value={k} />
                                ))}
                            </datalist>
                        </Field>
                        <Field
                            id="nominal"
                            label="Nominal"
                            error={errors.nominal}
                        >
                            <Input
                                id="nominal"
                                name="nominal"
                                type="number"
                                min={0.01}
                                step="0.01"
                                defaultValue={transaksi.nominal}
                                required
                            />
                        </Field>
                        <Field
                            id="tanggal"
                            label="Tanggal"
                            error={errors.tanggal}
                        >
                            <Input
                                id="tanggal"
                                name="tanggal"
                                type="date"
                                defaultValue={String(transaksi.tanggal).slice(
                                    0,
                                    10,
                                )}
                                required
                            />
                        </Field>
                        <Pilihan
                            id="kas_bank_account_id"
                            label="Akun Kas/Bank"
                            error={errors.kas_bank_account_id}
                            value={transaksi.kas_bank_account_id}
                            items={kasBankAccounts}
                            render={(a) => a.nama}
                        />
                        <Pilihan
                            id="anggaran_id"
                            label="RAB Terkait"
                            error={errors.anggaran_id}
                            value={transaksi.anggaran_id}
                            items={anggarans}
                            render={(a) => `${a.kategori} (${a.jenis})`}
                        />
                        <Pilihan
                            id="vendor_id"
                            label="Vendor"
                            error={errors.vendor_id}
                            value={transaksi.vendor_id}
                            items={vendors}
                            render={(v) => v.nama}
                        />
                        <Pilihan
                            id="metode_pembayaran_id"
                            label="Metode Pembayaran"
                            error={errors.metode_pembayaran_id}
                            value={transaksi.metode_pembayaran_id}
                            items={metodePembayarans}
                            render={(m) => m.nama}
                        />
                        <Field
                            id="keterangan"
                            label="Keterangan"
                            error={errors.keterangan}
                        >
                            <Input
                                id="keterangan"
                                name="keterangan"
                                defaultValue={transaksi.keterangan ?? ''}
                            />
                        </Field>
                        <div className="flex gap-2 md:col-span-2">
                            <Button disabled={processing}>Simpan</Button>
                            <Button variant="outline" asChild>
                                <Link href={transaksiIndex().url}>Batal</Link>
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}
TransaksiEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Transaksi', href: transaksiIndex() },
        { title: 'Ubah', href: '#' },
    ],
};
