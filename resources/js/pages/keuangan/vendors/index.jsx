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
import VendorController from '@/actions/App/Http/Controllers/Keuangan/VendorController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes';
import { index as vendorsIndex } from '@/routes/keuangan/vendors';
export default function VendorsIndex({ vendors }) {
    const [editingId, setEditingId] = useState(null);
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <Head title="Vendor" />

            <Heading
                title="Vendor / Rekanan"
                description="Kelola daftar vendor untuk pencatatan hutang & pengeluaran."
            />

            <Form
                {...VendorController.store.form()}
                resetOnSuccess
                className="grid grid-cols-1 gap-4 rounded-xl border p-4 md:grid-cols-3"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="nama"
                            >
                                Nama Vendor
                            </Label>
                            <Input
                                id="nama"
                                name="nama"
                                placeholder="CV Sumber Makmur"
                                required
                            />
                            <InputError message={errors.nama} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="kontak"
                            >
                                Kontak
                            </Label>
                            <Input
                                id="kontak"
                                name="kontak"
                                placeholder="08xxxxxxxxxx"
                            />
                            <InputError message={errors.kontak} />
                        </div>
                        <div className="flex items-end">
                            <Button disabled={processing} className="w-full">
                                Tambah Vendor
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
                                Nama
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Kontak
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Status Hutang
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vendors.map((vendor) =>
                            editingId === vendor.id ? (
                                <TableRow
                                    key={vendor.id}
                                    className="border-t bg-muted/30"
                                >
                                    <TableCell colSpan={4} className="p-3">
                                        <Form
                                            {...VendorController.update.form(
                                                vendor.id,
                                            )}
                                            onSuccess={() => setEditingId(null)}
                                            className="grid grid-cols-1 gap-3 md:grid-cols-4"
                                        >
                                            {({ processing }) => (
                                                <>
                                                    <Input
                                                        name="nama"
                                                        defaultValue={
                                                            vendor.nama
                                                        }
                                                        required
                                                    />
                                                    <Input
                                                        name="kontak"
                                                        defaultValue={
                                                            vendor.kontak ?? ''
                                                        }
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
                                <TableRow key={vendor.id} className="border-t">
                                    <TableCell className="p-3">
                                        {vendor.nama}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {vendor.kontak ?? '-'}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {vendor.status_hutang === 'lunas'
                                            ? 'Lunas'
                                            : 'Belum Lunas'}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setEditingId(vendor.id)
                                                }
                                            >
                                                Edit
                                            </Button>
                                            <Form
                                                {...VendorController.destroy.form(
                                                    vendor.id,
                                                )}
                                                onSubmit={(e) => {
                                                    if (
                                                        !confirm(
                                                            `Hapus vendor ${vendor.nama}?`,
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
                            ),
                        )}
                        {vendors.length === 0 && (
                            <TableRow>
                                <TableCell
                                    className="p-3 text-muted-foreground"
                                    colSpan={4}
                                >
                                    Belum ada vendor.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
VendorsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Vendor',
            href: vendorsIndex(),
        },
    ],
};
