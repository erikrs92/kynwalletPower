# Feature Specification: Pantalla de Registro de Usuarios de KynWallet

**Feature Branch**: `002-registro-usuarios`

**Created**: 2026-10-17

**Status**: Draft

**Input**: User description: "Necesito construir una pantalla web de registro de usuarios para la
billetera virtual KynWallet, con el objetivo de permitir que una persona nueva cree su cuenta de
manera sencilla. Esta funcionalidad complementa la pantalla de inicio de sesión ya existente (spec
001-login-billetera). El diseño de referencia se encuentra en Figma:
https://www.figma.com/design/f7uDsv8sh6ZOtK2OitTqtg/Billetera-Virtual---Prototipos?node-id=31-2.
La pantalla debe incluir: formulario con nombre completo, correo electrónico, contraseña y
confirmar contraseña; casilla de aceptación de términos y condiciones; botón "Crear cuenta" que
valide todos los campos antes de enviar; botones de Google y Apple que muestren el aviso
"Próximamente"; enlace "¿Ya tienes cuenta? Inicia sesión" que lleve a /login. Validaciones en
línea: todos los campos obligatorios, correo con formato válido, contraseña de mínimo 8
caracteres, contraseña y confirmación coincidentes y términos aceptados. Si el registro es
exitoso, se redirige a /login mostrando un mensaje de éxito. La pantalla debe ser responsive: en
escritorio, dos paneles (marca y formulario); en móvil, solo el formulario. El alcance se limita a
una demostración funcional, sin servicios backend ni base de datos; el registro se simula del
lado del cliente. Genera historias de usuario y criterios de aceptación, respetando la
Constitución del proyecto y reutilizando los componentes y tokens existentes del login."

