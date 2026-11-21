import { Head } from '@inertiajs/react';
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
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="p-3 font-medium">Waktu</th>
                            <th className="p-3 font-medium">Unit</th>
                            <th className="p-3 font-medium">Transaksi</th>
                            <th className="p-3 font-medium">Aksi</th>
                            <th className="p-3 font-medium">Oleh</th>
                            <th className="p-3 font-medium">Perubahan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riwayats.data.map((r) => (
                            <tr key={r.id} className="border-t">
                                <td className="p-3 text-xs">
                                    {new Date(r.created_at).toLocaleString(
                                        'id-ID',
                                    )}
                                </td>
                                <td className="p-3">{r.unit?.nama ?? '-'}</td>
                                <td className="p-3">#{r.transaksi_id}</td>
                                <td className="p-3 font-medium capitalize">
                                    {r.aksi}
                                </td>
                                <td className="p-3">{r.user?.name ?? '-'}</td>
                                <td className="p-3 text-xs text-muted-foreground">
                                    {ringkas(r)}
                                </td>
                            </tr>
                        ))}
                        {riwayats.data.length === 0 && (
                            <tr>
                                <td
                                    className="p-3 text-muted-foreground"
                                    colSpan={6}
                                >
                                    Belum ada riwayat.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
