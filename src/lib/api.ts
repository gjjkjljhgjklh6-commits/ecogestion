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

const TOKEN_KEY = 'ecogestion_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY)
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error en la petición al servidor.');
  }

  return data as T;
}

export const api = {
  // Autenticación
  login: (correo: string, contrasena: string) =>
    request<AuthSession>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, contrasena })
    }),

  getMe: () => request<any>('/api/auth/me'),

  // Recicladores
  getRecicladores: () => request<RecicladorDetalle[]>('/api/recicladores'),

  createReciclador: (data: { nombre: string; correo: string; contrasena: string; idAdministrador?: string }) =>
    request<any>('/api/recicladores', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateReciclador: (id: string, data: { nombre?: string; idAdministrador?: string }) =>
    request<any>(`/api/recicladores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteReciclador: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/recicladores/${id}`, {
      method: 'DELETE'
    }),

  // Empresas
  getEmpresas: () => request<EmpresaAfiliada[]>('/api/empresas'),

  createEmpresa: (data: { nombre: string; direccion: string; contacto: string }) =>
    request<EmpresaAfiliada>('/api/empresas', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateEmpresa: (id: string, data: { nombre?: string; direccion?: string; contacto?: string }) =>
    request<EmpresaAfiliada>(`/api/empresas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Materiales
  getMateriales: () => request<TipoMaterial[]>('/api/materiales'),

  createMaterial: (data: { nombre_material: string; porcentaje_meta: number }) =>
    request<TipoMaterial>('/api/materiales', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateMaterial: (id: string, data: { nombre_material?: string; porcentaje_meta?: number }) =>
    request<TipoMaterial>(`/api/materiales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Recolecciones
  getRecolecciones: (filters?: {
    mes?: string;
    anio?: string;
    idEmpresa?: string;
    idReciclador?: string;
    idMaterial?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.mes) params.append('mes', filters.mes);
    if (filters?.anio) params.append('anio', filters.anio);
    if (filters?.idEmpresa) params.append('idEmpresa', filters.idEmpresa);
    if (filters?.idReciclador) params.append('idReciclador', filters.idReciclador);
    if (filters?.idMaterial) params.append('idMaterial', filters.idMaterial);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<RecoleccionDetalle[]>(`/api/recolecciones${queryString}`);
  },

  createRecoleccion: (data: { fecha: string; cantidad_kg: number; idEmpresa: string; idMaterial: string }) =>
    request<any>('/api/recolecciones', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Indicadores
  getIndicadores: (filters?: { mes?: string; idEmpresa?: string; idReciclador?: string }) => {
    const params = new URLSearchParams();
    if (filters?.mes) params.append('mes', filters.mes);
    if (filters?.idEmpresa) params.append('idEmpresa', filters.idEmpresa);
    if (filters?.idReciclador) params.append('idReciclador', filters.idReciclador);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<IndicadoresAdmin>(`/api/indicadores${queryString}`);
  },

  // Resumen Reciclador
  getResumenReciclador: (mes?: string) => {
    const query = mes ? `?mes=${mes}` : '';
    return request<ResumenReciclador>(`/api/reciclador/resumen${query}`);
  },

  // Reporte Empresa
  getInformeEmpresa: (idEmpresa: string, anio: number, mes: number) =>
    request<InformeEmpresaMensual>(`/api/reportes/empresa/${idEmpresa}?anio=${anio}&mes=${mes}`),

  // Pruebas obligatorias
  runMandatoryTests: () =>
    request<{
      totalCasos: number;
      exitosos: number;
      fallidos: number;
      resultados: TestCaseResult[];
    }>('/api/tests/run-mandatory', { method: 'POST' }),

  resetDb: () => request<{ success: boolean; message: string }>('/api/admin/reset-db', { method: 'POST' })
};
