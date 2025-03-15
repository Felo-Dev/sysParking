<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\clientes;
use App\Http\Controllers\gestionVehiculos;
use App\Http\Controllers\tarifas;
use App\Http\Controllers\Users;
use App\Http\Controllers\Estadistica;

Route::get('/clientes', [clientes::class, 'index']);
Route::post('/clientes', [clientes::class, 'store']);

    
Route::get('/vehiculo', [gestionVehiculos::class, 'index']);
Route::post('/vehiculo', [gestionVehiculos::class, 'store']);


Route::get('/tarifas',[tarifas::class, 'index']);
Route::post('/tarifas',[tarifas::class, 'store']);
Route::put('/tarifas/{id}', [tarifas::class, 'update']);
Route::post('/tarifas/{id}', [tarifas::class, 'show']);
Route::delete('/tarifas/{id}', [tarifas::class, 'destroy']);

Route::get('users/{id}', [users::class, 'show']);
Route::get('users', [Users::class, 'index']);
Route::post('users', [Users::class, 'store']);
Route::put('users/{id}', [Users::class, 'update']);
Route::delete('users/{id}', [Users::class, 'destroy']);

Route::get('estadistica', [Estadistica::class, 'index']);
