<?php

namespace App\Http\Controllers;

use App\Models\Espacio;
use App\Services\AuditService;
use Illuminate\Http\Request;

class EspacioController extends Controller
{
    public function __construct(
        protected AuditService $auditService
    ) {}

    public function index()
    {
        return response()->json(Espacio::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo' => 'required|max:10',
            'sucursal_id' => 'required|exists:sucursales,id',
            'estado' => 'required|in:libre,ocupado,reservado',
        ]);

        $espacio = Espacio::create($validated);

        $this->auditService->logCreate('Espacio', $espacio);

        return response()->json($espacio, 201);
    }

    public function show($id)
    {
        $espacio = Espacio::findOrFail($id);
        return response()->json($espacio);
    }

    public function update(Request $request, $id)
    {
        $espacio = Espacio::findOrFail($id);

        $validated = $request->validate([
            'codigo' => 'required|max:10',
            'sucursal_id' => 'required|exists:sucursales,id',
            'estado' => 'required|in:libre,ocupado,reservado',
        ]);

        $original = $espacio->getOriginal();
        $espacio->update($validated);

        $this->auditService->logUpdate('Espacio', $espacio, $original);

        return response()->json($espacio);
    }

    public function destroy($id)
    {
        $espacio = Espacio::findOrFail($id);

        $this->auditService->logDelete('Espacio', $espacio);
        $espacio->delete();

        return response()->json(null, 204);
    }

    public function disponibles()
    {
        $espacios = Espacio::where('estado', 'libre')->get();
        return response()->json($espacios);
    }

    public function mapa()
    {
        $espacios = Espacio::all();
        $grouped = $espacios->groupBy(function ($item) {
            return strtoupper(substr($item->codigo, 0, 1));
        });

        return response()->json($grouped);
    }
}
