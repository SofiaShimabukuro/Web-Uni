# Web-Uni · frontend

React + Vite + TypeScript + MUI. SPA que consume la API de
`backend/` (Django REST Framework) por sesión (cookies + CSRF), no por
token — ver `src/api/client.ts`.

## Setup local

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL debe apuntar al backend (default http://localhost:8000/api)
npm run dev
```

El backend tiene que estar corriendo en paralelo (ver `backend/README.md`)
con `CORS_ALLOWED_ORIGINS`/`CSRF_TRUSTED_ORIGINS` incluyendo
`http://localhost:5173`.

## Estructura

- `src/api/` — cliente axios (`client.ts`, con CSRF vía cookie
  `csrftoken`) y funciones tipadas por dominio (`auth.ts`, `cursos.ts`).
- `src/auth/AuthContext.tsx` — sesión actual (`usuario`, `login`, `logout`),
  resuelta contra `/api/auth/me/`.
- `src/components/RutaProtegida.tsx` — redirige a `/login` si no hay sesión.
- `src/pages/` — `LoginPage`, `DashboardPage` (panel del alumno: "mis
  comisiones" desde `/api/inscripciones/`), `ComisionDetailPage` (módulos,
  recursos y entregas de una comisión).

## Estado actual

Login + panel del alumno funcionando de punta a punta contra el backend
real (probado con Playwright). Todavía no hay pantallas para docente/
administrativo ni para el módulo de productividad (hábitos, repaso
espaciado, autoevaluaciones) — consumen la misma API ya expuesta en
`backend/productividad`, falta construir la UI.
