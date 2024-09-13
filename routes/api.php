<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\clientes;
use App\Http\Controllers\gestionVehiculos;
use App\Http\Controllers\tarifas;

const USER_ID_ROUTE = '/user/{id}';
const TARIFA_ID_ROUTE = '/tarifas/{id}';

Route::get('/user', [clientes::class, 'index']);
Route::post('/user', [clientes::class, 'store']);
Route::put(USER_ID_ROUTE, [clientes::class, 'update']);
Route::post(USER_ID_ROUTE, [clientes::class, 'show']);
Route::post(USER_ID_ROUTE, [clientes::class, 'destroy']);


Route::get('/vehiculo', [gestionVehiculos::class, 'index']);
Route::post('/vehiculo', [gestionVehiculos::class, 'store']);


Route::get('/tarifas',[tarifas::class, 'index']);
Route::post('/tarifas',[tarifas::class, 'store']);
Route::put(TARIFA_ID_ROUTE, [tarifas::class, 'update']);
Route::post(TARIFA_ID_ROUTE, [tarifas::class, 'show']);
Route::delete(TARIFA_ID_ROUTE, [tarifas::class, 'destroy']);