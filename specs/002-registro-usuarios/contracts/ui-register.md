# Contract: Interfaz de usuario de la pantalla de registro

Contrato observable por el usuario y por las pruebas (RTL consulta por rol y nombre accesible).
Textos exactos en español, tomados de la captura del frame `04 · Registro` (Figma, nodo `31:2`) y
de la spec. Las medidas se verifican según [research.md R9](../research.md#r9-fidelidad-al-diseño-sin-mcp-de-figma).

## Vista de registro (`/registro`)

| Elemento | Rol / nombre accesible | Notas |
|---|---|---|
| Título | `heading` nivel 1 "Crea tu cuenta" | Subtítulo "Completa tus datos para comenzar". Recibe el foco al llegar por navegación |
| Nombre | `textbox` "Nombre completo" | `autocomplete=name`, placeholder "Ej: Diego Martínez" |
| Correo | `textbox` "Correo electrónico" | `type=email`, `autocomplete=username`, placeholder "tucorreo@ejemplo.com" |
| Contraseña | campo con etiqueta "Contraseña" | `type=password`, `autocomplete=new-password` |
| Confirmación | campo con etiqueta "Confirmar contraseña" | `type=password`, `autocomplete=new-password` |
| Visibilidad | `button` "Mostrar contraseña" / "Ocultar contraseña" en el primer campo y "Mostrar confirmación de contraseña" / "Ocultar confirmación de contraseña" en el segundo | `aria-pressed`; el nombre accesible indica a qué campo pertenece (prop `toggleSubject` de `PasswordField`) |
| Términos | `checkbox` "Acepto los términos y condiciones" | `aria-invalid` y `aria-describedby` si hay error |
| Enlace de términos | `button` "términos y condiciones" dentro de la etiqueta | Abre el diálogo de términos; no alterna la casilla |
| Diálogo de términos | `dialog` "Términos y condiciones" | Modal; texto de ejemplo marcado como ficticio; `button` "Cerrar"; Escape lo cierra; el foco queda dentro y vuelve al enlace al cerrar |
| Enviar | `button` "Crear cuenta" | `type=submit`. En carga: `aria-busy=true`, deshabilitado, texto "Creando cuenta…" |
| Separador | texto "o regístrate con" | Decorativo |
| Google / Apple | `button` "Google", `button` "Apple" | Muestran el aviso "Próximamente" |
| Ir al login | texto "¿Ya tienes cuenta?" + `link` "Inicia sesión" | `href="/login"` |

**Errores por campo** (texto bajo el campo, `aria-describedby`, campo con `aria-invalid=true`):

| Campo | Mensajes |
|---|---|
| Nombre | "Ingresa tu nombre completo" · "El nombre debe tener entre 2 y 80 caracteres" · "El nombre solo puede contener letras y espacios" |
| Correo | "Ingresa tu correo electrónico" · "Ingresa un correo electrónico válido" · "Este correo ya está registrado" |
| Contraseña | "Ingresa tu contraseña" · "La contraseña debe tener al menos 8 caracteres" · "La contraseña no puede superar 128 caracteres" |
| Confirmación | "Confirma tu contraseña" · "Las contraseñas no coinciden" |
| Términos | "Debes aceptar los términos y condiciones" |

**Mensajes globales**:

| Caso | Rol | Texto |
|---|---|---|
| Servicio no disponible | `alert` | "Servicio de registro no disponible. Intenta más tarde." |
| Google / Apple | `status` | "Próximamente" |

Los avisos informativos se reemplazan entre sí; enviar el formulario los limpia.

## Panel de marca

Logo "KynWallet", titular "Comienza tu camino financiero." (salto de línea tras "Comienza tu") y
texto "Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde
cualquier lugar.", más la tarjeta ilustrativa decorativa (`aria-hidden=true`). Por debajo de
960 px solo se muestra el logo.

## Teclado

Orden de tabulación: nombre → correo → contraseña → visibilidad → confirmación → visibilidad →
casilla → "términos y condiciones" → "Crear cuenta" → Google → Apple → "Inicia sesión".
Enter en cualquier campo de texto envía el formulario. El foco es siempre visible (anillo de 2 px
con contraste ≥ 3:1). Con errores al enviar, el foco va al primer elemento con error en el orden:
nombre, correo, contraseña, confirmación, casilla.

## Cambios en la pantalla de login (`/login`)

| Elemento | Antes (001) | Ahora |
|---|---|---|
| "Regístrate" | `button` que muestra el aviso | `link` con `href="/registro"` |
| Aviso de éxito | — | `status` "Cuenta creada correctamente. Ahora puedes iniciar sesión." (solo tras registrarse; se oculta al editar un campo, al salir de la ruta o al recargar) |
| Correo tras registrarse | Vacío | Aparece rellenado con el correo registrado y el foco va al campo de contraseña (FR-011a); recargar lo vacía |

El resto del contrato de [`ui-login.md`](../../001-login-billetera/contracts/ui-login.md) no
cambia. El aviso de éxito aparece encima del botón "Iniciar sesión", junto a los demás mensajes.
