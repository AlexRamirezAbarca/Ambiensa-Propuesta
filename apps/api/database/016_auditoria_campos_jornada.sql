-- SCRIPT INCREMENTAL 016: CAMPOS DE AUDITORÍA PARA CONTRALORÍA
-- Objetivo: Permitir que Contraloría guarde el estado de aprobación sin afectar el flujo de cierre del contratista.

-- 1. Añadir columnas de auditoría a jornadas_diarias
ALTER TABLE public.jornadas_diarias 
ADD COLUMN IF NOT EXISTS auditoria_estado VARCHAR(20) DEFAULT 'pendiente' NOT NULL, -- 'pendiente', 'aprobado', 'observado'
ADD COLUMN IF NOT EXISTS auditoria_observaciones TEXT,
ADD COLUMN IF NOT EXISTS auditado_por UUID REFERENCES public.usuarios(id),
ADD COLUMN IF NOT EXISTS fecha_auditoria TIMESTAMP WITH TIME ZONE;

-- 2. Crear un índice para mejorar la velocidad de búsqueda por estado de auditoría
CREATE INDEX IF NOT EXISTS idx_jornadas_auditoria ON public.jornadas_diarias(auditoria_estado);

-- Nota: Ahora los botones de 'Aprobar' y 'Rechazar' actualizarán 'auditoria_estado',
-- permitiendo que la gestión del contratista permanezca 'cerrada' para historial, 
-- pero 'aprobada' para pago.
