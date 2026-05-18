import { Loader2 } from 'lucide-react';

export default function Loading({ fullScreen = false, message = 'Cargando...' }) {
  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
          <p className="mt-3 text-sm text-gray-500">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      <p className="mt-3 text-sm text-gray-500">{message}</p>
    </div>
  );
}
