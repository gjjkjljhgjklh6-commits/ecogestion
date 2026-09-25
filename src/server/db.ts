import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  Usuario,
  Administrador,
  Reciclador,
  EmpresaAfiliada,
  TipoMaterial,
  Recoleccion,
  UserRole
} from '../types/index.js';

interface DatabaseSchema {
  usuarios: Usuario[];
  administradores: Administrador[];
  recicladores: Reciclador[];
  empresas: EmpresaAfiliada[];
  materiales: TipoMaterial[];
  recolecciones: Recoleccion[];
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'data', 'reciclaje_db.json');

function ensureDataDirectory() {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

class Database {
  private data: DatabaseSchema = {
    usuarios: [],
    administradores: [],
    recicladores: [],
    empresas: [],
    materiales: [],
    recolecciones: []
  };

  constructor() {
    this.init();
  }

  private init() {
    ensureDataDirectory();
    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Error loading database, re-seeding...', err);
      }
    }
    this.seedDefaultData();
  }

  private save() {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  private seedDefaultData() {
    const salt = bcrypt.genSaltSync(10);

    // 1. Create Default Administrator User
    const adminUserId = 'usr-admin-01';
    const adminUser: Usuario = {
      idUsuario: adminUserId,
      correo: 'admin@reciclaje.com',
      contrasena: bcrypt.hashSync('AdminPassword123!', salt),
      rol: 'ADMINISTRADOR',
      fechaCreacion: '2026-01-01T08:00:00.000Z'
    };

    const adminId = 'adm-01';
    const admin: Administrador = {
      idAdministrador: adminId,
      nombre: 'Administrador Principal (EcoGestión)',
      idUsuario: adminUserId
    };

    // 2. Create Reciclador 1
    const recUser1Id = 'usr-rec-01';
    const recUser1: Usuario = {
      idUsuario: recUser1Id,
      correo: 'carlos@reciclaje.com',
      contrasena: bcrypt.hashSync('Reciclador123!', salt),
      rol: 'RECICLADOR',
      fechaCreacion: '2026-01-10T09:00:00.000Z'
    };

    const rec1Id = 'rec-01';
    const rec1: Reciclador = {
      idReciclador: rec1Id,
      nombre: 'Carlos Mendoza',
      idUsuario: recUser1Id,
      idAdministrador: adminId
    };

    // 3. Create Reciclador 2
    const recUser2Id = 'usr-rec-02';
    const recUser2: Usuario = {
      idUsuario: recUser2Id,
      correo: 'maria@reciclaje.com',
      contrasena: bcrypt.hashSync('Reciclador123!', salt),
      rol: 'RECICLADOR',
      fechaCreacion: '2026-01-15T10:30:00.000Z'
    };

    const rec2Id = 'rec-02';
    const rec2: Reciclador = {
      idReciclador: rec2Id,
      nombre: 'María Elena Salazar',
      idUsuario: recUser2Id,
      idAdministrador: adminId
    };

    // 4. Create Empresas Afiliadas
    const empresas: EmpresaAfiliada[] = [
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
    ];

    // 5. Create Tipos de Material (with valid percentage 0 <= meta <= 100)
    const materiales: TipoMaterial[] = [
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
    ];

    // 6. Create Seed Recolecciones
    const recolecciones: Recoleccion[] = [
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
    ];

    this.data = {
      usuarios: [adminUser, recUser1, recUser2],
      administradores: [admin],
      recicladores: [rec1, rec2],
      empresas,
      materiales,
      recolecciones
    };

    this.save();
  }

  // =================== USUARIO & AUTH ===================

  public findUsuarioByCorreo(correo: string): Usuario | undefined {
    return this.data.usuarios.find(
      (u) => u.correo.toLowerCase() === correo.trim().toLowerCase()
    );
  }

  public findUsuarioById(idUsuario: string): Usuario | undefined {
    return this.data.usuarios.find((u) => u.idUsuario === idUsuario);
  }

  public createUsuario(data: { correo: string; contrasenaTextoPlano: string; rol: UserRole }): Usuario {
    const correoNormalizado = data.correo.trim().toLowerCase();

    // Regla: Correo UNIQUE
    if (this.findUsuarioByCorreo(correoNormalizado)) {
      throw new Error(`El correo ${data.correo} ya se encuentra registrado.`);
    }

    // Regla: Rol válido
    if (data.rol !== 'ADMINISTRADOR' && data.rol !== 'RECICLADOR') {
      throw new Error(`El rol '${data.rol}' no es válido. Debe ser ADMINISTRADOR o RECICLADOR.`);
    }

    // Regla: Contraseña segura (nunca en texto plano)
    if (!data.contrasenaTextoPlano || data.contrasenaTextoPlano.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(data.contrasenaTextoPlano, salt);

    const nuevoUsuario: Usuario = {
      idUsuario: 'usr-' + crypto.randomUUID(),
      correo: correoNormalizado,
      contrasena: hash,
      rol: data.rol,
      fechaCreacion: new Date().toISOString()
    };

    this.data.usuarios.push(nuevoUsuario);
    this.save();
    return nuevoUsuario;
  }

  // =================== ADMINISTRADOR ===================

  public getAdministradores(): Administrador[] {
    return [...this.data.administradores];
  }

  public findAdministradorById(idAdministrador: string): Administrador | undefined {
    return this.data.administradores.find((a) => a.idAdministrador === idAdministrador);
  }

  public findAdministradorByUsuarioId(idUsuario: string): Administrador | undefined {
    return this.data.administradores.find((a) => a.idUsuario === idUsuario);
  }

  public createAdministrador(nombre: string, idUsuario: string): Administrador {
    const user = this.findUsuarioById(idUsuario);
    if (!user) {
      throw new Error('El usuario especificado no existe.');
    }
    if (user.rol !== 'ADMINISTRADOR') {
      throw new Error('El usuario debe tener rol ADMINISTRADOR.');
    }

    const nuevoAdmin: Administrador = {
      idAdministrador: 'adm-' + crypto.randomUUID(),
      nombre: nombre.trim(),
      idUsuario
    };

    this.data.administradores.push(nuevoAdmin);
    this.save();
    return nuevoAdmin;
  }

  // =================== RECICLADOR ===================

  public getRecicladores(): Reciclador[] {
    return [...this.data.recicladores];
  }

  public findRecicladorById(idReciclador: string): Reciclador | undefined {
    return this.data.recicladores.find((r) => r.idReciclador === idReciclador);
  }

  public findRecicladorByUsuarioId(idUsuario: string): Reciclador | undefined {
    return this.data.recicladores.find((r) => r.idUsuario === idUsuario);
  }

  public createReciclador(params: {
    nombre: string;
    correo: string;
    contrasenaTextoPlano: string;
    idAdministrador: string;
  }): { reciclador: Reciclador; usuario: Usuario } {
    const admin = this.findAdministradorById(params.idAdministrador);
    if (!admin) {
      throw new Error('El administrador asociado no existe.');
    }

    // Create user with rol RECICLADOR
    const usuario = this.createUsuario({
      correo: params.correo,
      contrasenaTextoPlano: params.contrasenaTextoPlano,
      rol: 'RECICLADOR'
    });

    const reciclador: Reciclador = {
      idReciclador: 'rec-' + crypto.randomUUID(),
      nombre: params.nombre.trim(),
      idUsuario: usuario.idUsuario,
      idAdministrador: params.idAdministrador
    };

    this.data.recicladores.push(reciclador);
    this.save();
    return { reciclador, usuario };
  }

  public updateReciclador(idReciclador: string, updates: { nombre?: string; idAdministrador?: string }) {
    const rec = this.findRecicladorById(idReciclador);
    if (!rec) {
      throw new Error('Reciclador no encontrado.');
    }

    if (updates.nombre !== undefined) {
      if (!updates.nombre.trim()) throw new Error('El nombre no puede estar vacío.');
      rec.nombre = updates.nombre.trim();
    }

    if (updates.idAdministrador !== undefined) {
      const admin = this.findAdministradorById(updates.idAdministrador);
      if (!admin) throw new Error('El administrador asignado no existe.');
      rec.idAdministrador = updates.idAdministrador;
    }

    this.save();
    return rec;
  }

  /**
   * Regla obligatoria: No eliminar un reciclador que tenga recolecciones asociadas,
   * para conservar el histórico.
   */
  public deleteReciclador(idReciclador: string): boolean {
    const rec = this.findRecicladorById(idReciclador);
    if (!rec) {
      throw new Error('Reciclador no encontrado.');
    }

    const tieneRecolecciones = this.data.recolecciones.some(
      (r) => r.idReciclador === idReciclador
    );

    if (tieneRecolecciones) {
      throw new Error(
        'REGLA DE NEGOCIO: No es posible eliminar un reciclador que tenga recolecciones registradas, para conservar el histórico de recolecciones.'
      );
    }

    this.data.recicladores = this.data.recicladores.filter((r) => r.idReciclador !== idReciclador);
    this.data.usuarios = this.data.usuarios.filter((u) => u.idUsuario !== rec.idUsuario);
    this.save();
    return true;
  }

  // =================== EMPRESA_AFILIADA ===================

  public getEmpresas(): EmpresaAfiliada[] {
    return [...this.data.empresas];
  }

  public findEmpresaById(idEmpresa: string): EmpresaAfiliada | undefined {
    return this.data.empresas.find((e) => e.idEmpresa === idEmpresa);
  }

  public createEmpresa(data: { nombre: string; direccion: string; contacto: string }): EmpresaAfiliada {
    if (!data.nombre || !data.nombre.trim()) {
      throw new Error('El nombre de la empresa afiliada es obligatorio.');
    }
    if (!data.direccion || !data.direccion.trim()) {
      throw new Error('La dirección de la empresa es obligatoria.');
    }
    if (!data.contacto || !data.contacto.trim()) {
      throw new Error('Los datos de contacto son obligatorios.');
    }

    const nuevaEmpresa: EmpresaAfiliada = {
      idEmpresa: 'emp-' + crypto.randomUUID(),
      nombre: data.nombre.trim(),
      direccion: data.direccion.trim(),
      contacto: data.contacto.trim()
    };

    this.data.empresas.push(nuevaEmpresa);
    this.save();
    return nuevaEmpresa;
  }

  public updateEmpresa(
    idEmpresa: string,
    updates: { nombre?: string; direccion?: string; contacto?: string }
  ): EmpresaAfiliada {
    const emp = this.findEmpresaById(idEmpresa);
    if (!emp) throw new Error('Empresa no encontrada.');

    if (updates.nombre !== undefined) emp.nombre = updates.nombre.trim();
    if (updates.direccion !== undefined) emp.direccion = updates.direccion.trim();
    if (updates.contacto !== undefined) emp.contacto = updates.contacto.trim();

    this.save();
    return emp;
  }

  // =================== TIPO_MATERIAL ===================

  public getMateriales(): TipoMaterial[] {
    return [...this.data.materiales];
  }

  public findMaterialById(idMaterial: string): TipoMaterial | undefined {
    return this.data.materiales.find((m) => m.idMaterial === idMaterial);
  }

  public createMaterial(data: { nombre_material: string; porcentaje_meta: number }): TipoMaterial {
    if (!data.nombre_material || !data.nombre_material.trim()) {
      throw new Error('El nombre del tipo de material es obligatorio.');
    }

    // Regla: 0 <= porcentaje_meta <= 100
    if (
      typeof data.porcentaje_meta !== 'number' ||
      isNaN(data.porcentaje_meta) ||
      data.porcentaje_meta < 0 ||
      data.porcentaje_meta > 100
    ) {
      throw new Error('El porcentaje_meta debe ser un número comprendido entre 0 y 100.');
    }

    const nuevoMaterial: TipoMaterial = {
      idMaterial: 'mat-' + crypto.randomUUID(),
      nombre_material: data.nombre_material.trim(),
      porcentaje_meta: Number(data.porcentaje_meta)
    };

    this.data.materiales.push(nuevoMaterial);
    this.save();
    return nuevoMaterial;
  }

  public updateMaterial(
    idMaterial: string,
    updates: { nombre_material?: string; porcentaje_meta?: number }
  ): TipoMaterial {
    const mat = this.findMaterialById(idMaterial);
    if (!mat) throw new Error('Tipo de material no encontrado.');

    if (updates.nombre_material !== undefined) {
      if (!updates.nombre_material.trim()) throw new Error('El nombre no puede estar vacío.');
      mat.nombre_material = updates.nombre_material.trim();
    }

    if (updates.porcentaje_meta !== undefined) {
      const p = Number(updates.porcentaje_meta);
      if (isNaN(p) || p < 0 || p > 100) {
        throw new Error('El porcentaje_meta debe ser un número comprendido entre 0 y 100.');
      }
      mat.porcentaje_meta = p;
    }

    this.save();
    return mat;
  }

  // =================== RECOLECCION ===================

  public getRecolecciones(filters?: {
    mes?: string; // YYYY-MM
    anio?: string; // YYYY
    idEmpresa?: string;
    idReciclador?: string;
    idMaterial?: string;
  }): Recoleccion[] {
    let result = [...this.data.recolecciones];

    if (filters?.mes) {
      result = result.filter((r) => r.fecha.startsWith(filters.mes!));
    }
    if (filters?.anio) {
      result = result.filter((r) => r.fecha.startsWith(filters.anio!));
    }
    if (filters?.idEmpresa) {
      result = result.filter((r) => r.idEmpresa === filters.idEmpresa);
    }
    if (filters?.idReciclador) {
      result = result.filter((r) => r.idReciclador === filters.idReciclador);
    }
    if (filters?.idMaterial) {
      result = result.filter((r) => r.idMaterial === filters.idMaterial);
    }

    // Sort descending by date
    return result.sort((a, b) => (a.fecha > b.fecha ? -1 : 1));
  }

  public createRecoleccion(data: {
    fecha: string;
    cantidad_kg: number;
    idReciclador: string;
    idEmpresa: string;
    idMaterial: string;
  }): Recoleccion {
    // Validacion: fecha NOT NULL
    if (!data.fecha || !data.fecha.trim()) {
      throw new Error('VALIDACIÓN OBLIGATORIA: La fecha de recolección es requerida (NOT NULL).');
    }

    // Validacion: cantidad_kg > 0
    const cantidad = Number(data.cantidad_kg);
    if (isNaN(cantidad) || cantidad <= 0) {
      throw new Error('VALIDACIÓN OBLIGATORIA: La cantidad_kg debe ser estrictamente mayor a 0 (cantidad_kg > 0).');
    }

    // Validacion: idReciclador debe existir
    const reciclador = this.findRecicladorById(data.idReciclador);
    if (!reciclador) {
      throw new Error('VALIDACIÓN: El reciclador indicado no existe en el sistema.');
    }

    // Validacion: idEmpresa debe existir
    const empresa = this.findEmpresaById(data.idEmpresa);
    if (!empresa) {
      throw new Error('VALIDACIÓN: La empresa afiliada indicada no existe en el sistema.');
    }

    // Validacion: idMaterial debe existir
    const material = this.findMaterialById(data.idMaterial);
    if (!material) {
      throw new Error('VALIDACIÓN: El tipo de material indicado no existe en el sistema.');
    }

    const nuevaRecoleccion: Recoleccion = {
      idRecoleccion: 'rec-reg-' + crypto.randomUUID().slice(0, 8),
      fecha: data.fecha.trim(),
      cantidad_kg: Math.round(cantidad * 100) / 100,
      idReciclador: data.idReciclador,
      idEmpresa: data.idEmpresa,
      idMaterial: data.idMaterial
    };

    this.data.recolecciones.push(nuevaRecoleccion);
    this.save();
    return nuevaRecoleccion;
  }

  // =================== INDICADORES DINÁMICOS ===================

  /**
   * Calcula dinámicamente los indicadores del Administrador sin almacenar datos fijos.
   * Regla de negocio: SUM(cantidad_kg), participación calculada al vuelo.
   */
  public getIndicadoresAdmin(filters?: { mes?: string; idEmpresa?: string; idReciclador?: string }): {
    totalKgReciclados: number;
    totalRecolecciones: number;
    recicladoresActivos: number;
    empresasAtendidas: number;
    participacionMateriales: {
      idMaterial: string;
      nombre_material: string;
      total_kg: number;
      porcentaje: number;
      porcentaje_meta: number;
    }[];
    evolucionMensual: {
      mes: string;
      total_kg: number;
      total_recolecciones: number;
    }[];
    ingresosGenerados: {
      estado: 'PENDIENTE_DE_DEFINICION';
      mensaje: string;
    };
  } {
    const recs = this.getRecolecciones(filters);

    const totalKgReciclados = Math.round(recs.reduce((acc, r) => acc + r.cantidad_kg, 0) * 100) / 100;
    const totalRecolecciones = recs.length;

    const activeRecIds = new Set(recs.map((r) => r.idReciclador));
    const activeEmpIds = new Set(recs.map((r) => r.idEmpresa));

    // Material participation dynamic calculation
    const materiales = this.getMateriales();
    const participacionMateriales = materiales.map((m) => {
      const kgMaterial = recs
        .filter((r) => r.idMaterial === m.idMaterial)
        .reduce((sum, r) => sum + r.cantidad_kg, 0);

      const porcentaje = totalKgReciclados > 0 ? (kgMaterial / totalKgReciclados) * 100 : 0;

      return {
        idMaterial: m.idMaterial,
        nombre_material: m.nombre_material,
        total_kg: Math.round(kgMaterial * 100) / 100,
        porcentaje: Math.round(porcentaje * 10) / 10,
        porcentaje_meta: m.porcentaje_meta
      };
    });

    // Monthly evolution dynamic aggregation
    const monthlyMap: { [mes: string]: { total_kg: number; total_recolecciones: number } } = {};
    for (const r of this.data.recolecciones) {
      const mesKey = r.fecha.slice(0, 7); // YYYY-MM
      if (!monthlyMap[mesKey]) {
        monthlyMap[mesKey] = { total_kg: 0, total_recolecciones: 0 };
      }
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
        mensaje:
          'PENDIENTE DE DEFINICIÓN: El informe técnico especifica expresamente que no define una fórmula de cálculo para los ingresos generados. Por lo tanto, no se inventa una fórmula y queda reservado para la definición del cliente.'
      }
    };
  }

  /**
   * Resumen mensual dinámico para el Reciclador.
   * Regla de negocio: La recolección debe estar asociada exclusivamente al reciclador autenticado.
   * Ganancia: PENDIENTE DE DEFINICIÓN.
   */
  public getResumenReciclador(idReciclador: string, mesParam?: string) {
    const reciclador = this.findRecicladorById(idReciclador);
    if (!reciclador) throw new Error('Reciclador no encontrado.');

    const now = new Date();
    const currentMonth = mesParam || now.toISOString().slice(0, 7); // YYYY-MM

    // All collections of this recycler
    const allRecs = this.data.recolecciones.filter((r) => r.idReciclador === idReciclador);
    const monthRecs = allRecs.filter((r) => r.fecha.startsWith(currentMonth));

    const totalKgMes = Math.round(monthRecs.reduce((sum, r) => sum + r.cantidad_kg, 0) * 100) / 100;
    const totalKgHistorico = Math.round(allRecs.reduce((sum, r) => sum + r.cantidad_kg, 0) * 100) / 100;

    // Desglose por material
    const materiales = this.getMateriales();
    const desgloseMateriales = materiales.map((m) => {
      const kg = monthRecs
        .filter((r) => r.idMaterial === m.idMaterial)
        .reduce((sum, r) => sum + r.cantidad_kg, 0);
      return {
        idMaterial: m.idMaterial,
        nombre_material: m.nombre_material,
        total_kg: Math.round(kg * 100) / 100
      };
    });

    // Desglose por empresa
    const empresas = this.getEmpresas();
    const desgloseEmpresas = empresas
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
      idReciclador,
      nombre: reciclador.nombre,
      mesConsulta: currentMonth,
      totalKgMes,
      totalRecoleccionesMes: monthRecs.length,
      totalKgHistorico,
      desgloseMateriales,
      desgloseEmpresas,
      ganancia: {
        estado: 'PENDIENTE_DE_DEFINICION',
        mensaje:
          'PENDIENTE DE DEFINICIÓN: El informe técnico establece: "El documento no define la fórmula de cálculo de la ganancia; esta debe definirse antes de implementar el cálculo." Se mantiene la estructura extensible sin inventar valores económicos.'
      }
    };
  }

  /**
   * Informe mensual de cada empresa afiliada.
   * Regla obligatoria: "El informe debe calcularse exclusivamente a partir de las recolecciones registradas en el sistema. No utilizar información externa ni datos introducidos manualmente para alterar el total."
   */
  public getInformeMensualEmpresa(idEmpresa: string, anio: number, mes: number) {
    const empresa = this.findEmpresaById(idEmpresa);
    if (!empresa) throw new Error('Empresa no encontrada.');

    const mesStr = mes.toString().padStart(2, '0');
    const prefix = `${anio}-${mesStr}`;

    // Calculado EXCLUSIVAMENTE a partir de los registros de RECOLECCION
    const recs = this.data.recolecciones.filter(
      (r) => r.idEmpresa === idEmpresa && r.fecha.startsWith(prefix)
    );

    const totalKg = Math.round(recs.reduce((acc, r) => acc + r.cantidad_kg, 0) * 100) / 100;
    const totalRecolecciones = recs.length;

    const materiales = this.getMateriales();
    const recicladores = this.getRecicladores();

    const desglosePorMaterial = materiales.map((m) => {
      const kg = recs
        .filter((r) => r.idMaterial === m.idMaterial)
        .reduce((sum, r) => sum + r.cantidad_kg, 0);
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
      const rec = recicladores.find((rc) => rc.idReciclador === r.idReciclador);
      const mat = materiales.find((m) => m.idMaterial === r.idMaterial);
      return {
        idRecoleccion: r.idRecoleccion,
        fecha: r.fecha,
        recicladorNombre: rec?.nombre || 'Reciclador Desconocido',
        materialNombre: mat?.nombre_material || 'Material Desconocido',
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
      totalRecolecciones,
      desglosePorMaterial,
      recoleccionesDetalladas,
      fuenteExclusiva: 'RECOLECCION' as const
    };
  }

  // Reset database to seed (used for testing or reset)
  public resetToSeed() {
    this.seedDefaultData();
    return true;
  }
}

export const db = new Database();
