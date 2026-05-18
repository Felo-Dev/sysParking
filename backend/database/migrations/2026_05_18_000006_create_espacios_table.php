<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('espacios', function (Blueprint $table) {
            $table->id();
            $table->string('codigo');
            $table->unsignedBigInteger('sucursal_id')->nullable();
            $table->string('estado')->default('libre');
            $table->timestamps();

            $table->foreign('sucursal_id')
                ->references('id')
                ->on('sucursales')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('espacios');
    }
};
