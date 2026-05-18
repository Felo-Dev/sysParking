import { Car, Bike, Truck, Bus } from 'lucide-react';

export const VEHICLE_TYPES = [
  { id: '1', label: 'Automóvil', icon: Car, color: 'bg-blue-100', iconColor: 'text-blue-600', iconBg: 'bg-blue-500/30' },
  { id: '2', label: 'Motocicleta', icon: Bike, color: 'bg-orange-100', iconColor: 'text-orange-600', iconBg: 'bg-orange-500/30' },
  { id: '3', label: 'Bicicleta', icon: Bike, color: 'bg-green-100', iconColor: 'text-green-600', iconBg: 'bg-green-500/30' },
  { id: '4', label: 'Camión', icon: Truck, color: 'bg-purple-100', iconColor: 'text-purple-600', iconBg: 'bg-purple-500/30' },
  { id: '5', label: 'Furgón', icon: Truck, color: 'bg-yellow-100', iconColor: 'text-yellow-600', iconBg: 'bg-yellow-500/30' },
  { id: '6', label: 'Bus', icon: Bus, color: 'bg-red-100', iconColor: 'text-red-600', iconBg: 'bg-red-500/30' },
  { id: '7', label: 'Mula', icon: Truck, color: 'bg-indigo-100', iconColor: 'text-indigo-600', iconBg: 'bg-indigo-500/30' },
];

export function getVehicleType(id) {
  return VEHICLE_TYPES.find((t) => t.id === String(id)) || VEHICLE_TYPES[0];
}
