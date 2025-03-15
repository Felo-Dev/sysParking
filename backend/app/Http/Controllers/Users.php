<?php

namespace App\Http\Controllers;

use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Resto del código
    class Users extends Controller
    {
        public function index()
        {
            $user = User::all();

            $data = [
                "status" => 200,
                "data" => $user
            ];

            return response()->json($data, 200);
        }

        public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|max:255',
        'email' => 'required|email|max:255|unique:users,email',
        'password' => 'required|max:255',
        'role' => 'required|max:1'
    ]);

    if ($validator->fails()) {

        if ($validator->errors()->has('email')) {
            return response()->json([
                "status" => 400,
                "errors" => $validator->errors(),
                "message" => "No se pudo crear el usuario porque el correo ya está registrado. Por favor, use otro."
            ], 400);
        }
    }

    try {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // 🔒 Encriptar la contraseña
            'role' => $request->role
        ]);

        return response()->json([
            "status" => 200,
            "message" => "Usuario creado correctamente"
        ], 200);

    } catch (QueryException $e) {
        if ($e->getCode() == 23505) { // Código de error para llave duplicada en PostgreSQL
            return response()->json([
                "status" => 400,
                "message" => "El correo ya está registrado. Por favor, use otro."
            ], 400);
        }

        return response()->json([
            "status" => 500,
            "message" => "Ocurrió un error al crear el usuario. Intente nuevamente."
        ], 500);
    }
}


        public function update(Request $request, $id)
        {
            $user = User::find($id);
            $validator = Validator::make($request->all(), [
                'name' => 'required|max:255',
                'email' => 'required|max:255',
                'password' => 'required|max:255',
                'role' => 'required|max:1'
            ]);

            if ($validator->fails()) {
                $invalidFields = implode(', ', array_keys($validator->errors()->toArray()));

                $data = [
                    "status" => 400,
                    "data" => $validator->errors(),
                    "errors" => "No se pudo actualizar el usuario porque los campos : $invalidFields. no tienen el formato correcto"
                ];

                return response()->json($data, 400);
            }

            $user->name = $request->name;
            $user->email = $request->email;
            $user->password = $request->password;
            $user->role = $request->role;

            if(!$user->save()){
                $data = [
                    "status" => 400,
                    "errors" => "No se pudo actualizar el usuario"
                ];
                return response()->json($data, 400);
            }else{
                $data = [
                    "status" => 200,
                    "message" => "Usuario actualizado correctamente"
                ];
                return response()->json($data, 200);
            }
        }

        public function destroy($id)
        {
            $user = User::find($id);
            if(!$user){
                $data = [
                    "status" => 400,
                    "message" => "No se encontro el usuario"
                ];
                return response()->json($data, 400);
            }else{
                $user->delete();
                $data = [
                    "status" => 200,
                    "message" => "Usuario eliminado correctamente"
                ];
                return response()->json($data, 200);
            }
        }

        public function show($id)
        {
            $user = User::find($id);

            if(!$user){
                $data = [
                    "status" => 400,
                    "message" => "No se encontro el usuario"
                ];
                return response()->json($data, 400);
            }else{
                $data = [
                    "status" => 200,
                    "data" => $user
                ];
                return response()->json($data, 200);
            }
        }

    }
