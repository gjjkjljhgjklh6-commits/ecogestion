export type UserRole = 'ADMINISTRADOR' | 'RECICLADOR';

export interface Usuario {
  idUsuario: string;
  correo: string;
  contrasena: string; // Stored hashed with bcrypt
  rol: UserRole;
  fechaCreacion?: string;
}

export interface Administrador {
  idAdministrador: string;
  nombre: string;
  idUsuario: string;
}

export interface Reciclador {
  idReciclador: string;
  nombre: string;
  idUsuario: string;
  idAdministrador: string;
}

export interface EmpresaAfiliada {
  idEmpresa: string;
  nombre: string;
  direccion: string;
  contacto: string;
}

export interface TipoMaterial {
  idMaterial: string;
  nombre_material: string;
  porcentaje_meta: number; // 0 <= porcentaje_meta <= 100
}

export interface Recoleccion {
  idRecoleccion: string;
  fecha: string; // YYYY-MM-DD, NOT NULL
  cantidad_kg: number; // > 0
  idReciclador: string; // FK
  idEmpresa: string; // FK
  idMaterial: string; // FK
}

// Joined views for frontend convenience
export interface RecoleccionDetalle extends Recoleccion {
  recicladorNombre?: string;
  empresaNombre?: string;
  materialNombre?: string;
  administradorId?: string;
}

export interface RecicladorDetalle extends Reciclador {
  correo?: string;
  administradorNombre?: string;
  totalRecolecciones?: number;
  totalKgRecolectados?: number;
}

export interface AuthSession {
  token: string;
  usuario: {
    idUsuario: string;
    correo: string;
    rol: UserRole;
  };
  perfil: {
    id: string; // idAdministrador or idReciclador
    nombre: string;
    idAdministrador?: string; // If reciclador, its admin
  };
}

export interface IndicadoresAdmin {
  totalKgReciclados: number;
  totalRecolecciones: number;
  recicladoresActivos: number;
  empresasAtendidas: number;
  // Dynamic participation per material
  participacionMateriales: {
    idMaterial: string;
    nombre_material: string;
    total_kg: number;
    porcentaje: number; // dynamically computed
    porcentaje_meta: number;
  }[];
  // Monthly breakdown
  evolucionMensual: {
    mes: string; // YYYY-MM
    total_kg: number;
    total_recolecciones: number;
  }[];
  // Pending note for business logic:
  ingresosGenerados: {
    estado: 'PENDIENTE_DE_DEFINICION';
    mensaje: string;
  };
}

export interface ResumenReciclador {
  idReciclador: string;
  nombre: string;
  mesConsulta: string;
  totalKgMes: number;
  totalRecoleccionesMes: number;
  totalKgHistorico: number;
  desgloseMateriales: {
    idMaterial: string;
    nombre_material: string;
    total_kg: number;
  }[];
  desgloseEmpresas: {
    idEmpresa: string;
    nombre: string;
    total_kg: number;
    recolecciones: number;
  }[];
  ganancia: {
    estado: 'PENDIENTE_DE_DEFINICION';
    mensaje: string;
  };
}

export interface InformeEmpresaMensual {
  empresa: EmpresaAfiliada;
  periodo: {
    anio: number;
    mes: number; // 1-12
    mesNombre: string;
  };
  totalKg: number;
  totalRecolecciones: number;
  desglosePorMaterial: {
    idMaterial: string;
    nombre_material: string;
    cantidad_kg: number;
    porcentajeDelTotal: number;
  }[];
  recoleccionesDetalladas: {
    idRecoleccion: string;
    fecha: string;
    recicladorNombre: string;
    materialNombre: string;
    cantidad_kg: number;
  }[];
  fuenteExclusiva: 'RECOLECCION';
}

export interface TestCaseResult {
  id: number;
  descripcion: string;
  resultado: 'EXITOSO' | 'FALLIDO';
  detalles: string;
}
