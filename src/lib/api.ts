import {
  AuthSession,
  RecoleccionDetalle,
  RecicladorDetalle,
  EmpresaAfiliada,
  TipoMaterial,
  IndicadoresAdmin,
  ResumenReciclador,
  InformeEmpresaMensual,
  TestCaseResult
} from '../types/index.js';
import { clientDb } from './clientDb.js';

const TOKEN_KEY = 'ecogestion_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    clientDb.setSession(null);
  }
};

let isStaticFallbackMode: boolean | null = null;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // If we already detected static hosting (like GitHub Pages without a backend)
  if (isStaticFallbackMode) {
    throw new Error('STATIC_FALLBACK');
  }

  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type');
    // If GitHub Pages returns 404 or an HTML page (because SPA 404 redirect), it's not a JSON API
    if (!contentType || !contentType.includes('application/json')) {
      isStaticFallbackMode = true;
      throw new Error('STATIC_FALLBACK');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición al servidor.');
    }

    return data as T;
  } catch (err: any) {
    // If network failed or returned HTML/404, switch to static client mode
    if (err.message === 'STATIC_FALLBACK' || err instanceof TypeError || err.message?.includes('Failed to fetch')) {
      isStaticFallbackMode = true;
      throw new Error('STATIC_FALLBACK');
    }
    throw err;
  }
}

