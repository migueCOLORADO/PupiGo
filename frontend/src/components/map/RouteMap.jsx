import { useState } from 'react';
import GoogleRouteMap from './GoogleRouteMap';
import { googleMapsApiKey } from './loadGoogleMaps';
import SvgRouteMap from './SvgRouteMap';

// Se re-exportan para no cambiar los imports existentes (StudentPanel, TopBar).
export { isPositionStale, liveLabel } from './status';

// UH20: mapa real de Google Maps limitado a la zona de los recorridos. Sin llave
// (VITE_GOOGLE_MAPS_API_KEY vacia) o si la API falla, se muestra el mapa SVG ilustrado.
// `direction` (opcional) es la direccion elegida sin recorrido; con recorrido manda trip.direction.
export default function RouteMap({ trip, direction, mobile = false }) {
  const apiKey = googleMapsApiKey();
  const [failed, setFailed] = useState(false);

  if (!apiKey || failed) return <SvgRouteMap trip={trip} mobile={mobile} />;
  return <GoogleRouteMap trip={trip} direction={direction} mobile={mobile} apiKey={apiKey} onFail={() => setFailed(true)} />;
}
