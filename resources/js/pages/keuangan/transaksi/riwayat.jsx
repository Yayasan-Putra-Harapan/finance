import { Head } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Heading from '@/components/heading';
import { Pagination } from '@/components/pagination';
import { UnitFilter } from '@/components/unit-filter';
import { dashboard } from '@/routes';
import { index as transaksiIndex, riwayat } from '@/routes/keuangan/transaksi';

const KOLOM = {
    kategori: 'Kategori',
    nominal: 'Nominal',
    tanggal: 'Tanggal',
    keterangan: 'Keterangan',
    kas_bank_account_id: 'Akun',
    anggaran_id: 'RAB',
    vendor_id: 'Vendor',
    metode_pembayaran_id: 'Metode',
    jenis: 'Jenis',
};

function ringkas(r) {
    const p = r.perubahan ?? {};

    if (r.aksi === 'diubah') {
        return Object.entries(p)
            .map(
                ([k, v]) =>
                    `${KOLOM[k] ?? k}: ${v.dari ?? '-'} → ${v.menjadi ?? '-'}`,
            )
            .join('; ');
    }

    return `${p.jenis ?? ''} ${p.kategori ?? ''} ${p.nominal ?? ''} (${p.tanggal ?? ''})`;
}

export default function TransaksiRiwayat({ riwayats, units, filterUnitId }) {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <Head title="Riwayat Transaksi" />
            <Heading
                title="Riwayat Perubahan Transaksi"
                description="Jejak audit: siapa menambah, mengubah, atau menghapus transaksi, termasuk yang sudah dihapus."
            />
            <UnitFilter
                units={units}
                value={filterUnitId}
                action={riwayat().url}
            />
            <div className="overflow-x-auto rounded-xl border">
                <Table className="w-full text-sm">
                    <TableHeader className="bg-muted/50 text-left">
                        <TableRow>
                            <TableHead className="p-3 font-medium">
                                Waktu
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Unit
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Transaksi
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Aksi
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Oleh
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Perubahan
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {riwayats.data.map((r) => (
                            <TableRow key={r.id} className="border-t">
                                <TableCell className="p-3 text-xs">
                                    {new Date(r.created_at).toLocaleString(
                                        'id-ID',
                                    )}
                                </TableCell>
                                <TableCell className="p-3">
                                    {r.unit?.nama ?? '-'}
                                </TableCell>
                                <TableCell className="p-3">
                                    #{r.transaksi_id}
                                </TableCell>
                                <TableCell className="p-3 font-medium capitalize">
                                    {r.aksi}
                                </TableCell>
                                <TableCell className="p-3">
                                    {r.user?.name ?? '-'}
                                </TableCell>
                                <TableCell className="p-3 text-xs text-muted-foreground">
                                    {ringkas(r)}
                                </TableCell>
                            </TableRow>
                        ))}
                        {riwayats.data.length === 0 && (
                            <TableRow>
                                <TableCell
                                    className="p-3 text-muted-foreground"
                                    colSpan={6}
                                >
                                    Belum ada riwayat.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <Pagination links={riwayats.links} />
        </div>
    );
}
TransaksiRiwayat.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Transaksi', href: transaksiIndex() },
        { title: 'Riwayat', href: riwayat() },
    ],
};
