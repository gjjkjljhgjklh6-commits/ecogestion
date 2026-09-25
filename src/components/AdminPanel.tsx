import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Building2,
  PackageCheck,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Printer,
  Clock,
  TrendingUp,
  Scale,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../lib/api.js';
import {
  AuthSession,
  RecicladorDetalle,
  EmpresaAfiliada,
  TipoMaterial,
  RecoleccionDetalle,
  IndicadoresAdmin,
  InformeEmpresaMensual
} from '../types/index.js';
import { PendingItemsView } from './PendingItemsView.js';

interface AdminPanelProps {
  session: AuthSession;
  onOpenTests: () => void;
}

type TabType =
  | 'dashboard'
  | 'recicladores'
  | 'empresas'
  | 'materiales'
  | 'recolecciones'
  | 'informes'
  | 'pendientes';

export const AdminPanel: React.FC<AdminPanelProps> = ({ session, onOpenTests }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data states
  const [indicadores, setIndicadores] = useState<IndicadoresAdmin | null>(null);
  const [recicladores, setRecicladores] = useState<RecicladorDetalle[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaAfiliada[]>([]);
  const [materiales, setMateriales] = useState<TipoMaterial[]>([]);
  const [recolecciones, setRecolecciones] = useState<RecoleccionDetalle[]>([]);

  // Filter states
  const [filterMes, setFilterMes] = useState<string>('');
  const [filterEmpresa, setFilterEmpresa] = useState<string>('');
  const [filterReciclador, setFilterReciclador] = useState<string>('');
  const [filterMaterial, setFilterMaterial] = useState<string>('');

  // Modals state
  const [showNewRecModal, setShowNewRecModal] = useState(false);
  const [showEditRecModal, setShowEditRecModal] = useState<RecicladorDetalle | null>(null);
  const [recForm, setRecForm] = useState({ nombre: '', correo: '', contrasena: '' });

  const [showNewEmpModal, setShowNewEmpModal] = useState(false);
  const [showEditEmpModal, setShowEditEmpModal] = useState<EmpresaAfiliada | null>(null);
  const [empForm, setEmpForm] = useState({ nombre: '', direccion: '', contacto: '' });

  const [showNewMatModal, setShowNewMatModal] = useState(false);
  const [showEditMatModal, setShowEditMatModal] = useState<TipoMaterial | null>(null);
  const [matForm, setMatForm] = useState({ nombre_material: '', porcentaje_meta: 25 });

  // Monthly Report states
  const [repEmpresaId, setRepEmpresaId] = useState<string>('');
  const [repAnio, setRepAnio] = useState<number>(new Date().getFullYear());
  const [repMes, setRepMes] = useState<number>(new Date().getMonth() + 1);
  const [informeEmpresa, setInformeEmpresa] = useState<InformeEmpresaMensual | null>(null);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(null), 6000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [ind, recs, emps, mats, colls] = await Promise.all([
        api.getIndicadores({
          mes: filterMes || undefined,
          idEmpresa: filterEmpresa || undefined,
          idReciclador: filterReciclador || undefined
        }),
        api.getRecicladores(),
        api.getEmpresas(),
        api.getMateriales(),
        api.getRecolecciones({
          mes: filterMes || undefined,
          idEmpresa: filterEmpresa || undefined,
          idReciclador: filterReciclador || undefined,
          idMaterial: filterMaterial || undefined
        })
      ]);

      setIndicadores(ind);
      setRecicladores(recs);
      setEmpresas(emps);
      setMateriales(mats);
      setRecolecciones(colls);

      if (emps.length > 0 && !repEmpresaId) {
        setRepEmpresaId(emps[0].idEmpresa);
      }
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterMes, filterEmpresa, filterReciclador, filterMaterial]);

  // Recycler Handlers
  const handleCreateReciclador = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createReciclador({
        nombre: recForm.nombre,
        correo: recForm.correo,
        contrasena: recForm.contrasena
      });
      setShowNewRecModal(false);
      setRecForm({ nombre: '', correo: '', contrasena: '' });
      showNotification('Reciclador registrado satisfactoriamente.');
      loadData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleUpdateReciclador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditRecModal) return;
    try {
      await api.updateReciclador(showEditRecModal.idReciclador, {
        nombre: recForm.nombre
      });
      setShowEditRecModal(null);
      showNotification('Datos del reciclador actualizados.');
      loadData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleDeleteReciclador = async (rec: RecicladorDetalle) => {
    if (!confirm(`¿Desea eliminar al reciclador "${rec.nombre}"?`)) return;
    try {
      await api.deleteReciclador(rec.idReciclador);
      showNotification('Reciclador eliminado.');
      loadData();
    } catch (err: any) {
      // Highlights the mandatory rule: No eliminar si tiene recolecciones
      showNotification(err.message, true);
    }
  };

  // Empresa Handlers
  const handleCreateEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createEmpresa(empForm);
      setShowNewEmpModal(false);
      setEmpForm({ nombre: '', direccion: '', contacto: '' });
      showNotification('Empresa afiliada registrada.');
      loadData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleUpdateEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditEmpModal) return;
    try {
      await api.updateEmpresa(showEditEmpModal.idEmpresa, empForm);
      setShowEditEmpModal(null);
      showNotification('Empresa afiliada actualizada.');
      loadData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Material Handlers
  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMaterial(matForm);
      setShowNewMatModal(false);
      setMatForm({ nombre_material: '', porcentaje_meta: 25 });
      showNotification('Tipo de material registrado.');
      loadData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditMatModal) return;
    try {
      await api.updateMaterial(showEditMatModal.idMaterial, matForm);
      setShowEditMatModal(null);
      showNotification('Tipo de material actualizado.');
      loadData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Report Handler
  const handleGenerateReport = async () => {
    if (!repEmpresaId) return;
    setLoading(true);
    try {
      const rep = await api.getInformeEmpresa(repEmpresaId, repAnio, repMes);
      setInformeEmpresa(rep);
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const exportReportCsv = () => {
    if (!informeEmpresa) return;
    const lines = [
      `INFORME MENSUAL DE RECOLECCIÓN`,
      `Empresa: "${informeEmpresa.empresa.nombre}"`,
      `Periodo: ${informeEmpresa.periodo.mesNombre} ${informeEmpresa.periodo.anio}`,
      `Total Recolectado (kg): ${informeEmpresa.totalKg}`,
      `Total Recolecciones: ${informeEmpresa.totalRecolecciones}`,
      `Fuente: EXCLUSIVA de registros RECOLECCION`,
      ``,
      `DESGLOSE POR MATERIAL`,
      `Material,Cantidad (kg),Porcentaje`,
      ...informeEmpresa.desglosePorMaterial.map(
        (m) => `"${m.nombre_material}",${m.cantidad_kg},${m.porcentajeDelTotal}%`
      ),
      ``,
      `DETALLE DE RECOLECCIONES`,
      `Fecha,Reciclador,Material,Cantidad (kg)`,
      ...informeEmpresa.recoleccionesDetalladas.map(
        (r) => `${r.fecha},"${r.recicladorNombre}","${r.materialNombre}",${r.cantidad_kg}`
      )
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_${informeEmpresa.empresa.nombre.replace(/\s+/g, '_')}_${informeEmpresa.periodo.anio}_${informeEmpresa.periodo.mes}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/90 border border-red-800 text-red-200 text-sm flex items-start gap-3 shadow-lg animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-200 text-sm flex items-start gap-3 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMsg}</div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard & Indicadores</span>
          </button>

          <button
            onClick={() => setActiveTab('recicladores')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'recicladores'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Recicladores ({recicladores.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('empresas')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'empresas'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Empresas ({empresas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('materiales')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'materiales'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Materiales ({materiales.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recolecciones')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'recolecciones'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Recolecciones ({recolecciones.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('informes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'informes'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Informes Mensuales</span>
          </button>

          <button
            onClick={() => setActiveTab('pendientes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'pendientes'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Requisitos & Pendientes</span>
          </button>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors shrink-0"
          title="Actualizar datos"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ===================== TAB 1: DASHBOARD & INDICADORES ===================== */}
      {activeTab === 'dashboard' && indicadores && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Filter className="w-4 h-4 text-purple-400" />
              <span>Filtros Dinámicos:</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-400">Mes:</label>
              <input
                type="month"
                value={filterMes}
                onChange={(e) => setFilterMes(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-400">Empresa:</label>
              <select
                value={filterEmpresa}
                onChange={(e) => setFilterEmpresa(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
              >
                <option value="">Todas las empresas</option>
                {empresas.map((e) => (
                  <option key={e.idEmpresa} value={e.idEmpresa}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-400">Reciclador:</label>
              <select
                value={filterReciclador}
                onChange={(e) => setFilterReciclador(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
              >
                <option value="">Todos los recicladores</option>
                {recicladores.map((r) => (
                  <option key={r.idReciclador} value={r.idReciclador}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>

            {(filterMes || filterEmpresa || filterReciclador) && (
              <button
                onClick={() => {
                  setFilterMes('');
                  setFilterEmpresa('');
                  setFilterReciclador('');
                }}
                className="text-xs text-purple-400 hover:text-purple-300 underline ml-auto cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Dynamic KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 relative overflow-hidden">
              <div className="text-xs font-semibold text-slate-400">Total Kilogramos Reciclados</div>
              <div className="text-3xl font-extrabold text-white mt-2">
                {indicadores.totalKgReciclados.toLocaleString()} <span className="text-lg font-normal text-emerald-400">kg</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                <span>Calculado al vuelo: SUM(cantidad_kg)</span>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80">
              <div className="text-xs font-semibold text-slate-400">Total de Recolecciones</div>
              <div className="text-3xl font-extrabold text-white mt-2">
                {indicadores.totalRecolecciones}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 text-slate-400">
                Registros activos según filtro
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80">
              <div className="text-xs font-semibold text-slate-400">Recicladores Activos</div>
              <div className="text-3xl font-extrabold text-white mt-2">
                {indicadores.recicladoresActivos}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 text-slate-400">
                Con recolecciones en el periodo
              </p>
            </div>

            {/* INGRESOS GENERADOS: Clearly marked as PENDIENTE DE DEFINICIÓN */}
            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/60 relative">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-amber-300">Ingresos Generados</div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  PENDIENTE
                </span>
              </div>
              <div className="text-lg font-bold text-amber-200 mt-2">
                Por Definir
              </div>
              <p className="text-[10px] text-amber-300/80 mt-1 leading-tight">
                El documento técnico especifica expresamente que no define una fórmula de cálculo para los ingresos generados.
              </p>
            </div>
          </div>

          {/* Dinámica de Participación por Tipo de Material */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Participación por Tipo de Material</h3>
                  <p className="text-xs text-slate-400">Calculado dinámicamente a partir de las recolecciones</p>
                </div>
                <span className="text-[11px] text-purple-300 font-mono">
                  {indicadores.totalKgReciclados} kg total
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {indicadores.participacionMateriales.map((mat) => (
                  <div key={mat.idMaterial} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{mat.nombre_material}</span>
                      <div className="text-right">
                        <span className="font-bold text-emerald-400">{mat.porcentaje}%</span>
                        <span className="text-slate-400 ml-2">({mat.total_kg} kg)</span>
                        <span className="text-[10px] text-slate-500 ml-2">Meta: {mat.porcentaje_meta}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(mat.porcentaje, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Nota técnica:</strong> El uso y cálculo exacto de <code>porcentaje_meta</code> está listado en la especificación como <em>pendiente de definición</em>. Se muestra el progreso real sin aplicar reglas arbitrarias.
                </span>
              </div>
            </div>

            {/* Evolución Mensual */}
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Evolución Histórica Mensual</h3>
                  <p className="text-xs text-slate-400">Agrupación dinámica por mes</p>
                </div>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>

              <div className="overflow-hidden border border-slate-700/70 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/70 border-b border-slate-700 text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">Mes (Año-Mes)</th>
                      <th className="py-2.5 px-3 text-right">Recolecciones</th>
                      <th className="py-2.5 px-3 text-right">Total Kg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-750">
                    {indicadores.evolucionMensual.map((item) => (
                      <tr key={item.mes} className="hover:bg-slate-750/30">
                        <td className="py-2.5 px-3 font-semibold text-white">{item.mes}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{item.total_recolecciones}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          {item.total_kg.toLocaleString()} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: RECICLADORES ===================== */}
      {activeTab === 'recicladores' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Gestión y Supervisión de Recicladores</h2>
              <p className="text-xs text-slate-400">
                Cada reciclador pertenece al administrador y tiene un usuario exclusivo con rol RECICLADOR.
              </p>
            </div>
            <button
              onClick={() => {
                setRecForm({ nombre: '', correo: '', contrasena: '' });
                setShowNewRecModal(true);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-purple-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Reciclador</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              <strong>Regla de negocio obligatoria:</strong> No es posible eliminar un reciclador que tenga recolecciones registradas, con el fin de preservar la trazabilidad histórica.
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/70 border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="py-3 px-4">Reciclador</th>
                  <th className="py-3 px-4">Correo (Login)</th>
                  <th className="py-3 px-4">Administrador Asignado</th>
                  <th className="py-3 px-4 text-right">Recolecciones</th>
                  <th className="py-3 px-4 text-right">Total Kg</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-750">
                {recicladores.map((rec) => (
                  <tr key={rec.idReciclador} className="hover:bg-slate-750/30">
                    <td className="py-3 px-4 font-semibold text-white">{rec.nombre}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{rec.correo}</td>
                    <td className="py-3 px-4 text-slate-300">{rec.administradorNombre}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-200">
                      {rec.totalRecolecciones || 0}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      {(rec.totalKgRecolectados || 0).toLocaleString()} kg
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setShowEditRecModal(rec);
                            setRecForm({ nombre: rec.nombre, correo: rec.correo || '', contrasena: '' });
                          }}
                          className="p-1.5 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Editar información"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteReciclador(rec)}
                          className="p-1.5 rounded-lg bg-slate-700/70 hover:bg-red-900/80 text-slate-300 hover:text-red-200 transition-colors"
                          title="Eliminar (rechazado si tiene historial)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: EMPRESAS AFILIADAS ===================== */}
      {activeTab === 'empresas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Empresas Afiliadas</h2>
              <p className="text-xs text-slate-400">
                Entidad EMPRESA_AFILIADA: Nombre, Dirección y Contacto.
              </p>
            </div>
            <button
              onClick={() => {
                setEmpForm({ nombre: '', direccion: '', contacto: '' });
                setShowNewEmpModal(true);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-purple-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Empresa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {empresas.map((emp) => (
              <div
                key={emp.idEmpresa}
                className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-white text-sm">{emp.nombre}</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditEmpModal(emp);
                      setEmpForm({
                        nombre: emp.nombre,
                        direccion: emp.direccion,
                        contacto: emp.contacto
                      });
                    }}
                    className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-slate-400">
                    <strong className="text-slate-300">Dirección:</strong> {emp.direccion}
                  </div>
                  <div className="text-slate-400">
                    <strong className="text-slate-300">Contacto:</strong> {emp.contacto}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-750 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">ID: {emp.idEmpresa}</span>
                  <button
                    onClick={() => {
                      setRepEmpresaId(emp.idEmpresa);
                      setActiveTab('informes');
                      handleGenerateReport();
                    }}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Ver Informe Mensual</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 4: MATERIALES ===================== */}
      {activeTab === 'materiales' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Tipos de Material</h2>
              <p className="text-xs text-slate-400">
                Campos: nombre_material y porcentaje_meta (0 &le; porcentaje_meta &le; 100).
              </p>
            </div>
            <button
              onClick={() => {
                setMatForm({ nombre_material: '', porcentaje_meta: 20 });
                setShowNewMatModal(true);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-purple-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Material</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {materiales.map((mat) => (
              <div
                key={mat.idMaterial}
                className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <button
                    onClick={() => {
                      setShowEditMatModal(mat);
                      setMatForm({
                        nombre_material: mat.nombre_material,
                        porcentaje_meta: mat.porcentaje_meta
                      });
                    }}
                    className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm">{mat.nombre_material}</h3>
                  <div className="text-xs text-slate-400 mt-1">
                    Porcentaje Meta: <span className="font-bold text-emerald-400">{mat.porcentaje_meta}%</span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${Math.min(mat.porcentaje_meta, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 5: CONSULTA DE RECOLECCIONES ===================== */}
      {activeTab === 'recolecciones' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Consulta General de Recolecciones</h2>
              <p className="text-xs text-slate-400">
                Historial completo con vinculación obligatoria a Reciclador, Empresa y Material.
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-xl">
              Total Filtrado: {recolecciones.reduce((sum, r) => sum + r.cantidad_kg, 0).toFixed(1)} kg
            </div>
          </div>

          {/* Detailed table */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/70 border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="py-3 px-4">ID Recolección</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Reciclador</th>
                  <th className="py-3 px-4">Empresa Afiliada</th>
                  <th className="py-3 px-4">Tipo de Material</th>
                  <th className="py-3 px-4 text-right">Cantidad (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-750">
                {recolecciones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No hay recolecciones registradas con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  recolecciones.map((r) => (
                    <tr key={r.idRecoleccion} className="hover:bg-slate-750/30">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{r.idRecoleccion}</td>
                      <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">{r.fecha}</td>
                      <td className="py-3 px-4 text-slate-300">{r.recicladorNombre}</td>
                      <td className="py-3 px-4 text-slate-300">{r.empresaNombre}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-700/70 text-slate-200">
                          {r.materialNombre}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        {r.cantidad_kg.toFixed(1)} kg
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== TAB 6: INFORMES MENSUALES DE EMPRESAS ===================== */}
      {activeTab === 'informes' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Generador de Informes Mensuales por Empresa</h2>
              <p className="text-xs text-slate-400 mt-1">
                Conforme al documento: <em>"Las empresas podrán consultar y descargar un informe mensual sobre lo recolectado, calculado <strong>exclusivamente a partir de los registros de RECOLECCION del sistema</strong>."</em>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Empresa Afiliada</label>
                <select
                  value={repEmpresaId}
                  onChange={(e) => setRepEmpresaId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  {empresas.map((e) => (
                    <option key={e.idEmpresa} value={e.idEmpresa}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Año</label>
                <input
                  type="number"
                  value={repAnio}
                  onChange={(e) => setRepAnio(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Mes</label>
                <select
                  value={repMes}
                  onChange={(e) => setRepMes(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value={1}>Enero</option>
                  <option value={2}>Febrero</option>
                  <option value={3}>Marzo</option>
                  <option value={4}>Abril</option>
                  <option value={5}>Mayo</option>
                  <option value={6}>Junio</option>
                  <option value={7}>Julio</option>
                  <option value={8}>Agosto</option>
                  <option value={9}>Septiembre</option>
                  <option value={10}>Octubre</option>
                  <option value={11}>Noviembre</option>
                  <option value={12}>Diciembre</option>
                </select>
              </div>

              <button
                onClick={handleGenerateReport}
                className="py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-900/30"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Consultar Informe</span>
              </button>
            </div>
          </div>

          {informeEmpresa && (
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-6 shadow-xl print:bg-white print:text-black">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-700 gap-4">
                <div>
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Certificado de Recolección de Residuos
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">{informeEmpresa.empresa.nombre}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Dirección: {informeEmpresa.empresa.direccion} | Contacto: {informeEmpresa.empresa.contacto}
                  </p>
                  <p className="text-xs font-semibold text-emerald-400 mt-1">
                    Periodo Evaluado: {informeEmpresa.periodo.mesNombre} {informeEmpresa.periodo.anio}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportReportCsv}
                    className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <FileDown className="w-4 h-4 text-emerald-400" />
                    <span>Descargar CSV</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Printer className="w-4 h-4 text-purple-400" />
                    <span>Imprimir / PDF</span>
                  </button>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-750">
                  <div className="text-xs text-slate-400 font-semibold">Total Material Recolectado</div>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                    {informeEmpresa.totalKg.toLocaleString()} kg
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Calculado estrictamente desde los registros de recolección
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-750">
                  <div className="text-xs text-slate-400 font-semibold">Total de Registros de Recolección</div>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    {informeEmpresa.totalRecolecciones}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Operaciones realizadas en el periodo
                  </div>
                </div>
              </div>

              {/* Material Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Distribución por Tipo de Material
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {informeEmpresa.desglosePorMaterial.map((m) => (
                    <div key={m.idMaterial} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-750">
                      <div className="text-xs font-semibold text-white truncate">{m.nombre_material}</div>
                      <div className="text-xl font-bold text-emerald-400 mt-1">{m.cantidad_kg} kg</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{m.porcentajeDelTotal}% del total</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collection details list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Detalle Individual de Operaciones
                </h4>
                <div className="overflow-hidden border border-slate-700/70 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/70 text-slate-400 border-b border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Reciclador Responsable</th>
                        <th className="py-2.5 px-3">Material Recolectado</th>
                        <th className="py-2.5 px-3 text-right">Peso (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-750">
                      {informeEmpresa.recoleccionesDetalladas.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-500">
                            No se registraron recolecciones para esta empresa en el periodo indicado.
                          </td>
                        </tr>
                      ) : (
                        informeEmpresa.recoleccionesDetalladas.map((r) => (
                          <tr key={r.idRecoleccion} className="hover:bg-slate-750/30">
                            <td className="py-2.5 px-3 font-semibold text-white">{r.fecha}</td>
                            <td className="py-2.5 px-3 text-slate-300">{r.recicladorNombre}</td>
                            <td className="py-2.5 px-3 text-slate-300">{r.materialNombre}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                              {r.cantidad_kg} kg
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 7: REQUISITOS & PENDIENTES ===================== */}
      {activeTab === 'pendientes' && <PendingItemsView />}

      {/* ===================== MODAL: NUEVO RECICLADOR ===================== */}
      {showNewRecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Registrar Nuevo Reciclador</h3>
            <p className="text-xs text-slate-400">
              Crea la cuenta de usuario con rol RECICLADOR vinculada al administrador actual.
            </p>

            <form onSubmit={handleCreateReciclador} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={recForm.nombre}
                  onChange={(e) => setRecForm({ ...recForm, nombre: e.target.value })}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico (Login)</label>
                <input
                  type="email"
                  required
                  value={recForm.correo}
                  onChange={(e) => setRecForm({ ...recForm, correo: e.target.value })}
                  placeholder="juan@reciclaje.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña Inicial</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={recForm.contrasena}
                  onChange={(e) => setRecForm({ ...recForm, contrasena: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewRecModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl"
                >
                  Crear Reciclador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: EDITAR RECICLADOR ===================== */}
      {showEditRecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Editar Reciclador</h3>

            <form onSubmit={handleUpdateReciclador} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={recForm.nombre}
                  onChange={(e) => setRecForm({ ...recForm, nombre: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditRecModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: NUEVA EMPRESA ===================== */}
      {showNewEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Nueva Empresa Afiliada</h3>

            <form onSubmit={handleCreateEmpresa} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={empForm.nombre}
                  onChange={(e) => setEmpForm({ ...empForm, nombre: e.target.value })}
                  placeholder="Ej. Plásticos del Sur S.A."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Dirección</label>
                <input
                  type="text"
                  required
                  value={empForm.direccion}
                  onChange={(e) => setEmpForm({ ...empForm, direccion: e.target.value })}
                  placeholder="Ej. Calle 123, Parque Industrial"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contacto</label>
                <input
                  type="text"
                  required
                  value={empForm.contacto}
                  onChange={(e) => setEmpForm({ ...empForm, contacto: e.target.value })}
                  placeholder="Ej. Ing. Juan Pérez (+51 987654321)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewEmpModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl"
                >
                  Registrar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: EDITAR EMPRESA ===================== */}
      {showEditEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Editar Empresa Afiliada</h3>

            <form onSubmit={handleUpdateEmpresa} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={empForm.nombre}
                  onChange={(e) => setEmpForm({ ...empForm, nombre: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Dirección</label>
                <input
                  type="text"
                  required
                  value={empForm.direccion}
                  onChange={(e) => setEmpForm({ ...empForm, direccion: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contacto</label>
                <input
                  type="text"
                  required
                  value={empForm.contacto}
                  onChange={(e) => setEmpForm({ ...empForm, contacto: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditEmpModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: NUEVO MATERIAL ===================== */}
      {showNewMatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Nuevo Tipo de Material</h3>

            <form onSubmit={handleCreateMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Material</label>
                <input
                  type="text"
                  required
                  value={matForm.nombre_material}
                  onChange={(e) => setMatForm({ ...matForm, nombre_material: e.target.value })}
                  placeholder="Ej. Vidrio Ámbar"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Porcentaje Meta (0 &le; meta &le; 100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={matForm.porcentaje_meta}
                  onChange={(e) => setMatForm({ ...matForm, porcentaje_meta: parseFloat(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewMatModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl"
                >
                  Registrar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: EDITAR MATERIAL ===================== */}
      {showEditMatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Editar Tipo de Material</h3>

            <form onSubmit={handleUpdateMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Material</label>
                <input
                  type="text"
                  required
                  value={matForm.nombre_material}
                  onChange={(e) => setMatForm({ ...matForm, nombre_material: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Porcentaje Meta (0 &le; meta &le; 100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={matForm.porcentaje_meta}
                  onChange={(e) => setMatForm({ ...matForm, porcentaje_meta: parseFloat(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditMatModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