**Diseño de referencia**: Figma, frame `04 · Registro` (nodo `31:2`, 1440 × 1024) del archivo
"Billetera Virtual - Prototipos". Sigue el mismo lenguaje visual del frame `01 · Login`. Está
compuesto por un panel de marca (logo KynWallet, titular "Comienza tu camino financiero.", texto
de apoyo "Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde
cualquier lugar." y la tarjeta ilustrativa "Kyn Card") y un panel de formulario ("Crea tu
cuenta", subtítulo "Completa tus datos para comenzar", campos Nombre completo, Correo
electrónico, Contraseña y Confirmar contraseña con control de visibilidad en ambas contraseñas,
casilla "Acepto los términos y condiciones" con el enlace "términos y condiciones", botón
"Crear cuenta", separador "o regístrate con", botones Google y Apple, y "¿Ya tienes cuenta?
Inicia sesión"). El diseño no incluye "Recordarme" ni "¿Olvidaste tu contraseña?".

## Clarifications

### Session 2026-10-17

- Q: ¿La cuenta creada en el registro puede iniciar sesión después? → A: Sí, solo en memoria
  mientras la página siga abierta; se pierde al recargar.
- Q: ¿Qué ocurre si el correo ya está registrado? → A: Se muestra el mensaje específico "Este
  correo ya está registrado" (decisión de usabilidad aceptada solo para la demo).
- Q: Tras crear la cuenta y llegar a `/login`, ¿el campo de correo debe aparecer ya rellenado
  con el correo registrado? → A: Sí: el correo aparece rellenado y el foco va a la contraseña.
- Q: ¿Qué caracteres se aceptan en el nombre completo? → A: Solo letras latinas (con tildes,
  diéresis y ñ) y espacios.
- Q: ¿Qué debe ocurrir al activar el enlace "términos y condiciones" de la casilla? → A: Abre un
  cuadro de diálogo con un texto de términos de ejemplo (ficticio).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear una cuenta con datos válidos (Priority: P1)

Como persona nueva en la billetera virtual, quiero completar el formulario de registro con mi
nombre, correo y contraseña, y aceptar los términos, para crear mi cuenta y volver a la pantalla
de inicio de sesión.

**Why this priority**: es el propósito central de la pantalla; sin este flujo no existe valor
demostrable.

**Independent Test**: se completan los cuatro campos con datos válidos, se marca la casilla de
términos, se presiona "Crear cuenta" y se verifica la redirección a `/login` con el mensaje de
éxito.

**Acceptance Scenarios**:

1. **Given** la pantalla de registro cargada, **When** el usuario completa nombre completo,
   correo válido, contraseña de al menos 8 caracteres, la misma contraseña en la confirmación,
   marca los términos y presiona "Crear cuenta", **Then** el sistema lo redirige a `/login` y
   muestra el mensaje de éxito "Cuenta creada correctamente. Ahora puedes iniciar sesión."
2. **Given** el usuario envió el formulario con datos válidos, **When** el registro simulado
   está en curso, **Then** el botón "Crear cuenta" muestra un estado de carga, queda
   deshabilitado y no admite envíos adicionales.
3. **Given** el usuario escribe el correo con mayúsculas o espacios al inicio o al final,
   **When** envía el formulario con los demás datos válidos, **Then** el registro se acepta y el
   correo se trata sin distinguir mayúsculas ni espacios periféricos.
4. **Given** el usuario está en cualquier campo de texto, **When** presiona la tecla Enter,
   **Then** el formulario se envía igual que al presionar "Crear cuenta".
5. **Given** el mensaje de éxito mostrado en `/login`, **When** el usuario edita cualquiera de
   los campos del inicio de sesión o recarga la página, **Then** el mensaje desaparece y no
   vuelve a mostrarse.
6. **Given** una cuenta recién creada y la pantalla `/login`, **When** el usuario inicia sesión
   con el mismo correo y contraseña, **Then** ve la vista de bienvenida con el nombre completo
   que registró.
7. **Given** una cuenta creada y la página recargada, **When** el usuario intenta iniciar sesión
   con esa cuenta, **Then** se muestra el mensaje genérico de credenciales incorrectas.
8. **Given** un registro exitoso, **When** se muestra `/login`, **Then** el correo registrado
   aparece en el campo de correo, el campo de contraseña está vacío y el foco está en el campo de
   contraseña.
9. **Given** el login con el correo rellenado tras el registro, **When** el usuario recarga la
   página, **Then** ambos campos aparecen vacíos.

---

### User Story 2 - Validar los campos antes de enviar (Priority: P1)

Como usuario, quiero que el formulario me indique de inmediato qué datos faltan o son
incorrectos, para corregirlos antes de crear mi cuenta.

**Why this priority**: el requerimiento exige validaciones en línea y que "Crear cuenta" valide
todos los campos antes de enviar; es indispensable para un registro confiable.

**Independent Test**: se envía el formulario vacío y luego con un correo mal formado, una
contraseña corta y una confirmación distinta, y se verifican los mensajes asociados a cada campo.

**Acceptance Scenarios**:

1. **Given** todos los campos vacíos y la casilla sin marcar, **When** el usuario presiona
   "Crear cuenta", **Then** se muestran los mensajes "Ingresa tu nombre completo", "Ingresa tu
   correo electrónico", "Ingresa tu contraseña", "Confirma tu contraseña" y "Debes aceptar los
   términos y condiciones" junto a cada elemento, no se ejecuta el registro y el foco se mueve
   al primer elemento con error.
2. **Given** un correo sin formato válido (por ejemplo, "usuario@" o "usuario.com"), **When** el
   usuario sale del campo o envía el formulario, **Then** se muestra "Ingresa un correo
   electrónico válido".
3. **Given** una contraseña con menos de 8 caracteres, **When** el usuario sale del campo o
   envía el formulario, **Then** se muestra "La contraseña debe tener al menos 8 caracteres" y
   no se ejecuta el registro.
4. **Given** una contraseña válida y una confirmación distinta, **When** el usuario sale del
   campo de confirmación o envía el formulario, **Then** se muestra "Las contraseñas no
   coinciden" y no se ejecuta el registro.
5. **Given** una confirmación ya validada, **When** el usuario modifica la contraseña
   principal haciendo que ambas difieran, **Then** el error de coincidencia aparece en la
   confirmación sin esperar al envío.
6. **Given** un nombre compuesto solo por espacios, **When** el usuario envía el formulario,
   **Then** se trata como vacío y se muestra "Ingresa tu nombre completo".
6a. **Given** un nombre con números o símbolos (por ejemplo, "Diego123" o "Ana_@"), **When** el
   usuario sale del campo o envía el formulario, **Then** se muestra "El nombre solo puede
   contener letras y espacios" y no se ejecuta el registro.
6b. **Given** un nombre con tildes, diéresis o ñ (por ejemplo, "Diego Martínez" o "Íñigo Núñez"),
   **When** el usuario envía el formulario con los demás datos válidos, **Then** el nombre se
   acepta.
7. **Given** un campo con mensaje de validación, **When** el usuario corrige el valor, **Then**
   el mensaje de ese campo desaparece.
8. **Given** un campo con error, **When** es leído por un lector de pantalla, **Then** se anuncia
   el mensaje de error asociado a ese campo.
9. **Given** un correo que ya pertenece a una cuenta de demostración o a una cuenta creada en la
   sesión, **When** el usuario envía el formulario con los demás datos válidos, **Then** se
   muestra "Este correo ya está registrado" junto al campo de correo, no se crea una cuenta, el
   foco se mueve al campo de correo y los demás datos se conservan.

---

### User Story 3 - Aceptar los términos y condiciones (Priority: P1)

Como usuario, quiero indicar de forma explícita que acepto los términos y condiciones, para
poder crear mi cuenta con conocimiento de las condiciones de uso.

**Why this priority**: es una condición obligatoria del registro y parte de la validación del
envío.

**Independent Test**: se completan los campos válidos sin marcar la casilla, se presiona "Crear
cuenta" y se verifica el bloqueo; luego se marca la casilla y se verifica que el registro
procede.

**Acceptance Scenarios**:

1. **Given** todos los campos válidos y la casilla de términos sin marcar, **When** el usuario
   presiona "Crear cuenta", **Then** se muestra "Debes aceptar los términos y condiciones" junto
   a la casilla y no se ejecuta el registro.
2. **Given** el mensaje de términos mostrado, **When** el usuario marca la casilla, **Then** el
   mensaje desaparece.
3. **Given** la casilla de términos, **When** el usuario la opera solo con teclado, **Then**
   puede alcanzarla y alternarla, y su estado y su etiqueta son anunciados por tecnologías de
   asistencia.
4. **Given** la casilla de términos, **When** el usuario activa el enlace "términos y
   condiciones", **Then** se abre un cuadro de diálogo titulado "Términos y condiciones" con un
   texto de ejemplo, el estado de la casilla no cambia y los datos del formulario se conservan.
5. **Given** el cuadro de diálogo abierto, **When** el usuario presiona "Cerrar" o la tecla
   Escape, **Then** el diálogo se cierra y el foco vuelve al enlace "términos y condiciones".
6. **Given** el cuadro de diálogo abierto, **When** el usuario avanza con Tab, **Then** el foco
   permanece dentro del diálogo y su título es anunciado por tecnologías de asistencia al
   abrirse.

---

### User Story 4 - Volver al inicio de sesión (Priority: P2)

Como usuario que ya tiene cuenta, quiero un enlace claro para ir al inicio de sesión, para no
quedar atrapado en la pantalla de registro.

**Why this priority**: es navegación esencial entre las dos pantallas, pero el registro es
demostrable sin ella.

**Independent Test**: se activa "¿Ya tienes cuenta? Inicia sesión" y se verifica que se muestra
la pantalla de inicio de sesión en `/login`.

**Acceptance Scenarios**:

1. **Given** la pantalla de registro, **When** el usuario activa "Inicia sesión", **Then** se
   muestra la pantalla de inicio de sesión en `/login`, sin mensaje de éxito.
2. **Given** datos escritos en el formulario de registro, **When** el usuario va a `/login` con
   ese enlace, **Then** no se conserva ningún dato del formulario al volver a la pantalla de
   registro.
3. **Given** la pantalla de inicio de sesión, **When** el usuario activa "Regístrate", **Then**
   se muestra la pantalla de registro con todos los campos vacíos.

---

### User Story 5 - Acceso con Google y Apple, aún no disponible (Priority: P3)

Como usuario, quiero ver las opciones de Google y Apple del diseño y que me indiquen que
llegarán próximamente, para no quedar con la impresión de un error.

**Why this priority**: garantiza fidelidad al diseño sin ampliar el alcance funcional (YAGNI).

**Independent Test**: se activa cada botón y se verifica el aviso informativo.

**Acceptance Scenarios**:

1. **Given** la pantalla de registro, **When** el usuario activa "Google" o "Apple", **Then** se
   muestra el aviso "Próximamente" y la pantalla conserva los datos ingresados.
2. **Given** el aviso "Próximamente" mostrado, **When** es leído por un lector de pantalla,
   **Then** se anuncia de forma automática sin mover el foco.

---

### User Story 6 - Usar el registro en distintos tamaños de pantalla (Priority: P2)

Como usuario, quiero poder registrarme desde un computador o desde un teléfono, para crear mi
cuenta desde cualquier dispositivo.

**Why this priority**: el requerimiento exige un diseño adaptable; sin él, el registro no es
usable en móvil.

**Independent Test**: se abre la pantalla a anchos de 320 px, 960 px y escritorio y se verifica
la distribución y el uso completo del formulario.

**Acceptance Scenarios**:

1. **Given** una ventana de escritorio, **When** se muestra la pantalla de registro, **Then** se
   ven dos paneles: el de marca y el del formulario.
2. **Given** una ventana de móvil (desde 320 px de ancho), **When** se muestra la pantalla,
   **Then** solo se ve el formulario, completamente utilizable y sin desplazamiento horizontal.
3. **Given** cualquier ancho, **When** el usuario recorre el formulario, **Then** todos los
   campos, la casilla, los botones y los enlaces son alcanzables y operables.

---

### Edge Cases

- El usuario presiona "Crear cuenta" varias veces seguidas: solo se procesa un intento.
- Nombre, correo o contraseña exceden los límites (nombre > 80, correo > 254, contraseña > 128
  caracteres): se rechaza con mensaje de validación y no se ejecuta el registro.
- El nombre contiene números, símbolos, apóstrofos o guiones (por ejemplo, "O'Brien" o
  "Ana-María"): se rechaza con "El nombre solo puede contener letras y espacios".
- El correo o el nombre contienen espacios al inicio o al final: se ignoran al validar y al
  procesar. La contraseña se respeta tal cual, incluidos los espacios.
- El usuario pega texto en los campos: se acepta y se valida igual que el texto escrito.
- El usuario intenta registrarse con un correo que ya existe (cuenta de demostración o cuenta
  creada antes en la misma sesión): se muestra "Este correo ya está registrado" junto al campo
  de correo y no se crea otra cuenta. La comparación ignora mayúsculas y espacios periféricos.
- El usuario crea una cuenta y recarga la página: la cuenta creada se pierde y solo siguen
  disponibles las cuentas de demostración.
- La contraseña y la confirmación coinciden solo salvo mayúsculas o espacios: se consideran
  distintas.
- Tras un registro exitoso, el usuario recarga `/login`: el mensaje de éxito no se vuelve a
  mostrar.
- El usuario abre directamente `/registro` o `/login` escribiendo la dirección: se muestra la
  pantalla correspondiente.
- Una dirección desconocida: se muestra la pantalla de inicio de sesión.
- El usuario cambia la contraseña principal después de confirmarla: la confirmación se revalida.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La pantalla DEBE reproducir la estructura, textos y jerarquía visual del diseño de
  referencia de Figma (frame `04 · Registro`, nodo `31:2`), en el orden: encabezado "Crea tu
  cuenta" con su subtítulo, campos (con los marcadores "Ej: Diego Martínez" y
  "tucorreo@ejemplo.com"), casilla de términos, "Crear cuenta", separador "o regístrate con",
  botones Google y Apple, y enlace "¿Ya tienes cuenta? Inicia sesión". DEBE reutilizar los
  componentes y tokens del login, aplicando el sistema de diseño corporativo cuando exista.
