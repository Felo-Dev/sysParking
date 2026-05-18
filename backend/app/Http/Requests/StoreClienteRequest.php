<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'nombre' => 'required|string|max:255',
            'documento' => 'required|string|max:20',
            'placa' => 'required|string|max:6',
            'celular' => 'required|string|max:15',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('placa')) {
            $this->merge(['placa' => strtoupper($this->placa)]);
        }
    }
}
