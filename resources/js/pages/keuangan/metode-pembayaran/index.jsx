import { Form, Head } from '@inertiajs/react';
import { Checkbox } from '@/components/ui/checkbox';
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
import MetodePembayaranController from '@/actions/App/Http/Controllers/Keuangan/MetodePembayaranController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { dashboard } from '@/routes';
import { index as metodeIndex } from '@/routes/keuangan/metode-pembayaran';
export default function MetodePembayaranIndex({ metodePembayarans }) {
    const [editingId, setEditingId] = useState(null);
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <Head title="Metode Pembayaran" />

            <Heading
                title="Metode Pembayaran"
                description="Konfigurasi metode pembayaran yang tersedia, termasuk opsi payment gateway (hanya konfigurasi, integrasi pihak ketiga di luar lingkup)."
            />

            <Form
                {...MetodePembayaranController.store.form()}
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
                                Nama Metode
                            </Label>
                            <Input
                                id="nama"
                                name="nama"
                                placeholder="Transfer Bank"
                                required
                            />
                            <InputError message={errors.nama} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="tipe"
                            >
                                Tipe
                            </Label>
                            <NativeSelect
                                id="tipe"
                                name="tipe"
                                defaultValue="manual"
                                required
                            >
                                <option value="manual">Manual</option>
                                <option value="payment_gateway">
                                    Payment Gateway
                                </option>
                            </NativeSelect>
                            <InputError message={errors.tipe} />
                        </div>
                        <div className="flex items-end">
                            <Button disabled={processing} className="w-full">
                                Tambah Metode
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
                                Tipe
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
                        {metodePembayarans.map((metode) =>
                            editingId === metode.id ? (
                                <TableRow
                                    key={metode.id}
                                    className="border-t bg-muted/30"
                                >
                                    <TableCell colSpan={4} className="p-3">
                                        <Form
                                            {...MetodePembayaranController.update.form(
                                                metode.id,
                                            )}
                                            onSuccess={() => setEditingId(null)}
                                            className="grid grid-cols-1 gap-3 md:grid-cols-4"
                                        >
                                            {({ processing }) => (
                                                <>
                                                    <Input
                                                        name="nama"
                                                        defaultValue={
                                                            metode.nama
                                                        }
                                                        required
                                                    />
                                                    <NativeSelect
                                                        name="tipe"
                                                        defaultValue={
                                                            metode.tipe
                                                        }
                                                        required
                                                    >
                                                        <option value="manual">
                                                            Manual
                                                        </option>
                                                        <option value="payment_gateway">
                                                            Payment Gateway
                                                        </option>
                                                    </NativeSelect>
                                                    <Label className="flex items-center gap-2 text-sm">
                                                        <Checkbox
                                                            name="aktif"
                                                            value="1"
                                                            defaultChecked={
                                                                metode.aktif
                                                            }
                                                        />
                                                        Aktif
                                                    </Label>
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
                                <TableRow key={metode.id} className="border-t">
                                    <TableCell className="p-3">
                                        {metode.nama}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {metode.tipe === 'manual'
                                            ? 'Manual'
                                            : 'Payment Gateway'}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {metode.aktif ? 'Aktif' : 'Nonaktif'}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setEditingId(metode.id)
                                                }
                                            >
                                                Edit
                                            </Button>
                                            <Form
                                                {...MetodePembayaranController.destroy.form(
                                                    metode.id,
                                                )}
                                                onSubmit={(e) => {
                                                    if (
                                                        !confirm(
                                                            `Hapus metode ${metode.nama}?`,
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
                        {metodePembayarans.length === 0 && (
                            <TableRow>
                                <TableCell
                                    className="p-3 text-muted-foreground"
                                    colSpan={4}
                                >
                                    Belum ada metode pembayaran.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
MetodePembayaranIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Metode Pembayaran',
            href: metodeIndex(),
        },
    ],
};
