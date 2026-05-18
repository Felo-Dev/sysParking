<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVehiculoRequest;
use App\Http\Resources\VehiculoResource;
use App\Models\GestionVehiculo;
use App\Services\ParkingService;

class GestionVehiculos extends Controller
{
    public function __construct(
        protected ParkingService $parkingService
    ) {}

    public function index()
    {
        $vehiculos = GestionVehiculo::orderBy('created_at', 'desc')->get();

        return response()->json([
            "status" => 200,
            "data" => VehiculoResource::collection($vehiculos),
        ], 200);
    }

    public function store(StoreVehiculoRequest $request)
    {
        $placa = $request->placa;

        $activo = $this->parkingService->buscarActivo($placa);

        if ($activo) {
            $vehiculo = $this->parkingService->registrarSalida($placa);

            return response()->json([
                "status" => 200,
                "data" => new VehiculoResource($vehiculo),
                "message" => "salida: La hora de salida del vehículo con placa {$placa} ha sido actualizada.",
            ], 200);
        }

        $vehiculo = $this->parkingService->registrarEntrada(
            $placa,
            $request->tipo,
            $request->cascos ?? 0,
            $request->espacio_id
        );

        return response()->json([
            "status" => 200,
            "data" => new VehiculoResource($vehiculo),
            "message" => "Vehículo creado correctamente",
        ], 200);
    }

    public function show($id)
    {
        $vehiculo = GestionVehiculo::find($id);

        if (!$vehiculo) {
            return response()->json([
                "status" => 404,
                "message" => "Vehículo no encontrado",
            ], 404);
        }

        return response()->json([
            "status" => 200,
            "data" => new VehiculoResource($vehiculo),
        ], 200);
    }
}
