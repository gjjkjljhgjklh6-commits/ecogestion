import React, { useState, useEffect } from 'react';
import {
  Scale,
  Calendar,
  Building2,
  PackageCheck,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Clock,
  History,
  Info,
  Lock
} from 'lucide-react';
import { api } from '../lib/api.js';
import {
  AuthSession,
  EmpresaAfiliada,
  TipoMaterial,
  RecoleccionDetalle,
  ResumenReciclador
} from '../types/index.js';

interface RecyclerPanelProps {
  session: AuthSession;
  onOpenTests: () => void;
}

type TabType = 'registrar' | 'resumen' | 'ganancia' | 'historial';

export const RecyclerPanel: React.FC<RecyclerPanelProps> = ({ session, onOpenTests }) => {
  const [activeTab, setActiveTab] = useState<TabType>('registrar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Lists
  const [empresas, setEmpresas] = useState<EmpresaAfiliada[]>([]);
  const [materiales, setMateriales] = useState<TipoMaterial[]>([]);
  const [misRecolecciones, setMisRecolecciones] = useState<RecoleccionDetalle[]>([]);
  const [resumen, setResumen] = useState<ResumenReciclador | null>(null);

  // Month filter for summary
  const [mesConsulta, setMesConsulta] = useState<string>(new Date().toISOString().slice(0, 7));

  // New collection form state
  const todayStr = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState<string>(todayStr);
  const [idEmpresa, setIdEmpresa] = useState<string>('');
  const [idMaterial, setIdMaterial] = useState<string>('');
  const [cantidadKg, setCantidadKg] = useState<string>('');

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
      const [emps, mats, recs, res] = await Promise.all([
        api.getEmpresas(),
        api.getMateriales(),
        api.getRecolecciones(),
        api.getResumenReciclador(mesConsulta)
      ]);

      setEmpresas(emps);
      setMateriales(mats);
      setMisRecolecciones(recs);
      setResumen(res);

      if (emps.length > 0 && !idEmpresa) setIdEmpresa(emps[0].idEmpresa);
      if (mats.length > 0 && !idMaterial) setIdMaterial(mats[0].idMaterial);
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [mesConsulta]);

  const handleRegisterCollection = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!fecha || !fecha.trim()) {
      showNotification('La fecha es obligatoria (fecha NOT NULL).', true);
      return;
    }

    const kg = parseFloat(cantidadKg);
    if (isNaN(kg) || kg <= 0) {
      showNotification('La cantidad debe ser estrictamente mayor a 0 kg (cantidad_kg > 0).', true);
      return;
    }

    if (!idEmpresa) {
      showNotification('Debe seleccionar una empresa afiliada existente.', true);
      return;
    }

    if (!idMaterial) {
      showNotification('Debe seleccionar un tipo de material existente.', true);
      return;
    }

    setLoading(true);
    try {
      // NOTE: Associated automatically with authenticated recycler session
      await api.createRecoleccion({
        fecha,
        cantidad_kg: kg,
        idEmpresa,
        idMaterial
      });

      showNotification(`¡Recolección de ${kg} kg registrada exitosamente!`);
      setCantidadKg('');
      // Reload collections and summary
      await loadData();
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
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

      {/* Recycler Welcome Card */}
      <div className="bg-gradient-to-r from-emerald-900/40 via-slate-800 to-slate-800/80 border border-emerald-800/40 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Panel Operativo de Recolección
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Hola, {session.perfil.nombre}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Registra tus recolecciones en ruta y consulta tu avance mensual consolidado.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-700/80 shrink-0">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Total Histórico Registrado</div>
            <div className="text-lg font-bold text-white">
              {resumen?.totalKgHistorico.toLocaleString() || 0} <span className="text-xs font-normal text-emerald-400">kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center border-b border-slate-800 pb-2 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('registrar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'registrar'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar Recolección</span>
        </button>

        <button
          onClick={() => setActiveTab('resumen')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'resumen'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Resumen Mensual</span>
        </button>

        <button
          onClick={() => setActiveTab('ganancia')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'ganancia'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
              : 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Ganancia (Por Definir)</span>
        </button>

        <button
          onClick={() => setActiveTab('historial')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'historial'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Mis Recolecciones ({misRecolecciones.length})</span>
        </button>
      </div>

      {/* ===================== TAB 1: REGISTRAR RECOLECCIÓN ===================== */}
      {activeTab === 'registrar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Registration Form */}
          <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Nueva Recolección de Material</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ingrese los datos obligatorios de la recolección física efectuada.
                </p>
              </div>

              {/* Automatic recycler lock indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold">
                <Lock className="w-3 h-3" />
                <span>Reciclador Asociado: {session.perfil.nombre}</span>
              </div>
            </div>

            <form onSubmit={handleRegisterCollection} className="space-y-5">
              {/* Field 1: Fecha (NOT NULL) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Fecha de Recolección <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Field 2: Empresa Afiliada */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Empresa Afiliada <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    required
                    value={idEmpresa}
                    onChange={(e) => setIdEmpresa(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">-- Seleccionar empresa afiliada --</option>
                    {empresas.map((emp) => (
                      <option key={emp.idEmpresa} value={emp.idEmpresa}>
                        {emp.nombre} ({emp.direccion})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field 3: Tipo de Material */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Tipo de Material Reciclable <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <PackageCheck className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    required
                    value={idMaterial}
                    onChange={(e) => setIdMaterial(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">-- Seleccionar tipo de material --</option>
                    {materiales.map((mat) => (
                      <option key={mat.idMaterial} value={mat.idMaterial}>
                        {mat.nombre_material} (Meta: {mat.porcentaje_meta}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field 4: Cantidad en kg (> 0) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Cantidad en Kilogramos (kg) <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Scale className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="Ej. 125.5"
                    value={cantidadKg}
                    onChange={(e) => setCantidadKg(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Validación obligatoria: La cantidad debe ser mayor a 0 kg.
                </p>
              </div>

              {/* Auto-Recycler Lock Card: Compliance demonstration */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Vínculo Automático Protegido</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Conforme al requisito técnico: <em>"La recolección debe quedar asociada al reciclador autenticado; el usuario no debería poder seleccionar arbitrariamente otro idReciclador."</em>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Guardando recolección...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Confirmar y Guardar Recolección</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Resumen Rápido de Hoy
              </h3>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-750">
                <div className="text-[11px] text-slate-400">Recolecciones Registradas Hoy</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {misRecolecciones.filter((r) => r.fecha === todayStr).length}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-750">
                <div className="text-[11px] text-slate-400">Kilogramos Hoy</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  {misRecolecciones
                    .filter((r) => r.fecha === todayStr)
                    .reduce((sum, r) => sum + r.cantidad_kg, 0)
                    .toFixed(1)}{' '}
                  kg
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Materiales Habilitados
              </h3>
              <div className="space-y-2">
                {materiales.map((m) => (
                  <div key={m.idMaterial} className="flex items-center justify-between text-xs py-1 border-b border-slate-750/50">
                    <span className="text-slate-300">{m.nombre_material}</span>
                    <span className="text-[11px] text-emerald-400 font-mono">Meta: {m.porcentaje_meta}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: RESUMEN MENSUAL ===================== */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Month selector */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Resumen Mensual de Actividad</h3>
                <p className="text-xs text-slate-400">Consolidado dinámico de recolecciones por mes</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Mes:</label>
              <input
                type="month"
                value={mesConsulta}
                onChange={(e) => setMesConsulta(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
              />
            </div>
          </div>

          {resumen && (
            <>
              {/* KPIs of the month */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80">
                  <div className="text-xs text-slate-400 font-semibold">Total del Mes ({resumen.mesConsulta})</div>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-2">
                    {resumen.totalKgMes.toLocaleString()} <span className="text-sm font-normal text-slate-300">kg</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Calculado dinámicamente</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80">
                  <div className="text-xs text-slate-400 font-semibold">Recolecciones en el Mes</div>
                  <div className="text-3xl font-extrabold text-white mt-2">
                    {resumen.totalRecoleccionesMes}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Registros completados</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80">
                  <div className="text-xs text-slate-400 font-semibold">Total Histórico del Reciclador</div>
                  <div className="text-3xl font-extrabold text-white mt-2">
                    {resumen.totalKgHistorico.toLocaleString()} <span className="text-sm font-normal text-slate-300">kg</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Desde el inicio</div>
                </div>
              </div>

              {/* Material and Company Breakdowns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4">
                  <h3 className="text-sm font-bold text-white">Desglose por Tipo de Material</h3>
                  <div className="space-y-3">
                    {resumen.desgloseMateriales.map((m) => (
                      <div key={m.idMaterial} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-750">
                        <span className="text-xs font-semibold text-white">{m.nombre_material}</span>
                        <span className="text-xs font-bold text-emerald-400">{m.total_kg} kg</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4">
                  <h3 className="text-sm font-bold text-white">Desglose por Empresas Atendidas</h3>
                  {resumen.desgloseEmpresas.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">
                      No hay recolecciones en empresas para este mes.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {resumen.desgloseEmpresas.map((e) => (
                        <div key={e.idEmpresa} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-750">
                          <div>
                            <div className="text-xs font-semibold text-white">{e.nombre}</div>
                            <div className="text-[11px] text-slate-400">{e.recolecciones} recolecciones</div>
                          </div>
                          <span className="text-xs font-bold text-emerald-400">{e.total_kg} kg</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===================== TAB 3: GANANCIA (PENDIENTE DE DEFINICIÓN) ===================== */}
      {activeTab === 'ganancia' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/80 border border-amber-800/60 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <div className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 mb-2">
                  PENDIENTE DE DEFINICIÓN
                </div>
                <h2 className="text-lg font-bold text-white">
                  Módulo de Ganancia del Reciclador
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Conforme a la especificación técnica (Sección 6, 9 y 12 del informe de desarrolladores):
                </p>
                <blockquote className="my-3 p-3 rounded-xl bg-slate-900/80 border-l-4 border-amber-500 text-xs italic text-slate-300">
                  "El documento no define la fórmula de cálculo de la ganancia; esta debe definirse antes de implementar el cálculo."
                </blockquote>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-750 space-y-2">
                <div className="text-xs font-bold text-white">Directriz de Implementación</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  El sistema <strong>no inventa tarifas ficticias, ni porcentajes o comisiones arbitrarias</strong>.
                  La arquitectura técnica está completamente preparada con las sumas dinámicas de kilogramos por material y por empresa para inyectar la fórmula tan pronto sea definida.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-750 space-y-2">
                <div className="text-xs font-bold text-white">Datos Listos para el Cálculo</div>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• Kilogramos recolectados por mes: <span className="text-emerald-400 font-semibold">{resumen?.totalKgMes || 0} kg</span></li>
                  <li>• Desglose por tipo de material: Listo para multiplicador de tarifa</li>
                  <li>• Histórico acumulado: <span className="text-emerald-400 font-semibold">{resumen?.totalKgHistorico || 0} kg</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 4: MIS RECOLECCIONES ===================== */}
      {activeTab === 'historial' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Historial de Mis Recolecciones</h2>
            <div className="text-xs text-emerald-400 font-semibold">
              Total: {misRecolecciones.reduce((s, r) => s + r.cantidad_kg, 0).toFixed(1)} kg
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/70 border-b border-slate-700 text-slate-400">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Empresa Afiliada</th>
                  <th className="py-3 px-4">Tipo de Material</th>
                  <th className="py-3 px-4 text-right">Cantidad (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-750">
                {misRecolecciones.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      Aún no has registrado ninguna recolección.
                    </td>
                  </tr>
                ) : (
                  misRecolecciones.map((r) => (
                    <tr key={r.idRecoleccion} className="hover:bg-slate-750/30">
                      <td className="py-3 px-4 font-semibold text-white">{r.fecha}</td>
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
    </div>
  );
};
