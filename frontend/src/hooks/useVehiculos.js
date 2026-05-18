import { useState, useEffect, useCallback } from 'react';
import { vehiculoService } from '../services/vehiculoService';
import { tarifaService } from '../services/tarifaService';
import { clienteService } from '../services/clienteService';

export function useVehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [v, t, c] = await Promise.all([
        vehiculoService.getAll(),
        tarifaService.getAll(),
        clienteService.getAll(),
      ]);
      setVehiculos(v);
      setTarifas(t);
      setClientes(c);
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const esClienteMensual = (placa) =>
    clientes.some((c) => c.placa?.toUpperCase() === placa?.toUpperCase());

  const getTarifa = (tipoVehiculo) =>
    tarifas.find((t) => String(t.tipo_vehiculo) === String(tipoVehiculo));

  return { vehiculos, tarifas, clientes, loading, reload: load, esClienteMensual, getTarifa };
}
