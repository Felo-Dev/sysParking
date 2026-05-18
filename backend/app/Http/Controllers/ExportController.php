<?php

namespace App\Http\Controllers;

use App\Models\Factura;
use App\Models\Cliente;
use App\Models\GestionVehiculo;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    private function csvResponse($data, $filename, $headers)
    {
        $callback = function () use ($data, $headers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);
            foreach ($data as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };
        return response()->streamDownload($callback, $filename, ['Content-Type' => 'text/csv']);
    }

    public function facturasCSV()
    {
        $facturas = Factura::all();
        $data = $facturas->map(function ($f) {
            return [
                $f->id,
                $f->placa,
                $f->tipo_vehiculo,
                $f->hora_entrada,
                $f->hora_salida,
                $f->tiempo_total,
                $f->tarifa_aplicada,
                $f->cascos,
                $f->total,
                $f->estado,
                $f->created_at ? $f->created_at->format('Y-m-d') : '',
            ];
        })->toArray();

        return $this->csvResponse(
            $data,
            'facturas.csv',
            ['ID Factura', 'Placa', 'Tipo', 'Entrada', 'Salida', 'Tiempo', 'Tarifa', 'Cascos', 'Total', 'Estado', 'Fecha']
        );
    }

    public function clientesCSV()
    {
        $clientes = Cliente::all();
        $data = $clientes->map(function ($c) {
            return [
                $c->id,
                $c->nombre,
                $c->documento,
                $c->placa,
                $c->celular,
            ];
        })->toArray();

        return $this->csvResponse(
            $data,
            'clientes.csv',
            ['ID', 'Nombre', 'Documento', 'Placa', 'Celular']
        );
    }

    public function vehiculosCSV()
    {
        $tipos = config('tipos_vehiculo', [
            1 => 'Automóvil', 2 => 'Motocicleta', 3 => 'Bicicleta',
            4 => 'Camión', 5 => 'Furgón', 6 => 'Bus', 7 => 'Mula',
        ]);

        $vehiculos = GestionVehiculo::all();
        $data = $vehiculos->map(function ($v) use ($tipos) {
            $tipo = $tipos[$v->tipo] ?? $v->tipo;
            $duracion = '';
            if ($v->hora_entrada && $v->hora_salida) {
                $entrada = Carbon::parse($v->hora_entrada);
                $salida = Carbon::parse($v->hora_salida);
                $duracion = $entrada->diffInMinutes($salida) . ' min';
            }
            return [
                $v->id,
                $v->placa,
                $tipo,
                $v->cascos,
                $v->hora_entrada,
                $v->hora_salida,
                $duracion,
            ];
        })->toArray();

        return $this->csvResponse(
            $data,
            'vehiculos.csv',
            ['ID', 'Placa', 'Tipo', 'Cascos', 'Entrada', 'Salida', 'Duración']
        );
    }
}
