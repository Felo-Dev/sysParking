<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class Users extends Controller
{
    public function __construct(
        protected AuditService $auditService
    ) {}

    public function index()
    {
        $users = User::with('role')->get();

        return response()->json([
            "status" => 200,
            "data" => $users,
        ], 200);
    }

    public function store(Request $request)
    {
        $roleIds = Role::pluck('id')->implode(',');

        $validator = Validator::make($request->all(), [
            'name' => 'required|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|max:255',
            'role_id' => "required|in:{$roleIds}",
        ]);

        if ($validator->fails()) {
            if ($validator->errors()->has('email')) {
                return response()->json([
                    "status" => 400,
                    "errors" => $validator->errors(),
                    "message" => "No se pudo crear el usuario porque el correo ya está registrado. Por favor, use otro.",
                ], 400);
            }

            return response()->json([
                "status" => 400,
                "errors" => $validator->errors(),
                "message" => "Datos inválidos. Verifique los campos.",
            ], 400);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role_id' => $request->role_id,
            ]);

            $this->auditService->logCreate('User', $user);

            return response()->json([
                "status" => 200,
                "message" => "Usuario creado correctamente",
                "data" => $user->load('role'),
            ], 200);
        } catch (QueryException $e) {
            return response()->json([
                "status" => 500,
                "message" => "Ocurrió un error al crear el usuario. Intente nuevamente.",
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                "status" => 404,
                "message" => "Usuario no encontrado",
            ], 404);
        }

        $roleIds = Role::pluck('id')->implode(',');

        $validator = Validator::make($request->all(), [
            'name' => 'required|max:255',
            'email' => 'required|email|max:255',
            'password' => 'sometimes|min:6|max:255',
            'role_id' => "required|in:{$roleIds}",
        ]);

        if ($validator->fails()) {
            $invalidFields = implode(', ', array_keys($validator->errors()->toArray()));

            return response()->json([
                "status" => 400,
                "errors" => $validator->errors(),
                "message" => "No se pudo actualizar el usuario porque los campos: {$invalidFields} no tienen el formato correcto",
            ], 400);
        }

        $original = $user->getOriginal();
        $user->name = $request->name;
        $user->email = $request->email;
        $user->role_id = $request->role_id;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        if (!$user->save()) {
            return response()->json([
                "status" => 400,
                "message" => "No se pudo actualizar el usuario",
            ], 400);
        }

        $this->auditService->logUpdate('User', $user, $original);

        return response()->json([
            "status" => 200,
            "message" => "Usuario actualizado correctamente",
            "data" => $user->load('role'),
        ], 200);
    }

    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                "status" => 404,
                "message" => "No se encontró el usuario",
            ], 404);
        }

        $this->auditService->logDelete('User', $user);
        $user->delete();

        return response()->json([
            "status" => 200,
            "message" => "Usuario eliminado correctamente",
        ], 200);
    }

    public function show($id)
    {
        $user = User::with('role')->find($id);

        if (!$user) {
            return response()->json([
                "status" => 404,
                "message" => "No se encontró el usuario",
            ], 404);
        }

        return response()->json([
            "status" => 200,
            "data" => $user,
        ], 200);
    }
}
