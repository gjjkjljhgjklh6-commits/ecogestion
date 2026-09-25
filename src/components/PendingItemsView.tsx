import React from 'react';
import { HelpCircle, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';

export const PendingItemsView: React.FC = () => {
  const pendingAspects = [
    {
      id: 1,
      titulo: 'Fórmula de ganancia del reciclador',
      documentoRef: 'Sección 6, 9 y 12',
      estado: 'PENDIENTE DE DEFINICIÓN',
      tratamiento:
        'No se inventa fórmula ni valores económicos. El panel del reciclador y la API exponen la sección identificada claramente con la etiqueta de pendiente y su estructura de datos lista para consumir la regla cuando sea acordada.'
    },
    {
      id: 2,
      titulo: 'Fórmula exacta de ingresos generados para la empresa de reciclaje',
      documentoRef: 'Sección 5, 9 y 12',
      estado: 'PENDIENTE DE DEFINICIÓN',
      tratamiento:
        'El dashboard administrativo muestra la tarjeta de "Ingresos Generados" con indicación explícita de pendiente sin valores ficticios ni simulados.'
    },
    {
      id: 3,
      titulo: 'Uso y cálculo exacto de porcentaje_meta en TIPO_MATERIAL',
      documentoRef: 'Sección 3, 8 y 12',
      estado: 'IMPLEMENTADO CAMPO + PENDIENTE REGLA DE CONSUMO',
      tratamiento:
        'Se valida estrictamente que 0 <= porcentaje_meta <= 100 en la base de datos y CRUD. En el dashboard se compara visualmente con la participación real, dejando señalizado que la regla de penalización/bonificación o alerta está pendiente de definir.'
    },
    {
      id: 4,
      titulo: 'Permisos detallados del administrador',
      documentoRef: 'Sección 12',
      estado: 'PENDIENTE DE DEFINICIÓN',
      tratamiento:
        'Actualmente el rol ADMINISTRADOR tiene control total sobre recicladores, materiales, empresas y consulta global de recolecciones, preparado para sub-roles si el cliente lo solicita.'
    },
    {
      id: 5,
      titulo: 'Acceso directo de empresas afiliadas al sistema',
      documentoRef: 'Sección 7 y 12',
      estado: 'PREPARADO CONCEPTUALMENTE',
      tratamiento:
        'Actualmente las empresas consultan a través del administrador o panel de informes. Si se habilita el rol EMPRESA_AFILIADA, se integrará al mismo login único sin crear un login separado.'
    },
    {
      id: 6,
      titulo: 'Formato exacto de los reportes',
      documentoRef: 'Sección 12',
      estado: 'PENDIENTE DE DEFINICIÓN',
      tratamiento:
        'Se proporciona vista tabular detallada y estructurada calculada exclusivamente con la tabla RECOLECCION conforme al criterio principal.'
    },
    {
      id: 7,
      titulo: 'Formato de descarga de reportes (PDF, Excel u otro)',
      documentoRef: 'Sección 12',
      estado: 'PENDIENTE DE DEFINICIÓN',
      tratamiento:
        'Se implementa exportación estándar descargable a CSV y vista limpia optimizada para impresión (Print/PDF del navegador), preparado para motores binarios PDF/Excel.'
    },
    {
      id: 8,
      titulo: 'Recuperación y cambio de contraseña',
      documentoRef: 'Sección 12',
      estado: 'PENDIENTE DE DEFINICIÓN',
      tratamiento:
        'Las contraseñas se almacenan mediante hash seguro (bcrypt). El flujo de auto-recuperación por correo SMTP queda documentado para Fase posterior.'
    },
    {
      id: 9,
      titulo: 'Auditoría de modificaciones',
      documentoRef: 'Sección 12',
      estado: 'PENDIENTE DE DEFINICIÓN',
      tratamiento:
        'La base de datos preserva el histórico impidiendo el borrado de recicladores con recolecciones asociadas. Los logs de modificaciones adicionales se integrarán según especificación.'
    }
  ];

  const complianceMatrix = [
    {
      requisito: 'Login Único Centralizado',
      estado: 'IMPLEMENTADO',
      ubicacion: 'src/components/LoginView.tsx, src/server/routes.ts (/api/auth/login)',
      observaciones: 'Un solo formulario de login para Administrador y Reciclador centralizado en USUARIO con hash bcrypt.'
    },
    {
      requisito: 'Entidades y Esquema Relacional',
      estado: 'IMPLEMENTADO',
      ubicacion: 'src/server/db.ts, src/types/index.ts',
      observaciones: 'USUARIO, ADMINISTRADOR, RECICLADOR, EMPRESA_AFILIADA, TIPO_MATERIAL, RECOLECCION con todas sus FKs.'
    },
    {
      requisito: 'Asociación Automática del Reciclador en Recolecciones',
      estado: 'IMPLEMENTADO',
      ubicacion: 'src/components/RecyclerPanel.tsx, src/server/routes.ts (POST /recolecciones)',
      observaciones: 'El backend y frontend asignan estrictamente idReciclador de la sesión autenticada; no se permite elegir otro.'
    },
    {
      requisito: 'Validación cantidad_kg > 0',
      estado: 'IMPLEMENTADO',
      ubicacion: 'src/server/db.ts, src/components/RecyclerPanel.tsx',
      observaciones: 'Rechaza cualquier registro menor o igual a 0 kg en backend y cliente.'
    },
    {
      requisito: 'Validación fecha NOT NULL',
      estado: 'IMPLEMENTADO',
      ubicacion: 'src/server/db.ts, src/components/RecyclerPanel.tsx',
      observaciones: 'Rechaza registros con fecha vacía o nula.'
    },
    {
      requisito: 'Validación 0 <= porcentaje_meta <= 100',
      estado: 'IMPLEMENTADO',
      ubicacion: 'src/server/db.ts, src/server/routes.ts (/api/materiales)',
      observaciones: 'Control estricto tanto en creación como edición de tipos de material.'
    },
    {
      requisito: 'Regla de Histórico: No eliminar reciclador con recolecciones',
      estado: 'IMPLEMENTADO',
      ubicacion: 'src/server/db.ts (deleteReciclador), src/server/routes.ts',
      observaciones: 'Bloquea el borrado y lanza error explícito si el reciclador tiene recolecciones registradas.'
    },
    {
      requisito: 'Indicadores Dinámicos (Sin valores fijos)',
      estado: 'IMPLEMENTADO',
      ubicacion: 'src/server/db.ts (getIndicadoresAdmin), src/components/AdminPanel.tsx',
      observaciones: 'Calculados con SUM(cantidad_kg) y filtros en tiempo real sobre la tabla RECOLECCION.'
    },
    {
      requisito: 'Informe Mensual de Empresa exclusivo de RECOLECCION',
      estado: 'IMPLEMENTADO',
      ubicacion: 'src/server/db.ts (getInformeMensualEmpresa), src/components/AdminPanel.tsx',
      observaciones: 'Calculado 100% desde la tabla RECOLECCION sin fuentes externas ni datos fijos.'
    },
    {
      requisito: 'Fórmula de ganancia del reciclador',
      estado: 'PENDIENTE DE DEFINICIÓN',
      ubicacion: 'src/components/RecyclerPanel.tsx (Sección Ganancia)',
      observaciones: 'Identificado claramente según especificación técnica. Sin invención de fórmulas económicas.'
    },
    {
      requisito: 'Fórmula exacta de ingresos generados',
      estado: 'PENDIENTE DE DEFINICIÓN',
      ubicacion: 'src/components/AdminPanel.tsx (Tarjeta Ingresos)',
      observaciones: 'Tarjeta señalizada como pendiente de definición según indica la Sección 9 y 12 del documento.'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header card */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Aspectos Pendientes de Definición (Especificación Técnica)
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Conforme a la regla principal del proyecto: <em>"Cuando encuentres un aspecto que el documento indique como pendiente o no definido, NO inventes una solución definitiva. Déjalo claramente identificado como pendiente y utiliza una estructura que permita implementarlo posteriormente."</em>
            </p>
          </div>
        </div>
      </div>

      {/* Grid of pending items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingAspects.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-slate-600 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-400">PUNTO #{item.id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/80">
                  {item.estado}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{item.titulo}</h3>
              <p className="text-xs text-slate-400 mb-3">Ref. Documental: {item.documentoRef}</p>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                {item.tratamiento}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Matrix */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">
            Matriz de Trazabilidad y Cumplimiento (Checklist de Requisitos)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="py-3 px-3">REQUISITO</th>
                <th className="py-3 px-3">ESTADO</th>
                <th className="py-3 px-3">UBICACIÓN EN EL SISTEMA</th>
                <th className="py-3 px-3">OBSERVACIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-750">
              {complianceMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-750/30 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">{row.requisito}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {row.estado === 'IMPLEMENTADO' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        IMPLEMENTADO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                        <Clock className="w-3 h-3" />
                        {row.estado}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{row.ubicacion}</td>
                  <td className="py-3 px-3 text-slate-300">{row.observaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
