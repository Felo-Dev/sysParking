<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tarifa extends Model
{
    use HasFactory;
    
    protected $table = 'tarifa';

    protected $fillable = [
        'tipo_vehiculo',
        'tarifa_valor',
        'tarifa_hora_pago',
    ];

    
}
