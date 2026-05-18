<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Factura extends Model
{
    protected $table = 'facturas';

    protected $fillable = [
        'gestion_vehiculo_id',
        'placa',
        'tipo_vehiculo',
        'hora_entrada',
        'hora_salida',
        'tiempo_total',
        'tarifa_aplicada',
        'cascos',
        'cascos_total',
        'total',
        'estado',
        'registrado_por',
    ];

    public function gestionVehiculo()
    {
        return $this->belongsTo(GestionVehiculo::class, 'gestion_vehiculo_id');
    }

    public function registradoPor()
    {
        return $this->belongsTo(User::class, 'registrado_por');
    }
}
