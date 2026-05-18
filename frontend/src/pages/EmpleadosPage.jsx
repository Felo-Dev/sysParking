import { useState, useEffect, useCallback } from 'react';
import { empleadoService } from '../services/empleadoService';
import { turnoService } from '../services/turnoService';
import notify from '../utils/notiflix';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Clock,
  Play,
  Square,
  Loader2,
  UserCheck,
  Briefcase,
  IdCard,
  Phone,
} from 'lucide-react';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

const EMPLOYEE_ROLES = [
  'Cajero',
  'Supervisor',
  'Administrativo',
  'Aseador',
  'Guarda',
  'Conductor',
  'Otro',
];

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [turnoModal, setTurnoModal] = useState(null);
  const [form, setForm] = useState({ nombre: '', documento: '', telefono: '', rol: '' });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [eRes, tRes] = await Promise.all([
        empleadoService.getAll(),
        turnoService.getAll(),
      ]);
      setEmpleados(eRes || []);
      setTurnos(tRes || []);
    } catch (e) {
      notify.failure('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const activeTurnos = turnos.filter((t) => !t.fecha_fin);

  const getActiveTurno = (empleadoId) =>
    activeTurnos.find((t) => t.empleado_id === empleadoId);

  const resetForm = () => {
    setForm({ nombre: '', documento: '', telefono: '', rol: '' });
    setEditing(null);
  };

  const openEdit = (empleado) => {
    setForm({
      nombre: empleado.nombre,
      documento: empleado.documento,
      telefono: empleado.telefono,
      rol: empleado.rol,
    });
    setEditing(empleado);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.documento) return;
    setSaving(true);
    try {
      if (editing) {
        await empleadoService.update(editing.id, form);
        notify.success('Empleado actualizado correctamente');
      } else {
        await empleadoService.create(form);
        notify.success('Empleado creado correctamente');
      }
      setModalOpen(false);
      resetForm();
      loadData();
    } catch (e) {
      notify.failure(e.response?.data?.message || 'Error al guardar empleado');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    notify.confirm(
      'Eliminar Empleado',
      '¿Estás seguro de eliminar este empleado? Esta acción no se puede deshacer.',
      'Eliminar',
      'Cancelar',
      async () => {
        try {
          await empleadoService.delete(id);
          notify.success('Empleado eliminado');
          loadData();
        } catch (e) {
          notify.failure('Error al eliminar empleado');
        }
      }
    );
  };

  const handleToggleActive = async (empleado) => {
    try {
      await empleadoService.update(empleado.id, {
        ...empleado,
        activo: !empleado.activo,
      });
      notify.success(empleado.activo ? 'Empleado desactivado' : 'Empleado activado');
      loadData();
    } catch (e) {
      notify.failure('Error al cambiar estado');
    }
  };

  const handleIniciarTurno = async (empleadoId) => {
    setSaving(true);
    try {
      await turnoService.create({
        empleado_id: empleadoId,
        fecha_inicio: new Date().toISOString(),
      });
      notify.success('Turno iniciado correctamente');
      setTurnoModal(null);
      loadData();
    } catch (e) {
      notify.failure('Error al iniciar turno');
    } finally {
      setSaving(false);
    }
  };

  const handleCerrarTurno = async (turno) => {
    setSaving(true);
    try {
      await turnoService.update(turno.id, {
        fecha_fin: new Date().toISOString(),
      });
      notify.success('Turno cerrado correctamente');
      setTurnoModal(null);
      loadData();
    } catch (e) {
      notify.failure('Error al cerrar turno');
    } finally {
      setSaving(false);
    }
  };

  const filtered = empleados.filter(
    (e) =>
      e.nombre.toLowerCase().includes(search.toLowerCase()) ||
      e.documento.includes(search)
  );

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString('es-CO') : null;

  if (loading) return <Loading message="Cargando empleados..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
          <p className="text-gray-500 mt-1">Gestión de empleados y turnos</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nuevo Empleado
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o documento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} message="No hay empleados registrados" description="Agrega tu primer empleado usando el botón superior" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((empleado) => {
            const at = getActiveTurno(empleado.id);
            return (
              <div key={empleado.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{empleado.nombre}</h3>
                      <p className="text-xs text-gray-400">ID: {empleado.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(empleado)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(empleado.id)}
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
                    {empleado.documento}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {empleado.telefono || '—'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {empleado.rol || '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <span
                      className={`badge cursor-pointer ${
                        empleado.activo
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                      onClick={() => handleToggleActive(empleado)}
                    >
                      {empleado.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Turnos
                  </h4>
                  {at ? (
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Inicio: {formatDate(at.fecha_inicio)}
                      </div>
                      <button
                        onClick={() => setTurnoModal(at)}
                        className="p-2 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-700"
                        title="Cerrar turno"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        const emp = { id: empleado.id, nombre: empleado.nombre };
                        setTurnoModal({ tipo: 'iniciar', empleado: emp });
                      }}
                      disabled={!empleado.activo}
                      className="btn-secondary w-full text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Iniciar Turno
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? 'Editar Empleado' : 'Nuevo Empleado'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  className="input-field"
                  placeholder="Nombre del empleado"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  className="input-field"
                  placeholder="Número de teléfono"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol / Cargo</label>
                <select
                  className="input-field"
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                >
                  <option value="">Seleccionar cargo...</option>
                  {EMPLOYEE_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
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
                disabled={saving || !form.nombre || !form.documento}
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

      {turnoModal && (
        <div className="modal-overlay" onClick={() => !saving && setTurnoModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {turnoModal.tipo === 'iniciar' ? 'Iniciar Turno' : 'Cerrar Turno'}
              </h2>
              <button
                onClick={() => !saving && setTurnoModal(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {turnoModal.tipo === 'iniciar' ? (
              <div className="space-y-4">
                <p className="text-gray-600">
                  ¿Iniciar turno para <strong>{turnoModal.empleado.nombre}</strong>?
                </p>
                <p className="text-sm text-gray-400">
                  La fecha de inicio se registrará automáticamente con la hora actual.
                </p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setTurnoModal(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleIniciarTurno(turnoModal.empleado.id)}
                    disabled={saving}
                    className="btn-primary flex-1"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Iniciar Turno
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Inicio</span>
                    <span className="font-medium">{formatDate(turnoModal.fecha_inicio)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Al cerrar el turno se registrará la hora actual como fecha de finalización.
                </p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setTurnoModal(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleCerrarTurno(turnoModal)}
                    disabled={saving}
                    className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Square className="w-4 h-4" />
                        Cerrar Turno
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
