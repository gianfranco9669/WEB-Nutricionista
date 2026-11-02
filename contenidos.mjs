export const semanas = [
  { numero: 1, titulo: 'Entendé tu digestión', descripcion: 'Conocé cómo funciona tu cuerpo y empezá a escuchar sus señales.', etiqueta: 'CONOCER', temas: ['Bienvenida y síntomas digestivos', 'Cómo funciona el sistema digestivo', 'Distensión, gases y sensibilidad visceral', 'Horarios, volumen y velocidad de las comidas', 'Reflejo gastrocólico y hábitos evacuatorios', 'Hidratación, movimiento y descanso', 'Revisión semanal'] },
  { numero: 2, titulo: 'Alimentá tu intestino', descripcion: 'Descubrí el mundo de tu microbiota y construí hábitos que te nutran.', etiqueta: 'NUTRIR', temas: ['Microbiota intestinal', 'Fibra soluble e insoluble', 'Estreñimiento y estrategias nutricionales', 'Fermentación intestinal y gases', 'Prebióticos, probióticos y alimentos fermentados', 'FODMAP y tolerancia alimentaria', 'Revisión semanal'] },
  { numero: 3, titulo: 'Construí tu equilibrio', descripcion: 'Integrá lo aprendido a tu vida real, con flexibilidad y confianza.', etiqueta: 'INTEGRAR', temas: ['Eje intestino-cerebro y estrés', 'Sueño, actividad física y motilidad', 'Interpretación de la tolerancia alimentaria', 'Comer fuera de casa sin miedo', 'Planificación de comidas y compras', 'Qué hacer cuando reaparecen los síntomas', 'Evaluación final y mantenimiento'] }
];
export function crearEstado() {
  return {
    configuracion: { titulo: 'Sentirte bien empieza por entenderte.', descripcion: 'Un programa de 21 días para conocer tu digestión, transformar tus hábitos y volver a disfrutar de comer. A tu ritmo, sin restricciones innecesarias.', precioEsencial: 49000, precioAcompanado: 99000, diasAcceso: 90, enlaceReservas: '', recursos: { recetario: '', menus: '', cuaderno: '', mantenimiento: '' } },
    dias: semanas.flatMap(s => s.temas.map((titulo, indice) => ({ numero: (s.numero - 1) * 7 + indice + 1, semana: s.numero, titulo, descripcion: `${s.descripcion} En este encuentro exploramos ${titulo.toLocaleLowerCase('es-AR')} a través de una propuesta educativa y una actividad para llevar a tu día a día.`, enlaces: { clase: '', material: '', receta: '', actividad: '', registro: '' } }))),
    compradores: [], compras: []
  };
}
