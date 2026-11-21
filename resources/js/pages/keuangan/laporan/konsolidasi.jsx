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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRupiah } from '@/lib/utils';
import { dashboard } from '@/routes';
import { konsolidasi } from '@/routes/keuangan/laporan';
export default function LaporanKonsolidasi({
    perUnit,
    totalPemasukan,
    totalPengeluaran,
    totalSaldoKasBank,
    periode,
}) {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <Head title="Laporan Konsolidasi" />

            <Heading
                title="Laporan Konsolidasi Yayasan"
                description={`Gabungan kondisi keuangan seluruh unit periode ${periode.dari} s.d. ${periode.sampai}.`}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Pemasukan Yayasan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold text-green-600">
                        {formatRupiah(totalPemasukan)}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Pengeluaran Yayasan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold text-red-600">
                        {formatRupiah(totalPengeluaran)}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Saldo Kas & Bank
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold">
                        {formatRupiah(totalSaldoKasBank)}
                    </CardContent>
                </Card>
            </div>

            <div className="overflow-x-auto rounded-xl border">
                <Table className="w-full text-sm">
                    <TableHeader className="bg-muted/50 text-left">
                        <TableRow>
                            <TableHead className="p-3 font-medium">
                                Unit
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Pemasukan
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Pengeluaran
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Saldo Bersih
                            </TableHead>
                            <TableHead className="p-3 font-medium">
                                Saldo Kas & Bank
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {perUnit.map((row) => (
                            <TableRow key={row.unit_id} className="border-t">
                                <TableCell className="p-3">
                                    {row.unit}
                                </TableCell>
                                <TableCell className="p-3 text-green-600">
                                    {formatRupiah(row.pemasukan)}
                                </TableCell>
                                <TableCell className="p-3 text-red-600">
                                    {formatRupiah(row.pengeluaran)}
                                </TableCell>
                                <TableCell className="p-3">
                                    {formatRupiah(row.saldo_bersih)}
                                </TableCell>
                                <TableCell className="p-3">
                                    {formatRupiah(row.saldo_kas_bank)}
                                </TableCell>
                            </TableRow>
                        ))}
                        {perUnit.length === 0 && (
                            <TableRow>
                                <TableCell
                                    className="p-3 text-muted-foreground"
                                    colSpan={5}
                                >
                                    Belum ada data unit.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
LaporanKonsolidasi.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Laporan Konsolidasi',
            href: konsolidasi(),
        },
    ],
};
