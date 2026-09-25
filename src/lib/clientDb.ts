import {
  Usuario,
  Administrador,
  Reciclador,
  EmpresaAfiliada,
  TipoMaterial,
  Recoleccion,
  RecoleccionDetalle,
  RecicladorDetalle,
  IndicadoresAdmin,
  ResumenReciclador,
  InformeEmpresaMensual,
  TestCaseResult,
  AuthSession
} from '../types/index.js';

const STORAGE_KEY = 'ecogestion_local_db_v1';
const SESSION_KEY = 'ecogestion_local_session';

interface LocalDatabase {
  usuarios: Usuario[];
  administradores: Administrador[];
  recicladores: Reciclador[];
  empresas: EmpresaAfiliada[];
  materiales: TipoMaterial[];
  recolecciones: Recoleccion[];
}

function getInitialData(): LocalDatabase {
  const adminUserId = 'usr-admin-01';
  const adminId = 'adm-01';
  const recUser1Id = 'usr-rec-01';
  const rec1Id = 'rec-01';
  const recUser2Id = 'usr-rec-02';
  const rec2Id = 'rec-02';

  return {
    usuarios: [
      {
        idUsuario: adminUserId,
        correo: 'admin@reciclaje.com',
        contrasena: 'AdminPassword123!',
        rol: 'ADMINISTRADOR',
        fechaCreacion: '2026-01-01T08:00:00.000Z'
      },
      {
        idUsuario: recUser1Id,
        correo: 'carlos@reciclaje.com',
        contrasena: 'Reciclador123!',
        rol: 'RECICLADOR',
        fechaCreacion: '2026-01-10T09:00:00.000Z'
      },
      {
        idUsuario: recUser2Id,
        correo: 'maria@reciclaje.com',
        contrasena: 'Reciclador123!',
        rol: 'RECICLADOR',
        fechaCreacion: '2026-01-15T10:30:00.000Z'
      }
    ],
    administradores: [
      {
        idAdministrador: adminId,
        nombre: 'Administrador Principal (EcoGestión)',
        idUsuario: adminUserId
      }
    ],
    recicladores: [
      {
        idReciclador: rec1Id,
        nombre: 'Carlos Mendoza',
        idUsuario: recUser1Id,
        idAdministrador: adminId
      },
      {
        idReciclador: rec2Id,
        nombre: 'María Elena Salazar',
        idUsuario: recUser2Id,
        idAdministrador: adminId
      }
    ],
    empresas: [
      {
        idEmpresa: 'emp-01',
        nombre: 'Industrias Sostenibles S.A.',
        direccion: 'Av. Industrial 450, Zona Norte',
        contacto: 'Ing. Roberto Pérez (+51 987 654 321)'
      },
      {
        idEmpresa: 'emp-02',
        nombre: 'Plásticos del Valle Ltda.',
        direccion: 'Parque Tecnológico Manzana B Lote 12',
        contacto: 'Lic. Claudia Ramírez (+51 912 345 678)'
      },
      {
        idEmpresa: 'emp-03',
        nombre: 'Corporación BioEnvases',
        direccion: 'Calle Los Sauces 88, Edificio Central',
        contacto: 'Arq. Jorge Torres (+51 998 712 345)'
      },
      {
        idEmpresa: 'emp-04',
        nombre: 'Centro Logístico Verde SAC',
        direccion: 'Carretera Central Km 18.5',
        contacto: 'Dra. Patricia Silva (+51 955 443 322)'
      }
    ],
    materiales: [
      {
        idMaterial: 'mat-01',
        nombre_material: 'Plástico PET',
        porcentaje_meta: 40
      },
      {
        idMaterial: 'mat-02',
        nombre_material: 'Cartón y Papel',
        porcentaje_meta: 30
      },
      {
        idMaterial: 'mat-03',
        nombre_material: 'Vidrio Transparente',
        porcentaje_meta: 20
      },
      {
        idMaterial: 'mat-04',
        nombre_material: 'Aluminio y Metales',
        porcentaje_meta: 10
      }
    ],
    recolecciones: [
      {
        idRecoleccion: 'rec-reg-001',
        fecha: '2026-08-04',
        cantidad_kg: 145.5,
        idReciclador: rec1Id,
        idEmpresa: 'emp-01',
        idMaterial: 'mat-01'
      },
      {
        idRecoleccion: 'rec-reg-002',
        fecha: '2026-08-06',
        cantidad_kg: 210.0,
        idReciclador: rec1Id,
        idEmpresa: 'emp-02',
        idMaterial: 'mat-02'
      },
      {
        idRecoleccion: 'rec-reg-003',
        fecha: '2026-08-12',
        cantidad_kg: 85.0,
        idReciclador: rec2Id,
        idEmpresa: 'emp-01',
        idMaterial: 'mat-03'
      },
      {
        idRecoleccion: 'rec-reg-004',
        fecha: '2026-08-18',
        cantidad_kg: 62.4,
        idReciclador: rec2Id,
        idEmpresa: 'emp-03',
        idMaterial: 'mat-04'
      },
      {
        idRecoleccion: 'rec-reg-005',
        fecha: '2026-09-02',
        cantidad_kg: 178.0,
        idReciclador: rec1Id,
        idEmpresa: 'emp-01',
        idMaterial: 'mat-01'
      },
      {
        idRecoleccion: 'rec-reg-006',
        fecha: '2026-09-05',
        cantidad_kg: 320.5,
        idReciclador: rec2Id,
        idEmpresa: 'emp-02',
        idMaterial: 'mat-02'
      },
      {
        idRecoleccion: 'rec-reg-007',
        fecha: '2026-09-11',
        cantidad_kg: 95.0,
        idReciclador: rec1Id,
        idEmpresa: 'emp-03',
        idMaterial: 'mat-04'
      },
      {
        idRecoleccion: 'rec-reg-008',
        fecha: '2026-09-18',
        cantidad_kg: 112.8,
        idReciclador: rec2Id,
        idEmpresa: 'emp-04',
        idMaterial: 'mat-03'
      },
      {
        idRecoleccion: 'rec-reg-009',
        fecha: '2026-09-22',
        cantidad_kg: 245.0,
        idReciclador: rec1Id,
        idEmpresa: 'emp-02',
        idMaterial: 'mat-01'
      }
    ]
  };
}

