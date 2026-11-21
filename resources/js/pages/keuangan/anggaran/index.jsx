import { Form, Head, usePage } from '@inertiajs/react';
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
import AnggaranController from '@/actions/App/Http/Controllers/Keuangan/AnggaranController';
import { UnitFilter } from '@/components/unit-filter';
import { EwsBadge } from '@/components/ews-badge';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { formatRupiah } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as anggaranIndex } from '@/routes/keuangan/anggaran';
const STATUS_LABEL = {
    draft: 'Draft',
    diajukan: 'Diajukan',
    disetujui: 'Disetujui',
    ditolak: 'Ditolak',
};
export default function AnggaranIndex({ anggarans, units, filterUnitId }) {
    const { auth } = usePage().props;
    const role = auth.user.role;
    const [editingId, setEditingId] = useState(null);
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <Head title="RAB / Anggaran" />

            <Heading
                title="Rencana Anggaran Biaya (RAB)"
                description="Susun dan kelola anggaran pemasukan & pengeluaran per unit."
            />

            <UnitFilter
                units={units}
                value={filterUnitId}
                action={anggaranIndex().url}
            />

            {(role === 'admin' || role === 'bendahara_unit') && (
                <Form
                    {...AnggaranController.store.form()}
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
                                    htmlFor="jenis"
                                >
                                    Jenis
                                </Label>
                                <NativeSelect
                                    id="jenis"
                                    name="jenis"
                                    defaultValue="pengeluaran"
                                    required
                                >
                                    <option value="pemasukan">Pemasukan</option>
                                    <option value="pengeluaran">
                                        Pengeluaran
                                    </option>
                                </NativeSelect>
                            </div>
                            <div className="grid gap-1.5">
                                <Label
                                    className="text-sm font-medium"
                                    htmlFor="kategori"
                                >
                                    Kategori
                                </Label>
                                <Input
                                    id="kategori"
                                    name="kategori"
                                    placeholder="SPP / Operasional / Gaji"
                                    required
                                />
                                <InputError message={errors.kategori} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label
                                    className="text-sm font-medium"
                                    htmlFor="pagu"
                                >
                                    Pagu
                                </Label>
                                <Input
                                    id="pagu"
                                    name="pagu"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    required
                                />
                                <InputError message={errors.pagu} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label
                                    className="text-sm font-medium"
                                    htmlFor="periode_mulai"
                                >
                                    Periode Mulai
                                </Label>
                                <Input
                                    id="periode_mulai"
                                    name="periode_mulai"
                                    type="date"
                                    required
                                />
                                <InputError message={errors.periode_mulai} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label
                                    className="text-sm font-medium"
                                    htmlFor="periode_selesai"
                                >
                                    Periode Selesai
                                </Label>
                                <Input
                                    id="periode_selesai"
                                    name="periode_selesai"
                                    type="date"
                                    required
                                />
                                <InputError message={errors.periode_selesai} />
                            </div>
                            <div className="grid gap-1.5 md:col-span-2">
                                <Label
                                    className="text-sm font-medium"
                                    htmlFor="catatan"
                                >
                                    Catatan
                                </Label>
                                <Input
                                    id="catatan"
                                    name="catatan"
                                    placeholder="opsional"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    disabled={processing}
                                    className="w-full"
                                >
                                    Tambah RAB
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            )}

            <div className="overflow-x-auto rounded-xl border">
                <Table className="w-full text-sm">
                    <TableHeader className="bg-muted/50 text-left">
                        <TableRow>
                            <TableHead className="p-3 font-medium">
                                Unit
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Jenis
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Kategori
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Periode
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Pagu
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Realisasi
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Status RAB
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                EWS
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {anggarans.map((a) =>
                            editingId === a.id ? (
                                <TableRow
                                    key={a.id}
                                    className="border-t bg-muted/30"
                                >
                                    <TableCell colSpan={9} className="p-3">
                                        <Form
                                            {...AnggaranController.update.form(
                                                a.id,
                                            )}
                                            onSuccess={() => setEditingId(null)}
                                            className="grid grid-cols-1 gap-3 md:grid-cols-4"
                                        >
                                            {({ processing }) => (
                                                <>
                                                    <Input
                                                        name="kategori"
                                                        defaultValue={
                                                            a.kategori
                                                        }
                                                        required
                                                    />
                                                    <Input
                                                        name="pagu"
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        defaultValue={a.pagu}
                                                        required
                                                    />
                                                    <Input
                                                        name="periode_mulai"
                                                        type="date"
                                                        defaultValue={
                                                            a.periode_mulai
                                                        }
                                                        required
                                                    />
                                                    <Input
                                                        name="periode_selesai"
                                                        type="date"
                                                        defaultValue={
                                                            a.periode_selesai
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
                                                </>
                                            )}
                                        </Form>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <TableRow
                                    key={a.id}
                                    className="border-t align-top"
                                >
                                    <TableCell className="p-3">
                                        {a.unit.nama}
                                    </TableCell>
                                    <TableCell className="p-3 capitalize">
                                        {a.jenis}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {a.kategori}
                                    </TableCell>
                                    <TableCell className="p-3 text-xs">
                                        {a.periode_mulai} &ndash;{' '}
                                        {a.periode_selesai}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {formatRupiah(a.pagu)}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {formatRupiah(a.realisasi)}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {STATUS_LABEL[a.status] ?? a.status}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {a.jenis === 'pengeluaran' &&
                                            a.status === 'disetujui' && (
                                                <EwsBadge
                                                    status={a.status_ews}
                                                />
                                            )}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        <div className="flex flex-col gap-2">
                                            {a.status === 'draft' &&
                                                (role === 'admin' ||
                                                    role ===
                                                        'bendahara_unit') && (
                                                    <Form
                                                        {...AnggaranController.ajukan.form(
                                                            a.id,
                                                        )}
                                                    >
                                                        {({ processing }) => (
                                                            <Button
                                                                size="sm"
                                                                disabled={
                                                                    processing
                                                                }
                                                            >
                                                                Ajukan
                                                            </Button>
                                                        )}
                                                    </Form>
                                                )}
                                            {a.status === 'diajukan' &&
                                                role === 'pimpinan_yayasan' && (
                                                    <div className="flex gap-2">
                                                        <Form
                                                            {...AnggaranController.approve.form(
                                                                a.id,
                                                            )}
                                                        >
                                                            {({
                                                                processing,
                                                            }) => (
                                                                <Button
                                                                    size="sm"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                >
                                                                    Setujui
                                                                </Button>
                                                            )}
                                                        </Form>
                                                        <Form
                                                            {...AnggaranController.reject.form(
                                                                a.id,
                                                            )}
                                                        >
                                                            {({
                                                                processing,
                                                            }) => (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                >
                                                                    Tolak
                                                                </Button>
                                                            )}
                                                        </Form>
                                                    </div>
                                                )}
                                            {a.status === 'draft' &&
                                                (role === 'admin' ||
                                                    role ===
                                                        'bendahara_unit') && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setEditingId(a.id)
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                            {a.status === 'draft' &&
                                                (role === 'admin' ||
                                                    role ===
                                                        'bendahara_unit') && (
                                                    <Form
                                                        {...AnggaranController.destroy.form(
                                                            a.id,
                                                        )}
                                                        onSubmit={(e) => {
                                                            if (
                                                                !confirm(
                                                                    `Hapus RAB ${a.kategori}?`,
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
                                                                disabled={
                                                                    processing
                                                                }
                                                            >
                                                                Hapus
                                                            </Button>
                                                        )}
                                                    </Form>
                                                )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ),
                        )}
                        {anggarans.length === 0 && (
                            <TableRow>
                                <TableCell
                                    className="p-3 text-muted-foreground"
                                    colSpan={9}
                                >
                                    Belum ada RAB.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
AnggaranIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'RAB / Anggaran',
            href: anggaranIndex(),
        },
    ],
};
