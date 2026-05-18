<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('facturas', function (Blueprint $table) {
            $table->integer('cascos')->default(0)->after('tarifa_aplicada');
            $table->decimal('cascos_total', 10, 2)->default(0)->after('cascos');
        });
    }

    public function down(): void
    {
        Schema::table('facturas', function (Blueprint $table) {
            $table->dropColumn(['cascos', 'cascos_total']);
        });
    }
};
