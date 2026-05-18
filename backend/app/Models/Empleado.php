<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Empleado extends Model
{
    protected $table = 'empleados';

    protected $fillable = [
        'user_id', 'nombre', 'documento', 'telefono', 'rol', 'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function turnos()
    {
        return $this->hasMany(Turno::class, 'empleado_id');
    }
}
