<?php

namespace App\Http\Controllers;

use App\Services\EstadisticaService;
use Illuminate\Http\Request;

class Estadistica extends Controller
{
    public function __construct(
        protected EstadisticaService $estadisticaService
    ) {}

    public function index()
    {
        return response()->json([
            "status" => 200,
            "data" => $this->estadisticaService->obtenerResumen(),
        ], 200);
    }

    public function ingresosPorMes()
    {
        return response()->json([
            'status' => 200,
            'data' => $this->estadisticaService->ingresosPorMes(),
        ], 200);
    }

    public function ocupacionPorDia()
    {
        return response()->json([
            'status' => 200,
            'data' => $this->estadisticaService->ocupacionPorDia(),
        ], 200);
    }
}
