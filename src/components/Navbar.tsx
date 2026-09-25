import React from 'react';
import { AuthSession } from '../types/index.js';
import { Recycle, LogOut, RotateCcw, ShieldCheck, UserCheck, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  session: AuthSession;
  onLogout: () => void;
  onResetDb: () => void;
  onOpenTests: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  onLogout,
  onResetDb,
  onOpenTests
}) => {
  const isAdmin = session.usuario.rol === 'ADMINISTRADOR';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & system name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-sm">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">EcoGestión</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                RECICLAJE
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-400">
              Sistema Digital de Control y Registro de Recolecciones
            </p>
          </div>
        </div>

        {/* Right: User profile, role badge & actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Tests Runner trigger */}
          <button
            onClick={onOpenTests}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            title="Ejecutar suite de pruebas obligatorias (Casos 1 al 10)"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Pruebas Obligatorias</span>
            <span className="md:hidden">Pruebas</span>
          </button>

          {/* Reset DB to seed (convenient for test verification) */}
          <button
            onClick={onResetDb}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            title="Restaurar base de datos a datos iniciales para pruebas"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reiniciar Datos</span>
          </button>

          {/* User info & Role badge */}
          <div className="flex items-center gap-2 pl-2 sm:pl-4 sm:border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-200">{session.perfil.nombre}</div>
              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{session.usuario.correo}</div>
            </div>

            {isAdmin ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/80">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">ADMIN</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">RECICLADOR</span>
              </span>
            )}

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-slate-800/90 hover:bg-red-950/80 hover:text-red-300 border border-slate-700/80 hover:border-red-800 text-slate-400 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
