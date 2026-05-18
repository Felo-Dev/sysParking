<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('slug')->unique();
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });

        DB::table('roles')->insert([
            ['nombre' => 'Super Admin', 'slug' => 'super-admin'],
            ['nombre' => 'Administrador', 'slug' => 'admin'],
            ['nombre' => 'Operador', 'slug' => 'operador'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
