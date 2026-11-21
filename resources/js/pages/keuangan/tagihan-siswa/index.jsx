import { Form, Head } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import TagihanSiswaController from '@/actions/App/Http/Controllers/Keuangan/TagihanSiswaController';
import { UnitFilter } from '@/components/unit-filter';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { formatRupiah } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as tagihanIndex } from '@/routes/keuangan/tagihan-siswa';
const JENIS_LABEL = {
    spp: 'SPP',
    uang_pangkal: 'Uang Pangkal',
    boarding_fee: 'Boarding Fee',
    kegiatan: 'Tagihan Kegiatan',
};
export default function TagihanSiswaIndex({
    tagihans,
    units,
    kasBankAccounts,
    metodePembayarans,
    filterUnitId,
}) {
    const [editingId, setEditingId] = useState(null);
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <Head title="Tagihan Siswa" />

            <Heading
                title="Tagihan Siswa"
                description="Kelola tagihan SPP, uang pangkal, boarding fee, dan tagihan kegiatan. Tagihan yang belum lunas otomatis menjadi piutang."
            />

            <UnitFilter
                units={units}
                value={filterUnitId}
                action={tagihanIndex().url}
            />

            <Form
                {...TagihanSiswaController.store.form()}
                resetOnSuccess
                className="grid grid-cols-1 gap-4 rounded-xl border p-4 md:grid-cols-4"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="unit_id"
                            >
                                Unit
                            </Label>
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
                            <Label
                                className="text-sm font-medium"
                                htmlFor="kode_siswa"
                            >
                                Kode Siswa
                            </Label>
                            <Input
                                id="kode_siswa"
                                name="kode_siswa"
                                placeholder="S-0001"
                                required
                            />
                            <InputError message={errors.kode_siswa} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="nama_siswa"
                            >
                                Nama Siswa
                            </Label>
                            <Input id="nama_siswa" name="nama_siswa" required />
                            <InputError message={errors.nama_siswa} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="jenis_tagihan"
                            >
                                Jenis Tagihan
                            </Label>
                            <NativeSelect
                                id="jenis_tagihan"
                                name="jenis_tagihan"
                                defaultValue="spp"
                                required
                            >
                                {Object.entries(JENIS_LABEL).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </NativeSelect>
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="periode"
                            >
                                Periode
                            </Label>
                            <Input
                                id="periode"
                                name="periode"
                                placeholder="2026-10"
                                required
                            />
                            <InputError message={errors.periode} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="nominal"
                            >
                                Nominal
                            </Label>
                            <Input
                                id="nominal"
                                name="nominal"
                                type="number"
                                min={0}
                                step="0.01"
                                required
                            />
                            <InputError message={errors.nominal} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="jatuh_tempo"
                            >
                                Jatuh Tempo
                            </Label>
                            <Input
                                id="jatuh_tempo"
                                name="jatuh_tempo"
                                type="date"
                                required
                            />
                            <InputError message={errors.jatuh_tempo} />
                        </div>
                        <div className="flex items-end">
                            <Button disabled={processing} className="w-full">
                                Tambah Tagihan
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            <div className="overflow-x-auto rounded-xl border">
                <Table className="w-full text-sm">
                    <TableHeader className="bg-muted/50 text-left">
                        <TableRow>
                            <TableHead className="p-3 font-medium">
                                Unit
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Siswa
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Jenis
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Periode
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Nominal
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Sisa
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Status
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tagihans.map((tagihan) => {
                            const accountsForUnit = kasBankAccounts.filter(
                                (a) => a.unit_id === tagihan.unit_id,
                            );
                            if (editingId === tagihan.id) {
                                return (
                                    <TableRow
                                        key={tagihan.id}
                                        className="border-t bg-muted/30"
                                    >
                                        <TableCell colSpan={8} className="p-3">
                                            <Form
                                                {...TagihanSiswaController.update.form(
                                                    tagihan.id,
                                                )}
                                                onSuccess={() =>
                                                    setEditingId(null)
                                                }
                                                className="grid grid-cols-1 gap-3 md:grid-cols-4"
                                            >
                                                {({ processing }) => (
                                                    <>
                                                        <Input
                                                            name="kode_siswa"
                                                            defaultValue={
                                                                tagihan.kode_siswa
                                                            }
                                                            required
                                                        />
                                                        <Input
                                                            name="nama_siswa"
                                                            defaultValue={
                                                                tagihan.nama_siswa
                                                            }
                                                            required
                                                        />
                                                        <NativeSelect
                                                            name="jenis_tagihan"
                                                            defaultValue={
                                                                tagihan.jenis_tagihan
                                                            }
                                                            required
                                                        >
                                                            {Object.entries(
                                                                JENIS_LABEL,
                                                            ).map(
                                                                ([
                                                                    value,
                                                                    label,
                                                                ]) => (
                                                                    <option
                                                                        key={
                                                                            value
                                                                        }
                                                                        value={
                                                                            value
                                                                        }
                                                                    >
                                                                        {label}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </NativeSelect>
                                                        <Input
                                                            name="periode"
                                                            defaultValue={
                                                                tagihan.periode
                                                            }
                                                            required
                                                        />
                                                        <Input
                                                            name="nominal"
                                                            type="number"
                                                            min={0}
                                                            step="0.01"
                                                            defaultValue={
                                                                tagihan.nominal
                                                            }
                                                            disabled={
                                                                tagihan.status !==
                                                                'belum_bayar'
                                                            }
                                                            required
                                                        />
                                                        <Input
                                                            name="jatuh_tempo"
                                                            type="date"
                                                            defaultValue={
                                                                tagihan.jatuh_tempo
                                                            }
                                                            required
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                disabled={
                                                                    processing
                                                                }
                                                            >
                                                                Simpan
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    setEditingId(
                                                                        null,
                                                                    )
                                                                }
                                                            >
                                                                Batal
                                                            </Button>
                                                        </div>
                                                        {tagihan.status !==
                                                            'belum_bayar' && (
                                                            <p className="text-xs text-muted-foreground md:col-span-4">
                                                                Nominal tidak
                                                                bisa diubah
                                                                karena sudah ada
                                                                pembayaran.
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                            </Form>
                                        </TableCell>
                                    </TableRow>
                                );
                            }
                            return (
                                <TableRow
                                    key={tagihan.id}
                                    className="border-t align-top"
                                >
                                    <TableCell className="p-3">
                                        {tagihan.unit.nama}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {tagihan.nama_siswa}
                                        <div className="text-xs text-muted-foreground">
                                            {tagihan.kode_siswa}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {JENIS_LABEL[tagihan.jenis_tagihan] ??
                                            tagihan.jenis_tagihan}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {tagihan.periode}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {formatRupiah(tagihan.nominal)}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {formatRupiah(tagihan.sisa_tagihan)}
                                    </TableCell>
                                    <TableCell className="p-3 capitalize">
                                        {tagihan.status.replace('_', ' ')}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        <div className="flex flex-col gap-2">
                                            {tagihan.status !== 'lunas' && (
                                                <Form
                                                    {...TagihanSiswaController.bayar.form(
                                                        tagihan.id,
                                                    )}
                                                    resetOnSuccess
                                                    className="flex flex-wrap items-end gap-2"
                                                >
                                                    {({ processing }) => (
                                                        <>
                                                            <NativeSelect
                                                                name="kas_bank_account_id"
                                                                className="w-36"
                                                                required
                                                                defaultValue=""
                                                            >
                                                                <option
                                                                    value=""
                                                                    disabled
                                                                >
                                                                    Akun
                                                                </option>
                                                                {accountsForUnit.map(
                                                                    (a) => (
                                                                        <option
                                                                            key={
                                                                                a.id
                                                                            }
                                                                            value={
                                                                                a.id
                                                                            }
                                                                        >
                                                                            {
                                                                                a.nama
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </NativeSelect>
                                                            <NativeSelect
                                                                name="metode_pembayaran_id"
                                                                className="w-32"
                                                                defaultValue=""
                                                            >
                                                                <option value="">
                                                                    Metode
                                                                </option>
                                                                {metodePembayarans.map(
                                                                    (m) => (
                                                                        <option
                                                                            key={
                                                                                m.id
                                                                            }
                                                                            value={
                                                                                m.id
                                                                            }
                                                                        >
                                                                            {
                                                                                m.nama
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </NativeSelect>
                                                            <Input
                                                                name="nominal"
                                                                type="number"
                                                                min={0.01}
                                                                max={Number(
                                                                    tagihan.sisa_tagihan,
                                                                )}
                                                                step="0.01"
                                                                defaultValue={
                                                                    tagihan.sisa_tagihan
                                                                }
                                                                className="w-28"
                                                                required
                                                            />
                                                            <Input
                                                                name="tanggal"
                                                                type="date"
                                                                defaultValue={new Date()
                                                                    .toISOString()
                                                                    .slice(
                                                                        0,
                                                                        10,
                                                                    )}
                                                                className="w-36"
                                                                required
                                                            />
                                                            <Button
                                                                size="sm"
                                                                disabled={
                                                                    processing
                                                                }
                                                            >
                                                                Bayar
                                                            </Button>
                                                        </>
                                                    )}
                                                </Form>
                                            )}
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setEditingId(tagihan.id)
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                            <Form
                                                {...TagihanSiswaController.destroy.form(
                                                    tagihan.id,
                                                )}
                                                onSubmit={(e) => {
                                                    if (
                                                        !confirm(
                                                            `Hapus tagihan ${tagihan.nama_siswa}?`,
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
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {tagihans.length === 0 && (
                            <TableRow>
                                <TableCell
                                    className="p-3 text-muted-foreground"
                                    colSpan={8}
                                >
                                    Belum ada tagihan siswa.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
TagihanSiswaIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Tagihan Siswa',
            href: tagihanIndex(),
        },
    ],
};
