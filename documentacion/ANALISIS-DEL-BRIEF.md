# Análisis del brief — Equilibrio 21

Documento analizado: `Equilibrio_21_Brief_Programador.pdf`, siete páginas. El objetivo es comercializar educación nutricional de 21 días; no es una plataforma clínica. Los requisitos del PDF se usaron como especificación del producto; la petición actual es construir una demo premium para presentación.

## Matriz de requisitos

| Apartado | Requisito y decisión | Resultado en la demo / condición para producción |
| --- | --- | --- |
| 1. Proyecto | Venta pública y un índice visual privado de materiales editables. | Portada, campus y panel funcionales; los enlaces son editables y persistentes. No se alojan clases o PDFs. |
| 2. Modalidades | Esencial y Acompañado, pago único; Acompañado suma tres sesiones. Precios y vigencia configurables. | Comparación y perfiles separados. Precios ilustrativos ARS 49.000 / 99.000 y vigencia inicial 90 días, editables. Sin suscripción. No son precios aprobados por la cliente. |
| 3. Venta | Objetivos, destinatarios, tres semanas, materiales, profesional, FAQ y botones de compra. | Secciones completas, lenguaje argentino cercano y adaptación a móvil, tablet y escritorio. Biografía de muestra identificada; faltan datos profesionales verificados. |
| 4. Pagos y usuarios | Mercado Pago, aprobación verificada, cuenta y email de confirmación, correo de Google. | Recorrido de compra simulado, con consentimiento y campo de correo de Google. No guarda ese correo ni datos bancarios. No hay integración real ni identidad productiva. Nunca se usa una redirección como prueba de pago. |
| 5. Campus | Bienvenida, tres semanas, 21 días, biblioteca y reservas exclusivas. | Los 21 títulos originales; navegación semanal, biblioteca, progreso persistente y cuenta. El backend controla vigencia y modalidad; no entrega enlace de reserva a Esencial. |
| 6. Cada día | Número, semana, título, descripción y cinco accesos a materiales. | Pantalla por día con clase, material, receta, actividad y registro personal. Enlaces pendientes explícitos; al configurar, abren pestaña nueva con protección de origen. Descripciones editoriales provisionales, no contenido médico validado. |
| 7. Drive | Biblioteca publicada separada de borradores; actualización conservando enlaces. | Gestión de enlaces por día y cuatro recursos globales. Validación HTTPS de drive.google.com / docs.google.com. Estructura recomendada documentada; no se crea una carpeta sin autorización o credenciales. |
| 8. Permisos | Restringido, permisos de Lector individuales; manual o API; completo o progresivo. | La demo no concede permisos. Estado pendiente/activo/revocado y vigencia controlan el campus. Etapa inicial propuesta: permisos manuales y contenido completo; revocar el campus no revoca Drive. Automatización y desbloqueo progresivo se presupuestan aparte. |
| 9. Materiales | 12–15 microclases, 25–35 recetas, 10–12 guías, menús, actividades, mantenimiento. | Contenedores listos para enlaces, sin inventar los materiales profesionales. Cuaderno y síntomas no se almacenan online. La nutricionista publica su contenido. |
| 10. Encuentros | Tres sesiones ligadas a semanas, proveedor externo, sin duplicados ni cobros extra. | Vista exclusiva para Acompañado y registro administrativo de utilizadas. Enlace externo configurable. En demo no hay reservas reales ni prevención de duplicados entre sistemas; ver estrategia de enlaces únicos y webhooks en PRODUCCION.md. |
| 11. Administración | Textos, precios, 21 días, enlaces, compradores, pagos, vigencia, sesiones. | Portada principal, precios, vigencia inicial, recursos, enlaces, 21 títulos y descripciones editables. Accesos, compras de muestra y sesiones visibles. Otras secciones editoriales de portada siguen en código; CMS ampliado queda para producción. |
| 12. Identidad | Cálida, minimalista, profesional, Montserrat o alternativa, crema/salvia/terracota, fotos reales. | Sistema editorial con Noto Serif Display + Inter, fuentes locales abiertas. Diseño adaptativo. Imagen gastronómica generada y monograma provisional: reemplazar por fotos reales de platos y profesional para publicación. |
| 13. Seguridad y legales | Autenticación, protección de datos, permisos y términos; Ley 25.326; sin curaciones prometidas. | Cookies HttpOnly/SameSite, sesiones de ocho horas, control por rol/estado/vigencia, validación de entradas, CSP, escape de HTML, límites de payload. Términos/privacidad identificados como borradores. Accesos demo abiertos: no aptos para producción. |
| 14. Exclusiones | Sin chat, videollamadas, historia clínica, IA dietética ni síntomas almacenados. | Respetadas. Solo se registra qué días se completaron; no se piden ni guardan datos de salud. |

## Recorrido y temario

Los 21 días respetan los temas del PDF, incluidos los tres días de revisión, el eje intestino-cerebro, FODMAP, tolerancia, planificación y mantenimiento. Se almacenan como contenido editable. Las descripciones iniciales son textos de demostración y requieren revisión de la nutricionista.

El programa se ve completo desde la habilitación. “21 días” describe la propuesta educativa, no un bloqueo diario automático. El tiempo de acceso es otro parámetro y debe decidirlo María Sol.

## Decisiones de producto

- Una sola aplicación Node.js, sin dependencias externas: fácil de ejecutar y presentar en el entorno disponible. Frontend de HTML/CSS/JavaScript moderno y backend en español; nombres exigidos por HTTP, navegador y Node se mantienen en inglés.
- La identidad prioriza composición editorial, espacios amplios, curvas discretas y tipografía con carácter. Evita estética detox, promesas de resultados, testimonios falsos y contadores inventados.
- No se inventan matrícula, retrato o experiencia profesional. El espacio “Sobre mí” debe ser validado y completado por la nutricionista.
- El formulario de compra explica el correo de Google sin almacenarlo en la demo. En producción debe confirmarse la cuenta correcta, aunque sea distinta del correo de facturación.
- Los estados de acceso no pretenden representar permisos reales de Drive. La administración indica la separación entre ambos.
- La simulación de compra no crea una cuenta real ni envía un correo ficticio. La navegación invita a explorar un perfil de muestra separado.
- La persistencia JSON es adecuada para mostrar cambios en una instancia; antes de vender se recomienda una base transaccional, autenticación productiva y alojamiento HTTPS.

## Alcance pendiente de aprobación comercial

La cliente debe definir precios, moneda y compradores del exterior, vigencia, matrícula/biografía/retrato, materiales, carpeta publicada, cuenta de cobros, remitente de correo y políticas comerciales. No se requieren estas decisiones para presentar la demo; sí para habilitar ventas reales.

No se prometió cumplimiento legal automático ni permisos que esta entrega no configura. El documento de producción separa alcance inicial de automatizaciones opcionales para presupuestar sin inflar el MVP.
