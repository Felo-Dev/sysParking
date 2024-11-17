<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GestionVehiculo extends Model
{
    use HasFactory;

    protected $table = 'gestion_vehiculos';

    protected $fillable = [
        'id',
        'placa',
        'tipo',
        'hora_entrada',
        'hora_salida',
    ];
}
