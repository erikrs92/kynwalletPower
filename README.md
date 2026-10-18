# KynWallet · Inicio de sesión y registro (demo)

Demostración funcional, solo del lado del cliente, de las pantallas de inicio de sesión y de
registro de la billetera virtual KynWallet. Reproducen el diseño de Figma
([01 · Login](https://www.figma.com/design/f7uDsv8sh6ZOtK2OitTqtg/Billetera-Virtual---Prototipos?node-id=2-2)
y [04 · Registro](https://www.figma.com/design/f7uDsv8sh6ZOtK2OitTqtg/Billetera-Virtual---Prototipos?node-id=31-2)),
validan los campos y simulan la autenticación y el registro contra cuentas en memoria, sin backend
ni base de datos.

Especificación, plan y tareas: [`specs/001-login-billetera/`](specs/001-login-billetera/) (login)
y [`specs/002-registro-usuarios/`](specs/002-registro-usuarios/) (registro).

## Rutas

| Ruta        | Pantalla                                                                        |
| ----------- | ------------------------------------------------------------------------------- |
| `/login`    | Inicio de sesión. También se muestra para `/` y para cualquier ruta desconocida |
| `/registro` | Registro de usuarios                                                            |

- La navegación usa la History API (sin recargar la página). El servidor de desarrollo y
  `npm run preview` ya responden con `index.html` en cualquier ruta; un despliegue estático propio
  debe configurar la misma regla de reescritura (cualquier ruta → `index.html`), de lo contrario
  recargar en `/registro` devuelve 404.
- **Registro:** crea una cuenta con nombre completo, correo, contraseña y confirmación, y vuelve a
  `/login` con un aviso de éxito y el correo prellenado. La cuenta creada puede iniciar sesión
  **solo mientras la página siga abierta**: vive en memoria y se pierde al recargar (no se guarda
  nada en el navegador).
- ⚠️ El registro muestra "Este correo ya está registrado", lo que revela qué cuentas existen. Es una
  decisión aceptada solo para esta demo con cuentas ficticias; con un backend real debe sustituirse
  por una respuesta genérica (Constitución 5.4).
- Las contraseñas se conservan en texto plano únicamente en la memoria de la página, igual que las
  cuentas de `VITE_DEMO_USERS`; nunca se serializan ni se registran.

## Requisitos

- Node.js 20 LTS o superior y npm 10 o superior.

## Configuración

```bash
npm install
cp .env.example .env.local
```

Edita `.env.local` y define al menos una cuenta **ficticia** en `VITE_DEMO_USERS`:

```dotenv
VITE_DEMO_USERS=[{"email":"tu.correo@example.com","password":"minimo-8-caracteres","displayName":"Tu Nombre"}]
```

- `password`: de 8 a 128 caracteres. `displayName`: de 1 a 80 caracteres. Los correos no se pueden repetir.
- `.env.local` no se versiona: la Constitución del proyecto (regla 5.3) prohíbe credenciales en el
  código fuente o en archivos versionados.
- ⚠️ Al ser una aplicación solo-cliente, el valor de `VITE_DEMO_USERS` queda incluido en el bundle
  compilado. Usa únicamente cuentas ficticias.
- Si la variable falta o es inválida, el inicio de sesión muestra "Servicio de acceso no
  disponible" mientras no exista ninguna cuenta. El registro funciona igualmente y, una vez creada
  una cuenta, el login la reconoce.

## Scripts

| Comando                           | Descripción                                                                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Servidor de desarrollo en <http://localhost:5173>                                                                                                     |
| `npm run build`                   | Typecheck y build de producción en `dist/`                                                                                                            |
| `npm run preview`                 | Sirve el build de producción                                                                                                                          |
| `npm test`                        | Ejecuta las pruebas una vez                                                                                                                           |
| `npm run test:watch`              | Pruebas en modo observación                                                                                                                           |
| `npm run test:coverage`           | Pruebas con cobertura (umbral: 80 %)                                                                                                                  |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                                                                                                     |
| `npm run verify`                  | Todos los controles de cumplimiento: lint, formato, tipos, pruebas con cobertura, build, auditoría de dependencias y licencias, y escaneo de secretos |

## Arquitectura

Clean Architecture ligera. Las dependencias apuntan hacia el dominio y ESLint lo verifica:

```text
src/
├── domain/          # Tipos, reglas de validación (login y registro) y textos. Sin React.
├── application/     # Casos de uso `authenticate` y `register`, y puertos `AuthGateway` y `RegistrationGateway`
├── infrastructure/  # `InMemoryAccountStore` (cuentas compartidas), `InMemoryAuthGateway`,
│                    # `InMemoryRegistrationGateway` (simulación, 1 s) y `loadDemoAccounts`
├── ui/
│   ├── styles/      # Tokens de Figma (`tokens.css`) y estilos globales
│   ├── components/  # Button, TextField, PasswordField, Checkbox, SocialButton, Divider, Alert
│   ├── layout/      # BrandPanel y AuthScreen (dos paneles compartidos)
│   ├── navigation/  # Rutas `/login` y `/registro` (History API), Link y anuncio de cambio de pantalla
│   └── features/
│       ├── login/     # LoginForm, WelcomeView, reducer y hook
│       └── register/  # RegisterForm, TermsDialog, reducer y hook
├── App.tsx
└── main.tsx         # Raíz de composición (inyección de dependencias)
```

Las pruebas viven junto al código (`*.test.ts(x)`). Cada caso se nombra con el escenario o
requisito que verifica (por ejemplo, `US2-1`, `FR-012`) para mantener la trazabilidad.

## Notas de diseño

- **Contraste (pendiente de aprobación de diseño):** varios colores de Figma no alcanzan
  WCAG 2.1 AA (botón 2.83:1, enlaces 3.56:1, textos secundarios 3.28:1, bordes 1.40:1). Se
  usan variantes más oscuras del mismo tono (`--brand-700`, `--neutral-600`, `--neutral-border`
  en `src/ui/styles/tokens.css`) y, para el aviso de éxito del registro, `--success-700`
  (6.52:1). Detalle en `specs/001-login-billetera/research.md` (R3) y
  `specs/002-registro-usuarios/research.md` (R9).
- Los iconos de Google, Apple y del control de visibilidad son los marcadores de posición del
  diseño de Figma.
- Fuera de alcance: recuperar contraseña, verificación de correo, acceso real con Google/Apple
  (en el registro avisan "Próximamente"), persistencia de cuentas o de "Recordarme" y bloqueo por
  intentos fallidos. Los términos y condiciones del registro son un texto de ejemplo ficticio.
