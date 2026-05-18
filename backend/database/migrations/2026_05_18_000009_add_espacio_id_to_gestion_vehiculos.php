<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gestion_vehiculos', function (Blueprint $table) {
            $table->unsignedBigInteger('espacio_id')->nullable()->after('cascos');

            $table->foreign('espacio_id')
                ->references('id')
                ->on('espacios')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('gestion_vehiculos', function (Blueprint $table) {
            $table->dropForeign(['espacio_id']);
            $table->dropColumn('espacio_id');
        });
    }
};
