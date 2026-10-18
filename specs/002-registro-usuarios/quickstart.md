# Quickstart: Pantalla de Registro de Usuarios de KynWallet

Guía para ejecutar la demo localmente y validar el registro de punta a punta. La preparación es la
misma del login: ver [`001-login-billetera/quickstart.md`](../001-login-billetera/quickstart.md).

## Prerrequisitos

- Node.js 20 LTS o superior y npm 10 o superior.
- Al menos una cuenta ficticia en `.env.local` (`VITE_DEMO_USERS`), igual que en el login. Sin
  esa configuración el login y el registro responden "servicio no disponible".

## Ejecutar

```bash
npm install
cp .env.example .env.local   # solo la primera vez; define una cuenta ficticia
npm run dev                  # http://localhost:5173/login  y  http://localhost:5173/registro
npm run verify               # lint, format, typecheck, test:coverage, build, audits y secretos
```

`npm run preview` sirve el build y también responde con `index.html` ante `/registro`. Un
despliegue estático propio debe configurar la misma regla de reescritura (cualquier ruta →
`index.html`); de lo contrario, recargar en `/registro` devuelve 404.

## Escenarios de validación manual

Siendo `<correo>` y `<contraseña>` una cuenta de demostración definida en `.env.local`. Los
correos nuevos usados abajo son ficticios (por ejemplo `nueva@ejemplo.com`).

| # | Acción | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir `/registro` en escritorio | Dos paneles: marca ("Comienza tu camino financiero.") y formulario "Crea tu cuenta" | US6-1, FR-001 |
| 2 | Completar nombre, correo nuevo, contraseña de 8+ caracteres, la misma confirmación, marcar términos y presionar "Crear cuenta" | Botón en carga ~1 s; redirige a `/login` con "Cuenta creada correctamente. Ahora puedes iniciar sesión."; el correo aparece rellenado y el foco está en la contraseña | US1-1, US1-2, US1-8 |
| 3 | En `/login`, iniciar sesión con la cuenta recién creada | Vista "¡Bienvenido, {nombre}!" | US1-6 |
| 4 | Tras el escenario 2, escribir en cualquier campo del login | El aviso de éxito desaparece | US1-5 |
| 5 | Tras el escenario 2, recargar `/login` | No aparece el aviso ni el correo; la cuenta creada ya no existe (acceso denegado con mensaje genérico) | US1-5, US1-7, US1-9 |
| 6 | Enviar el formulario vacío | Cinco mensajes (nombre, correo, contraseña, confirmación, términos); foco en el nombre | US2-1 |
| 7 | Escribir "usuario@" y salir del campo | "Ingresa un correo electrónico válido" | US2-2 |
| 8 | Contraseña "1234567" | "La contraseña debe tener al menos 8 caracteres" | US2-3 |
| 8a | Nombre "Diego123" o "O'Brien" | "El nombre solo puede contener letras y espacios"; "Íñigo Núñez" se acepta | US2-6a, US2-6b |
| 9 | Contraseña válida y confirmación distinta | "Las contraseñas no coinciden" en la confirmación | US2-4 |
| 10 | Con la confirmación ya validada, cambiar la contraseña principal | El error de coincidencia aparece sin enviar | US2-5 |
| 11 | Usar el correo `<correo>` de una cuenta de demostración | "Este correo ya está registrado" bajo el correo; foco en el correo; los demás datos se conservan | US2-9, FR-024 |
| 12 | Datos válidos sin marcar términos | "Debes aceptar los términos y condiciones"; no se envía | US3-1 |
| 13 | Activar "términos y condiciones" | Se abre el diálogo "Términos y condiciones" (texto de ejemplo); Tab no sale de él; Escape o "Cerrar" lo cierran y el foco vuelve al enlace; la casilla no cambia | FR-021, US3-4 a US3-6 |
| 14 | Activar Google o Apple | Aviso "Próximamente"; los datos se conservan | US5-1 |
| 15 | Activar "Inicia sesión" | Pantalla de login en `/login`, sin aviso de éxito | US4-1 |
| 16 | En `/login`, activar "Regístrate" | Formulario de registro vacío en `/registro` | US4-3 |
| 17 | Abrir una ruta desconocida, por ejemplo `/otra` | Se muestra el login y la URL pasa a `/login` | FR-022 |
| 18 | Usar el botón Atrás tras navegar | La pantalla sigue a la URL | N5 |
| 19 | Reducir la ventana a 320 px | Solo logo y formulario; sin desplazamiento horizontal | US6-2, FR-017 |
| 20 | Recorrer la pantalla solo con Tab y Enter | Orden según [contracts/ui-register.md](./contracts/ui-register.md#teclado); foco visible | FR-018 |
| 21 | Comparar con la captura de Figma (`04 · Registro`) | Sin diferencias de textos, orden y jerarquía; revisar los puntos de [research.md R9](./research.md#r9-fidelidad-al-diseño-sin-mcp-de-figma) | SC-006 |

## Qué se valida automáticamente

- Dominio: validación del registro y reducer del formulario.
- Contratos: `RegistrationGateway` (R1–R7), almacén compartido (C7 del login) y navegación (N1–N8).
- Componentes: `Checkbox` con error, `Alert` de éxito y accesibilidad con `axe`.
- Integración: formulario completo, redirección con aviso y regresión del login.

Detalles en [contracts/](./contracts/) y [data-model.md](./data-model.md).
