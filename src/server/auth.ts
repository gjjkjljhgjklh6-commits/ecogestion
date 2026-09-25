import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import { Usuario, UserRole } from '../types/index.js';

interface SessionData {
  idUsuario: string;
  correo: string;
  rol: UserRole;
  expiresAt: number;
}

// In-memory token store with 24h validity
const sessions = new Map<string, SessionData>();

export function generateToken(usuario: Usuario): string {
  const token = 'tok_' + crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  sessions.set(token, {
    idUsuario: usuario.idUsuario,
    correo: usuario.correo,
    rol: usuario.rol,
    expiresAt
  });

  return token;
}

export function verifySession(token: string): SessionData | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    idUsuario: string;
    correo: string;
    rol: UserRole;
    perfilId: string; // idAdministrador or idReciclador
    nombre: string;
  };
}

/**
 * Middleware: Requires any authenticated user
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'ACCESO NO AUTORIZADO: Se requiere un token de sesión válido (Bearer token).'
    });
  }

  const token = authHeader.substring(7).trim();
  const session = verifySession(token);
  if (!session) {
    return res.status(401).json({
      error: 'SESIÓN INVÁLIDA O EXPIRADA: Inicie sesión nuevamente desde la pantalla de login único.'
    });
  }

  const usuario = db.findUsuarioById(session.idUsuario);
  if (!usuario) {
    return res.status(401).json({ error: 'Usuario no encontrado en la base de datos.' });
  }

  // Load operational profile
  let perfilId = '';
  let nombre = '';

  if (usuario.rol === 'ADMINISTRADOR') {
    const admin = db.findAdministradorByUsuarioId(usuario.idUsuario);
    if (!admin) {
      return res.status(403).json({ error: 'Perfil de administrador no asociado a este usuario.' });
    }
    perfilId = admin.idAdministrador;
    nombre = admin.nombre;
  } else if (usuario.rol === 'RECICLADOR') {
    const reciclador = db.findRecicladorByUsuarioId(usuario.idUsuario);
    if (!reciclador) {
      return res.status(403).json({ error: 'Perfil de reciclador no asociado a este usuario.' });
    }
    perfilId = reciclador.idReciclador;
    nombre = reciclador.nombre;
  }

  req.user = {
    idUsuario: usuario.idUsuario,
    correo: usuario.correo,
    rol: usuario.rol,
    perfilId,
    nombre
  };

  next();
}

/**
 * Middleware: Requires ADMINISTRADOR role
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.rol !== 'ADMINISTRADOR') {
      return res.status(403).json({
        error: 'CONTROL DE ACCESO: Endpoint exclusivo para ADMINISTRADOR. Su rol no tiene los privilegios necesarios.'
      });
    }
    next();
  });
}

/**
 * Middleware: Requires RECICLADOR role
 */
export function requireReciclador(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.rol !== 'RECICLADOR') {
      return res.status(403).json({
        error: 'CONTROL DE ACCESO: Endpoint exclusivo para RECICLADOR. Su rol no tiene acceso a esta función operativa.'
      });
    }
    next();
  });
}
