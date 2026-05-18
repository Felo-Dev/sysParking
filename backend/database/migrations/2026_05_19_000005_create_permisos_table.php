<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permisos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('slug')->unique();
            $table->string('grupo')->nullable();
            $table->timestamps();
        });

        DB::table('permisos')->insert([
            ['nombre' => 'Ver Dashboard', 'slug' => 'ver-dashboard'],
            ['nombre' => 'Gestionar Vehículos', 'slug' => 'gestionar-vehiculos'],
            ['nombre' => 'Gestionar Clientes', 'slug' => 'gestionar-clientes'],
            ['nombre' => 'Gestionar Tarifas', 'slug' => 'gestionar-tarifas'],
            ['nombre' => 'Gestionar Facturas', 'slug' => 'gestionar-facturas'],
            ['nombre' => 'Gestionar Empleados', 'slug' => 'gestionar-empleados'],
            ['nombre' => 'Gestionar Espacios', 'slug' => 'gestionar-espacios'],
            ['nombre' => 'Ver Reportes', 'slug' => 'ver-reportes'],
            ['nombre' => 'Gestionar Cartera', 'slug' => 'gestionar-cartera'],
            ['nombre' => 'Gestionar Usuarios', 'slug' => 'gestionar-usuarios'],
            ['nombre' => 'Configurar Sistema', 'slug' => 'configurar-sistema'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('permisos');
    }
};
