<?php

namespace App\Enums;

enum EstadoEspacio: string
{
    case Libre = 'libre';
    case Ocupado = 'ocupado';
    case Reservado = 'reservado';
    case Mantenimiento = 'mantenimiento';
}
