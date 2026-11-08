import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { FICTIONAL_MAP_POINTS, MIAMI_CENTER, type MiamiMapProps } from './MiamiMap.data';
export type { MiamiMapPoint, MiamiMapProps } from './MiamiMap.data';

export default function MiamiMap({ points = FICTIONAL_MAP_POINTS, selectedId, onSelect }: MiamiMapProps = {}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const layersRef = useRef<import('leaflet').LayerGroup | null>(null);
  const [library, setLibrary] = useState<typeof import('leaflet') | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [internalId, setInternalId] = useState<string | null>(null);
  const activeId = selectedId === undefined ? internalId : selectedId;
  const selectRef = useRef<(id: string) => void>(() => {});
  useEffect(() => {
    selectRef.current = (id) => { if (selectedId === undefined) setInternalId(id); onSelect?.(id); };
  }, [selectedId, onSelect]);
  useEffect(() => {
    let disposed = false;
    void import('leaflet').then(L => {
      if (disposed || !container.current) return;
      const map = L.map(container.current, { scrollWheelZoom: false }).setView([MIAMI_CENTER.latitude, MIAMI_CENTER.longitude], 13);
      mapRef.current = map;
      const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' }).addTo(map);
      tiles.on('tileerror', () => { if (!disposed) setUnavailable(true); });
      tiles.on('load', () => { if (!disposed) setUnavailable(false); });
      layersRef.current = L.layerGroup().addTo(map);
      setLibrary(L);
      map.invalidateSize();
    }).catch(() => { if (!disposed) setUnavailable(true); });
    return () => { disposed = true; mapRef.current?.remove(); mapRef.current = null; layersRef.current = null; };
  }, []);
  useEffect(() => {
    if (!library || !layersRef.current) return;
    layersRef.current.clearLayers();
    points.forEach(point => {
      library.circleMarker([point.latitude, point.longitude], { radius: activeId === point.id ? 12 : 9, color: '#fff', weight: 3, fillColor: activeId === point.id ? '#7c3218' : '#d97437', fillOpacity: 1 })
        .bindTooltip(point.title).on('click', () => selectRef.current(point.id)).addTo(layersRef.current!);
    });
  }, [library, points, activeId]);
  return <div style={{ width: '100%' }}>
    <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: '18px', color: '#493b30' }}>Miami streets · demo colony positions are illustrative, not actual rescue sites.</p>
    <div ref={container} role="region" aria-label="Miami map of example colony locations" style={{ width: '100%', height: 320, borderRadius: 12, overflow: 'hidden' }} />
    {unavailable && <p role="status">Some map content could not be loaded. Use the colony list below.</p>}
    <p style={{ fontWeight: 700, fontSize: 14 }}>Colony list · select a colony</p>
    {points.length === 0 ? <p>No colonies available to display.</p> : points.map(point => <button key={point.id} type="button" aria-pressed={activeId === point.id} onClick={() => selectRef.current(point.id)} style={{ display: 'block', width: '100%', minHeight: 44, textAlign: 'left', padding: '8px 12px', marginBottom: 8, background: activeId === point.id ? '#f7dfc0' : '#fffcf4', color: '#261c17', border: `1px solid ${activeId === point.id ? '#8d3f1c' : '#d5c3aa'}`, cursor: 'pointer' }}>{point.title}{activeId === point.id ? ' · Selected' : ''}</button>)}
  </div>;
}