- **FR-001a**: El panel de marca DEBE mostrar el titular "Comienza tu camino financiero." y su
  texto de apoyo, con el mismo logo y la misma tarjeta ilustrativa del login.
- **FR-002**: La pantalla DEBE permitir ingresar nombre completo, correo electrónico,
  contraseña y confirmación de contraseña.
- **FR-003**: El sistema DEBE validar que el nombre completo sea obligatorio, tenga entre 2 y
  80 caracteres tras recortar espacios periféricos y contenga únicamente letras latinas
  (incluidas las vocales con tilde o diéresis y la ñ) y espacios; no se aceptan números,
  símbolos, apóstrofos ni guiones.
- **FR-004**: El sistema DEBE validar que el correo sea obligatorio, tenga formato válido y no
  exceda 254 caracteres.
- **FR-005**: El sistema DEBE validar que la contraseña sea obligatoria y tenga entre 8 y 128
  caracteres.
- **FR-006**: El sistema DEBE validar que la confirmación sea obligatoria y coincida
  exactamente con la contraseña, y DEBE revalidarla cuando cambie la contraseña.
- **FR-007**: La pantalla DEBE incluir una casilla de aceptación de términos y condiciones, y
  el sistema DEBE exigir que esté marcada para registrar.
- **FR-008**: El sistema DEBE mostrar los mensajes de validación junto al campo correspondiente,
  al salir del campo y al intentar enviar, y DEBE ocultarlos cuando el valor se corrija.
