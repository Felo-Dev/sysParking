<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipo_vehiculos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('icono')->nullable();
            $table->decimal('tarifa_defecto', 10, 2)->nullable();
            $table->timestamps();
        });

        DB::table('tipo_vehiculos')->insert([
            ['id' => 1, 'nombre' => 'Automóvil', 'icono' => 'Car'],
            ['id' => 2, 'nombre' => 'Motocicleta', 'icono' => 'Bike'],
            ['id' => 3, 'nombre' => 'Bicicleta', 'icono' => 'Bike'],
            ['id' => 4, 'nombre' => 'Camión', 'icono' => 'Truck'],
            ['id' => 5, 'nombre' => 'Furgón', 'icono' => 'Truck'],
            ['id' => 6, 'nombre' => 'Bus', 'icono' => 'Bus'],
            ['id' => 7, 'nombre' => 'Mula', 'icono' => 'Truck'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('tipo_vehiculos');
    }
};
