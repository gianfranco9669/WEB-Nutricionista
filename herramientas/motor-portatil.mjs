// Motor exclusivamente demostrativo del entregable HTML. No autentica usuarios reales.
export function crearMotorPortatil(inicial, almacenamiento) {
  const copiar = valor => JSON.parse(JSON.stringify(valor));
  const clave = 'equilibrio21-presentacion-v2';
  let memoria = { estado: copiar(inicial), sesion: null };
  try { almacenamiento ||= globalThis.localStorage; const anterior = almacenamiento?.getItem(clave); if(anterior) { const leido = JSON.parse(anterior); if(leido.version === 2) memoria = leido; } } catch { /* Navegadores sin almacenamiento local: funciona en memoria. */ }
  const guardar = () => { try { almacenamiento?.setItem(clave,JSON.stringify({...memoria,version:2})); } catch { /* La navegación sigue disponible aunque se agote el almacenamiento. */ } };
  const exigir = (condicion, mensaje) => { if(!condicion) throw new Error(mensaje); };
  const validarTexto = (valor,max) => { exigir(typeof valor === 'string' && valor.trim() && valor.length <= max,'Revisá los campos de texto.'); return valor.trim(); };
  const validarEnlace = (valor,drive = true) => { if(!valor) return ''; let u; try { u = new URL(valor); } catch { throw new Error('Ingresá un enlace HTTPS válido.'); } exigir(u.protocol === 'https:' && !u.username && !u.password && (!drive || ['drive.google.com','docs.google.com'].includes(u.hostname)), 'Usá un enlace HTTPS válido de Google Drive o Google Docs.'); return u.href; };
  return async function apiPortatil(ruta,metodo = 'GET',datos = {}) {
    const e = memoria.estado;
    const sesion = memoria.sesion?.vence > Date.now() ? memoria.sesion : null;
    const comprador = e.compradores.find(c => c.id === sesion?.compradorId);
    const vista = c => ({...c,vigente:new Date(c.vence) > new Date()});
    if(ruta === 'publico' && metodo === 'GET') { const {recursos,enlaceReservas,...configuracion} = e.configuracion; return copiar({configuracion,semanas:inicial.semanas,itinerario:e.dias.map(({numero,semana,titulo,descripcion})=>({numero,semana,titulo,descripcion})),demo:true}); }
    if(ruta === 'sesion') return copiar({rol:sesion?.rol || null,comprador:comprador ? vista(comprador) : null});
    if(ruta === 'demo' && metodo === 'POST') {
      exigir(['esencial','acompanado','administrador'].includes(datos.modalidad),'Modalidad inválida.');
      let cuenta;
      if(datos.modalidad !== 'administrador') { cuenta = {id:crypto.randomUUID(),nombre:'Visitante',correo:'visitante@example.com',modalidad:datos.modalidad,acceso:'activo',vence:new Date(Date.now()+e.configuracion.diasAcceso*86400000).toISOString(),diasCompletados:[],encuentros:[false,false,false],demo:true}; e.compradores.push(cuenta); }
      memoria.sesion = {rol:cuenta ? 'comprador' : 'administrador',compradorId:cuenta?.id,vence:Date.now()+28800000}; guardar(); return {ok:true};
    }
    if(ruta === 'salir') { memoria.sesion = null; guardar(); return {ok:true}; }
    if(ruta === 'compra-demo' && metodo === 'POST') {
      exigir(datos.acepta === true,'Aceptá las condiciones de la demostración.'); exigir(['esencial','acompanado'].includes(datos.modalidad),'Modalidad inválida.');
      const compra = {id:crypto.randomUUID(),nombre:validarTexto(datos.nombre,100),modalidad:datos.modalidad,monto:datos.modalidad === 'esencial' ? e.configuracion.precioEsencial : e.configuracion.precioAcompanado,estado:'simulada',fecha:new Date().toISOString(),demo:true}; e.compras.push(compra); guardar(); return {id:compra.id,mensaje:'Compra simulada. No se realizó ningún cobro ni se envió correo. Explorá el campus con una cuenta de demostración.'};
    }
    if(ruta === 'campus' || ruta === 'progreso') {
      exigir(comprador,'Ingresá a tu cuenta demo.'); exigir(comprador.acceso === 'activo' && new Date(comprador.vence) > new Date(),'Tu acceso está pendiente, revocado o vencido.');
      if(ruta === 'campus') return copiar({comprador:vista(comprador),dias:e.dias,semanas:inicial.semanas,recursos:e.configuracion.recursos,...(comprador.modalidad === 'acompanado' ? {enlaceReservas:e.configuracion.enlaceReservas} : {})});
      exigir(Number.isInteger(datos.dia) && datos.dia >= 1 && datos.dia <= 21,'Día inválido.'); comprador.diasCompletados = comprador.diasCompletados.includes(datos.dia) ? comprador.diasCompletados.filter(n=>n!==datos.dia) : [...comprador.diasCompletados,datos.dia]; guardar(); return copiar({diasCompletados:comprador.diasCompletados});
    }
    if(ruta.startsWith('admin/')) {
      exigir(sesion?.rol === 'administrador','Acceso exclusivo de administración.');
      if(ruta === 'admin/estado') return copiar(e);
      if(ruta === 'admin/configuracion' && metodo === 'PUT') {
        const recursos={}; for(const clave of ['recetario','menus','cuaderno','mantenimiento']) recursos[clave]=validarEnlace(datos.recursos?.[clave]||'');
        for(const clave of ['precioEsencial','precioAcompanado','diasAcceso']) exigir(Number.isSafeInteger(datos[clave]) && datos[clave]>0 && datos[clave]<=(clave==='diasAcceso'?3650:10000000),'Precios o vigencia inválidos.');
        e.configuracion={titulo:validarTexto(datos.titulo,120),descripcion:validarTexto(datos.descripcion,500),precioEsencial:datos.precioEsencial,precioAcompanado:datos.precioAcompanado,diasAcceso:datos.diasAcceso,enlaceReservas:validarEnlace(datos.enlaceReservas,false),recursos}; guardar(); return {ok:true};
      }
      if(/^admin\/dias\/\d+$/.test(ruta) && metodo === 'PUT') { const d=e.dias.find(d=>d.numero===Number(ruta.split('/')[2])); exigir(d,'Día inexistente.'); const enlaces={}; for(const clave of ['clase','material','receta','actividad','registro']) enlaces[clave]=validarEnlace(datos.enlaces?.[clave]||''); Object.assign(d,{titulo:validarTexto(datos.titulo,150),descripcion:validarTexto(datos.descripcion,1000),enlaces}); guardar(); return {ok:true}; }
      if(ruta === 'admin/acceso' && metodo === 'PUT') { const c=e.compradores.find(c=>c.id===datos.id); exigir(c,'Comprador inexistente.'); exigir(['activo','pendiente','revocado'].includes(datos.acceso) && Number.isFinite(Date.parse(datos.vence)),'Estado o fecha inválidos.'); exigir(Array.isArray(datos.encuentros) && datos.encuentros.length===3 && datos.encuentros.every(x=>typeof x==='boolean'),'Encuentros inválidos.'); Object.assign(c,{acceso:datos.acceso,vence:datos.vence,encuentros:datos.encuentros}); guardar(); return {ok:true}; }
    }
    throw new Error('Función no disponible en esta demostración.');
  };
}