- **FR-009**: El botón "Crear cuenta" DEBE validar todos los campos antes de enviar; mientras
  existan errores, el sistema NO DEBE ejecutar el registro y DEBE mover el foco al primer
  elemento con error.
- **FR-010**: El registro DEBE simularse del lado del cliente, sin servicios backend ni base de
  datos, con una espera breve (aprox. 1 segundo) y un indicador de carga durante la cual el
  envío queda deshabilitado.
- **FR-011**: Ante un registro exitoso, el sistema DEBE redirigir a `/login` y mostrar allí el
  mensaje de éxito "Cuenta creada correctamente. Ahora puedes iniciar sesión."; el mensaje DEBE
  anunciarse automáticamente a tecnologías de asistencia, DEBE ocultarse al editar el
  formulario de inicio de sesión y NO DEBE reaparecer al recargar.
- **FR-011a**: Al llegar a `/login` tras un registro exitoso, el campo de correo DEBE aparecer
  rellenado con el correo registrado (normalizado), el campo de contraseña DEBE estar vacío y el
  foco DEBE ir al campo de contraseña. El correo viaja solo en memoria, nunca en la dirección;
  recargar la página, cerrar sesión o navegar a otra pantalla lo descarta.
- **FR-012**: El sistema NO DEBE registrar ni mostrar la contraseña ni su confirmación en
  mensajes, registros de diagnóstico, URL ni almacenamiento del navegador, ni incluir datos
  personales en la dirección de redirección (Constitución, Principio V).
