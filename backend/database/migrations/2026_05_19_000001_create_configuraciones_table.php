<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configuraciones', function (Blueprint $table) {
            $table->id();
            $table->string('clave')->unique();
            $table->text('valor')->nullable();
            $table->string('tipo')->default('string');
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });

        DB::table('configuraciones')->insert([
            ['clave' => 'capacidad_parqueadero', 'valor' => '50', 'tipo' => 'integer', 'descripcion' => 'Capacidad máxima del parqueadero'],
            ['clave' => 'precio_casco', 'valor' => '500', 'tipo' => 'integer', 'descripcion' => 'Precio del casco'],
            ['clave' => 'tarifa_minima_horas', 'valor' => '1', 'tipo' => 'integer', 'descripcion' => 'Tarifa mínima en horas'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('configuraciones');
    }
};
