// Geometria del mapa ilustrado (tomada tal cual del mockup). Coordenadas en unidades del viewBox.
export const DESKTOP = {
  viewBox: '0 0 900 620',
  route: 'M 150 480 C 260 480, 260 380, 210 340 C 300 320, 340 250, 470 220 C 620 220, 620 150, 760 150',
  hwy: 'M0 470 C 220 450, 260 250, 480 230 C 660 215, 700 120, 900 90',
  river: 'M0 560 C 200 545, 220 500, 210 480',
  stops: { metro: { x: 150, y: 480 }, paradero: { x: 210, y: 341 }, eafit: { x: 760, y: 150 } },
};

export const MOBILE = {
  viewBox: '0 0 400 420',
  route: 'M 70 320 C 120 320, 130 260, 105 235 C 160 220, 190 170, 260 150 C 320 150, 320 110, 340 100',
  hwy: 'M0 320 C 100 310, 120 170, 240 150 C 300 140, 320 100, 400 70',
  river: 'M0 380 C 90 370, 100 340, 95 325',
  stops: { metro: { x: 70, y: 320 }, paradero: { x: 104, y: 235 }, eafit: { x: 340, y: 101 } },
};

export const NAMES = {
  metro: { long: 'Estación Aguacatala', short: 'Metro' },
  eafit: { long: 'Entrada Las Hermosas', short: 'EAFIT' },
};
