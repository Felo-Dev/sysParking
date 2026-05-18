<?php

namespace App\Http\Controllers;

use App\Models\Sucursal;
use App\Services\AuditService;
use Illuminate\Http\Request;

class SucursalController extends Controller
{
    public function __construct(
        protected AuditService $auditService
    ) {}

    public function index()
    {
        return response()->json(Sucursal::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|max:255',
            'direccion' => 'nullable|max:255',
            'telefono' => 'nullable|max:20',
            'capacidad' => 'nullable|integer|min:0',
        ]);

        $sucursal = Sucursal::create($validated);

        $this->auditService->logCreate('Sucursal', $sucursal);

        return response()->json($sucursal, 201);
    }

    public function show($id)
    {
        $sucursal = Sucursal::findOrFail($id);
        return response()->json($sucursal);
    }

    public function update(Request $request, $id)
    {
        $sucursal = Sucursal::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|max:255',
            'direccion' => 'nullable|max:255',
            'telefono' => 'nullable|max:20',
            'capacidad' => 'nullable|integer|min:0',
        ]);

        $original = $sucursal->getOriginal();
        $sucursal->update($validated);

        $this->auditService->logUpdate('Sucursal', $sucursal, $original);

        return response()->json($sucursal);
    }

    public function destroy($id)
    {
        $sucursal = Sucursal::findOrFail($id);

        $this->auditService->logDelete('Sucursal', $sucursal);
        $sucursal->delete();

        return response()->json(null, 204);
    }
}
