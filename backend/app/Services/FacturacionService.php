<?php

namespace App\Services;

use App\Models\Factura;
use App\Models\GestionVehiculo;
use App\Models\Tarifa;
use App\Models\Configuracion;
use Carbon\Carbon;

class FacturacionService
{
    public function generarFactura(GestionVehiculo $vehiculo, ?int $userId = null): array
    {
        $duracion = app(ParkingService::class)->obtenerDuracion($vehiculo->hora_entrada, $vehiculo->hora_salida);

        $tarifa = Tarifa::where('tipo_vehiculo', (string)$vehiculo->tipo)->first();
        $tarifaValor = $tarifa ? (float)$tarifa->tarifa_valor : 0;
        $totalEstacionamiento = $duracion['horas'] * $tarifaValor;

        $precioCasco = (int)(Configuracion::where('clave', 'precio_casco')->value('valor') ?? 500);
        $cascos = (int)($vehiculo->cascos ?? 0);
        $cascosTotal = $cascos * $precioCasco;

        $total = $totalEstacionamiento + $cascosTotal;

        $factura = Factura::create([
            'gestion_vehiculo_id' => $vehiculo->id,
            'placa' => $vehiculo->placa,
            'tipo_vehiculo' => $vehiculo->tipo,
            'hora_entrada' => $vehiculo->hora_entrada,
            'hora_salida' => $vehiculo->hora_salida,
            'tiempo_total' => $duracion['texto'],
            'tarifa_aplicada' => $tarifaValor,
            'cascos' => $cascos,
            'cascos_total' => $cascosTotal,
            'total' => $total,
            'estado' => 'pendiente',
            'registrado_por' => $userId,
        ]);

        return [
            'factura' => $factura,
            'es_cliente_mensual' => false,
        ];
    }

    public function generarTicket(Factura $factura): array
    {
        $tipos = config('tipos_vehiculo', [
            1 => 'Automóvil', 2 => 'Motocicleta', 3 => 'Bicicleta',
            4 => 'Camión', 5 => 'Furgón', 6 => 'Bus', 7 => 'Mula',
        ]);

        return [
            'numero_factura' => str_pad($factura->id, 6, '0', STR_PAD_LEFT),
            'fecha' => $factura->created_at->format('d/m/Y H:i:s'),
            'placa' => $factura->placa,
            'tipo_vehiculo' => $tipos[(int)$factura->tipo_vehiculo] ?? 'Desconocido',
            'hora_entrada' => Carbon::parse($factura->hora_entrada)->format('d/m/Y H:i:s'),
            'hora_salida' => $factura->hora_salida
                ? Carbon::parse($factura->hora_salida)->format('d/m/Y H:i:s')
                : 'N/A',
            'tiempo_total' => $factura->tiempo_total,
            'tarifa_por_hora' => '$' . number_format($factura->tarifa_aplicada, 2),
            'cascos' => (int)($factura->cascos ?? 0),
            'cascos_total' => $factura->cascos > 0
                ? '$' . number_format($factura->cascos_total ?? 0, 2)
                : null,
            'total' => '$' . number_format($factura->total, 2),
            'estado' => $factura->estado,
            'atendido_por' => $factura->registradoPor?->name ?? 'Sistema',
        ];
    }

    public function pagarFactura(Factura $factura): Factura
    {
        $factura->update(['estado' => 'pagado']);
        return $factura;
    }

    public function anularFactura(Factura $factura): Factura
    {
        $factura->update(['estado' => 'anulado']);
        return $factura;
    }
}
