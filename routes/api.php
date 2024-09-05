<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\clientes;
use App\Http\Controllers\gestionVehiculos;

const USER_ID_ROUTE = '/user/{id}';

Route::get('/user', [clientes::class, 'index']);
Route::post('/user', [clientes::class, 'store']);
Route::put(USER_ID_ROUTE, [clientes::class, 'update']);
Route::post(USER_ID_ROUTE, [clientes::class, 'show']);
Route::post(USER_ID_ROUTE, [clientes::class, 'destroy']);


Route::get('/vehiculo', [gestionVehiculos::class, 'index']);
Route::post('/vehiculo', [gestionVehiculos::class, 'store']);