- **FR-013**: Los campos de contraseña y confirmación DEBEN ocultar los caracteres por defecto y
  ofrecer un control accesible para mostrarlos u ocultarlos.
- **FR-014**: Los botones "Google" y "Apple" DEBEN mostrarse según el diseño y, al activarse,
  mostrar el aviso "Próximamente" sin perder los datos ingresados.
- **FR-015**: La pantalla DEBE incluir el enlace "¿Ya tienes cuenta? Inicia sesión", que lleve a
  `/login`.
- **FR-016**: La pantalla de inicio de sesión DEBE ofrecer "Regístrate" como enlace de
  navegación hacia la pantalla de registro, en lugar del aviso "Función no disponible" de la
  spec 001 (esto modifica el FR-016 de `001-login-billetera`).
- **FR-017**: La pantalla DEBE adaptarse a anchos desde 320 px hasta escritorio sin
  desplazamiento horizontal: en escritorio, dos paneles (marca y formulario); en móvil, solo el
  formulario con el logo visible.
- **FR-018**: El formulario DEBE poder enviarse con la tecla Enter y operarse completamente con
  teclado, con orden de foco lógico y foco visible.
- **FR-019**: La pantalla DEBE cumplir WCAG 2.1 nivel AA: etiquetas asociadas a cada campo,
  errores y avisos anunciados por tecnologías de asistencia y contraste suficiente.
