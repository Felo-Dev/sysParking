<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Tarifa;

class tarifas extends Controller
{
    public function index()
    {
        $tarifa = Tarifa::all();

        $data = [
            "status" => 200,
            "data" => $tarifa
        ];
        return  response()->json($data, 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tipo_vehiculo' => 'required',
            'tarifa_valor' => 'required',
            'tarifa_hora_pago' => 'required',
        ]);

        if($validator->fails()){
            $invalidFields = implode(', ', array_keys($validator->errors()->toArray()));
            $data = [
                "status" => 400,
                "data" => $validator->errors(),
                "message" => "No se pudo crear la tarifa porque los campos : $invalidFields. son requeridos"
            ];
            return response()->json($data, 400);
        }

        $tarifa = Tarifa::create([
            'tipo_vehiculo' => $request->tipo_vehiculo,
            'tarifa_valor' => $request->tarifa_valor,
            'tarifa_hora_pago' => $request->tarifa_hora_pago
        ]);

        if(!$tarifa){
            $data = [
                "status" => 400,
                "data" => $tarifa,
                "message" => "No se pudo crear la tarifa"
            ];
            return response()->json($data, 400);
        } else {
            $data = [
                "status" => 200,
                "data" => $tarifa,
                "message" => "Tarifa creada correctamente"
            ];
            return response()->json($data, 200);
        }


    }

    public function update(Request $request, $id)
    {

        $validator = Validator::make($request->all(), [
            'tipo_vehiculo' => 'required',
            'tarifa_valor' => 'required',
            'tarifa_hora_pago' => 'required',
        ]);


        if($validator->fails()){
            $invalidFields = implode(', ', array_keys($validator->errors()->toArray()));
            $data = [
                "status" => 400,
                "data" => $validator->errors(),
                "message" => "No se pudo actualizar la tarifa porque los campos : $invalidFields. son requeridos"
            ];
            return response()->json($data, 400);
        }

        $tarifa = Tarifa::find($id);
        $tarifa->update($request->all());
        $data = [
            "status" => 200,
            "data" => $tarifa,
            "message" => "Tarifa actualizada correctamente"
        ];
        return response()->json($data, 200);
    }

    public function destroy($id)
    {
        $tarifa = Tarifa::find($id);
        $tarifa->delete();
        $data = [
            "status" => 200,
            "data" => $tarifa,
            "message" => "Tarifa eliminada correctamente"
        ];
        return response()->json($data, 200);
    
    }

    public function show($id)
    {
        $tarifa = Tarifa::find($id);
       

        if(!$tarifa){
            $data = [
                "status" => 400,
                "data" => $tarifa,
                "message" => "No se pudo encontrar la tarifa"
            ];
            return response()->json($data, 400);
        }

        $data = [
            "status" => 200,
            "data" => $tarifa,
            'message' => 'Tarifa encontrado correctamente'
        ];

        return response()->json($data, 200);
    }

}
