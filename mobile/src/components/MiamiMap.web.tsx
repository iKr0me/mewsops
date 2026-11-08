import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { FICTIONAL_MAP_POINTS, MIAMI_CENTER } from './MiamiMap.data';

/** Web uses Leaflet and OpenStreetMap tiles; native uses the device map provider. */
export default function MiamiMap() {
  const container = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let disposed = false;
    let map: import('leaflet').Map | undefined;
    void import('leaflet').then((L) => {
      if (disposed || !container.current) return;
      map = L.map(container.current, { scrollWheelZoom: false }).setView([MIAMI_CENTER.latitude, MIAMI_CENTER.longitude], 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(map);
      FICTIONAL_MAP_POINTS.forEach((point) => {
        L.circleMarker([point.latitude, point.longitude], { radius: 9, color: '#ffffff', weight: 3, fillColor: '#a63b48', fillOpacity: 1 })
          .bindTooltip(`${point.title} — fictional example, not a rescue site`)
          .bindPopup(`<strong>${point.title}</strong><br>Fictional example — not an actual rescue location.`)
          .addTo(map!);
      });
    }).catch(() => { if (!disposed) setUnavailable(true); });
    return () => { disposed = true; map?.remove(); };
  }, []);
  return (
    <div style={{ width: '100%' }}>
      <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: '18px', color: '#33474c' }}>Real Miami map · markers are fictional examples, not rescue sites.</p>
      <div ref={container} role="region" aria-label="Interactive Miami map with three fictional example markers" style={{ width: '100%', height: 320, borderRadius: 12, overflow: 'hidden' }} />
      {unavailable && <p role="alert">The map could not be loaded. Check your connection and try again.</p>}
      <p style={{ fontSize: 13, lineHeight: '18px', color: '#33474c' }}>Examples: Fictional colony A, Fictional colony B, Fictional colony C.</p>
    </div>
  );
}
