<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditService
{
    public function __construct(protected Request $request) {}

    public function log(
        string $accion,
        ?string $modeloType = null,
        ?int $modeloId = null,
        ?array $valoresAnteriores = null,
        ?array $valoresNuevos = null,
    ): AuditLog {
        return AuditLog::create([
            'user_id' => $this->request->user()?->id,
            'accion' => $accion,
            'modelo_type' => $modeloType,
            'modelo_id' => $modeloId,
            'valores_anteriores' => $valoresAnteriores,
            'valores_nuevos' => $valoresNuevos,
            'ip_address' => $this->request->ip(),
            'user_agent' => $this->request->userAgent(),
        ]);
    }

    public function logDelete(string $modeloType, $modelo): AuditLog
    {
        return $this->log(
            accion: 'eliminar',
            modeloType: $modeloType,
            modeloId: $modelo->id,
            valoresAnteriores: $modelo->toArray(),
        );
    }

    public function logCreate(string $modeloType, $modelo): AuditLog
    {
        return $this->log(
            accion: 'crear',
            modeloType: $modeloType,
            modeloId: $modelo->id,
            valoresNuevos: $modelo->toArray(),
        );
    }

    public function logUpdate(string $modeloType, $modelo, array $original): AuditLog
    {
        return $this->log(
            accion: 'actualizar',
            modeloType: $modeloType,
            modeloId: $modelo->id,
            valoresAnteriores: $original,
            valoresNuevos: $modelo->toArray(),
        );
    }
}
