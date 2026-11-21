<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TahunAjaran extends Model
{
    protected $fillable = ['kode', 'nama', 'semester', 'tanggal_mulai', 'tanggal_selesai', 'is_aktif'];

    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date:Y-m-d',
            'tanggal_selesai' => 'date:Y-m-d',
            'is_aktif' => 'boolean',
        ];
    }
}
