# CheckAuto

CheckAuto es una aplicación web para gestionar vehículos, mantenimientos y registros de servicio.

## Características

- Gestión de vehículos (crear, editar, eliminar)
- Registro y historial de mantenimientos
- Alertas y puntuación de salud del vehículo
- Integración con Firebase (configurable)

## Requisitos

- Node.js 18+ y npm

## Instalación (local)

1. Clona el repositorio o cópialo localmente.
2. Instala dependencias:

```bash
npm install
```

3. Crea un archivo de configuración de Firebase si corresponde en `services/firebase.ts`.

## Scripts útiles

- `npm run dev`  Ejecuta la app en modo desarrollo (Vite).
- `npm run build`  Construye la app para producción.
- `npm run preview`  Previsualiza la build.

Ejemplo:

```bash
npm run dev
```

## Estructura notable

- `App.tsx`  Punto de entrada de la app.
- `components/`  Componentes React reutilizables.
- `views/`  Vistas principales: `Garage`, `History`, `Settings`, `VehicleDetail`.
- `services/`  Integraciones (Firebase, DB, i18n, theme).

## Contribuir

1. Crea un branch por feature: `git checkout -b feat/nombre-feature`.
2. Haz commits claros y abre un pull request.

## Licencia y contacto

Este proyecto pertenece al usuario `Ayusox`. Para preguntas o mejoras, contacta al propietario del repositorio.
