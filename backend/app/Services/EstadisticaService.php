<?php

namespace App\Services;

use App\Models\Cliente;
use App\Models\Factura;
use App\Models\GestionVehiculo;
use App\Models\Configuracion;
use Carbon\Carbon;

class EstadisticaService
{
    public function obtenerResumen(): array
    {
        $capacidadTotal = (int)(Configuracion::where('clave', 'capacidad_parqueadero')->value('valor') ?? 50);
        $vehiculosDentro = GestionVehiculo::whereNull('hora_salida')->count();

        return [
            'clientes' => Cliente::count(),
            'vehiculos' => GestionVehiculo::count(),
            'vehiculos_dentro' => $vehiculosDentro,
            'vehiculos_fuera' => GestionVehiculo::whereNotNull('hora_salida')->count(),
            'vehiculos_hoy' => GestionVehiculo::whereDate('hora_entrada', Carbon::today())->count(),
            'facturas' => Factura::count(),
            'facturas_hoy' => Factura::whereDate('created_at', Carbon::today())->count(),
            'facturas_pagadas' => Factura::where('estado', 'pagado')->count(),
            'facturas_pendientes' => Factura::where('estado', 'pendiente')->count(),
            'total_ingresos' => (float)Factura::where('estado', 'pagado')->sum('total'),
            'ingresos_hoy' => (float)Factura::whereDate('created_at', Carbon::today())
                ->where('estado', 'pagado')->sum('total'),
            'cascos_hoy' => (int)GestionVehiculo::whereDate('hora_entrada', Carbon::today())->sum('cascos'),
            'capacidad_total' => $capacidadTotal,
            'ocupacion_porcentaje' => $capacidadTotal > 0
                ? round(($vehiculosDentro / $capacidadTotal) * 100, 1) : 0,
            'lugares_disponibles' => max(0, $capacidadTotal - $vehiculosDentro),
        ];
    }

    public function ingresosPorMes(): array
    {
        $meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        $ingresos = [];

        for ($i = 11; $i >= 0; $i--) {
            $fecha = Carbon::now()->subMonths($i);
            $ingresos[] = [
                'mes' => $meses[$fecha->month - 1],
                'year' => $fecha->year,
                'total' => (float)Factura::where('estado', 'pagado')
                    ->whereYear('created_at', $fecha->year)
                    ->whereMonth('created_at', $fecha->month)
                    ->sum('total'),
            ];
        }

        return $ingresos;
    }

    public function ocupacionPorDia(): array
    {
        $dias = [];
        for ($i = 6; $i >= 0; $i--) {
            $fecha = Carbon::today()->subDays($i);
            $entradas = GestionVehiculo::whereDate('hora_entrada', $fecha)->count();
            $salidas = GestionVehiculo::whereDate('hora_salida', $fecha)->count();
            $dias[] = [
                'fecha' => $fecha->format('d/m'),
                'dia' => $fecha->format('d/m'),
                'entradas' => $entradas,
                'salidas' => $salidas,
                'ocupacion' => $entradas,
            ];
        }
        return $dias;
    }
}
