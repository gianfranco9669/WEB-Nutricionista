# Compartir Equilibrio 21 con la cliente

Hay dos entregables: una presentación portátil sin instalación y el proyecto completo con backend. Ninguno acredita pagos ni concede permisos de Drive.

## 1. Archivo para abrir con doble clic

Descargar la rama `demo-publica` desde GitHub → Code → Download ZIP. Descomprimir y abrir **index.html** en Chrome, Edge, Firefox o Safari actualizado. Se puede enviar ese archivo por correo, WhatsApp o Drive como cualquier documento de presentación.

Incluye las fuentes, las cuatro imágenes, el explorador de 21 días, el campus, la biblioteca, la compra simulada y el panel demo. No necesita servidor, Node.js o acceso a Internet para los recorridos internos. Los enlaces externos de Drive, si se configuran, sí necesitan conexión y permisos.

Cada navegador maneja su propio estado de ejemplo: editar un título o precio no afecta a otros visitantes ni al proyecto con backend. Los cambios persisten cuando el navegador permite almacenamiento local; si lo bloquea, el archivo funciona en memoria y los cambios se pierden al cerrar o recargar. Los datos pueden eliminarse borrando el almacenamiento del sitio/archivo desde el navegador.

Es una demostración con controles de rol visuales, no autenticación ni protección de contenido real. No incluir datos personales ni archivos privados. No se guardan síntomas ni el correo del formulario de compra. Las fotografías son generadas y provisionales.

Para regenerarlo después de modificar el proyecto:

```sh
npm run entregable
```

Genera `entregable/index.html` y `entregable/LEEME.txt`. La carpeta es un resultado de compilación ignorado por Git; la versión lista para descargar se publica en la rama `demo-publica`.

## 2. Enlace público de prueba con GitHub Pages

La rama `demo-publica` está preparada para alojar el mismo HTML como web estática:

1. En el repositorio de GitHub, abrir **Settings → Pages**.
2. En **Build and deployment**, elegir **Deploy from a branch**.
3. Elegir **demo-publica** y **/(root)**. Pulsar **Save**.
4. Esperar a que GitHub indique que terminó el despliegue y copiar el enlace que muestra Pages.

El enlace esperado, una vez habilitado y desplegado, es `https://gianfranco9669.github.io/WEB-Nutricionista/`. No es un enlace confirmado mientras Pages no esté activado y el despliegue haya finalizado. La disponibilidad de Pages en repositorios privados depende del plan de GitHub; no cambiar la visibilidad del repositorio solo para este paso. Si Pages no está disponible, usar Render o compartir el HTML.

Esta versión online sigue siendo una simulación local por navegador. No necesita base de datos, no admite ventas reales y no sincroniza cambios administrativos entre personas. El backend real de la demo está en la otra rama.

## 3. Demo online con backend en Render

El proyecto completo tiene un `render.yaml` para un Web Service gratuito. Requiere una cuenta de Render conectada al repositorio. La creación del servicio se realiza en esa cuenta; guardar este archivo no publica una web.

En Render:

1. Entrar con GitHub y autorizar acceso al repositorio.
2. Seleccionar **New → Blueprint**, elegir `gianfranco9669/WEB-Nutricionista` y la rama **demo/equilibrio-21**.
3. Revisar el servicio `equilibrio-21-demo`, el plan **Free** y la configuración del blueprint. No seleccionar opciones de pago para esta prueba.
4. Crear el servicio. Render ejecuta `npm run check` y `npm start`, asigna el puerto y entrega una URL HTTPS `onrender.com` al terminar.
5. Abrir esa URL, comprobar la portada y Mi espacio, y compartirla con la cliente.

Alternativa manual **New → Web Service**: mismo repositorio y rama, runtime Node, Build Command `npm run check`, Start Command `npm start`, plan Free. Variables: `NODE_VERSION=24`, `COOKIE_SEGURA=1`, `DIRECTORIO_DATOS=/tmp/equilibrio-21-demo`. Health check: `/api/salud`. No necesita claves de pagos o de Google para la demo.

El servicio gratuito puede suspenderse por inactividad y tardar al recibir la primera visita. Su sistema de archivos es efímero: cuentas, progreso y cambios de muestra pueden perderse al reiniciar o desplegar. Las sesiones siempre se pierden al reiniciar. El panel demo es compartido y abierto; usar solo datos ficticios. Para conservar cambios productivos, conectar una base durable y autenticación real. Revisar las condiciones vigentes de Render antes de activar el servicio; no se creó ningún recurso facturable desde este entorno.

## Qué recibe la cliente

- Un sitio adaptable a celular, tablet y computadora.
- Una vista previa interactiva de las tres semanas y los 21 días.
- Acceso de ejemplo a Esencial o Acompañado.
- Una demostración de administración de contenidos, precios, accesos y sesiones.
- Una separación explícita entre demo y ventas reales.

El proyecto completo y sus instrucciones técnicas permanecen en la rama `demo/equilibrio-21`. Antes de vender, seguir `PRODUCCION.md` para autenticación, pagos verificados, correo, permisos individuales de Google Drive, reservas y revisión legal.
