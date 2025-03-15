<?php

namespace App\Http\Controllers;
use App\Models\Cliente;
use Illuminate\Http\Request;
use App\Models\GestionVehiculo;
class Estadistica extends Controller
{
 public function index()
 {
     $clientes = Cliente::all();
     $vehiculos = GestionVehiculo::all();
 
     $data = [
         "status" => 200,
         "data" => [
             "clientes" => count($clientes),
             "vehiculos" => count($vehiculos),
         ],
     ];
 
     return response()->json($data, 200);
 }
}



