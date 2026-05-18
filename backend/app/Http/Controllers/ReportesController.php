<?php

namespace App\Http\Controllers;

use App\Models\Factura;
use App\Models\GestionVehiculo;
use App\Models\Cliente;
use App\Models\TipoVehiculo;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportesController extends Controller
{
    public function ingresos(Request $request)
    {
        $fechaDesde = $request->query('fecha_desde', Carbon::today()->subMonth()->toDateString());
        $fechaHasta = $request->query('fecha_hasta', Carbon::today()->toDateString());

        $ingresos = Factura::where('estado', 'pagado')
            ->whereBetween('created_at', [$fechaDesde . ' 00:00:00', $fechaHasta . ' 23:59:59'])
            ->selectRaw("DATE(created_at) as fecha, SUM(total) as total")
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get();

        return response()->json($ingresos);
    }

    public function frecuentes()
    {
        $frecuentes = GestionVehiculo::select('placa', DB::raw('COUNT(*) as total'))
            ->groupBy('placa')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        return response()->json($frecuentes);
    }

    public function resumenDiario(Request $request)
    {
        $fecha = $request->query('fecha', Carbon::today()->toDateString());

        $totalIngresos = Factura::where('estado', 'pagado')
            ->whereDate('created_at', $fecha)
            ->sum('total');

        $totalFacturas = Factura::whereDate('created_at', $fecha)->count();

        $totalVehiculos = GestionVehiculo::whereDate('hora_entrada', $fecha)->count();

        $totalClientes = Cliente::count();

        return response()->json([
            'fecha' => $fecha,
            'total_ingresos' => $totalIngresos,
            'total_facturas' => $totalFacturas,
            'total_vehiculos' => $totalVehiculos,
            'total_clientes' => $totalClientes,
        ]);
    }

    public function ingresosPorSemana()
    {
        $resultados = [];
        $hoy = Carbon::today();

        for ($i = 11; $i >= 0; $i--) {
            $inicio = (clone $hoy)->subWeeks($i)->startOfWeek();
            $fin = (clone $hoy)->subWeeks($i)->endOfWeek();

            $total = Factura::where('estado', 'pagado')
                ->whereBetween('created_at', [$inicio->toDateTimeString(), $fin->toDateTimeString()])
                ->sum('total');

            $resultados[] = [
                'semana' => $inicio->weekOfYear,
                'inicio' => $inicio->toDateString(),
                'fin' => $fin->toDateString(),
                'total' => $total,
            ];
        }

        return response()->json($resultados);
    }

    public function cuadre(Request $request)
    {
        $fecha = $request->query('fecha', Carbon::today()->toDateString());

        $inicioDia = $fecha . ' 00:00:00';
        $finDia = $fecha . ' 23:59:59';

        $facturasHoy = Factura::whereBetween('created_at', [$inicioDia, $finDia])->get();

        $totalIngresos = (float)$facturasHoy->where('estado', 'pagado')->sum('total');
        $totalPendiente = (float)$facturasHoy->where('estado', 'pendiente')->sum('total');
        $totalAnulado = (float)$facturasHoy->where('estado', 'anulado')->sum('total');

        $vehiculosHoy = GestionVehiculo::whereBetween('hora_entrada', [$inicioDia, $finDia])->get();
        $vehiculosPorTipo = [];
        foreach ($vehiculosHoy as $v) {
            $tipo = $v->tipo;
            if (!isset($vehiculosPorTipo[$tipo])) {
                $vehiculosPorTipo[$tipo] = 0;
            }
            $vehiculosPorTipo[$tipo]++;
        }

        $tiposVehiculo = TipoVehiculo::pluck('nombre', 'id');

        $vehiculosTipoDetalle = [];
        foreach ($vehiculosPorTipo as $tipoId => $count) {
            $vehiculosTipoDetalle[] = [
                'tipo_id' => $tipoId,
                'nombre' => $tiposVehiculo[$tipoId] ?? "Tipo {$tipoId}",
                'cantidad' => $count,
            ];
        }

        $placasFacturadas = $facturasHoy->pluck('placa')->map(fn($p) => strtoupper($p))->unique();

        $clientes = \App\Models\Cliente::whereIn('placa', $vehiculosHoy->pluck('placa'))->get()->keyBy(fn($c) => strtoupper($c->placa));

        $vehiculosMensuales = [];
        $vehiculosSinFactura = [];
        foreach ($vehiculosHoy as $v) {
            $placa = strtoupper($v->placa);
            $esMensual = isset($clientes[$placa]);
            $tieneFactura = $placasFacturadas->contains($placa);

            if ($esMensual) {
                $vehiculosMensuales[] = [
                    'placa' => $v->placa,
                    'tipo' => $v->tipo,
                    'hora_entrada' => $v->hora_entrada,
                    'hora_salida' => $v->hora_salida,
                    'cliente' => $clientes[$placa]->nombre,
                ];
            }

            if (!$tieneFactura) {
                $vehiculosSinFactura[] = [
                    'placa' => $v->placa,
                    'tipo' => $v->tipo,
                    'hora_entrada' => $v->hora_entrada,
                    'hora_salida' => $v->hora_salida,
                    'es_mensual' => $esMensual,
                    'cliente' => $esMensual ? $clientes[$placa]->nombre : null,
                ];
            }
        }

        $cascosHoy = (int)$vehiculosHoy->sum('cascos');
        $ingresosCascos = (float)$facturasHoy->where('estado', 'pagado')->sum('cascos_total');

        $detalleFacturas = $facturasHoy->map(function ($f) {
            $tipos = config('tipos_vehiculo', [
                1 => 'Automóvil', 2 => 'Motocicleta', 3 => 'Bicicleta',
                4 => 'Camión', 5 => 'Furgón', 6 => 'Bus', 7 => 'Mula',
            ]);
            return [
                'id' => $f->id,
                'numero' => str_pad($f->id, 6, '0', STR_PAD_LEFT),
                'placa' => $f->placa,
                'tipo_vehiculo' => $tipos[(int)$f->tipo_vehiculo] ?? 'Desconocido',
                'hora_entrada' => $f->hora_entrada,
                'hora_salida' => $f->hora_salida,
                'tiempo_total' => $f->tiempo_total,
                'cascos' => (int)$f->cascos,
                'cascos_total' => (float)$f->cascos_total,
                'total' => (float)$f->total,
                'estado' => $f->estado,
                'created_at' => $f->created_at,
            ];
        });

        return response()->json([
            'status' => 200,
            'data' => [
                'fecha' => $fecha,
                'resumen' => [
                    'total_facturas' => $facturasHoy->count(),
                    'facturas_pagadas' => $facturasHoy->where('estado', 'pagado')->count(),
                    'facturas_pendientes' => $facturasHoy->where('estado', 'pendiente')->count(),
                    'facturas_anuladas' => $facturasHoy->where('estado', 'anulado')->count(),
                    'total_ingresos' => $totalIngresos,
                    'total_pendiente' => $totalPendiente,
                    'total_anulado' => $totalAnulado,
                    'total_general' => $totalIngresos + $totalPendiente,
                ],
                'vehiculos' => [
                    'total_ingresados' => $vehiculosHoy->count(),
                    'total_salidas' => GestionVehiculo::whereBetween('hora_salida', [$inicioDia, $finDia])->count(),
                    'facturados' => $facturasHoy->count(),
                    'mensuales' => count($vehiculosMensuales),
                    'sin_factura' => count($vehiculosSinFactura),
                    'por_tipo' => $vehiculosTipoDetalle,
                    'lista_mensuales' => $vehiculosMensuales,
                    'lista_sin_factura' => $vehiculosSinFactura,
                ],
                'cascos' => [
                    'total_alquilados' => $cascosHoy,
                    'ingresos_cascos' => $ingresosCascos,
                ],
                'detalle_facturas' => $detalleFacturas,
            ],
        ], 200);
    }
}
