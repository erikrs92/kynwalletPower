# Quickstart: Pantalla de Inicio de Sesión de KynWallet

Guía para ejecutar la demo localmente y validar la funcionalidad de punta a punta.

## Prerrequisitos

- Node.js 20 LTS o superior y npm 10 o superior.

## Configuración

```bash
npm install
cp .env.example .env.local
```

Edita `.env.local` y define al menos una cuenta ficticia en `VITE_DEMO_USERS`, con el formato
descrito en [contracts/auth-gateway.md](./contracts/auth-gateway.md#configuración-vite_demo_users).
`.env.local` no se versiona (Constitución 5.3).

> En una aplicación solo-cliente, el contenido de `VITE_DEMO_USERS` queda incluido en el bundle
> compilado. Usa únicamente cuentas ficticias.

## Ejecutar

```bash
npm run dev        # servidor de desarrollo en http://localhost:5173
npm run build      # build de producción en dist/
npm run preview    # sirve el build
```

## Verificar calidad (Constitución 9.4)

```bash
npm run verify     # lint, typecheck, test:coverage, build, audit:deps, audit:licenses, scan:secrets
```

Resultado esperado: todos los pasos terminan con código 0 y la cobertura es ≥ 80 %.

## Escenarios de validación manual

Siendo `<correo>` y `<contraseña>` una cuenta definida en `.env.local`:

| # | Acción | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Ingresar `<correo>` y `<contraseña>` y presionar "Iniciar sesión" | Botón en carga ~1 s; luego la vista "¡Bienvenido, {nombre}!" con "Cerrar sesión" | US1-1, US1-2 |
| 2 | Presionar "Cerrar sesión" | Vuelve el formulario vacío | US1-5 |
| 3 | `<correo>` en mayúsculas y con espacios, contraseña correcta | Acceso exitoso | US1-3 |
| 4 | `<correo>` con una contraseña incorrecta de 8+ caracteres | "Correo o contraseña incorrectos"; correo conservado, contraseña vacía y con el foco | US2-1, US2-4 |
| 5 | Correo inexistente | El mismo mensaje que en el escenario 4 | US2-2 |
| 6 | Enviar con los campos vacíos | Errores en ambos campos; foco en el correo | US3-1 |
| 7 | Escribir "usuario@" y salir del campo | "Ingresa un correo electrónico válido" | US3-2 |
| 8 | Contraseña "1234567" | "La contraseña debe tener al menos 8 caracteres" | US3-3 |
| 9 | Activar el icono de visibilidad | Se muestra y se oculta la contraseña | US4 |
| 10 | Presionar Google, Apple o "¿Olvidaste…?" (en `/login`) | "Función no disponible en esta demostración". "Regístrate" navega a `/registro` (spec 002) | US5-1 |
| 11 | Borrar `VITE_DEMO_USERS` y reiniciar `npm run dev`; intentar acceder | "Servicio de acceso no disponible. Intenta más tarde." | Caso límite |
| 12 | Reducir la ventana a 320px | Sin scroll horizontal; logo visible; formulario usable | FR-018 |
| 13 | Recorrer la pantalla solo con Tab y Enter | Orden según [contracts/ui-login.md](./contracts/ui-login.md#teclado); foco visible | FR-014 |
