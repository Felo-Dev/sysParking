<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GestionVehiculo extends Model
{
    use HasFactory;

    protected $table = 'gestion_vehiculos';

    protected $fillable = [
        'placa',
        'tipo',
        'cascos',
        'hora_entrada',
        'hora_salida',
        'espacio_id',
    ];

    public function getDurationText(): ?string
    {
        if (!$this->hora_salida) return null;

        $inicio = \Carbon\Carbon::parse($this->hora_entrada);
        $fin = \Carbon\Carbon::parse($this->hora_salida);
        $minutos = (int)ceil($inicio->diffInMinutes($fin));

        if ($minutos < 60) {
            return "{$minutos} minuto(s)";
        }

        $horas = (int)ceil($minutos / 60);
        return "{$horas} hora(s)";
    }
}
