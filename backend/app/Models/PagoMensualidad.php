<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PagoMensualidad extends Model
{
    protected $table = 'pagos_mensualidad';

    protected $fillable = [
        'cliente_id', 'mes', 'anio', 'monto', 'fecha_pago', 'estado',
    ];

    protected $casts = [
        'fecha_pago' => 'datetime',
        'monto' => 'float',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }
}
