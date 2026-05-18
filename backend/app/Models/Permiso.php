<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permiso extends Model
{
    protected $fillable = ['nombre', 'slug', 'grupo'];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'permiso_role');
    }
}