- **FR-020**: Los errores inesperados DEBEN mostrarse con un mensaje comprensible para el
  usuario, sin revelar detalles técnicos.
- **FR-021**: El texto "términos y condiciones" DEBE mostrarse como enlace, según el diseño, y
  al activarse DEBE abrir un cuadro de diálogo modal titulado "Términos y condiciones" con un
  texto de ejemplo ficticio, identificado como tal, y un botón "Cerrar". El diálogo DEBE
  cerrarse con "Cerrar" o con Escape, mantener el foco en su interior mientras está abierto,
  devolver el foco al enlace al cerrarse y no alterar la casilla ni los datos del formulario.
- **FR-022**: Al ingresar a `/registro` o a `/login` por su dirección, el sistema DEBE mostrar
  la pantalla correspondiente; una dirección desconocida DEBE mostrar el inicio de sesión.
- **FR-023**: Una cuenta creada con éxito DEBE poder usarse para iniciar sesión en la pantalla
  de inicio de sesión (con el mismo correo y contraseña, mostrando el nombre completo
  registrado en la bienvenida) mientras la página permanezca abierta. La cuenta se mantiene solo
  en memoria, se pierde al recargar y NO DEBE almacenarse en el navegador ni en archivos
  (FR-012).
- **FR-024**: Si el correo ya pertenece a una cuenta existente (de demostración o creada en la
  sesión), el sistema NO DEBE crear la cuenta y DEBE mostrar "Este correo ya está registrado"
  junto al campo de correo. Esta distinción aplica solo al registro; el inicio de sesión
  mantiene su mensaje genérico (spec 001, FR-010).

### Key Entities

- **Solicitud de registro**: datos ingresados en el formulario (nombre completo, correo,
  contraseña, confirmación y aceptación de términos) y su resultado: error de validación o
  registro exitoso. No se persiste.
- **Aviso de registro exitoso**: mensaje transitorio mostrado una sola vez en el inicio de
  sesión tras un registro completado, junto con el correo registrado para rellenar el campo de
  correo. Existe solo en memoria.
- **Cuenta de demostración**: entidad definida en la spec 001 (correo, contraseña, nombre del
  titular). Las cuentas creadas desde el registro tienen los mismos atributos, comparten el
  mismo conjunto consultado por el inicio de sesión y existen solo en memoria durante la
  sesión de la página.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario con datos válidos completa el registro en menos de 60 segundos desde
  que la pantalla se muestra.
- **SC-002**: El resultado de un intento (redirección con éxito o errores de validación) se
  muestra en un máximo de 2 segundos tras presionar "Crear cuenta".
