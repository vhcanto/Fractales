# SistemaFractales · Fractal Lab

Primera etapa de un prototipo administrativo construido con React, TypeScript, Vite, Tailwind CSS y Canvas 2D.

## Objetivo

La app muestra un dashboard oscuro y una sección **Fractal Lab** capaz de generar fractales visuales a partir de datos fijos definidos en arrays locales. No incluye login, backend, base de datos, formularios ni CRUD.

## Estructura principal

```txt
src/
  data/              # Arrays locales reemplazables después por Firestore/Supabase
  types/             # Interfaces TypeScript estrictas
  lib/               # Mapeo de medicamentos y motor fractal Canvas 2D
  components/        # UI reutilizable
  pages/             # Dashboard, Fractal Lab y Medicamentos
```

## Comandos

```bash
npm install
npm run dev
npm run build
```
