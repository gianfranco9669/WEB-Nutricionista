# Equilibrio 21

Demo de presentación para **María Sol Calvo — Nutrición Digestiva**, desarrollada a partir de `Equilibrio_21_Brief_Programador.pdf` (7 páginas). Incluye web comercial, campus de 21 días y administración editable.

## Iniciar

Requiere Node.js 22 o superior (validado con Node.js 24). No utiliza dependencias de npm, base de datos externa ni compilación.

```sh
cd /workspace/WEB-Nutricionista
npm start
```

El servidor escucha en el puerto `3000`. `npm run dev` reinicia el backend al guardar cambios. Se pueden configurar `PORT`, `HOST` y `DIRECTORIO_DATOS`; los valores predeterminados son `3000`, `0.0.0.0` y `.datos/`. Con HTTPS, `COOKIE_SEGURA=1` agrega el atributo Secure a la cookie. No usar esta demo abierta para tratar datos reales.

## Cómo presentarla

1. Recorrer la portada, las tres semanas y la comparación Esencial / Acompañado.
2. Elegir una modalidad y completar **Simular mi compra** con datos ficticios. No cobra, no envía correo y no guarda el email escrito en el formulario.
3. Entrar desde **Mi espacio**, o desde el resultado de la compra. Elegir un perfil demo; cada ingreso crea una cuenta nueva de ejemplo.
4. Explorar los 21 días, marcar progreso y abrir la biblioteca. Acompañado tiene además **Mis tres encuentros**.
5. Abrir **Administración demo**, al pie de la página. Editar precios, vigencia, portada, títulos, descripciones y enlaces de Drive sin modificar código. Consultar compras simuladas y cambiar estados de acceso o sesiones utilizadas.
6. Los enlaces configurados se abren en otra pestaña. Los vacíos muestran una explicación, nunca materiales ficticios presentados como reales.

Las cuentas de ejemplo conservan progreso al recargar mientras dure su sesión. Los datos se guardan en `.datos/demo.json`, excluido de Git. Las sesiones duran ocho horas y están en memoria: un reinicio exige volver a ingresar. Las compras simuladas y el campus de muestra son recorridos separados; simular una compra no equivale a acreditar un pago ni otorgar acceso real.

## Diseño

Paleta crema, salvia, verde profundo y terracota. **Noto Serif Display** (normal e itálica) aporta una voz editorial distintiva; **Inter** facilita la lectura y la interacción. Son alternativas abiertas a Montserrat, alojadas localmente para no depender de Google Fonts. La imagen gastronómica es **generada para la demo** y está guardada localmente: debe reemplazarse por fotografía real de la marca para cumplir el requisito de publicación. El monograma sustituye provisionalmente al retrato; no inventamos foto, matrícula, trayectoria o testimonios de la profesional.

## Validación

```sh
npm run check
npm test
```

Las pruebas de integración usan un servidor efímero y datos temporales independientes. Cubren recursos estáticos, denegación anónima, modalidades, los 21 días, persistencia de progreso, edición, enlaces válidos, accesos pendientes/revocados/vencidos, compras simuladas y cierre de sesión.

Validación adicional de navegador, si están instalados Python, Playwright y Chromium:

```sh
python3 pruebas/interfaz.py
```

Recorre la compra, campus Esencial y Acompañado, progreso, edición administrativa, accesos, compras, menú móvil y anchos 390/768/1440. Guarda capturas en `resultados/` (ignorado por Git).

## Archivos

- `servidor.mjs`: HTTP, API, sesiones, autorización y persistencia JSON.
- `contenidos.mjs`: configuración inicial y temario exacto del brief.
- `public/index.html`, `public/estilos.css`, `public/aplicacion.js`: interfaz, identidad visual y recorridos.
- `documentacion/ANALISIS-DEL-BRIEF.md`: análisis de los 14 apartados, decisiones y alcance.
- `documentacion/PRODUCCION.md`: integraciones, permisos de Drive y reservas antes de vender.

Esta entrega es una **demo funcional**, no una plataforma de pagos desplegada en producción. El panel de administración y el ingreso de compradores están deliberadamente abiertos para la presentación. No deben publicarse con datos reales.