export const api = {
  // Autenticación
  login: async (correo: string, contrasena: string): Promise<AuthSession> => {
    try {
      const res = await request<AuthSession>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo, contrasena })
      });
      return res;
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        const session = clientDb.login(correo, contrasena);
        authStorage.setToken(session.token);
        return session;
      }
      throw err;
    }
  },

  getMe: async (): Promise<any> => {
    try {
      return await request<any>('/api/auth/me');
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        const session = clientDb.getCurrentSession();
        if (!session) throw new Error('No hay sesión activa.');
        return session;
      }
      throw err;
    }
  },

  // Recicladores
  getRecicladores: async (): Promise<RecicladorDetalle[]> => {
    try {
      return await request<RecicladorDetalle[]>('/api/recicladores');
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        return clientDb.getRecicladores();
      }
      throw err;
    }
  },

  createReciclador: async (data: {
    nombre: string;
    correo: string;
    contrasena: string;
    idAdministrador?: string;
  }) => {
    try {
      return await request<any>('/api/recicladores', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        return clientDb.createReciclador(data);
      }
      throw err;
    }
  },

  updateReciclador: async (id: string, data: { nombre?: string; idAdministrador?: string }) => {
    try {
      return await request<any>(`/api/recicladores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        return clientDb.updateReciclador(id, data);
      }
      throw err;
    }
  },

  deleteReciclador: async (id: string) => {
    try {
      return await request<{ success: boolean; message: string }>(`/api/recicladores/${id}`, {
        method: 'DELETE'
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        clientDb.deleteReciclador(id);
        return { success: true, message: 'Reciclador eliminado satisfactoriamente.' };
      }
      throw err;
    }
  },

  // Empresas
  getEmpresas: async (): Promise<EmpresaAfiliada[]> => {
    try {
      return await request<EmpresaAfiliada[]>('/api/empresas');
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        return clientDb.getEmpresas();
      }
      throw err;
    }
  },

  createEmpresa: async (data: { nombre: string; direccion: string; contacto: string }) => {
    try {
      return await request<EmpresaAfiliada>('/api/empresas', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        return clientDb.createEmpresa(data);
      }
      throw err;
    }
  },

  updateEmpresa: async (id: string, data: { nombre?: string; direccion?: string; contacto?: string }) => {
    try {
      return await request<EmpresaAfiliada>(`/api/empresas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        return clientDb.updateEmpresa(id, data);
      }
      throw err;
    }
  },

  // Materiales
  getMateriales: async (): Promise<TipoMaterial[]> => {
    try {
      return await request<TipoMaterial[]>('/api/materiales');
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        return clientDb.getMateriales();
      }
      throw err;
    }
  },

  createMaterial: async (data: { nombre_material: string; porcentaje_meta: number }) => {
    try {
      return await request<TipoMaterial>('/api/materiales', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        return clientDb.createMaterial(data);
      }
      throw err;
    }
  },

  updateMaterial: async (id: string, data: { nombre_material?: string; porcentaje_meta?: number }) => {
    try {
      return await request<TipoMaterial>(`/api/materiales/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        return clientDb.updateMaterial(id, data);
      }
      throw err;
    }
  },

  // Recolecciones
  getRecolecciones: async (filters?: {
    mes?: string;
    anio?: string;
    idEmpresa?: string;
    idReciclador?: string;
    idMaterial?: string;
  }): Promise<RecoleccionDetalle[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.mes) params.append('mes', filters.mes);
      if (filters?.anio) params.append('anio', filters.anio);
      if (filters?.idEmpresa) params.append('idEmpresa', filters.idEmpresa);
      if (filters?.idReciclador) params.append('idReciclador', filters.idReciclador);
      if (filters?.idMaterial) params.append('idMaterial', filters.idMaterial);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await request<RecoleccionDetalle[]>(`/api/recolecciones${queryString}`);
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        return clientDb.getRecolecciones(filters);
      }
      throw err;
    }
  },

  createRecoleccion: async (data: {
    fecha: string;
    cantidad_kg: number;
    idEmpresa: string;
    idMaterial: string;
  }) => {
    try {
      return await request<any>('/api/recolecciones', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        return clientDb.createRecoleccion(data);
      }
      throw err;
    }
  },

  // Indicadores
  getIndicadores: async (filters?: {
    mes?: string;
    idEmpresa?: string;
    idReciclador?: string;
  }): Promise<IndicadoresAdmin> => {
    try {
      const params = new URLSearchParams();
      if (filters?.mes) params.append('mes', filters.mes);
      if (filters?.idEmpresa) params.append('idEmpresa', filters.idEmpresa);
      if (filters?.idReciclador) params.append('idReciclador', filters.idReciclador);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return await request<IndicadoresAdmin>(`/api/indicadores${queryString}`);
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        return clientDb.getIndicadoresAdmin(filters);
      }
      throw err;
    }
  },

  // Resumen Reciclador
  getResumenReciclador: async (mes?: string): Promise<ResumenReciclador> => {
    try {
      const query = mes ? `?mes=${mes}` : '';
      return await request<ResumenReciclador>(`/api/reciclador/resumen${query}`);
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        const session = clientDb.getCurrentSession();
        return clientDb.getResumenReciclador(session?.perfil.id || 'rec-01', mes);
      }
      throw err;
    }
  },

  // Reporte Empresa
  getInformeEmpresa: async (
    idEmpresa: string,
    anio: number,
    mes: number
  ): Promise<InformeEmpresaMensual> => {
    try {
      return await request<InformeEmpresaMensual>(
        `/api/reportes/empresa/${idEmpresa}?anio=${anio}&mes=${mes}`
      );
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        return clientDb.getInformeMensualEmpresa(idEmpresa, anio, mes);
      }
      throw err;
    }
  },

  // Pruebas obligatorias
  runMandatoryTests: async (): Promise<{
    totalCasos: number;
    exitosos: number;
    fallidos: number;
    resultados: TestCaseResult[];
  }> => {
    try {
      return await request<{
        totalCasos: number;
        exitosos: number;
        fallidos: number;
        resultados: TestCaseResult[];
      }>('/api/tests/run-mandatory', { method: 'POST' });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        return clientDb.runMandatoryTests();
      }
      throw err;
    }
  },

  resetDb: async () => {
    try {
      return await request<{ success: boolean; message: string }>('/api/admin/reset-db', {
        method: 'POST'
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK' || isStaticFallbackMode) {
        clientDb.reset();
        return { success: true, message: 'Base de datos restaurada al estado inicial con éxito.' };
      }
      throw err;
    }
  }
};
