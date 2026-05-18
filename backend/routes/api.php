<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\clientes;
use App\Http\Controllers\gestionVehiculos;
use App\Http\Controllers\tarifas;
use App\Http\Controllers\Users;
use App\Http\Controllers\Estadistica;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FacturaController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ReportesController;
use App\Http\Controllers\EmpleadoController;
use App\Http\Controllers\TurnoController;
use App\Http\Controllers\EspacioController;
use App\Http\Controllers\CarteraController;
use App\Http\Controllers\SucursalController;
use App\Http\Controllers\RoleController;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/clientes', [clientes::class, 'index']);
    Route::post('/clientes', [clientes::class, 'store'])->middleware('permiso:gestionar-clientes');
    Route::get('/clientes/{id}', [clientes::class, 'show']);
    Route::put('/clientes/{id}', [clientes::class, 'update'])->middleware('permiso:gestionar-clientes');
    Route::delete('/clientes/{id}', [clientes::class, 'destroy'])->middleware('permiso:gestionar-clientes');
    Route::get('/clientes/placa/{placa}', [clientes::class, 'showByPlaca']);

    Route::get('/vehiculo', [gestionVehiculos::class, 'index']);
    Route::post('/vehiculo', [gestionVehiculos::class, 'store']);
    Route::get('/vehiculo/{id}', [gestionVehiculos::class, 'show']);

    Route::get('/tarifas', [tarifas::class, 'index']);
    Route::post('/tarifas', [tarifas::class, 'store'])->middleware('permiso:gestionar-tarifas');
    Route::put('/tarifas/{id}', [tarifas::class, 'update'])->middleware('permiso:gestionar-tarifas');
    Route::delete('/tarifas/{id}', [tarifas::class, 'destroy'])->middleware('permiso:gestionar-tarifas');

    Route::get('/users', [Users::class, 'index'])->middleware('permiso:gestionar-usuarios');
    Route::post('/users', [Users::class, 'store'])->middleware('permiso:gestionar-usuarios');
    Route::get('/users/{id}', [Users::class, 'show'])->middleware('permiso:gestionar-usuarios');
    Route::put('/users/{id}', [Users::class, 'update'])->middleware('permiso:gestionar-usuarios');
    Route::delete('/users/{id}', [Users::class, 'destroy'])->middleware('permiso:gestionar-usuarios');

    Route::get('/estadistica', [Estadistica::class, 'index']);
    Route::get('/estadistica/ingresos-mes', [Estadistica::class, 'ingresosPorMes']);
    Route::get('/estadistica/ocupacion', [Estadistica::class, 'ocupacionPorDia']);

    Route::get('/facturas', [FacturaController::class, 'index']);
    Route::get('/facturas/{id}', [FacturaController::class, 'show']);
    Route::post('/facturas/generar', [FacturaController::class, 'generar']);
    Route::put('/facturas/{id}/pagar', [FacturaController::class, 'pagar'])->middleware('permiso:gestionar-facturas');
    Route::put('/facturas/{id}/anular', [FacturaController::class, 'anular'])->middleware('permiso:gestionar-facturas');
    Route::get('/facturas/{id}/ticket', [FacturaController::class, 'ticket']);
    Route::get('/facturas/resumen/hoy', [FacturaController::class, 'resumen']);

    Route::get('/exportar/facturas', [ExportController::class, 'facturasCSV']);
    Route::get('/exportar/clientes', [ExportController::class, 'clientesCSV']);
    Route::get('/exportar/vehiculos', [ExportController::class, 'vehiculosCSV']);

    Route::get('/reportes/ingresos', [ReportesController::class, 'ingresos']);
    Route::get('/reportes/frecuentes', [ReportesController::class, 'frecuentes']);
    Route::get('/reportes/resumen-diario', [ReportesController::class, 'resumenDiario']);
    Route::get('/reportes/ingresos-semana', [ReportesController::class, 'ingresosPorSemana']);
    Route::get('/reportes/cuadre', [ReportesController::class, 'cuadre']);

    Route::get('/empleados', [EmpleadoController::class, 'index']);
    Route::post('/empleados', [EmpleadoController::class, 'store'])->middleware('permiso:gestionar-empleados');
    Route::put('/empleados/{id}', [EmpleadoController::class, 'update'])->middleware('permiso:gestionar-empleados');
    Route::delete('/empleados/{id}', [EmpleadoController::class, 'destroy'])->middleware('permiso:gestionar-empleados');

    Route::get('/turnos', [TurnoController::class, 'index']);
    Route::post('/turnos', [TurnoController::class, 'store']);
    Route::get('/turnos/{id}', [TurnoController::class, 'show']);
    Route::put('/turnos/{id}', [TurnoController::class, 'update']);
    Route::delete('/turnos/{id}', [TurnoController::class, 'destroy']);
    Route::get('/turnos/activo', [TurnoController::class, 'activo']);

    Route::get('/espacios', [EspacioController::class, 'index']);
    Route::post('/espacios', [EspacioController::class, 'store'])->middleware('permiso:gestionar-espacios');
    Route::put('/espacios/{id}', [EspacioController::class, 'update'])->middleware('permiso:gestionar-espacios');
    Route::delete('/espacios/{id}', [EspacioController::class, 'destroy'])->middleware('permiso:gestionar-espacios');

    Route::get('/cartera', [CarteraController::class, 'index']);
    Route::get('/cartera/pendientes', [CarteraController::class, 'pendientes']);
    Route::put('/cartera/{id}/pagar', [CarteraController::class, 'pagar'])->middleware('permiso:gestionar-cartera');
    Route::get('/cartera/cliente/{cliente_id}', [CarteraController::class, 'historialCliente']);
    Route::post('/cartera/generar-mensualidades', [CarteraController::class, 'generarMensualidades'])->middleware('permiso:gestionar-cartera');

    Route::get('/sucursales', [SucursalController::class, 'index']);
    Route::get('/sucursales/{id}', [SucursalController::class, 'show'])->middleware('permiso:configurar-sistema');
    Route::post('/sucursales', [SucursalController::class, 'store'])->middleware('permiso:configurar-sistema');
    Route::put('/sucursales/{id}', [SucursalController::class, 'update'])->middleware('permiso:configurar-sistema');
    Route::delete('/sucursales/{id}', [SucursalController::class, 'destroy'])->middleware('permiso:configurar-sistema');

    Route::get('/roles', [RoleController::class, 'index']);
    Route::get('/permisos', function () {
        return response()->json(\App\Models\Permiso::all());
    });
});
