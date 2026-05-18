import { useState, useEffect, useCallback } from 'react';
import { clienteService } from '../services/clienteService';
import notify from '../utils/notiflix';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  IdCard,
  Phone,
  Car,
  Loader2,
} from 'lucide-react';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', documento: '', placa: '', celular: '' });
  const [saving, setSaving] = useState(false);

  const loadClients = useCallback(async () => {
    try {
      const data = await clienteService.getAll();
      setClients(data || []);
    } catch (e) {
      notify.failure('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);

  const resetForm = () => {
    setForm({ nombre: '', documento: '', placa: '', celular: '' });
    setEditing(null);
  };

  const openEdit = (client) => {
    setForm({
      nombre: client.nombre,
      documento: client.documento,
      placa: client.placa,
      celular: client.celular,
    });
    setEditing(client);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.documento || !form.placa || !form.celular) return;
    setSaving(true);
    try {
      if (editing) {
        await clienteService.update(editing.id, form);
        notify.success('Cliente actualizado correctamente');
      } else {
        await clienteService.create(form);
        notify.success('Cliente creado correctamente');
      }
      setModalOpen(false);
      resetForm();
      loadClients();
    } catch (e) {
      notify.failure(e.response?.data?.message || 'Error al guardar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    notify.confirm(
      'Eliminar Cliente',
      '¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.',
      'Eliminar',
      'Cancelar',
      async () => {
        try {
          await clienteService.delete(id);
          notify.success('Cliente eliminado');
          loadClients();
        } catch (e) {
          notify.failure('Error al eliminar cliente');
        }
      }
    );
  };

  const filtered = clients.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.placa.toLowerCase().includes(search.toLowerCase()) ||
      c.documento.includes(search)
  );

  if (loading) return <Loading message="Cargando clientes..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gestión de clientes registrados</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, placa o documento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} message="No hay clientes registrados" description="Agrega tu primer cliente usando el botón superior" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((client) => (
            <div key={client.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.nombre}</h3>
                    <p className="text-xs text-gray-400">ID: {client.id}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(client)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <IdCard className="w-4 h-4 text-gray-400" />
                  {client.documento}
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-gray-400" />
                  {client.placa}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {client.celular}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button
                onClick={() => { setModalOpen(false); resetForm(); }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  className="input-field"
                  placeholder="Nombre completo"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                <input
                  className="input-field"
                  placeholder="Número de documento"
                  value={form.documento}
                  onChange={(e) => setForm({ ...form, documento: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                <input
                  className="input-field uppercase"
                  placeholder="ABC123"
                  value={form.placa}
                  onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                <input
                  className="input-field"
                  placeholder="Número de celular"
                  value={form.celular}
                  onChange={(e) => setForm({ ...form, celular: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setModalOpen(false); resetForm(); }}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.nombre || !form.documento || !form.placa || !form.celular}
                className="btn-primary flex-1"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editing ? (
                  'Actualizar'
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
