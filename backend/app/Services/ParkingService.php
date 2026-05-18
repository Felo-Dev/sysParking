<?php

namespace App\Services;

use App\Models\GestionVehiculo;
use App\Models\Cliente;
use App\Models\Espacio;
use Carbon\Carbon;

class ParkingService
{
    public function registrarEntrada(string $placa, string $tipo, int $cascos = 0, ?int $espacioId = null): GestionVehiculo
    {
        $vehiculo = GestionVehiculo::create([
            'placa' => strtoupper($placa),
            'tipo' => $tipo,
            'cascos' => $cascos,
            'hora_entrada' => now(),
            'espacio_id' => $espacioId,
        ]);

        if ($espacioId) {
            Espacio::where('id', $espacioId)->update(['estado' => 'ocupado']);
        }

        return $vehiculo;
    }

    public function registrarSalida(string $placa): ?GestionVehiculo
    {
        $vehiculo = GestionVehiculo::where('placa', strtoupper($placa))
            ->whereNull('hora_salida')
            ->first();

        if (!$vehiculo) return null;

        $vehiculo->hora_salida = now();
        $vehiculo->save();

        if ($vehiculo->espacio_id) {
            Espacio::where('id', $vehiculo->espacio_id)->update(['estado' => 'libre']);
        }

        return $vehiculo;
    }

    public function buscarActivo(string $placa): ?GestionVehiculo
    {
        return GestionVehiculo::where('placa', strtoupper($placa))
            ->whereNull('hora_salida')
            ->first();
    }

    public function esClienteMensual(string $placa): bool
    {
        return Cliente::where('placa', strtoupper($placa))->exists();
    }

    public function obtenerDuracion(string $entrada, ?string $salida = null): array
    {
        $inicio = Carbon::parse($entrada);
        $fin = $salida ? Carbon::parse($salida) : now();
        $minutos = (int)ceil($inicio->diffInMinutes($fin));
        $horas = (int)ceil($minutos / 60);

        return [
            'minutos' => $minutos,
            'horas' => $horas,
            'texto' => $minutos < 60 ? "{$minutos} minuto(s)" : "{$horas} hora(s)",
        ];
    }
}
