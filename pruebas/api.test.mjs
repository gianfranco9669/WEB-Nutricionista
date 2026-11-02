import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as esperar } from 'node:timers/promises';

let proceso, carpeta, base, compradorId, cookieComprador, cookieAdmin, configuracion;
async function solicitar(ruta, { metodo = 'GET', datos, cookie, cabecera = true } = {}) {
 const respuesta = await fetch(`${base}/api/${ruta}`, { method: metodo, headers: { 'Content-Type': 'application/json', ...(cabecera ? { 'X-Equilibrio-Demo': '1' } : {}), ...(cookie ? { Cookie: cookie } : {}) }, ...(datos ? { body: JSON.stringify(datos) } : {}) });
 return { codigo: respuesta.status, datos: await respuesta.json(), cookie: respuesta.headers.get('set-cookie')?.split(';')[0], cookieCompleta: respuesta.headers.get('set-cookie') };
}
before(async () => {
 carpeta = await mkdtemp(join(tmpdir(), 'equilibrio-prueba-'));
 proceso = spawn(process.execPath, ['servidor.mjs'], { env: { ...process.env, PORT: '0', HOST: '127.0.0.1', DIRECTORIO_DATOS: carpeta }, stdio: ['ignore', 'pipe', 'pipe'] });
 // El sistema asigna un puerto libre para no interferir con la demo en ejecución.
 base = await new Promise((resolve, reject) => {
  const temporizador = setTimeout(() => reject(new Error('El servidor no inició.')), 10000);
  proceso.once('error', reject);
  proceso.stderr.on('data', d => { clearTimeout(temporizador); reject(new Error(String(d))); });
  proceso.stdout.on('data', d => { const puerto = String(d).match(/puerto (\d+)/)?.[1]; if(puerto) { clearTimeout(temporizador); resolve(`http://127.0.0.1:${puerto}`); } });
 });
});
after(async () => { proceso?.kill(); await esperar(100); if(carpeta) await rm(carpeta,{recursive:true,force:true}); });

