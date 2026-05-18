<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehiculoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'placa' => $this->placa,
            'tipo' => $this->tipo,
            'cascos' => (int)($this->cascos ?? 0),
            'hora_entrada' => $this->hora_entrada,
            'hora_salida' => $this->hora_salida,
            'espacio_id' => $this->espacio_id,
            'duracion' => $this->hora_salida
                ? $this->getDurationText()
                : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
