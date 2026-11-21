import { Head } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRupiah } from '@/lib/utils';
import { dashboard } from '@/routes';
const JENIS_COLOR = {
    pemasukan: '#22c55e',
    pengeluaran: '#ef4444',
};
export default function LaporanPerUnit({
    unit,
    totalPemasukan,
    totalPengeluaran,
    saldoBersih,
    perKategori,
    bukuBesar,
    saldoKasBank,
    periode,
}) {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <Head title={`Laporan - ${unit.nama}`} />

            <Heading
                title={`Laporan Keuangan - ${unit.nama}`}
                description={`Periode ${periode.dari} s.d. ${periode.sampai}`}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Pemasukan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold text-green-600">
                        {formatRupiah(totalPemasukan)}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Pengeluaran
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold text-red-600">
                        {formatRupiah(totalPengeluaran)}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Saldo Bersih
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-semibold">
                        {formatRupiah(saldoBersih)}
                    </CardContent>
                </Card>
            </div>

            <div>
                <Heading variant="small" title="Saldo Kas & Bank" />
                <div className="mt-2 overflow-x-auto rounded-xl border">
                    <Table className="w-full text-sm">
                        <TableHeader className="bg-muted/50 text-left">
                            <TableRow>
                                <TableHead className="p-3 font-medium">
                                    Nama Akun
                                </TableHead>
                                <TableHead className="p-3 font-medium">
                                    Jenis
                                </TableHead>
                                <TableHead className="p-3 font-medium">
                                    Saldo
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {saldoKasBank.map((a) => (
                                <TableRow key={a.id} className="border-t">
                                    <TableCell className="p-3">
                                        {a.nama}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {a.jenis === 'kas' ? 'Kas' : 'Bank'}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {formatRupiah(a.saldo)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {perKategori.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pemasukan & Pengeluaran per Kategori
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer
                            width="100%"
                            height={Math.max(160, perKategori.length * 36)}
                        >
                            <BarChart
                                data={perKategori.map((row) => ({
                                    ...row,
                                    total: Number(row.total),
                                }))}
                                layout="vertical"
                                margin={{
                                    left: 12,
                                    right: 24,
                                }}
                            >
                                <CartesianGrid
                                    horizontal={false}
                                    stroke="var(--border)"
                                />
                                <XAxis
                                    type="number"
                                    stroke="var(--muted-foreground)"
                                    fontSize={12}
                                    tickFormatter={(v) => formatRupiah(v)}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="kategori"
                                    width={140}
                                    stroke="var(--muted-foreground)"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <Tooltip
                                    formatter={(value) =>
                                        formatRupiah(Number(value))
                                    }
                                    contentStyle={{
                                        background: 'var(--popover)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 8,
                                        color: 'var(--popover-foreground)',
                                    }}
                                />
                                <Bar
                                    dataKey="total"
                                    radius={[0, 4, 4, 0]}
                                    maxBarSize={18}
                                >
                                    {perKategori.map((row, i) => (
                                        <Cell
                                            key={i}
                                            fill={
                                                JENIS_COLOR[row.jenis] ?? '#999'
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <span
                                    className="size-2.5 rounded-full"
                                    style={{
                                        backgroundColor: JENIS_COLOR.pemasukan,
                                    }}
                                />
                                Pemasukan
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span
                                    className="size-2.5 rounded-full"
                                    style={{
                                        backgroundColor:
                                            JENIS_COLOR.pengeluaran,
                                    }}
                                />
                                Pengeluaran
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div>
                <Heading variant="small" title="Rekap per Kategori" />
                <div className="mt-2 overflow-x-auto rounded-xl border">
                    <Table className="w-full text-sm">
                        <TableHeader className="bg-muted/50 text-left">
                            <TableRow>
                                <TableHead className="p-3 font-medium">
                                    Jenis
                                </TableHead>
                                <TableHead className="p-3 font-medium">
                                    Kategori
                                </TableHead>
                                <TableHead className="p-3 font-medium">
                                    Total
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {perKategori.map((row, i) => (
                                <TableRow key={i} className="border-t">
                                    <TableCell className="p-3 capitalize">
                                        {row.jenis}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {row.kategori}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {formatRupiah(row.total)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {perKategori.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        className="p-3 text-muted-foreground"
                                        colSpan={3}
                                    >
                                        Belum ada transaksi pada periode ini.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div>
                <Heading variant="small" title="Buku Besar" />
                <div className="mt-2 max-h-96 overflow-x-auto overflow-y-auto rounded-xl border">
                    <Table className="w-full text-sm">
                        <TableHeader className="bg-muted/50 text-left">
                            <TableRow>
                                <TableHead className="p-3 font-medium">
                                    Tanggal
                                </TableHead>
                                <TableHead className="p-3 font-medium">
                                    Akun
                                </TableHead>
                                <TableHead className="p-3 font-medium">
                                    Debit
                                </TableHead>
                                <TableHead className="p-3 font-medium">
                                    Kredit
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bukuBesar.map((row) => (
                                <TableRow key={row.id} className="border-t">
                                    <TableCell className="p-3 text-xs">
                                        {row.tanggal}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {row.akun}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {Number(row.debit) > 0
                                            ? formatRupiah(row.debit)
                                            : '-'}
                                    </TableCell>
                                    <TableCell className="p-3">
                                        {Number(row.kredit) > 0
                                            ? formatRupiah(row.kredit)
                                            : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {bukuBesar.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        className="p-3 text-muted-foreground"
                                        colSpan={4}
                                    >
                                        Belum ada jurnal pada periode ini.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
LaporanPerUnit.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Laporan per Unit',
            href: '#',
        },
    ],
};