test('la portada sirve HTML, fuentes e imagen sin servicios externos', async () => {
 for(const [ruta,tipo] of [['/','text/html'],['/estilos.css','text/css'],['/aplicacion.js','text/javascript'],['/fuentes/editorial.ttf','font/ttf'],['/imagenes/bowl-equilibrio.webp','image/webp'],['/imagenes/desayuno.webp','image/webp'],['/imagenes/habitos.webp','image/webp'],['/imagenes/mercado.webp','image/webp']]) {
  const r = await fetch(`${base}${ruta}`); assert.equal(r.status,200); assert.ok(r.headers.get('content-type').startsWith(tipo)); assert.ok((await r.arrayBuffer()).byteLength > 100);
 }
 const r = await solicitar('publico'); assert.equal(r.datos.semanas.length,3); assert.equal(r.datos.itinerario.length,21); assert.ok(r.datos.itinerario.every(d => !('enlaces' in d))); assert.equal(r.datos.configuracion.enlaceReservas,undefined); configuracion = r.datos.configuracion; assert.equal(r.datos.configuracion.recursos,undefined);
});
test('el acceso anónimo no permite campus ni administración', async () => {
 assert.equal((await solicitar('campus')).codigo,401); assert.equal((await solicitar('admin/estado')).codigo,403);
});
test('rechaza mutaciones sin la cabecera de la aplicación', async () => {
 assert.equal((await solicitar('demo',{metodo:'POST',datos:{modalidad:'administrador'},cabecera:false})).codigo,403);
});
test('Acompañado tiene 21 días, sesiones y cookie HttpOnly', async () => {
 const r = await solicitar('demo',{metodo:'POST',datos:{modalidad:'acompanado'}}); cookieComprador = r.cookie; assert.match(r.cookieCompleta, /HttpOnly/); assert.match(r.cookieCompleta, /SameSite=Strict/);
 const c = await solicitar('campus',{cookie:cookieComprador}); compradorId = c.datos.comprador.id;
 assert.equal(c.datos.dias.length,21); assert.equal(c.datos.comprador.encuentros.length,3); assert.equal(c.datos.comprador.modalidad,'acompanado');
 assert.equal(c.datos.dias[20].titulo,'Evaluación final y mantenimiento'); assert.equal(c.datos.dias[7].semana,2);
 const sesion = await solicitar('sesion',{cookie:cookieComprador}); assert.equal(sesion.datos.rol,'comprador');
});
test('el progreso se guarda, puede desmarcarse y valida el número de día', async () => {
 let r = await solicitar('progreso',{metodo:'POST',cookie:cookieComprador,datos:{dia:1}}); assert.deepEqual(r.datos.diasCompletados,[1]);
 assert.deepEqual((await solicitar('campus',{cookie:cookieComprador})).datos.comprador.diasCompletados,[1]);
 r = await solicitar('progreso',{metodo:'POST',cookie:cookieComprador,datos:{dia:1}}); assert.deepEqual(r.datos.diasCompletados,[]);
 assert.equal((await solicitar('progreso',{metodo:'POST',cookie:cookieComprador,datos:{dia:22}})).codigo,400);
 assert.equal((await solicitar('admin/estado',{cookie:cookieComprador})).codigo,403);
});
test('Esencial no recibe el enlace de reservas', async () => {
 const r = await solicitar('demo',{metodo:'POST',datos:{modalidad:'esencial'}});
 const c = await solicitar('campus',{cookie:r.cookie}); assert.equal(c.datos.comprador.modalidad,'esencial'); assert.equal('enlaceReservas' in c.datos,false);
});
test('administración modifica títulos, enlaces y precios; rechaza enlaces ajenos a Drive', async () => {
 cookieAdmin = (await solicitar('demo',{metodo:'POST',datos:{modalidad:'administrador'}})).cookie;
 const dia = {titulo:'Mi bienvenida de prueba',descripcion:'Un texto actualizado desde el panel.',enlaces:{clase:'https://drive.google.com/file/d/ejemplo/view'}};
 assert.equal((await solicitar('admin/dias/1',{metodo:'PUT',cookie:cookieAdmin,datos:dia})).codigo,200);
 assert.equal((await solicitar('campus',{cookie:cookieComprador})).datos.dias[0].titulo,dia.titulo);
 dia.enlaces.clase = 'https://example.com/archivo'; assert.equal((await solicitar('admin/dias/1',{metodo:'PUT',cookie:cookieAdmin,datos:dia})).codigo,400);
 const datos = {...configuracion,precioEsencial:62000,recursos:{},enlaceReservas:'https://calendly.com/ejemplo'};
 assert.equal((await solicitar('admin/configuracion',{metodo:'PUT',cookie:cookieAdmin,datos})).codigo,200);
 const publico=await solicitar('publico'); assert.equal(publico.datos.configuracion.precioEsencial,62000); assert.equal(publico.datos.configuracion.enlaceReservas,undefined); assert.equal(publico.datos.itinerario[0].titulo,dia.titulo);
});
test('acceso pendiente, revocado y vencido bloquea el campus desde el servidor', async () => {
 for(const acceso of ['pendiente','revocado','activo']) {
  const datos = {id:compradorId,acceso,vence: acceso === 'activo' ? '2020-01-01' : '2099-01-01',encuentros:[true,false,false]};
  assert.equal((await solicitar('admin/acceso',{metodo:'PUT',cookie:cookieAdmin,datos})).codigo,200);
  assert.equal((await solicitar('campus',{cookie:cookieComprador})).codigo,403);
 }
});
test('las compras son simuladas, no autorizan acceso y requieren consentimiento', async () => {
 assert.equal((await solicitar('compra-demo',{metodo:'POST',datos:{nombre:'Prueba',modalidad:'esencial',acepta:false}})).codigo,400);
 const r = await solicitar('compra-demo',{metodo:'POST',datos:{nombre:'Prueba',modalidad:'esencial',acepta:true,correo:'no-guardar@example.com'}});
 assert.equal(r.codigo,201); assert.match(r.datos.mensaje,/No se realizó ningún cobro/);
 const a = await solicitar('admin/estado',{cookie:cookieAdmin}); assert.equal(a.datos.compras.length,1); assert.equal(a.datos.compras[0].estado,'simulada'); assert.equal(a.datos.compras[0].correo,undefined); assert.equal(a.datos.compras[0].monto,62000);
});
test('cerrar sesión invalida la cookie', async () => {
 assert.equal((await solicitar('salir',{metodo:'POST',cookie:cookieAdmin})).codigo,200);
 assert.equal((await solicitar('admin/estado',{cookie:cookieAdmin})).codigo,403);
});
