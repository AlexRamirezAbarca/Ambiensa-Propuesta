-- SCRIPT INCREMENTAL 007: ACTUALIZACIÓN RLS PARA GESTIÓN DE PROYECTOS
-- Requerimiento: Administrador y Supervisor pasan a modo lectura (viewer).
-- El Fiscalizador toma el control (ALL) para crear proyectos y asignar lotes.

----------------------------------------------
-- 1. LIMPIAR POLÍTICAS ANTERIORES
----------------------------------------------
DROP POLICY IF EXISTS "Admins y Supervisores pueden gestionar proyectos" ON public.proyectos;
DROP POLICY IF EXISTS "Admins y Supervisores pueden gestionar lotes" ON public.lotes_unidades;

----------------------------------------------
-- 2. POLÍTICAS DE GESTIÓN TOTAL (INSERT, UPDATE, DELETE) -> FISCALIZADOR
----------------------------------------------
-- Nota: La política SELECT general ("Usuarios autenticados pueden ver proyectos")
-- ya existe y se encarga de la visualización para admin/supervisor/etc.

CREATE POLICY "Fiscalizadores pueden gestionar proyectos íntegramente" 
ON public.proyectos FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.nombre = 'fiscalizador'
  )
);

CREATE POLICY "Fiscalizadores pueden gestionar lotes de forma general" 
ON public.lotes_unidades FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.nombre = 'fiscalizador'
  )
);

----------------------------------------------
-- 3. AUDITORÍA
----------------------------------------------
COMMENT ON POLICY "Fiscalizadores pueden gestionar proyectos íntegramente" ON public.proyectos IS 'Los fiscalizadores ahora son los encargados operativos de crear los proyectos y urbanizaciones para prepararlos para los contratistas.';
