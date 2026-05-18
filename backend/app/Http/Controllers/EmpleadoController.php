<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Services\AuditService;
use Illuminate\Http\Request;

class EmpleadoController extends Controller
{
    public function __construct(
        protected AuditService $auditService
    ) {}

    public function index()
    {
        return response()->json(Empleado::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|max:255',
            'documento' => 'required|max:20',
            'telefono' => 'nullable|max:15',
            'rol' => 'nullable|max:50',
            'activo' => 'boolean',
        ]);

        $empleado = Empleado::create($validated);

        $this->auditService->logCreate('Empleado', $empleado);

        return response()->json($empleado, 201);
    }

    public function show($id)
    {
        $empleado = Empleado::findOrFail($id);
        return response()->json($empleado);
    }

    public function update(Request $request, $id)
    {
        $empleado = Empleado::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|max:255',
            'documento' => 'required|max:20',
            'telefono' => 'nullable|max:15',
            'rol' => 'nullable|max:50',
            'activo' => 'boolean',
        ]);

        $original = $empleado->getOriginal();
        $empleado->update($validated);

        $this->auditService->logUpdate('Empleado', $empleado, $original);

        return response()->json($empleado);
    }

    public function destroy($id)
    {
        $empleado = Empleado::findOrFail($id);

        $this->auditService->logDelete('Empleado', $empleado);
        $empleado->delete();

        return response()->json(null, 204);
    }
}
