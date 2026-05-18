<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('facturas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gestion_vehiculo_id');
            $table->string('placa', 6);
            $table->integer('tipo_vehiculo');
            $table->timestamp('hora_entrada');
            $table->timestamp('hora_salida')->nullable();
            $table->string('tiempo_total')->nullable();
            $table->decimal('tarifa_aplicada', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->string('estado', 20)->default('pendiente');
            $table->unsignedBigInteger('registrado_por')->nullable();
            $table->timestamps();

            $table->foreign('gestion_vehiculo_id')
                ->references('id')
                ->on('gestion_vehiculos')
                ->onDelete('cascade');

            $table->foreign('registrado_por')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facturas');
    }
};
