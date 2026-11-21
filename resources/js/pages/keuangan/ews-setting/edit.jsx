import { Form, Head } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import EwsSettingController from '@/actions/App/Http/Controllers/Keuangan/EwsSettingController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes';
import { edit as ewsSettingEdit } from '@/routes/keuangan/ews-setting';
export default function EwsSettingEdit({ setting }) {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <Head title="Konfigurasi EWS" />

            <Heading
                title="Konfigurasi Early Warning System"
                description="Atur ambang batas rasio serapan anggaran untuk klasifikasi status EWS tanpa mengubah kode program."
            />

            <Form
                {...EwsSettingController.update.form()}
                className="max-w-xl space-y-4 rounded-xl border p-4"
            >
                {({ processing, errors }) => (
                    <>
                        <p className="text-sm font-medium">
                            Ambang rasio proyeksi SES (utama)
                        </p>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="proyeksi_waspada"
                            >
                                Batas Waspada (proyeksi / pagu)
                            </Label>
                            <Input
                                id="proyeksi_waspada"
                                name="proyeksi_waspada"
                                type="number"
                                step="0.01"
                                defaultValue={setting.proyeksi_waspada}
                                required
                            />
                            <InputError message={errors.proyeksi_waspada} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="proyeksi_kritis"
                            >
                                Batas Kritis (proyeksi / pagu)
                            </Label>
                            <Input
                                id="proyeksi_kritis"
                                name="proyeksi_kritis"
                                type="number"
                                step="0.01"
                                defaultValue={setting.proyeksi_kritis}
                                required
                            />
                            <InputError message={errors.proyeksi_kritis} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="proyeksi_melebihi"
                            >
                                Batas Melebihi Anggaran (proyeksi / pagu)
                            </Label>
                            <Input
                                id="proyeksi_melebihi"
                                name="proyeksi_melebihi"
                                type="number"
                                step="0.01"
                                defaultValue={setting.proyeksi_melebihi}
                                required
                            />
                            <InputError message={errors.proyeksi_melebihi} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="alpha_ses"
                            >
                                Alpha SES tetap (kosongkan = otomatis, MAPE
                                terkecil)
                            </Label>
                            <Input
                                id="alpha_ses"
                                name="alpha_ses"
                                type="number"
                                step="0.01"
                                defaultValue={setting.alpha_ses}
                            />
                            <InputError message={errors.alpha_ses} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Rasio Proyeksi = (Realisasi berjalan + Proyeksi SES
                            periode berikutnya) &divide; Pagu. Dipakai bila
                            riwayat pengeluaran minimal 6 bulan.
                        </p>
                        <p className="text-sm font-medium">
                            Ambang rasio serapan (cadangan bila riwayat kurang
                            dari 6 bulan)
                        </p>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="batas_waspada"
                            >
                                Batas Waspada (rasio serapan &gt; nilai ini)
                            </Label>
                            <Input
                                id="batas_waspada"
                                name="batas_waspada"
                                type="number"
                                step="0.01"
                                defaultValue={setting.batas_waspada}
                                required
                            />
                            <InputError message={errors.batas_waspada} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="batas_kritis"
                            >
                                Batas Kritis
                            </Label>
                            <Input
                                id="batas_kritis"
                                name="batas_kritis"
                                type="number"
                                step="0.01"
                                defaultValue={setting.batas_kritis}
                                required
                            />
                            <InputError message={errors.batas_kritis} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                className="text-sm font-medium"
                                htmlFor="batas_melebihi"
                            >
                                Batas Melebihi Anggaran
                            </Label>
                            <Input
                                id="batas_melebihi"
                                name="batas_melebihi"
                                type="number"
                                step="0.01"
                                defaultValue={setting.batas_melebihi}
                                required
                            />
                            <InputError message={errors.batas_melebihi} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Rasio Serapan = Persentase Serapan Aktual &divide;
                            Expected Pace (waktu berjalan &divide; total durasi
                            periode).
                        </p>
                        <Button disabled={processing}>Simpan</Button>
                    </>
                )}
            </Form>
        </div>
    );
}
EwsSettingEdit.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Konfigurasi EWS',
            href: ewsSettingEdit(),
        },
    ],
};
