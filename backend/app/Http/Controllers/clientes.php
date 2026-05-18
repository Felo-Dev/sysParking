<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class clientes extends Controller
{
    public function __construct(
        protected AuditService $auditService
    ) {}

    public function index()
    {
        $cliente = Cliente::all();

        $data = [
            "status" => 200,
            "data" => $cliente
        ];

        return response()->json($data, 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|max:255',
            'documento' => 'required|max:10',
            'placa' => 'required|max:6',
            'celular' => 'required|max:10'
        ]);


        if ($validator->fails()) {
            $invalidFields = implode(', ', array_keys($validator->errors()->toArray()));

            $data = [
                "status" => 400,
                "data" => $validator->errors(),
                "errors" => "No se pudo crear el cliente porque los campos : $invalidFields. no tienen el formato correcto"
            ];
            return response()->json($data, 400);
        }

        $cliente = Cliente:: create([
            'nombre' => $request->nombre,
            'documento' => $request->documento,
            'placa' => strtoupper($request->placa),
            'celular' => $request->celular
        ]);

        if(!$cliente){
            $data = [
                'status' => 400,
                'errors' => $validator->errors(),
                'message' => 'No se pudo crear el cliente'
            ];
            return response()->json($data, 400);
        }

        $this->auditService->logCreate('Cliente', $cliente);

        $data = [
            'status' => 200,
            'message' => 'Cliente creado correctamente'
        ];
        return response()->json($data, 200);


    }

    public function update(Request $request, $id)
    {
        $cliente = Cliente::find($id);
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|max:255',
            'documento' => 'required|max:10',
            'placa' => 'required|max:6',
            'celular' => 'required|max:10'
        ]);

        if ($validator->fails()) {
            $invalidFields = implode(', ', array_keys($validator->errors()->toArray()));

            $data = [
                "status" => 400,
                "data" => $validator->errors(),
                "message" => "No se pudo actualizar el cliente porque los campos : $invalidFields. son requeridos"
            ];
            return response()->json($data, 400);
        }

        $original = $cliente->getOriginal();
        $cliente->update([
            'nombre' => $request->nombre,
            'documento' => $request->documento,
            'placa' => strtoupper($request->placa),
            'celular' => $request->celular
        ]);

        $this->auditService->logUpdate('Cliente', $cliente, $original);

        $data = [
            'status' => 200,
            'data' => $cliente,
            'message' => 'Cliente actualizado correctamente'
        ];
        return response()->json($data, 200);
    }

    public function destroy($id)
    {
        $cliente = Cliente::find($id);

        $this->auditService->logDelete('Cliente', $cliente);
        $cliente->delete();
        $data = [
            'status' => 200,
            'data' => $cliente,
            'message' => 'Cliente eliminado correctamente'
        ];
        return response()->json($data, 200);
    }

    public function show($id)
    {
        $cliente = Cliente::find($id);

        if ($cliente) {
            $data = [
                'status' => 200,
                'data' => $cliente,
                'message' => 'Cliente encontrado correctamente'
            ];
            return response()->json($data, 200);
        } else {
            $data = [
                'status' => 404,
                'message' => 'Cliente no encontrado'
            ];
            return response()->json($data, 404);
        }
    }

    public function showByPlaca($placa)
    {
        $cliente = Cliente::where('placa', strtoupper($placa))->first();

        if ($cliente) {
            $data = [
                'status' => 200,
                'data' => $cliente,
                'message' => 'Cliente encontrado correctamente'
            ];
            return response()->json($data, 200);
        } else {
            $data = [
                'status' => 404,
                'message' => 'Cliente no encontrado'
            ];
            return response()->json($data, 404);
        }
    }
    
    

}
