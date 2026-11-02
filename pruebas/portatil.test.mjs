import {test} from 'node:test';
import assert from 'node:assert/strict';
import {crearMotorPortatil} from '../herramientas/motor-portatil.mjs';
import {crearEstado,semanas} from '../contenidos.mjs';
const inicial=()=>({...crearEstado(),semanas:semanas.map(({temas,...s})=>s)});
function almacen(){const valores=new Map();return {getItem:clave=>valores.get(clave),setItem:(clave,valor)=>valores.set(clave,valor)};}
test('el entregable conserva el progreso en el navegador y separa modalidades',async()=>{
 const almacenamiento=almacen();let api=crearMotorPortatil(inicial(),almacenamiento);
 await api('demo','POST',{modalidad:'esencial'});
 await api('progreso','POST',{dia:9});
 api=crearMotorPortatil(inicial(),almacenamiento);
 const c=await api('campus');assert.deepEqual(c.comprador.diasCompletados,[9]);assert.equal('enlaceReservas' in c,false);
 await api('salir','POST');await assert.rejects(api('campus'));
 await api('demo','POST',{modalidad:'acompanado'});assert.equal((await api('campus')).comprador.encuentros.length,3);
});
test('editar el HTML portátil actualiza el explorador sin exponer enlaces privados',async()=>{
 const api=crearMotorPortatil(inicial(),almacen());
 await api('demo','POST',{modalidad:'administrador'});
 await api('admin/dias/2','PUT',{titulo:'Nuevo día',descripcion:'Descripción de prueba.',enlaces:{clase:'https://drive.google.com/file/d/demo/view'}});
 const p=await api('publico');assert.equal(p.itinerario[1].titulo,'Nuevo día');assert.equal(p.itinerario[1].enlaces,undefined);
 await assert.rejects(api('admin/dias/2','PUT',{titulo:'Nuevo día',descripcion:'Texto.',enlaces:{clase:'javascript:alert(1)'}}));
});
test('el archivo portátil funciona sin acceso al almacenamiento del navegador',async()=>{
 const api=crearMotorPortatil(inicial(),{getItem(){throw new Error('Bloqueado');},setItem(){throw new Error('Bloqueado');}});
 await api('demo','POST',{modalidad:'esencial'});assert.equal((await api('campus')).dias.length,21);
});
