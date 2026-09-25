import React, { useState, useEffect } from 'react';
import { api, authStorage } from './lib/api.js';
import { AuthSession } from './types/index.js';
import { LoginView } from './components/LoginView.js';
import { Navbar } from './components/Navbar.js';
import { AdminPanel } from './components/AdminPanel.js';
import { RecyclerPanel } from './components/RecyclerPanel.js';
import { TestRunner } from './components/TestRunner.js';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [showTestsModal, setShowTestsModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = authStorage.getToken();
      if (!token) {
        setLoadingInitial(false);
        return;
      }
      try {
        const me = await api.getMe();
        setSession({
          token,
          usuario: me.usuario,
          perfil: me.perfil
        });
      } catch (err) {
        authStorage.clearToken();
        setSession(null);
      } finally {
        setLoadingInitial(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
  };

  const handleLogout = () => {
    authStorage.clearToken();
    setSession(null);
  };

  const handleResetDb = async () => {
    if (!confirm('¿Desea restaurar la base de datos a los valores de prueba iniciales?')) return;
    try {
      await api.resetDb();
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Error al restaurar la base de datos.');
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
          <span className="text-xs font-semibold">Cargando EcoGestión...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        session={session}
        onLogout={handleLogout}
        onResetDb={handleResetDb}
        onOpenTests={() => setShowTestsModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {session.usuario.rol === 'ADMINISTRADOR' ? (
          <AdminPanel session={session} onOpenTests={() => setShowTestsModal(true)} />
        ) : (
          <RecyclerPanel session={session} onOpenTests={() => setShowTestsModal(true)} />
        )}
      </main>

      {/* Mandatory Tests Modal */}
      {showTestsModal && (
        <TestRunner
          onClose={() => setShowTestsModal(false)}
          onRefreshAll={() => {
            // Can reload or let user close
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <p>
          EcoGestión Reciclaje &copy; {new Date().getFullYear()} — Plataforma desarrollada estrictamente conforme al Informe Técnico de Desarrolladores.
        </p>
      </footer>
    </div>
  );
}
