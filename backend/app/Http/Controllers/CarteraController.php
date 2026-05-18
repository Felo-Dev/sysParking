<?php

namespace App\Http\Controllers;

use App\Models\PagoMensualidad;
use App\Models\Cliente;
use App\Services\AuditService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CarteraController extends Controller
{
    public function __construct(
        protected AuditService $auditService
    ) {}

    public function index()
    {
        $pagos = PagoMensualidad::with('cliente')
            ->orderByDesc('anio')
            ->orderByDesc('mes')
            ->get();

        return response()->json($pagos);
    }

    public function pendientes()
    {
        $pagos = PagoMensualidad::with('cliente')
            ->whereIn('estado', ['pendiente', 'vencido'])
            ->orderByDesc('anio')
            ->orderByDesc('mes')
            ->get();

        return response()->json($pagos);
    }

    public function pagar($id)
    {
        $pago = PagoMensualidad::findOrFail($id);
        $original = $pago->getOriginal();
        $pago->update([
            'estado' => 'pagado',
            'fecha_pago' => Carbon::now(),
        ]);

        $this->auditService->logUpdate('PagoMensualidad', $pago, $original);

        return response()->json($pago->load('cliente'));
    }

    public function historialCliente($cliente_id)
    {
        $pagos = PagoMensualidad::with('cliente')
            ->where('cliente_id', $cliente_id)
            ->orderByDesc('anio')
            ->orderByDesc('mes')
            ->get();

        return response()->json($pagos);
    }

    public function generarMensualidades()
    {
        $now = Carbon::now();
        $mes = $now->month;
        $anio = $now->year;

        $clientes = Cliente::all();
        $generados = 0;

        foreach ($clientes as $cliente) {
            $existe = PagoMensualidad::where('cliente_id', $cliente->id)
                ->where('mes', $mes)
                ->where('anio', $anio)
                ->exists();

            if (!$existe) {
                PagoMensualidad::create([
                    'cliente_id' => $cliente->id,
                    'mes' => $mes,
                    'anio' => $anio,
                    'monto' => 0,
                    'estado' => 'pendiente',
                ]);
                $generados++;
            }
        }

        $this->auditService->log(
            accion: 'generar-mensualidades',
            modeloType: 'PagoMensualidad',
            valoresNuevos: ['mes' => $mes, 'anio' => $anio, 'generados' => $generados],
        );

        return response()->json([
            'message' => "Se generaron {$generados} mensualidades para {$mes}/{$anio}.",
            'generados' => $generados,
        ]);
    }
}
