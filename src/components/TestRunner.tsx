import React, { useState } from 'react';
import { CheckCircle, XCircle, Play, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api.js';
import { TestCaseResult } from '../types/index.js';

interface TestRunnerProps {
  onClose: () => void;
  onRefreshAll?: () => void;
}

export const TestRunner: React.FC<TestRunnerProps> = ({ onClose, onRefreshAll }) => {
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<{
    totalCasos: number;
    exitosos: number;
    fallidos: number;
    resultados: TestCaseResult[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setRunning(true);
    setError(null);
    try {
      const data = await api.runMandatoryTests();
      setSummary(data);
      if (onRefreshAll) {
        onRefreshAll();
      }
    } catch (err: any) {
      setError(err.message || 'Error al ejecutar las pruebas obligatorias.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Suite de Pruebas Obligatorias</h2>
              <p className="text-xs text-slate-400">
                Verificación automatizada de los 10 casos exigidos por el documento técnico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Ejecución Integral de Casos de Negocio</h3>
              <p className="text-xs text-slate-400 mt-1">
                Comprueba validaciones, seguridad por roles, restricciones de eliminación y cálculos dinámicos.
              </p>
            </div>
            <button
              onClick={runTests}
              disabled={running}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-colors cursor-pointer shrink-0"
            >
              {running ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Ejecutando suite...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Ejecutar Todas las Pruebas</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Test Results */}
          {summary ? (
            <div className="space-y-4">
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-xs text-slate-400 font-medium">Total Evaluados</div>
                  <div className="text-2xl font-bold text-white mt-1">{summary.totalCasos}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                  <div className="text-xs text-emerald-300 font-medium">Exitosos</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{summary.exitosos}</div>
                </div>
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60">
                  <div className="text-xs text-red-300 font-medium">Fallidos</div>
                  <div className="text-2xl font-bold text-red-400 mt-1">{summary.fallidos}</div>
                </div>
              </div>

              <div className="space-y-2.5">
                {summary.resultados.map((test) => (
                  <div
                    key={test.id}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                      test.resultado === 'EXITOSO'
                        ? 'bg-emerald-950/20 border-emerald-800/50'
                        : 'bg-red-950/20 border-red-800/50'
                    }`}
                  >
                    {test.resultado === 'EXITOSO' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white">
                          Caso {test.id}: {test.descripcion}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            test.resultado === 'EXITOSO'
                              ? 'bg-emerald-900 text-emerald-200'
                              : 'bg-red-900 text-red-200'
                          }`}
                        >
                          {test.resultado}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{test.detalles}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-400" />
              <p className="text-sm">Haga clic en "Ejecutar Todas las Pruebas" para validar la conformidad del sistema.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
