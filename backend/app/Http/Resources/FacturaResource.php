<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FacturaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'placa' => $this->placa,
            'tipo_vehiculo' => $this->tipo_vehiculo,
            'hora_entrada' => $this->hora_entrada,
            'hora_salida' => $this->hora_salida,
            'tiempo_total' => $this->tiempo_total,
            'tarifa_aplicada' => (float)$this->tarifa_aplicada,
            'cascos' => (int)($this->cascos ?? 0),
            'cascos_total' => (float)($this->cascos_total ?? 0),
            'total' => (float)$this->total,
            'estado' => $this->estado,
            'created_at' => $this->created_at,
            'atendido_por' => $this->registradoPor?->name ?? 'Sistema',
        ];
    }
}
