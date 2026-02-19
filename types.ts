import React from 'react';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface ElevationPoint {
  km: number;
  altitude: number;
  label?: string;
  terrain?: string;
}

export interface RacePace {
  avg: string;
  flat: string;
  uphill: string;
  downhill: string;
}

export interface Metric {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  subtext?: string;
}

export interface StatData {
  name: string;
  visitors: number;
  palms?: number;
}

export interface Checkpoint {
  name: string;
  pos: [number, number];
  type: 'start' | 'aid' | 'landmark' | 'finish';
  km: number;
  desc?: string;
  arrival?: string; // Calculated arrival time (e.g., "09:15")
}

export interface RouteSegment {
  id: number;
  name: string;
  startKm: number;
  endKm: number;
  terrain: 'Asfalto' | 'Montaña' | 'Arena' | 'Pista' | 'Asfalto/Mixto' | 'Urbano';
  terrainFactor: number; // 1.0 = avg, >1.0 = slower, <1.0 = faster
  elevation: string; // "+300m"
  strategy: string; // "Correr fácil, guardar piernas"
  color: string;
  // Calculated fields
  calculatedPace?: string;
  calculatedTimeStr?: string;
  arrivalClockTime?: string;
}