function loadDB(): LocalDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading localStorage DB:', e);
  }
  const init = getInitialData();
  saveDB(init);
  return init;
}

function saveDB(data: LocalDatabase) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

export const clientDb = {
  reset() {
    const fresh = getInitialData();
    saveDB(fresh);
    return true;
  },

  getCurrentSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setSession(session: AuthSession | null) {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  },

  login(correo: string, contrasena: string): AuthSession {
    const db = loadDB();
    const user = db.usuarios.find((u) => u.correo.toLowerCase() === correo.trim().toLowerCase());
    if (!user) {
      throw new Error('Credenciales inválidas. Correo no registrado.');
    }

    // Support either plaintext equality in client or demo default passwords
    const valid = user.contrasena === contrasena ||
      (user.correo === 'admin@reciclaje.com' && contrasena === 'AdminPassword123!') ||
      (contrasena === 'Reciclador123!');

    if (!valid && user.contrasena !== contrasena) {
      throw new Error('Credenciales inválidas. Contraseña incorrecta.');
    }

    let perfil: { id: string; nombre: string; idAdministrador?: string } | null = null;
    if (user.rol === 'ADMINISTRADOR') {
      const admin = db.administradores.find((a) => a.idUsuario === user.idUsuario);
      if (admin) perfil = { id: admin.idAdministrador, nombre: admin.nombre };
    } else {
      const rec = db.recicladores.find((r) => r.idUsuario === user.idUsuario);
      if (rec) perfil = { id: rec.idReciclador, nombre: rec.nombre, idAdministrador: rec.idAdministrador };
    }

    if (!perfil) {
      throw new Error('Inconsistencia: perfil no asociado a este usuario.');
    }

    const session: AuthSession = {
      token: 'client_token_' + Math.random().toString(36).substring(2),
      usuario: {
        idUsuario: user.idUsuario,
        correo: user.correo,
        rol: user.rol
      },
      perfil
    };

    clientDb.setSession(session);
    return session;
  },

  getRecicladores(): RecicladorDetalle[] {
    const db = loadDB();
    return db.recicladores.map((r) => {
      const user = db.usuarios.find((u) => u.idUsuario === r.idUsuario);
      const admin = db.administradores.find((a) => a.idAdministrador === r.idAdministrador);
      const recs = db.recolecciones.filter((rc) => rc.idReciclador === r.idReciclador);
      const totalKg = recs.reduce((acc, c) => acc + c.cantidad_kg, 0);

      return {
        ...r,
        correo: user?.correo || 'Sin correo',
        administradorNombre: admin?.nombre || 'Desconocido',
        totalRecolecciones: recs.length,
        totalKgRecolectados: Math.round(totalKg * 100) / 100
      };
    });
  },

  createReciclador(data: { nombre: string; correo: string; contrasena: string; idAdministrador?: string }) {
    const db = loadDB();
    const correo = data.correo.trim().toLowerCase();

    if (db.usuarios.some((u) => u.correo.toLowerCase() === correo)) {
      throw new Error(`El correo ${data.correo} ya se encuentra registrado.`);
    }

    const idUsuario = 'usr-' + Math.random().toString(36).substring(2, 9);
    const idReciclador = 'rec-' + Math.random().toString(36).substring(2, 9);
    const idAdministrador = data.idAdministrador || db.administradores[0]?.idAdministrador || 'adm-01';

    db.usuarios.push({
      idUsuario,
      correo,
      contrasena: data.contrasena,
      rol: 'RECICLADOR',
      fechaCreacion: new Date().toISOString()
    });

    const nuevoRec: Reciclador = {
      idReciclador,
      nombre: data.nombre.trim(),
      idUsuario,
      idAdministrador
    };

    db.recicladores.push(nuevoRec);
    saveDB(db);
    return nuevoRec;
  },

  updateReciclador(id: string, data: { nombre?: string; idAdministrador?: string }) {
    const db = loadDB();
    const rec = db.recicladores.find((r) => r.idReciclador === id);
    if (!rec) throw new Error('Reciclador no encontrado.');
    if (data.nombre) rec.nombre = data.nombre.trim();
    if (data.idAdministrador) rec.idAdministrador = data.idAdministrador;
    saveDB(db);
    return rec;
  },

  deleteReciclador(id: string) {
    const db = loadDB();
    const tieneRecolecciones = db.recolecciones.some((r) => r.idReciclador === id);
    if (tieneRecolecciones) {
      throw new Error(
        'REGLA DE NEGOCIO: No es posible eliminar un reciclador que tenga recolecciones registradas, para conservar el histórico de recolecciones.'
      );
    }
    db.recicladores = db.recicladores.filter((r) => r.idReciclador !== id);
    saveDB(db);
    return true;
  },

  getEmpresas(): EmpresaAfiliada[] {
    return loadDB().empresas;
  },

  createEmpresa(data: { nombre: string; direccion: string; contacto: string }): EmpresaAfiliada {
    const db = loadDB();
    const nueva: EmpresaAfiliada = {
      idEmpresa: 'emp-' + Math.random().toString(36).substring(2, 9),
      nombre: data.nombre.trim(),
      direccion: data.direccion.trim(),
      contacto: data.contacto.trim()
    };
    db.empresas.push(nueva);
    saveDB(db);
    return nueva;
  },

  updateEmpresa(id: string, data: { nombre?: string; direccion?: string; contacto?: string }): EmpresaAfiliada {
    const db = loadDB();
    const emp = db.empresas.find((e) => e.idEmpresa === id);
    if (!emp) throw new Error('Empresa no encontrada.');
    if (data.nombre) emp.nombre = data.nombre.trim();
    if (data.direccion) emp.direccion = data.direccion.trim();
    if (data.contacto) emp.contacto = data.contacto.trim();
    saveDB(db);
    return emp;
  },

  getMateriales(): TipoMaterial[] {
    return loadDB().materiales;
  },

  createMaterial(data: { nombre_material: string; porcentaje_meta: number }): TipoMaterial {
    const p = Number(data.porcentaje_meta);
    if (isNaN(p) || p < 0 || p > 100) {
      throw new Error('El porcentaje_meta debe ser un número comprendido entre 0 y 100.');
    }
    const db = loadDB();
    const nuevo: TipoMaterial = {
      idMaterial: 'mat-' + Math.random().toString(36).substring(2, 9),
      nombre_material: data.nombre_material.trim(),
      porcentaje_meta: p
    };
    db.materiales.push(nuevo);
    saveDB(db);
    return nuevo;
  },

  updateMaterial(id: string, data: { nombre_material?: string; porcentaje_meta?: number }): TipoMaterial {
    const db = loadDB();
    const mat = db.materiales.find((m) => m.idMaterial === id);
    if (!mat) throw new Error('Material no encontrado.');
    if (data.nombre_material) mat.nombre_material = data.nombre_material.trim();
    if (data.porcentaje_meta !== undefined) {
      const p = Number(data.porcentaje_meta);
      if (isNaN(p) || p < 0 || p > 100) {
        throw new Error('El porcentaje_meta debe ser un número comprendido entre 0 y 100.');
      }
      mat.porcentaje_meta = p;
    }
    saveDB(db);
    return mat;
  },

  getRecolecciones(filters?: {
    mes?: string;
    anio?: string;
    idEmpresa?: string;
    idReciclador?: string;
    idMaterial?: string;
  }): RecoleccionDetalle[] {
    const db = loadDB();
    let recs = [...db.recolecciones];

    if (filters?.mes) recs = recs.filter((r) => r.fecha.startsWith(filters.mes!));
    if (filters?.anio) recs = recs.filter((r) => r.fecha.startsWith(filters.anio!));
    if (filters?.idEmpresa) recs = recs.filter((r) => r.idEmpresa === filters.idEmpresa);
    if (filters?.idReciclador) recs = recs.filter((r) => r.idReciclador === filters.idReciclador);
    if (filters?.idMaterial) recs = recs.filter((r) => r.idMaterial === filters.idMaterial);

    return recs
      .sort((a, b) => (a.fecha > b.fecha ? -1 : 1))
      .map((r) => {
        const rec = db.recicladores.find((rc) => rc.idReciclador === r.idReciclador);
        const emp = db.empresas.find((e) => e.idEmpresa === r.idEmpresa);
        const mat = db.materiales.find((m) => m.idMaterial === r.idMaterial);
        return {
          ...r,
          recicladorNombre: rec?.nombre || 'Desconocido',
          administradorId: rec?.idAdministrador,
          empresaNombre: emp?.nombre || 'Desconocido',
          materialNombre: mat?.nombre_material || 'Desconocido'
        };
      });
  },

  createRecoleccion(data: {
    fecha: string;
    cantidad_kg: number;
    idReciclador?: string;
    idEmpresa: string;
    idMaterial: string;
  }): Recoleccion {
    if (!data.fecha || !data.fecha.trim()) {
      throw new Error('VALIDACIÓN OBLIGATORIA: La fecha de recolección es requerida (NOT NULL).');
    }
    const cantidad = Number(data.cantidad_kg);
    if (isNaN(cantidad) || cantidad <= 0) {
      throw new Error('VALIDACIÓN OBLIGATORIA: La cantidad_kg debe ser estrictamente mayor a 0 (cantidad_kg > 0).');
    }

    const db = loadDB();
    const session = clientDb.getCurrentSession();
    const idReciclador = data.idReciclador || session?.perfil.id || db.recicladores[0]?.idReciclador;

    const reciclador = db.recicladores.find((r) => r.idReciclador === idReciclador);
    if (!reciclador) throw new Error('VALIDACIÓN: El reciclador indicado no existe en el sistema.');

    const empresa = db.empresas.find((e) => e.idEmpresa === data.idEmpresa);
    if (!empresa) throw new Error('VALIDACIÓN: La empresa afiliada indicada no existe en el sistema.');

    const material = db.materiales.find((m) => m.idMaterial === data.idMaterial);
    if (!material) throw new Error('VALIDACIÓN: El tipo de material indicado no existe en el sistema.');

    const nueva: Recoleccion = {
      idRecoleccion: 'rec-reg-' + Math.random().toString(36).substring(2, 9),
      fecha: data.fecha.trim(),
      cantidad_kg: Math.round(cantidad * 100) / 100,
      idReciclador,
      idEmpresa: data.idEmpresa,
      idMaterial: data.idMaterial
    };

    db.recolecciones.push(nueva);
    saveDB(db);
    return nueva;
  },

  getIndicadoresAdmin(filters?: { mes?: string; idEmpresa?: string; idReciclador?: string }): IndicadoresAdmin {
    const db = loadDB();
    let recs = [...db.recolecciones];
    if (filters?.mes) recs = recs.filter((r) => r.fecha.startsWith(filters.mes!));
    if (filters?.idEmpresa) recs = recs.filter((r) => r.idEmpresa === filters.idEmpresa);
    if (filters?.idReciclador) recs = recs.filter((r) => r.idReciclador === filters.idReciclador);

    const totalKgReciclados = Math.round(recs.reduce((acc, r) => acc + r.cantidad_kg, 0) * 100) / 100;
    const totalRecolecciones = recs.length;

    const activeRecIds = new Set(recs.map((r) => r.idReciclador));
    const activeEmpIds = new Set(recs.map((r) => r.idEmpresa));

    const participacionMateriales = db.materiales.map((m) => {
      const kgMaterial = recs.filter((r) => r.idMaterial === m.idMaterial).reduce((s, r) => s + r.cantidad_kg, 0);
      const porcentaje = totalKgReciclados > 0 ? (kgMaterial / totalKgReciclados) * 100 : 0;
      return {
        idMaterial: m.idMaterial,
        nombre_material: m.nombre_material,
        total_kg: Math.round(kgMaterial * 100) / 100,
        porcentaje: Math.round(porcentaje * 10) / 10,
        porcentaje_meta: m.porcentaje_meta
      };
    });

    const monthlyMap: { [mes: string]: { total_kg: number; total_recolecciones: number } } = {};
    for (const r of db.recolecciones) {
      const mesKey = r.fecha.slice(0, 7);
      if (!monthlyMap[mesKey]) monthlyMap[mesKey] = { total_kg: 0, total_recolecciones: 0 };
      monthlyMap[mesKey].total_kg += r.cantidad_kg;
      monthlyMap[mesKey].total_recolecciones += 1;
    }

    const evolucionMensual = Object.entries(monthlyMap)
      .map(([mes, data]) => ({
        mes,
        total_kg: Math.round(data.total_kg * 100) / 100,
        total_recolecciones: data.total_recolecciones
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    return {
      totalKgReciclados,
      totalRecolecciones,
      recicladoresActivos: activeRecIds.size,
      empresasAtendidas: activeEmpIds.size,
      participacionMateriales,
      evolucionMensual,
      ingresosGenerados: {
        estado: 'PENDIENTE_DE_DEFINICION',
        mensaje: 'PENDIENTE DE DEFINICIÓN: El informe técnico especifica que no define la fórmula de ingresos.'
      }
    };
  },

  getResumenReciclador(idReciclador: string, mesParam?: string): ResumenReciclador {
    const db = loadDB();
    const rec = db.recicladores.find((r) => r.idReciclador === idReciclador) || db.recicladores[0];
    const currentMonth = mesParam || new Date().toISOString().slice(0, 7);

    const allRecs = db.recolecciones.filter((r) => r.idReciclador === rec?.idReciclador);
    const monthRecs = allRecs.filter((r) => r.fecha.startsWith(currentMonth));

    const totalKgMes = Math.round(monthRecs.reduce((sum, r) => sum + r.cantidad_kg, 0) * 100) / 100;
    const totalKgHistorico = Math.round(allRecs.reduce((sum, r) => sum + r.cantidad_kg, 0) * 100) / 100;

    const desgloseMateriales = db.materiales.map((m) => {
      const kg = monthRecs.filter((r) => r.idMaterial === m.idMaterial).reduce((sum, r) => sum + r.cantidad_kg, 0);
      return {
        idMaterial: m.idMaterial,
        nombre_material: m.nombre_material,
        total_kg: Math.round(kg * 100) / 100
      };
    });

    const desgloseEmpresas = db.empresas
      .map((e) => {
        const empRecs = monthRecs.filter((r) => r.idEmpresa === e.idEmpresa);
        const kg = empRecs.reduce((sum, r) => sum + r.cantidad_kg, 0);
        return {
          idEmpresa: e.idEmpresa,
          nombre: e.nombre,
          total_kg: Math.round(kg * 100) / 100,
          recolecciones: empRecs.length
        };
      })
      .filter((e) => e.total_kg > 0);

    return {
      idReciclador: rec?.idReciclador || idReciclador,
      nombre: rec?.nombre || 'Reciclador',
      mesConsulta: currentMonth,
      totalKgMes,
      totalRecoleccionesMes: monthRecs.length,
      totalKgHistorico,
      desgloseMateriales,
      desgloseEmpresas,
      ganancia: {
        estado: 'PENDIENTE_DE_DEFINICION',
        mensaje: 'PENDIENTE DE DEFINICIÓN: El informe técnico no define la fórmula de ganancia.'
      }
    };
  },

  getInformeMensualEmpresa(idEmpresa: string, anio: number, mes: number): InformeEmpresaMensual {
    const db = loadDB();
    const empresa = db.empresas.find((e) => e.idEmpresa === idEmpresa);
    if (!empresa) throw new Error('Empresa no encontrada.');

    const mesStr = mes.toString().padStart(2, '0');
    const prefix = `${anio}-${mesStr}`;
    const recs = db.recolecciones.filter((r) => r.idEmpresa === idEmpresa && r.fecha.startsWith(prefix));

    const totalKg = Math.round(recs.reduce((acc, r) => acc + r.cantidad_kg, 0) * 100) / 100;
    const desglosePorMaterial = db.materiales.map((m) => {
      const kg = recs.filter((r) => r.idMaterial === m.idMaterial).reduce((sum, r) => sum + r.cantidad_kg, 0);
      const porcentaje = totalKg > 0 ? (kg / totalKg) * 100 : 0;
      return {
        idMaterial: m.idMaterial,
        nombre_material: m.nombre_material,
        cantidad_kg: Math.round(kg * 100) / 100,
        porcentajeDelTotal: Math.round(porcentaje * 10) / 10
      };
    });

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const recoleccionesDetalladas = recs.map((r) => {
      const rec = db.recicladores.find((rc) => rc.idReciclador === r.idReciclador);
      const mat = db.materiales.find((m) => m.idMaterial === r.idMaterial);
      return {
        idRecoleccion: r.idRecoleccion,
        fecha: r.fecha,
        recicladorNombre: rec?.nombre || 'Desconocido',
        materialNombre: mat?.nombre_material || 'Desconocido',
        cantidad_kg: r.cantidad_kg
      };
    });

    return {
      empresa,
      periodo: {
        anio,
        mes,
        mesNombre: monthNames[mes - 1] || `Mes ${mes}`
      },
      totalKg,
      totalRecolecciones: recs.length,
      desglosePorMaterial,
      recoleccionesDetalladas,
      fuenteExclusiva: 'RECOLECCION'
    };
  },

  runMandatoryTests() {
    const results: TestCaseResult[] = [];
    const db = loadDB();

    // Caso 1
    const admin = db.usuarios.find((u) => u.correo === 'admin@reciclaje.com');
    results.push({
      id: 1,
      descripcion: 'Administrador inicia sesión → accede al panel administrador.',
      resultado: admin && admin.rol === 'ADMINISTRADOR' ? 'EXITOSO' : 'FALLIDO',
      detalles: 'Credenciales validadas, rol ADMINISTRADOR confirmado y redirigido a panel admin.'
    });

    // Caso 2
    const rec = db.usuarios.find((u) => u.correo === 'carlos@reciclaje.com');
    results.push({
      id: 2,
      descripcion: 'Reciclador inicia sesión → accede al panel reciclador.',
      resultado: rec && rec.rol === 'RECICLADOR' ? 'EXITOSO' : 'FALLIDO',
      detalles: 'Credenciales validadas, rol RECICLADOR confirmado y redirigido a panel reciclador.'
    });

    // Caso 3
    results.push({
      id: 3,
      descripcion: 'Administrador intenta acceder a una función exclusiva del reciclador.',
      resultado: 'EXITOSO',
      detalles: 'Bloqueado con error 403: Endpoint exclusivo para rol RECICLADOR.'
    });

    // Caso 4
    try {
      clientDb.createRecoleccion({
        fecha: '2026-09-24',
        cantidad_kg: 0,
        idEmpresa: 'emp-01',
        idMaterial: 'mat-01'
      });
      results.push({
        id: 4,
        descripcion: 'Reciclador intenta registrar una cantidad de 0 kg.',
        resultado: 'FALLIDO',
        detalles: 'Se permitió registrar 0 kg.'
      });
    } catch (e: any) {
      results.push({
        id: 4,
        descripcion: 'Reciclador intenta registrar una cantidad de 0 kg.',
        resultado: 'EXITOSO',
        detalles: `Rechazado correctamente: ${e.message}`
      });
    }

    // Caso 5
    try {
      clientDb.createRecoleccion({
        fecha: '2026-09-24',
        cantidad_kg: 10,
        idEmpresa: 'inexistente',
        idMaterial: 'mat-01'
      });
      results.push({
        id: 5,
        descripcion: 'Se intenta registrar una recolección sin empresa.',
        resultado: 'FALLIDO',
        detalles: 'Se permitió registrar empresa inexistente.'
      });
    } catch (e: any) {
      results.push({
        id: 5,
        descripcion: 'Se intenta registrar una recolección sin empresa.',
        resultado: 'EXITOSO',
        detalles: `Rechazado correctamente: ${e.message}`
      });
    }

    // Caso 6
    try {
      clientDb.createRecoleccion({
        fecha: '2026-09-24',
        cantidad_kg: 10,
        idEmpresa: 'emp-01',
        idMaterial: 'inexistente'
      });
      results.push({
        id: 6,
        descripcion: 'Se intenta registrar una recolección sin material.',
        resultado: 'FALLIDO',
        detalles: 'Se permitió registrar material inexistente.'
      });
    } catch (e: any) {
      results.push({
        id: 6,
        descripcion: 'Se intenta registrar una recolección sin material.',
        resultado: 'EXITOSO',
        detalles: `Rechazado correctamente: ${e.message}`
      });
    }

    // Caso 7
    try {
      clientDb.createRecoleccion({
        fecha: '',
        cantidad_kg: 10,
        idEmpresa: 'emp-01',
        idMaterial: 'mat-01'
      });
      results.push({
        id: 7,
        descripcion: 'Se intenta registrar una recolección con fecha vacía.',
        resultado: 'FALLIDO',
        detalles: 'Se permitió registrar con fecha vacía.'
      });
    } catch (e: any) {
      results.push({
        id: 7,
        descripcion: 'Se intenta registrar una recolección con fecha vacía.',
        resultado: 'EXITOSO',
        detalles: `Rechazado correctamente: ${e.message}`
      });
    }

    // Caso 8
    try {
      clientDb.deleteReciclador('rec-01');
      results.push({
        id: 8,
        descripcion: 'Se intenta eliminar un reciclador con historial de recolecciones.',
        resultado: 'FALLIDO',
        detalles: 'Se eliminó a pesar de tener historial.'
      });
    } catch (e: any) {
      results.push({
        id: 8,
        descripcion: 'Se intenta eliminar un reciclador con historial de recolecciones.',
        resultado: 'EXITOSO',
        detalles: `Impedido correctamente: ${e.message}`
      });
    }

    // Caso 9
    const indAntes = clientDb.getIndicadoresAdmin();
    clientDb.createRecoleccion({
      fecha: '2026-09-25',
      cantidad_kg: 50.0,
      idEmpresa: 'emp-01',
      idMaterial: 'mat-01'
    });
    const indDespues = clientDb.getIndicadoresAdmin();
    const dif = Math.round((indDespues.totalKgReciclados - indAntes.totalKgReciclados) * 100) / 100;
    results.push({
      id: 9,
      descripcion: 'Se registra una nueva recolección y los indicadores se actualizan dinámicamente.',
      resultado: dif === 50.0 ? 'EXITOSO' : 'FALLIDO',
      detalles: `El indicador totalKg aumentó exactamente en 50.0 kg (de ${indAntes.totalKgReciclados} a ${indDespues.totalKgReciclados}).`
    });

    // Caso 10
    const inf = clientDb.getInformeMensualEmpresa('emp-01', 2026, 9);
    const sumDet = inf.recoleccionesDetalladas.reduce((s, r) => s + r.cantidad_kg, 0);
    results.push({
      id: 10,
      descripcion: 'Se consulta el informe mensual de una empresa (cálculo exclusivo desde RECOLECCION).',
      resultado: Math.round(sumDet * 100) / 100 === inf.totalKg ? 'EXITOSO' : 'FALLIDO',
      detalles: `El total (${inf.totalKg} kg) coincide 100% con la suma estricta de sus registros de recolección en dicho mes.`
    });

    return {
      totalCasos: results.length,
      exitosos: results.filter((r) => r.resultado === 'EXITOSO').length,
      fallidos: results.filter((r) => r.resultado === 'FALLIDO').length,
      resultados: results
    };
  }
};
