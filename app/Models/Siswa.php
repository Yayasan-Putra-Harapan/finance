<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Siswa extends Model
{
    protected $table = 'siswa';

    protected $fillable = ['kode_siswa', 'nama_siswa', 'kode_unit', 'status_aktif', 'orang_tua_mdm_id'];

    protected function casts(): array
    {
        return ['status_aktif' => 'boolean'];
    }

    /** @return BelongsTo<OrangTua, $this> */
    public function orangTua(): BelongsTo
    {
        return $this->belongsTo(OrangTua::class, 'orang_tua_mdm_id', 'mdm_id');
    }
}
