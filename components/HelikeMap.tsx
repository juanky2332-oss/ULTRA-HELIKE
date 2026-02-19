import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip as LeafletTooltip, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Checkpoint } from '../types';

// --- CONFIGURACIÓN DE ICONOS ---
const createIcon = (color: string, size: number = 12) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [size, size],
  iconAnchor: [size/2, size/2]
});

const startIcon = L.divIcon({
  className: 'bg-transparent',
  html: `<div style="background-color: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; border: 1px solid #065f46; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">🏁 SALIDA</div>`,
  iconSize: [60, 20],
  iconAnchor: [30, 25]
});

const finishIcon = L.divIcon({
  className: 'bg-transparent',
  html: `<div style="background-color: #0f172a; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; border: 1px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">🏆 META</div>`,
  iconSize: [50, 20],
  iconAnchor: [25, -5]
});

// --- DATOS DE RUTA SIMULADOS (TRAZADO COMPLETO) ---
// Simulamos el track dividiéndolo en segmentos por tipo de terreno
const ROUTE_SEGMENTS = [
  {
    type: "Urbano/Pista",
    color: "#fbbf24", // Amarillo (Rápido)
    positions: [
      [38.2669, -0.6983], // Elche
      [38.2800, -0.7000], // Cauce Norte
      [38.3035, -0.7167], // Pantano (Llegada)
    ] as [number, number][]
  },
  {
    type: "Montaña Técnica",
    color: "#ef4444", // Rojo (Duro)
    positions: [
      [38.3035, -0.7167], // Pantano
      [38.3200, -0.7300], // Sierra Castellar
      [38.3100, -0.7500], // Crevillente zona alta
      [38.2800, -0.7400], // Bajada técnica
      [38.2500, -0.7100], // Hacia el sur
    ] as [number, number][]
  },
  {
    type: "Transición a Costa",
    color: "#94a3b8", // Gris (Enlace)
    positions: [
      [38.2500, -0.7100],
      [38.2000, -0.6900],
      [38.1437, -0.6622], // La Marina
    ] as [number, number][]
  },
  {
    type: "Arena / Playa",
    color: "#3b82f6", // Azul (Pesado)
    positions: [
      [38.1437, -0.6622], // La Marina
      [38.1800, -0.6400], // Playa
      [38.2200, -0.5800], // Carabassí
      [38.2500, -0.5500], // Arenales
      [38.2736, -0.5408], // El Altet (Salida playa)
    ] as [number, number][]
  },
  {
    type: "Campo / Vuelta",
    color: "#fbbf24", // Amarillo (Corrible)
    positions: [
      [38.2736, -0.5408], // Altet
      [38.2906, -0.5833], // Torrellano
      [38.2850, -0.6200], // Parque Empresarial
      [38.2669, -0.6983], // Elche Meta
    ] as [number, number][]
  }
];

// --- HITOS KILOMÉTRICOS ---
const KM_MARKERS = [
  { km: 10, pos: [38.29, -0.71] as [number, number] },
  { km: 20, pos: [38.32, -0.73] as [number, number] },
  { km: 30, pos: [38.29, -0.74] as [number, number] },
  { km: 40, pos: [38.18, -0.68] as [number, number] },
  { km: 50, pos: [38.16, -0.65] as [number, number] },
  { km: 60, pos: [38.24, -0.56] as [number, number] },
  { km: 70, pos: [38.28, -0.55] as [number, number] },
  { km: 80, pos: [38.29, -0.58] as [number, number] },
  { km: 90, pos: [38.27, -0.65] as [number, number] },
];

const MAJOR_CHECKPOINTS: Checkpoint[] = [
  { name: "SALIDA", pos: [38.2669, -0.6983], type: "start", km: 0, desc: "06:00 AM - Frontal ON" },
  { name: "PANTANO", pos: [38.3035, -0.7167], type: "aid", km: 18, desc: "Inicio zona técnica" },
  { name: "LA MARINA", pos: [38.1437, -0.6622], type: "aid", km: 45, desc: "BASE DE VIDA / Comida Caliente" },
  { name: "TORRELLANO", pos: [38.2906, -0.5833], type: "aid", km: 82, desc: "Última carga sólida" },
];

const HelikeMap: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full h-full bg-stone-200 animate-pulse rounded-3xl" />;
  }

  const centerPos: [number, number] = [38.24, -0.65]; // Centered to fit the loop

  return (
    <div className="w-full h-full relative z-0 bg-stone-100">
      <MapContainer 
        center={centerPos} 
        zoom={11} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        className="rounded-[2rem]"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {/* LÍNEAS DE RUTA (TRACK) */}
        {ROUTE_SEGMENTS.map((segment, idx) => (
          <Polyline 
            key={idx} 
            positions={segment.positions} 
            pathOptions={{ 
              color: segment.color, 
              weight: 5, 
              opacity: 0.8,
              lineJoin: 'round'
            }}
          >
            <LeafletTooltip sticky direction="top">
              <span className="font-bold text-xs uppercase">{segment.type}</span>
            </LeafletTooltip>
          </Polyline>
        ))}

        {/* MARCADORES KILOMÉTRICOS CADA 10KM */}
        {KM_MARKERS.map((m, idx) => (
          <CircleMarker 
            key={`km-${idx}`} 
            center={m.pos} 
            pathOptions={{ color: 'white', fillColor: '#3f3f46', fillOpacity: 1, weight: 2 }} 
            radius={6}
          >
            <LeafletTooltip direction="center" permanent className="bg-transparent border-0 shadow-none text-white font-bold text-[10px]">
              {m.km}
            </LeafletTooltip>
          </CircleMarker>
        ))}

        {/* PUNTOS DE CONTROL PRINCIPALES */}
        {MAJOR_CHECKPOINTS.map((loc, idx) => (
          <Marker 
            key={idx} 
            position={loc.pos} 
            icon={loc.type === 'start' ? startIcon : createIcon('#059669', 16)}
          >
            <Popup className="font-sans">
              <div className="text-center">
                <strong className="text-emerald-900 text-sm block uppercase tracking-wider">{loc.name}</strong>
                <span className="text-xs bg-stone-800 text-white px-2 py-0.5 rounded-full font-mono mt-1 inline-block">KM {loc.km}</span>
                <p className="text-xs text-stone-600 mt-2 font-medium border-t pt-1 border-stone-200">{loc.desc}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* MARCADOR DE META (Mismo punto que salida pero etiqueta distinta si se desea, o visual) */}
        <Marker position={[38.2669, -0.6983]} icon={finishIcon} zIndexOffset={100} />

      </MapContainer>
      
      {/* LEYENDA TÉCNICA FLOTANTE */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur px-4 py-3 rounded-xl shadow-xl border border-stone-200 text-xs flex flex-col gap-2 min-w-[140px]">
        <h4 className="font-black text-stone-800 uppercase tracking-widest text-[10px] border-b border-stone-200 pb-1 mb-1">Tipo de Terreno</h4>
        
        <div className="flex items-center justify-between">
          <span className="font-bold text-stone-600">Pista Rápida</span>
          <span className="w-8 h-1.5 rounded-full bg-amber-400"></span> 
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-stone-600">Montaña</span>
          <span className="w-8 h-1.5 rounded-full bg-red-500"></span> 
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-stone-600">Costa / Arena</span>
          <span className="w-8 h-1.5 rounded-full bg-blue-500"></span> 
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-stone-600">Enlace</span>
          <span className="w-8 h-1.5 rounded-full bg-slate-400"></span> 
        </div>
      </div>
    </div>
  );
};

export default HelikeMap;
