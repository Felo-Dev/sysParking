<?php

namespace App\Http\Controllers;

use App\Models\Turno;
use App\Models\Empleado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TurnoController extends Controller
{
    public function index()
    {
        $turnos = Turno::with('empleado')->get();
        return response()->json($turnos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'empleado_id' => 'required|exists:empleados,id',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        $turno = Turno::create($validated);

        return response()->json($turno->load('empleado'), 201);
    }

    public function show($id)
    {
        $turno = Turno::with('empleado')->findOrFail($id);
        return response()->json($turno);
    }

    public function update(Request $request, $id)
    {
        $turno = Turno::findOrFail($id);

        $validated = $request->validate([
            'empleado_id' => 'sometimes|exists:empleados,id',
            'fecha_inicio' => 'sometimes|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        $turno->update($validated);

        return response()->json($turno->load('empleado'));
    }

    public function destroy($id)
    {
        $turno = Turno::findOrFail($id);
        $turno->delete();

        return response()->json(null, 204);
    }

    public function activo()
    {
        $user = Auth::user();
        $empleado = Empleado::where('user_id', $user->id)->first();

        if (!$empleado) {
            return response()->json(['message' => 'No hay empleado asociado a este usuario.'], 404);
        }

        $turno = Turno::with('empleado')
            ->where('empleado_id', $empleado->id)
            ->whereNull('fecha_fin')
            ->first();

        if (!$turno) {
            return response()->json(['message' => 'No hay turno activo.'], 404);
        }

        return response()->json($turno);
    }
}
