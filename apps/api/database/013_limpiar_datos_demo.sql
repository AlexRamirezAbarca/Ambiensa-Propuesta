-- ==========================================================
-- SCRIPT 013: LIMPIEZA DE DATOS DEMO (CONTRATISTA)
-- Objetivo: Borrar toda la gestión de pruebas para presentación
-- ==========================================================

-- 1. Borrar los rubros planificados (links entre jornadas y presupuesto)
DELETE FROM public.jornada_items;

-- 2. Borrar las jornadas diarias (el "contenedor" del día)
DELETE FROM public.jornadas_diarias;

-- 3. Borrar los avances diarios (aperturas y cierres con fotos/GPS)
DELETE FROM public.avances_diarios;

-- REINICIO DE ESTADO:
-- Al ejecutar esto, el dashboard de Inicio mostrará "Pendiente" 
-- y la sección de Tareas mostrará el botón "Planificar Día de Trabajo".
