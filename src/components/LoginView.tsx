import React, { useState } from 'react';
import { ShieldCheck, LogIn, Key, Mail, Sparkles, User, AlertCircle } from 'lucide-react';
import { api, authStorage } from '../lib/api.js';
import { AuthSession } from '../types/index.js';

interface LoginViewProps {
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim() || !contrasena) {
      setError('Por favor complete su correo electrónico y contraseña.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const session = await api.login(correo, contrasena);
      authStorage.setToken(session.token);
      onLoginSuccess(session);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (email: string, pass: string) => {
    setCorreo(email);
    setContrasena(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            EcoGestión Reciclaje
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Sistema Digital de Gestión para Empresa de Reciclaje
          </p>
          <div className="inline-block mt-3 px-3 py-1 text-xs font-medium rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            Punto de Acceso Único Centralizado
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-sm flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ejemplo@reciclaje.com"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Key className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 text-sm transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Ingresar al Sistema</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-700/70">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Credenciales de Prueba (Demo)
              </span>
              <span className="text-[11px] text-slate-500">Un clic para probar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@reciclaje.com', 'AdminPassword123!')}
                className="text-left p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-slate-700/80 hover:border-purple-500/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 group-hover:scale-125 transition-transform" />
                  <span className="text-xs font-medium text-purple-300">Administrador</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">admin@reciclaje.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('carlos@reciclaje.com', 'Reciclador123!')}
                className="text-left p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-slate-700/80 hover:border-emerald-500/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
                  <span className="text-xs font-medium text-emerald-300">Reciclador (Carlos)</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">carlos@reciclaje.com</div>
              </button>
            </div>
          </div>
        </div>

        {/* Architectural note compliant with document */}
        <div className="mt-6 text-center text-xs text-slate-500 px-4">
          <p>
            Arquitectura conforme a especificación: Entidad <strong>USUARIO</strong> centraliza el inicio de sesión.
            El sistema detecta automáticamente si el rol es <strong>ADMINISTRADOR</strong> o <strong>RECICLADOR</strong> y dirige al panel correspondiente.
          </p>
        </div>
      </div>
    </div>
  );
};
