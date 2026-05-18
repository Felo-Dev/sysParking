<?php

namespace App\Enums;

enum EstadoFactura: string
{
    case Pendiente = 'pendiente';
    case Pagado = 'pagado';
    case Anulado = 'anulado';
}
