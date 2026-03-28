# demo-ambiensa

Monorepo ERP/SaaS para **Ambiensa** — Constructora líder en Ecuador 🇪🇨

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend / PWA** | Next.js 14 + TypeScript + Tailwind CSS |
| **Backend / API** | NestJS + TypeScript |
| **Base de Datos** | PostgreSQL (Supabase) + Redis |
| **Cola de Jobs** | BullMQ (exports Excel pesados) |
| **Deploy Demo** | Railway / Supabase |
| **Monorepo** | Turborepo |

## Estructura

```
demo-ambiensa/
├── apps/
│   ├── web/     → Next.js (PWA + Dashboard)
│   └── api/     → NestJS (REST API)
├── packages/
│   ├── ui/      → Componentes compartidos
│   └── types/   → TypeScript types compartidos
```

## Comandos

```bash
# Instalar dependencias
npm install

# Levantar todo en desarrollo
npm run dev

# Solo frontend
cd apps/web && npm run dev

# Solo backend
cd apps/api && npm run start:dev
```

## Módulos del ERP (Roadmap)

- [ ] Autenticación / Roles (JWT + RBAC)
- [ ] Dashboard principal con KPIs de obra
- [ ] Gestión de Proyectos de construcción
- [ ] Presupuesto y control de costos
- [ ] Gestión de proveedores
- [ ] Reportes y exportación Excel
- [ ] Notificaciones en tiempo real
- [ ] Multi-tenant (por empresa/proyecto)