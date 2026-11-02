# Del prototipo a la venta real

## Primera versión recomendada

Mantener el acceso completo a las tres semanas desde el alta, los permisos manuales de Drive y las consultas mediante un proveedor externo. Es la variante inicial más simple que permite el brief. El acceso progresivo y Drive API son extensiones separadas.

La demo sirve para revisar el diseño y los recorridos. No desplegarla abierta con información real: reemplazar las rutas `/api/demo` y `/api/compra-demo`, el acceso público al panel, las sesiones de ejemplo y el almacenamiento JSON antes de vender.

## Identidad y autenticación

Conectar un proveedor de identidad con recuperación de acceso y validación de correo, o enlaces de acceso de un solo uso y corta duración. Restringir administración a una lista de cuentas autorizadas y activar MFA. Sustituir las sesiones en memoria por almacenamiento durable, rotar sesión tras el ingreso, limitar intentos y usar HTTPS con cookies Secure. La marca debe proveer su biografía, matrícula y fotografías reales.

## Mercado Pago y correo

1. Crear preferencias de checkout desde el backend con precio y modalidad tomados del servidor, no del navegador.
2. Mantener separados estados de orden, pago, cuenta, permiso de Drive y vigencia.
3. Verificar firmas de webhook y consultar el estado del pago con la API oficial usando credenciales del servidor.
4. Validar comercio, referencia, moneda e importe. Procesar el evento con idempotencia y restricciones únicas. Un retorno “success” del navegador no acredita la compra.
5. Solo después de aprobación verificable, habilitar cuenta y registrar modalidad. Con permisos manuales, marcar “pendiente de habilitación de Drive”. Enviar confirmación con instrucciones; informar luego la activación.
6. Manejar reembolsos, contracargos, vencimiento, reintentos y revocación tanto del campus como de Drive.
7. Conectar un proveedor de email transaccional con dominio verificado, registros SPF/DKIM y cola de reintentos. No almacenar claves en el repositorio ni pedirlas por chat.

Compradores del exterior: evaluar con la cliente los países, moneda y disponibilidad de su cuenta de cobros. Comparar un proveedor internacional habilitado para su situación fiscal (por ejemplo, PayPal) o una solución merchant of record, con comisiones, reintegros y facturación. No asumir que una cuenta argentina puede usar cualquier proveedor global.

## Google Drive manual

Carpeta de materiales publicados, acceso general **Restringido**:

- `00 — Bienvenida`
- `01 — Semana 1: Entendé tu digestión`
- `02 — Semana 2: Alimentá tu intestino`
- `03 — Semana 3: Construí tu equilibrio`
- `04 — Recetario`
- `05 — Menús orientativos`
- `06 — Actividades y registros`
- `07 — Guía de mantenimiento`

Guardar borradores en una carpeta diferente, nunca dentro de la compartida. Verificar el pago y confirmar la cuenta de Google antes de agregar al comprador como Lector. Probar cada enlace con esa cuenta. Un recurso independiente fuera de la carpeta necesita su propio permiso.

Actualizar documentos originales o cargar nuevas versiones sobre el mismo archivo cuando Drive lo permita conserva el ID. Borrar y volver a subir crea otro archivo y puede romper los enlaces. No usar “Cualquier persona con el enlace”. El correo de acceso debe estar asociado a una cuenta Google, no necesariamente terminar en gmail.com.

Las fichas de síntomas deben ser descargables o tener instrucciones de crear una copia personal; nunca un único archivo compartido con permiso de Editor. No subir datos de salud al servidor de la aplicación.

Ante vencimiento, reintegro o revocación, retirar permisos de Drive además de bloquear el campus. El bloqueo web no impide que una persona con permiso abra un enlace ya conocido. Un archivo descargado no puede revocarse retroactivamente.

## Drive API — presupuesto separado

Evaluar el tipo de cuenta Google y las restricciones de Workspace, autorización OAuth de la propietaria, consentimiento, alcance mínimo, almacenamiento seguro/rotación de tokens, concesión/revocación idempotente de permisos, trabajos de vencimiento, alertas y conciliación. No asumir que una cuenta de servicio puede administrar cualquier Drive personal sin compartirlo o sin una configuración adicional.

Incluir en el presupuesto implementación, pruebas con cuentas reales, configuración de Google, verificaciones aplicables, operación y mantenimiento. Las claves y la autorización se suministran en la configuración segura del despliegue; no están incluidas en esta demo.

## Acceso progresivo — presupuesto separado

No basta con ocultar botones en la web. Una carpeta compartida con todo el contenido permitiría abrir días futuros directamente en Drive. Para garantizar progresividad se necesitan carpetas o archivos por etapa sin permisos heredados globales y un proceso que conceda/revoque acceso según la fecha y la compra. Hay que definir zona horaria, fecha de inicio, períodos de gracia, cambios de modalidad y manejo de fallas.

## Tres consultas sin duplicados

Evaluar **Calendly** para una experiencia simple, o **Cal.com** si se necesita más control de API y webhooks; disponibilidad de enlaces únicos, límites y API depende del plan contratado y debe verificarse antes de elegir. No presentar un enlace público reutilizable como control de sesiones.

Recomendación técnica: tres derechos de reserva por compra Acompañado, identificados individualmente. Generar enlaces de un solo uso mediante el proveedor cuando lo permita; asociar cada reserva a compra/encuentro; webhook autenticado e idempotente para marcar reservada, realizada, cancelada o reprogramada; restricciones únicas para impedir duplicados. No mostrar las páginas de reserva con cobros adicionales. Definir qué cancelaciones restituyen el derecho. Si se elige una operación manual económica, la profesional debe conciliar y autorizar cada reserva; su límite operativo debe quedar explícito.

La demo solo permite configurar el enlace externo y marcar consultas utilizadas desde el panel. No hay calendario conectado ni bloqueo de duplicados productivo.

## Datos, contenidos y legales

Usar base transaccional (por ejemplo PostgreSQL), migraciones, backups restaurables, permisos mínimos y registros operativos sin secretos. Retener lo mínimo necesario de identidad, orden, vigencia y reservas. No guardar síntomas. Limitar accesos, registrar cambios administrativos, documentar incidentes y configurar plazos de eliminación.

Completar CMS de todas las secciones de portada si se requiere que cada texto sea autoadministrable; la demo edita título/descripción principal, precios, vigencia, recursos y días. Revisar y aprobar los textos educativos con la profesional.

Revisión jurídica argentina: responsable y contacto, política de privacidad conforme a Ley 25.326, finalidades y transferencias, proveedores, derechos de titulares, consentimiento aplicable, facturación, defensa del consumidor, derecho de revocación y procedimiento de reintegros, condiciones de sesiones y duración del acceso. Los borradores de la demo no equivalen a asesoramiento jurídico o cumplimiento certificado.

## Verificación antes de habilitar cobros

Probar pago aprobado/rechazado/pendiente, webhooks duplicados o falsificados, reembolsos, correo fallido, cuenta de Google distinta, habilitación manual, permisos directos de Drive, vencimiento, revocación y reservas repetidas. Hacer pruebas con el sandbox oficial, usuarios de ambos planes, móvil y lectores de pantalla. Publicar solo después de reemplazar datos de muestra, aprobar condiciones y validar integraciones con las cuentas de la cliente.
