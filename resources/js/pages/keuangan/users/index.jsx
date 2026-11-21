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
import UserController from '@/actions/App/Http/Controllers/Keuangan/UserController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { dashboard } from '@/routes';
import { index as usersIndex } from '@/routes/keuangan/users';
const ROLE_LABEL = {
    admin: 'Admin Sistem',
    pimpinan_yayasan: 'Pimpinan Yayasan',
    bendahara_yayasan: 'Bendahara Yayasan',
    bendahara_unit: 'Bendahara Unit',
};
export default function UsersIndex({ users, units, roles }) {
    const [editingId, setEditingId] = useState(null);
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <Head title="Pengguna" />

            <Heading
                title="Pengelolaan Pengguna"
                description="Kelola akun dan peran pengguna sistem."
            />

            <Form
                {...UserController.store.form()}
                resetOnSuccess
                className="grid grid-cols-1 gap-4 rounded-xl border p-4 md:grid-cols-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="name"
                            >
                                Nama
                            </Label>
                            <Input id="name" name="name" required />
                            <InputError message={errors.name} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="email"
                            >
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                            />
                            <InputError message={errors.email} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="password"
                            >
                                Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                minLength={8}
                                required
                            />
                            <InputError message={errors.password} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="role"
                            >
                                Peran
                            </Label>
                            <NativeSelect
                                id="role"
                                name="role"
                                defaultValue="bendahara_unit"
                                required
                            >
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {ROLE_LABEL[role] ?? role}
                                    </option>
                                ))}
                            </NativeSelect>
                            <InputError message={errors.role} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="unit_id"
                            >
                                Unit (untuk Bendahara Unit)
                            </Label>
                            <NativeSelect
                                id="unit_id"
                                name="unit_id"
                                defaultValue=""
                            >
                                <option value="">-</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.nama}
                                    </option>
                                ))}
                            </NativeSelect>
                            <InputError message={errors.unit_id} />
                        </div>
                        <div className="flex items-end md:col-span-5">
                            <Button disabled={processing}>
                                Tambah Pengguna
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
                                Email
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Peran
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Unit
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) =>
                            editingId === user.id ? (
                                <TableRow
                                    key={user.id}
                                    className="border-t bg-muted/30"
                                >
                                    <TableCell colSpan={5} className="p-3">
                                        <Form
                                            {...UserController.update.form(
                                                user.id,
                                            )}
                                            onSuccess={() => setEditingId(null)}
                                            className="grid grid-cols-1 gap-3 md:grid-cols-5"
                                        >
                                            {({ processing, errors }) => (
                                                <>
                                                    <Input
                                                        name="name"
                                                        defaultValue={user.name}
                                                        required
                                                    />
                                                    <Input
                                                        name="email"
                                                        type="email"
                                                        defaultValue={
                                                            user.email
                                                        }
                                                        required
                                                    />
                                                    <NativeSelect
                                                        name="role"
                                                        defaultValue={user.role}
                                                        required
                                                    >
                                                        {roles.map((role) => (
                                                            <option
                                                                key={role}
                                                                value={role}
                                                            >
                                                                {ROLE_LABEL[
                                                                    role
                                                                ] ?? role}
                                                            </option>
                                                        ))}
                                                    </NativeSelect>
                                                    <NativeSelect
                                                        name="unit_id"
                                                        defaultValue={
                                                            user.unit?.id ?? ''
                                                        }
                                                    >
                                                        <option value="">
                                                            -
                                                        </option>
                                                        {units.map((unit) => (
                                                            <option
                                                                key={unit.id}
                                                                value={unit.id}
                                                            >
                                                                {unit.nama}
                                                            </option>
                                                        ))}
                                                    </NativeSelect>
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
                                                            errors.name ??
                                                            errors.email ??
                                                            errors.role ??
                                                            errors.unit_id
                                                        }
                                                    />
                                                </>
                                            )}
                                        </Form>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <TableRow key={user.id} className="border-t">
                                    <TableCell className="p-3">
                                        {user.name}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {user.email}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {ROLE_LABEL[user.role] ?? user.role}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {user.unit?.nama ?? '-'}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setEditingId(user.id)
                                                }
                                            >
                                                Edit
                                            </Button>
                                            <Form
                                                {...UserController.destroy.form(
                                                    user.id,
                                                )}
                                                onSubmit={(e) => {
                                                    if (
                                                        !confirm(
                                                            `Hapus pengguna ${user.name}?`,
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
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell
                                    className="p-3 text-muted-foreground"
                                    colSpan={5}
                                >
                                    Belum ada pengguna.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Pengguna',
            href: usersIndex(),
        },
    ],
};
