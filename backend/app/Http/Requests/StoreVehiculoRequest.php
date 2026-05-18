<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehiculoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tipos = \App\Models\TipoVehiculo::pluck('id')->implode(',');
        return [
            'placa' => 'required|string|max:6',
            'tipo' => "required|in:{$tipos}",
            'cascos' => 'nullable|integer|min:0|max:99',
            'espacio_id' => 'nullable|integer|exists:espacios,id',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('placa')) {
            $this->merge(['placa' => strtoupper($this->placa)]);
        }
    }
}
