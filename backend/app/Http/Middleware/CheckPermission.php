<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permisoSlug)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        if (!$user->role_id) {
            return response()->json(['message' => 'No tienes un rol asignado'], 403);
        }

        $tienePermiso = Cache::remember("user.{$user->id}.permiso.{$permisoSlug}", 300, function () use ($user, $permisoSlug) {
            return $user->role->permisos()->where('slug', $permisoSlug)->exists();
        });

        if (!$tienePermiso) {
            return response()->json(['message' => 'No tienes permiso para realizar esta acción'], 403);
        }

        return $next($request);
    }
}
