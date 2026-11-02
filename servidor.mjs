import http from 'node:http';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, randomUUID } from 'node:crypto';
import { crearEstado, semanas } from './contenidos.mjs';

const raiz = dirname(fileURLToPath(import.meta.url));
const carpeta = resolve(process.env.DIRECTORIO_DATOS || resolve(raiz, '.datos'));
await mkdir(carpeta, { recursive: true });
const archivo = resolve(carpeta, 'demo.json');
let estado;
try { estado = JSON.parse(await readFile(archivo, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; estado = crearEstado(); }
const sesiones = new Map();
let escritura = Promise.resolve();
function guardar() { const contenido = JSON.stringify(estado, null, 2); escritura = escritura.then(async () => { await writeFile(`${archivo}.tmp`, contenido, { mode: 0o600 }); await rename(`${archivo}.tmp`, archivo); }); return escritura; }
function responder(res, codigo, datos) { res.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(datos)); }
function exigir(condicion, mensaje, codigo = 400) { if (!condicion) throw Object.assign(new Error(mensaje), { codigo }); }
async function cuerpo(req) { let texto = ''; for await (const trozo of req) { texto += trozo; exigir(Buffer.byteLength(texto) < 24000, 'Solicitud demasiado grande.', 413); } try { return JSON.parse(texto || '{}'); } catch { throw Object.assign(new Error('JSON inválido.'), { codigo: 400 }); } }
function texto(valor, max = 500) { exigir(typeof valor === 'string' && valor.trim().length > 0 && valor.length <= max, 'Revisá los campos de texto.'); return valor.trim(); }
function enlace(valor, drive = true) { exigir(typeof valor === 'string', 'Enlace inválido.'); if (!valor) return ''; let url; try { url = new URL(valor); } catch { exigir(false, 'Ingresá un enlace HTTPS válido.'); } exigir(url.protocol === 'https:' && !url.username && !url.password && (!drive || ['drive.google.com', 'docs.google.com'].includes(url.hostname)), drive ? 'Usá un enlace HTTPS de Google Drive o Google Docs.' : 'Usá un enlace HTTPS válido.'); return url.href; }
function vistaComprador(comprador) { return { ...comprador, vigente: new Date(comprador.vence) > new Date(), diasCompletados: comprador.diasCompletados || [] }; }
function compradorActivo(sesion) { const c = estado.compradores.find(c => c.id === sesion?.compradorId); exigir(c, 'Ingresá a tu cuenta demo.', 401); exigir(c.acceso === 'activo' && new Date(c.vence) > new Date(), 'Tu acceso está pendiente, revocado o vencido.', 403); return c; }
const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
const servidor = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('X-Frame-Options', 'DENY'); res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self'; font-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith('/api/')) {
      if (!['GET', 'HEAD'].includes(req.method)) { exigir(req.headers['x-equilibrio-demo'] === '1', 'Solicitud no autorizada.', 403); if (req.headers.origin) exigir(new URL(req.headers.origin).host === req.headers.host, 'Origen no autorizado.', 403); }
      const token = /(?:^|;\s*)equilibrio=([^;]+)/.exec(req.headers.cookie || '')?.[1];
      const sesion = sesiones.get(token); if (sesion && sesion.vence < Date.now()) sesiones.delete(token);
      const actual = sesion?.vence > Date.now() ? sesion : null;
      if (req.method === 'GET' && url.pathname === '/api/publico') return responder(res, 200, { configuracion: { ...estado.configuracion, recursos: undefined }, semanas: semanas.map(({ temas, ...s }) => s), demo: true });
      if (req.method === 'GET' && url.pathname === '/api/sesion') return responder(res, 200, { rol: actual?.rol || null, comprador: actual?.compradorId ? vistaComprador(estado.compradores.find(c => c.id === actual.compradorId)) : null });
      if (req.method === 'POST' && url.pathname === '/api/demo') {
        const datos = await cuerpo(req); exigir(['esencial', 'acompanado', 'administrador'].includes(datos.modalidad), 'Modalidad inválida.');
        let comprador;
        if (datos.modalidad !== 'administrador') {
          const id = randomUUID(); comprador = { id, nombre: 'Visitante', correo: `demo-${id.slice(0, 8)}@example.com`, modalidad: datos.modalidad, acceso: 'activo', vence: new Date(Date.now() + estado.configuracion.diasAcceso * 86400000).toISOString(), diasCompletados: [], encuentros: [false, false, false], demo: true };
          estado.compradores.push(comprador); await guardar();
        }
        const nuevoToken = randomBytes(32).toString('hex'); sesiones.set(nuevoToken, { rol: comprador ? 'comprador' : 'administrador', compradorId: comprador?.id, vence: Date.now() + 8 * 3600000 });
        res.setHeader('Set-Cookie', `equilibrio=${nuevoToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.COOKIE_SEGURA === '1' ? '; Secure' : ''}`);
        return responder(res, 200, { ok: true });
      }
      if (req.method === 'POST' && url.pathname === '/api/salir') { sesiones.delete(token); res.setHeader('Set-Cookie', 'equilibrio=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'); return responder(res, 200, { ok: true }); }
      if (req.method === 'POST' && url.pathname === '/api/compra-demo') {
        const datos = await cuerpo(req); exigir(['esencial', 'acompanado'].includes(datos.modalidad), 'Modalidad inválida.'); exigir(datos.acepta === true, 'Aceptá las condiciones de la demostración.');
        // Nunca recibe tarjetas, confirma pagos ni concede permisos reales de Drive.
        const id = randomUUID(); estado.compras.push({ id, nombre: texto(datos.nombre, 100), modalidad: datos.modalidad, monto: datos.modalidad === 'esencial' ? estado.configuracion.precioEsencial : estado.configuracion.precioAcompanado, estado: 'simulada', fecha: new Date().toISOString(), demo: true }); await guardar();
        return responder(res, 201, { id, mensaje: 'Compra simulada. No se realizó ningún cobro ni se envió correo. Explorá el campus con una cuenta de demostración.' });
      }
      if (req.method === 'GET' && url.pathname === '/api/campus') { const c = compradorActivo(actual); return responder(res, 200, { comprador: vistaComprador(c), dias: estado.dias, semanas: semanas.map(({ temas, ...s }) => s), recursos: estado.configuracion.recursos, enlaceReservas: c.modalidad === 'acompanado' ? estado.configuracion.enlaceReservas : undefined }); }
      if (req.method === 'POST' && url.pathname === '/api/progreso') { const c = compradorActivo(actual); const { dia } = await cuerpo(req); exigir(Number.isInteger(dia) && dia >= 1 && dia <= 21, 'Día inválido.'); c.diasCompletados = c.diasCompletados.includes(dia) ? c.diasCompletados.filter(n => n !== dia) : [...c.diasCompletados, dia]; await guardar(); return responder(res, 200, { diasCompletados: c.diasCompletados }); }
      if (url.pathname.startsWith('/api/admin/')) {
        exigir(actual?.rol === 'administrador', 'Acceso exclusivo de administración.', 403);
        if (req.method === 'GET' && url.pathname === '/api/admin/estado') return responder(res, 200, estado);
        if (req.method === 'PUT' && url.pathname === '/api/admin/configuracion') {
          const d = await cuerpo(req); const recursos = {};
          for (const clave of ['recetario','menus','cuaderno','mantenimiento']) recursos[clave] = enlace(d.recursos?.[clave] || '');
          for (const clave of ['precioEsencial', 'precioAcompanado', 'diasAcceso']) exigir(Number.isSafeInteger(d[clave]) && d[clave] > 0 && d[clave] <= (clave === 'diasAcceso' ? 3650 : 10000000), 'Precios o vigencia inválidos.');
          estado.configuracion = { titulo: texto(d.titulo, 120), descripcion: texto(d.descripcion, 500), precioEsencial: d.precioEsencial, precioAcompanado: d.precioAcompanado, diasAcceso: d.diasAcceso, enlaceReservas: enlace(d.enlaceReservas || '', false), recursos }; await guardar(); return responder(res, 200, { ok: true });
        }
        const dia = /^\/api\/admin\/dias\/(\d+)$/.exec(url.pathname);
        if (req.method === 'PUT' && dia) { const d = await cuerpo(req); const existente = estado.dias.find(d => d.numero === Number(dia[1])); exigir(existente, 'Día inexistente.', 404); const enlaces = {}; for (const clave of ['clase','material','receta','actividad','registro']) enlaces[clave] = enlace(d.enlaces?.[clave] || ''); Object.assign(existente, { titulo: texto(d.titulo, 150), descripcion: texto(d.descripcion, 1000), enlaces }); await guardar(); return responder(res, 200, { ok: true }); }
        if (req.method === 'PUT' && url.pathname === '/api/admin/acceso') { const d = await cuerpo(req); const c = estado.compradores.find(c => c.id === d.id); exigir(c, 'Comprador inexistente.', 404); exigir(['activo','pendiente','revocado'].includes(d.acceso), 'Estado inválido.'); exigir(Number.isFinite(Date.parse(d.vence)), 'Fecha inválida.'); exigir(Array.isArray(d.encuentros) && d.encuentros.length === 3 && d.encuentros.every(x => typeof x === 'boolean'), 'Encuentros inválidos.'); c.acceso = d.acceso; c.vence = new Date(d.vence).toISOString(); c.encuentros = d.encuentros; await guardar(); return responder(res, 200, { ok: true }); }
      }
      return responder(res, 404, { error: 'Ruta inexistente.' });
    }
    exigir(['GET', 'HEAD'].includes(req.method), 'Método no permitido.', 405);
    const relativa = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const ruta = resolve(raiz, 'public', relativa); exigir(ruta.startsWith(resolve(raiz, 'public') + sep), 'Ruta no permitida.', 403);
    let contenido; try { contenido = await readFile(ruta); } catch { return responder(res, 404, { error: 'Archivo no encontrado.' }); }
    res.writeHead(200, { 'Content-Type': tipos[extname(ruta)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); res.end(req.method === 'HEAD' ? undefined : contenido);
  } catch (error) { if (!res.headersSent) responder(res, error.codigo || 500, { error: error.codigo ? error.message : 'No pudimos completar la operación.' }); }
});
servidor.listen(Number(process.env.PORT || 3000), process.env.HOST || '0.0.0.0', () => console.log(`Equilibrio 21 · demo disponible en el puerto ${servidor.address().port}`));