- **SC-003**: El 100 % de los escenarios de aceptación de las historias P1 y P2 se verifican
  mediante pruebas automatizadas que pasan, salvo el comportamiento nativo del navegador
  (contención del foco con Tab dentro del diálogo, US3-6) y la distribución visual por ancho de
  pantalla (US6), que se verifican manualmente según el quickstart y se registran en la solicitud
  de cambio.
- **SC-004**: El 90 % de los participantes de una prueba de usabilidad completa el registro en
  el primer intento sin asistencia.
- **SC-005**: La pantalla no presenta incumplimientos WCAG 2.1 AA en una auditoría automatizada
  de accesibilidad y es operable solo con teclado.
- **SC-006**: La revisión visual frente al diseño de Figma no detecta diferencias en textos,
  orden de elementos ni jerarquía visual, salvo los tokens accesibles ya aprobados en el login.
- **SC-007**: El análisis de secretos no detecta credenciales en el código fuente versionado, y
  la contraseña no aparece en la dirección, el almacenamiento ni los registros en ninguna
  prueba.
- **SC-008**: La pantalla es completamente utilizable, sin desplazamiento horizontal, desde
  320 px de ancho hasta escritorio.

## Assumptions

- La demostración es exclusivamente del lado del cliente: no hay backend, base de datos ni
  sesión persistente.
- El idioma de la interfaz es español.
- Los límites de correo (254) y contraseña (8 a 128) coinciden con los del inicio de sesión;
  para el nombre completo se asume 2 a 80 caracteres, de acuerdo con el nombre del titular del
  login (hasta 80). No se exigen reglas de complejidad adicionales.
- Restricción aceptada del nombre (clarificación 2026-10-17): solo letras latinas y espacios, lo
  que excluye nombres con apóstrofo o guion (por ejemplo, "O'Brien", "Ana-María") y alfabetos
  no latinos; es una limitación conocida de la demostración.
- El texto "términos y condiciones" es un enlace del diseño que abre un diálogo con términos de
  ejemplo ficticios (clarificación 2026-10-17); no existe un documento legal real ni una página
  propia, y el diálogo solo se cierra, sin botón de aceptación.
- El enlace del login se muestra como "Regístrate" y el del registro como "Inicia sesión"; ambos
  conservan los textos del diseño.
- La verificación de correo electrónico, la recuperación de contraseña, el acceso real con
  Google y Apple y la persistencia de cuentas entre recargas quedan fuera de alcance; sus
  elementos se muestran solo por fidelidad al diseño.
- Decisión de seguridad aceptada (clarificación 2026-10-17): el registro informa "Este correo
  ya está registrado", lo que revela la existencia de cuentas. Se acepta porque es una demo con
  cuentas ficticias; el inicio de sesión sigue sin revelar si un correo existe. Si la
  funcionalidad pasa a producción, DEBE revisarse (Constitución 5.4) y reemplazarse por una
  respuesta genérica.
- Las rutas son `/login` (indicada en el requerimiento) y `/registro` (supuesto por
  consistencia con el idioma de la interfaz).
- El registro reutiliza el panel de marca, los componentes de campo, casilla, botón, aviso y los
  tokens de diseño existentes del login; no se crean variantes nuevas salvo que el diseño las
  exija.
- Esta funcionalidad requiere navegar entre dos direcciones (`/login` y `/registro`), lo que
  modifica el supuesto de "pantalla única" de la spec 001; el plan DEBE justificarlo
  (Constitución 4.2).
- No existen BRD ni ARD para esta funcionalidad; si se incorporan, esta especificación DEBE
  alinearse con ellos (Constitución, Principio VI).
- Los textos del formulario y del panel de marca se tomaron de una captura del frame `31:2`
  aportada por el solicitante (el MCP de Figma no estaba disponible). Las medidas, colores y
  espaciados se verifican en el plan contra los tokens del login y en la revisión visual
  (SC-006).
- Las dependencias son la spec 001 (componentes, tokens, estilos y mensajes compartidos).
