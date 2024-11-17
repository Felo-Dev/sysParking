<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\GestionVehiculo;
class GestionVehiculos extends Controller
{
    public function index()
    {
        $vehiculo = GestionVehiculo::all();

        $data = [
            "status" => 200,
            "data" => $vehiculo
        ];
        return  response()->json($data, 200);
    }


    public function store(Request $request)
{
    // Verificar si existe un vehículo con la misma placa y hora_salida es NULL
    $vehiculoExistente = GestionVehiculo::where('placa', strtoupper($request->placa))
        ->whereNull('hora_salida')
        ->first();

    if ($vehiculoExistente) {
        // Actualizar la hora_salida con la fecha y hora actual del servidor
        $vehiculoExistente->hora_salida = now();
        $vehiculoExistente->save();

        $data = [
            "status" => 200,
            "message" => "La hora de salida del vehículo con placa " . strtoupper($request->placa) . " ha sido actualizada con la fecha y hora actual."
        ];
        return response()->json($data, 200);
    } else {
         // Crear un nuevo registro
        $validator = Validator::make($request->all(), [
            'placa' => 'required|max:6',
            'hora_entrada' => 'required',
            'tipo' => 'required|in:1,2|max:1',
        ]);

        if ($validator->fails()) {
            $invalidFields = implode(', ', array_keys($validator->errors()->toArray()));
            $data = [
                "status" => 400,
                "data" => $validator->errors(),
                "message" => "No se pudo registrar el vehículo porque los campos: $invalidFields no son válidos"
            ];
            return response()->json($data, 400);
        }
        $vehiculo = GestionVehiculo::create([
            'placa' => strtoupper($request->placa),
            'hora_entrada' => $request->hora_entrada,
            'tipo' => $request->tipo
        ]);

        if (!$vehiculo) {
            $data = [
                "status" => 400,
                "data" => $vehiculo,
                "message" => "No se pudo crear el vehículo"
            ];
            return response()->json($data, 400);
        }

        $data = [
            "status" => 200,
            "data" => $vehiculo,
            "message" => "Vehículo creado correctamente"
        ];
        return response()->json($data, 200);
    }

   
}


}