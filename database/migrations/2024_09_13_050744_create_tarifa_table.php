<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tarifa', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('tarifa_valor');
            $table->string('tarifa_hora_pago');
            $table->string('tipo_vehiculo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tarifa');
    }
};
