<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermisoRoleSeeder extends Seeder
{
    public function run(): void
    {
        $asignaciones = [
            1 => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            2 => [1, 2, 3, 4, 5, 6, 7, 8, 9],
            3 => [1, 2, 3, 5, 8],
        ];

        foreach ($asignaciones as $roleId => $permisoIds) {
            foreach ($permisoIds as $permisoId) {
                DB::table('permiso_role')->insert([
                    'role_id' => $roleId,
                    'permiso_id' => $permisoId,
                ]);
            }
        }
    }
}
