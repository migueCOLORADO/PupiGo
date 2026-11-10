// UH16 #219: textos del carrusel. Fuente: README.md del proyecto (Context, Proposed Solution,
// Product Vision, Access Routes, Trying a Full Trip, Authors y Course Information).
import imgQuienes from '../../assets/logo.png';
import imgComoUsar from '../../assets/landing/como-usar.svg';
import imgConductores from '../../assets/landing/fondoConductor.jpg';
import imgVision from '../../assets/landing/nuestraVision.jpg';

// fit 'contain': la imagen se muestra completa y centrada sobre el color bg (logo e ilustracion).
// whiten: aclara el fondo gris muy claro del logo (#F7F7F7) para que se funda con el blanco.
// Fotos (sin fit): natural es su tamano en pixeles y focal su punto de interes (object-position).
// La tarjeta y el detalle deciden cover o contain con fondo desenfocado (lib/carousel.js).

export const LANDING_CARDS = [
  {
    id: 'quienes-somos',
    title: 'Quiénes somos',
    image: imgQuienes,
    fit: 'contain',
    bg: '#FFFFFF',
    natural: { w: 483, h: 138 },
    whiten: true,
    alt: 'Logo de PupiGo',
    summary: 'PupiGo nace de la comunidad EAFIT que se mueve entre la universidad y el metro, la misma que creó Caminantes y le puso nombre al Pupi móvil.',
    detail: [
      'Durante varios semestres la comunidad estudiantil de EAFIT reportó robos en el trayecto entre la universidad y la estación del metro, sobre todo en la tarde y la noche. Como primera respuesta los estudiantes crearon "Caminantes": coordinaban la salida por chat y caminaban juntos.',
      'La solución que más tranquilidad dio fue el transporte gestionado por la universidad: primero una van con cupo limitado que la comunidad bautizó "Pupi móvil" y luego un bus colectivo de mayor capacidad, "el colectivo".',
      'Hoy ese servicio se coordina por el grupo de WhatsApp "Caminantes EAFIT" con un sticker que pregunta "¿Por dónde pasa el Pupi móvil?". PupiGo reemplaza esa coordinación informal con una aplicación web que muestra el colectivo en tiempo real.',
      'Somos el equipo Los Integradores (Miguel Ángel Colorado Castaño, Juan Diego Muñoz Buitrago, Daniel Mauricio Giraldo Moreno, Julian Peña Ochoa y Samuel Montoya Espinosa), del curso ST0251 Proyecto Integrador 1 de Ingeniería de Sistemas en la Universidad EAFIT, 2026-2.',
    ],
  },
  {
    id: 'como-usar',
    title: 'Cómo usar la app',
    image: imgComoUsar,
    fit: 'contain',
    bg: '#F3F1EA',
    natural: { w: 320, h: 180 },
    alt: 'Ilustración de un celular con el mapa de la ruta y el colectivo',
    summary: 'Abre PupiGo desde el enlace, sin instalar nada, y mira en el mapa dónde va el colectivo, su ruta y su estado.',
    detail: [
      'PupiGo es una aplicación web: se abre desde un enlace y no requiere instalación.',
      'En la vista de estudiante ves el estado del viaje, el mapa ilustrado con la ruta fija Estación Aguacatala - Entrada Las Hermosas, el colectivo asignado y el asistente de IA.',
      'Cuando el viaje está en curso el colectivo aparece en el mapa y su posición se actualiza cada 5 segundos. Si no hay un viaje activo, la vista te lo indica.',
      'Puedes preguntarle al asistente cosas como "¿Dónde está el colectivo?". Si el asistente no tiene IA configurada, responde en modo automático con los datos del sistema.',
      'Para entrar, toca el botón GO: te lleva a la selección de rol.',
    ],
  },
  {
    id: 'conductores',
    title: 'Para conductores',
    image: imgConductores,
    natural: { w: 626, h: 626 },
    // la cara del conductor, no el torso
    focal: '60% 18%',
    alt: 'Ilustración de un conductor al volante del colectivo',
    summary: 'El conductor gestiona el viaje y comparte su ubicación GPS desde el navegador mientras hace el recorrido.',
    detail: [
      'En la vista del conductor eliges el sentido del viaje (Metro a EAFIT o EAFIT a Metro) y presionas "Poner en espera". Los estudiantes ven el viaje "En espera".',
      'Permite la ubicación en el navegador y presiona "Iniciar recorrido": la vista envía la posición GPS cada 5 segundos, incluso si el bus está detenido.',
      'Al terminar presiona "Finalizar recorrido", o "Cancelar recorrido" si el viaje no se hace. Solo puede haber un viaje activo a la vez.',
      'Si aparece "Permiso de ubicacion rechazado", revisa el icono de ubicación en la barra de direcciones del navegador y recarga la página.',
    ],
  },
  {
    id: 'vision',
    title: 'Nuestra visión',
    image: imgVision,
    natural: { w: 1200, h: 535 },
    focal: '55% 40%',
    alt: 'Campus de la Universidad EAFIT con estudiantes caminando entre los edificios',
    summary: 'Menos espera, más certeza: que cada estudiante sepa cuándo llega el colectivo y pueda planear su salida.',
    detail: [
      'Queremos reducir la incertidumbre de los estudiantes en el trayecto entre EAFIT y el metro, con información clara y oportuna sobre el transporte.',
      'Que dejen de perder tiempo esperando sin saber si el bus va a llegar, y que nadie termine caminando solo por falta de información.',
      'Pensamos en quienes tienen clase hasta tarde, en quienes dependen por completo de este transporte y en quienes hoy caminan solos porque no saben si alcanzan el bus.',
      'Lema: "Menos espera, más certeza."',
    ],
  },
];
