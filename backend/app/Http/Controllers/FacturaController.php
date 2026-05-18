<?php

namespace App\Http\Controllers;

use App\Http\Resources\FacturaResource;
use App\Models\Factura;
use App\Models\GestionVehiculo;
use App\Services\AuditService;
use App\Services\FacturacionService;
use App\Services\ParkingService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class FacturaController extends Controller
{
    public function __construct(
        protected FacturacionService $facturacionService,
        protected ParkingService $parkingService,
        protected AuditService $auditService
    ) {}

    public function index()
    {
        $facturas = Factura::with('gestionVehiculo', 'registradoPor')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'status' => 200,
            'data' => $facturas,
        ], 200);
    }

    public function show($id)
    {
        $factura = Factura::with('gestionVehiculo', 'registradoPor')->find($id);

        if (!$factura) {
            return response()->json([
                'status' => 404,
                'message' => 'Factura no encontrada',
            ], 404);
        }

        return response()->json([
            'status' => 200,
            'data' => new FacturaResource($factura),
        ], 200);
    }

    public function generar(Request $request)
    {
        $validated = $request->validate([
            'gestion_vehiculo_id' => 'required|exists:gestion_vehiculos,id',
        ]);

        $vehiculo = GestionVehiculo::find($validated['gestion_vehiculo_id']);

        if ($this->parkingService->esClienteMensual($vehiculo->placa)) {
            $cliente = \App\Models\Cliente::where('placa', $vehiculo->placa)->first();
            return response()->json([
                'status' => 200,
                'message' => 'cliente_mensual',
                'data' => [
                    'cliente' => $cliente->nombre,
                    'placa' => $vehiculo->placa,
                ],
            ], 200);
        }

        if (!$vehiculo->hora_salida) {
            return response()->json([
                'status' => 400,
                'message' => 'El vehículo aún no ha salido. No se puede generar factura.',
            ], 400);
        }

        $facturaExistente = Factura::where('gestion_vehiculo_id', $vehiculo->id)->first();
        if ($facturaExistente) {
            return response()->json([
                'status' => 200,
                'message' => 'La factura ya existe',
                'data' => new FacturaResource($facturaExistente),
            ], 200);
        }

        $resultado = $this->facturacionService->generarFactura(
            $vehiculo,
            $request->user()?->id
        );

        return response()->json([
            'status' => 200,
            'message' => 'Factura generada correctamente',
            'data' => $resultado['factura'],
        ], 200);
    }

    public function pagar($id)
    {
        $factura = Factura::find($id);

        if (!$factura) {
            return response()->json([
                'status' => 404,
                'message' => 'Factura no encontrada',
            ], 404);
        }

        if ($factura->estado === 'pagado') {
            return response()->json([
                'status' => 400,
                'message' => 'La factura ya está pagada',
            ], 400);
        }

        $this->facturacionService->pagarFactura($factura);

        $this->auditService->log(
            accion: 'pagar',
            modeloType: 'Factura',
            modeloId: $factura->id,
            valoresAnteriores: ['estado' => 'pendiente'],
            valoresNuevos: ['estado' => 'pagado'],
        );

        return response()->json([
            'status' => 200,
            'message' => 'Factura pagada correctamente',
            'data' => new FacturaResource($factura->fresh()),
        ], 200);
    }

    public function anular($id)
    {
        $factura = Factura::find($id);

        if (!$factura) {
            return response()->json([
                'status' => 404,
                'message' => 'Factura no encontrada',
            ], 404);
        }

        $this->facturacionService->anularFactura($factura);

        $this->auditService->log(
            accion: 'anular',
            modeloType: 'Factura',
            modeloId: $factura->id,
            valoresAnteriores: ['estado' => $factura->getOriginal('estado')],
            valoresNuevos: ['estado' => $factura->fresh()->estado],
        );

        return response()->json([
            'status' => 200,
            'message' => 'Factura anulada correctamente',
            'data' => new FacturaResource($factura->fresh()),
        ], 200);
    }

    public function ticket($id)
    {
        $factura = Factura::with('gestionVehiculo', 'registradoPor')->find($id);

        if (!$factura) {
            return response()->json([
                'status' => 404,
                'message' => 'Factura no encontrada',
            ], 404);
        }

        return response()->json([
            'status' => 200,
            'data' => $this->facturacionService->generarTicket($factura),
        ], 200);
    }

    public function resumen(Request $request)
    {
        $hoy = Carbon::today();

        $ingresosHoy = Factura::whereDate('created_at', $hoy)
            ->where('estado', 'pagado')
            ->sum('total');

        $facturasHoy = Factura::whereDate('created_at', $hoy)->count();

        $pendientes = Factura::where('estado', 'pendiente')->count();

        return response()->json([
            'status' => 200,
            'data' => [
                'ingresos_hoy' => (float)$ingresosHoy,
                'facturas_hoy' => $facturasHoy,
                'pendientes' => $pendientes,
            ],
        ], 200);
    }
}
