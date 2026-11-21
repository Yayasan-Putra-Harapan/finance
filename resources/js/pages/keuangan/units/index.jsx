import { Form, Head, Link, usePage } from '@inertiajs/react';
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
import UnitController from '@/actions/App/Http/Controllers/Keuangan/UnitController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { dashboard } from '@/routes';
import { perUnit, proyeksiSes } from '@/routes/keuangan/laporan';
import { index as unitsIndex } from '@/routes/keuangan/units';
export default function UnitsIndex({ units }) {
    const { auth } = usePage().props;
    const isAdmin = auth.user.role === 'admin';
    const [editingId, setEditingId] = useState(null);
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <Head title="Unit Sekolah" />

            <Heading
                title="Unit Sekolah"
                description="Kelola daftar unit sekolah di bawah yayasan."
            />

            {isAdmin && (
                <Form
                    {...UnitController.store.form()}
                    resetOnSuccess
                    className="grid grid-cols-1 gap-4 rounded-xl border p-4 md:grid-cols-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-1.5">
                                <Label
                                    className="text-sm font-medium"
                                    htmlFor="kode_unit"
                                >
                                    Kode Unit
                                </Label>
                                <Input
                                    id="kode_unit"
                                    name="kode_unit"
                                    placeholder="SD-01"
                                    required
                                />
                                <InputError message={errors.kode_unit} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label
                                    className="text-sm font-medium"
                                    htmlFor="nama"
                                >
                                    Nama Unit
                                </Label>
                                <Input
                                    id="nama"
                                    name="nama"
                                    placeholder="SD Harapan Bangsa"
                                    required
                                />
                                <InputError message={errors.nama} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label
                                    className="text-sm font-medium"
                                    htmlFor="jenjang"
                                >
                                    Jenjang
                                </Label>
                                <Input
                                    id="jenjang"
                                    name="jenjang"
                                    placeholder="SD / SMP / SMA"
                                    required
                                />
                                <InputError message={errors.jenjang} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label
                                    className="text-sm font-medium"
                                    htmlFor="jumlah_siswa"
                                >
                                    Jumlah Siswa
                                </Label>
                                <Input
                                    id="jumlah_siswa"
                                    name="jumlah_siswa"
                                    type="number"
                                    min={0}
                                    defaultValue={0}
                                    required
                                />
                                <InputError message={errors.jumlah_siswa} />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    disabled={processing}
                                    className="w-full"
                                >
                                    Tambah Unit
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
                                Kode
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Nama
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Jenjang
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Jumlah Siswa
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {units.map((unit) =>
                            editingId === unit.id ? (
                                <TableRow
                                    key={unit.id}
                                    className="border-t bg-muted/30"
                                >
                                    <TableCell colSpan={5} className="p-3">
                                        <Form
                                            {...UnitController.update.form(
                                                unit.id,
                                            )}
                                            onSuccess={() => setEditingId(null)}
                                            className="grid grid-cols-1 gap-3 md:grid-cols-5"
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    <Input
                                                        name="kode_unit"
                                                        defaultValue={
                                                            unit.kode_unit
                                                        }
                                                        required
                                                    />
                                                    <Input
                                                        name="nama"
                                                        defaultValue={unit.nama}
                                                        required
                                                    />
                                                    <Input
                                                        name="jenjang"
                                                        defaultValue={
                                                            unit.jenjang
                                                        }
                                                        required
                                                    />
                                                    <Input
                                                        name="jumlah_siswa"
                                                        type="number"
                                                        min={0}
                                                        defaultValue={
                                                            unit.jumlah_siswa
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
                                                    <InputError
                                                        message={
                                                            errors.kode_unit ??
                                                            errors.nama ??
                                                            errors.jenjang ??
                                                            errors.jumlah_siswa
                                                        }
                                                    />
                                                </>
                                            )}
                                        </Form>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <TableRow key={unit.id} className="border-t">
                                    <TableCell className="p-3">
                                        {unit.kode_unit}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {unit.nama}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {unit.jenjang}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {unit.jumlah_siswa}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link
                                                href={perUnit(unit.id)}
                                                className="text-sm text-primary underline-offset-4 hover:underline"
                                            >
                                                Laporan
                                            </Link>
                                            <Link
                                                href={proyeksiSes(unit.id)}
                                                className="text-sm text-primary underline-offset-4 hover:underline"
                                            >
                                                Proyeksi SES
                                            </Link>
                                            {isAdmin && (
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    className="h-auto p-0"
                                                    onClick={() =>
                                                        setEditingId(unit.id)
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                        </div>
                                        {isAdmin && (
                                            <Form
                                                {...UnitController.destroy.form(
                                                    unit.id,
                                                )}
                                                onSubmit={(e) => {
                                                    if (
                                                        !confirm(
                                                            `Hapus unit ${unit.nama}?`,
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
                                                        className="mt-2"
                                                    >
                                                        Hapus
                                                    </Button>
                                                )}
                                            </Form>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ),
                        )}
                        {units.length === 0 && (
                            <TableRow>
                                <TableCell
                                    className="p-3 text-muted-foreground"
                                    colSpan={5}
                                >
                                    Belum ada unit.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
UnitsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Unit Sekolah',
            href: unitsIndex(),
        },
    ],
};
