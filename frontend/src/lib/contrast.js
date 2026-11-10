// UH16: contraste WCAG 2.x (sin React ni DOM). Luminancia relativa sRGB y razon de contraste.
// Se usa para medir el texto del encabezado contra el peor pixel del fondo.

export const AA_NORMAL = 4.5;
export const AA_LARGE = 3;

function assertChannel(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 255) {
    throw new RangeError(`canal debe ser un numero en [0, 255], recibido: ${value}`);
  }
}

// Canal sRGB de 0 a 255 a valor lineal.
export function linearize(channel) {
  assertChannel(channel);
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

// Luminancia relativa de un color [r, g, b] (0 a 255): 0 negro, 1 blanco.
export function relativeLuminance(rgb) {
  if (!Array.isArray(rgb) || rgb.length < 3) {
    throw new TypeError(`rgb debe ser una lista [r, g, b], recibido: ${rgb}`);
  }
  const [r, g, b] = rgb.map(linearize);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function assertLuminance(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`luminancia debe estar en [0, 1], recibido: ${value}`);
  }
}

// Razon de contraste entre dos luminancias, siempre >= 1 (orden indiferente).
export function contrastFromLuminance(l1, l2) {
  assertLuminance(l1);
  assertLuminance(l2);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

export function contrastRatio(rgbA, rgbB) {
  return contrastFromLuminance(relativeLuminance(rgbA), relativeLuminance(rgbB));
}

export function hexToRgb(hex) {
  if (typeof hex !== 'string' || !/^#[0-9a-f]{6}$/i.test(hex)) {
    throw new TypeError(`hex debe tener la forma #RRGGBB, recibido: ${hex}`);
  }
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Peor contraste de un texto contra una lista de pixeles RGBA planos (como ImageData.data).
// Devuelve la razon minima y el pixel que la produce.
export function worstContrast(textRgb, pixels) {
  if (!pixels || typeof pixels.length !== 'number' || pixels.length < 4 || pixels.length % 4 !== 0) {
    throw new RangeError('pixels debe ser una lista RGBA no vacia con longitud multiplo de 4');
  }
  const lt = relativeLuminance(textRgb);
  let worst = Infinity;
  let pixel = null;
  for (let i = 0; i < pixels.length; i += 4) {
    const rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
    const ratio = contrastFromLuminance(lt, relativeLuminance(rgb));
    if (ratio < worst) {
      worst = ratio;
      pixel = rgb;
    }
  }
  return { ratio: worst, pixel };
}

export function passesAA(ratio, large = false) {
  if (typeof ratio !== 'number' || Number.isNaN(ratio) || ratio < 1) {
    throw new RangeError(`ratio debe ser un numero >= 1, recibido: ${ratio}`);
  }
  return ratio >= (large ? AA_LARGE : AA_NORMAL);
}
