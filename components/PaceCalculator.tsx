import React, { useEffect } from 'react';
import { Timer, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { RacePace } from '../types';

interface PaceCalculatorProps {
  targetHours: number;
  setTargetHours: (h: number) => void;
  targetMinutes: number;
  setTargetMinutes: (m: number) => void;
  paces: RacePace;
  setPaces: (p: RacePace) => void;
}

const PaceCalculator: React.FC<PaceCalculatorProps> = ({ 
  targetHours, setTargetHours, targetMinutes, setTargetMinutes, paces, setPaces 
}) => {
  const DISTANCE = 100; // km

  useEffect(() => {
    calculatePaces();
  }, [targetHours, targetMinutes]);

  const calculatePaces = () => {
    const totalMinutes = (Number(targetHours) * 60) + Number(targetMinutes);
    if (totalMinutes <= 0) return;

    const avgPaceDecimal = totalMinutes / DISTANCE;
    
    // Heuristic factors for terrain
    const flatFactor = 0.95; // Slightly faster than avg
    const uphillFactor = 1.30; // Significantly slower
    const downhillFactor = 0.90; // Faster

    setPaces({
      avg: formatPace(avgPaceDecimal),
      flat: formatPace(avgPaceDecimal * flatFactor),
      uphill: formatPace(avgPaceDecimal * uphillFactor),
      downhill: formatPace(avgPaceDecimal * downhillFactor),
    });
  };

  const formatPace = (decimalMinPerKm: number) => {
    const minutes = Math.floor(decimalMinPerKm);
    const seconds = Math.round((decimalMinPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-stone-900 text-white p-6 rounded-[2rem] h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Timer className="text-emerald-400" size={20} />
          Calculadora de Objetivo
        </h3>
        <span className="text-xs font-mono bg-stone-800 px-2 py-1 rounded text-stone-400 border border-stone-700">100 KM</span>
      </div>

      <div className="bg-black/20 p-4 rounded-2xl mb-6 border border-stone-700/50">
        <label className="text-stone-400 text-[10px] uppercase tracking-widest font-bold block mb-3 text-center">Introduce tu Tiempo Meta</label>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <input 
              type="number" 
              min="8" max="24"
              value={targetHours}
              onChange={(e) => setTargetHours(parseInt(e.target.value) || 0)}
              className="w-full bg-stone-800 border border-stone-600 rounded-xl px-2 py-3 text-center font-mono text-3xl focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-400 font-bold"
            />
            <span className="text-[10px] text-center block mt-2 text-stone-500 font-bold">HORAS</span>
          </div>
          <span className="text-2xl font-bold text-stone-600 -mt-6">:</span>
          <div className="flex-1">
            <input 
              type="number" 
              min="0" max="59"
              value={targetMinutes}
              onChange={(e) => setTargetMinutes(parseInt(e.target.value) || 0)}
              className="w-full bg-stone-800 border border-stone-600 rounded-xl px-2 py-3 text-center font-mono text-3xl focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-400 font-bold"
            />
            <span className="text-[10px] text-center block mt-2 text-stone-500 font-bold">MINUTOS</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-stone-800 to-stone-800/50 rounded-xl border-l-4 border-emerald-500 shadow-lg">
          <div className="flex items-center gap-3">
            <Activity size={18} className="text-emerald-400" />
            <span className="text-sm font-bold">Media Global</span>
          </div>
          <span className="font-mono text-xl font-black text-white">{paces.avg} <span className="text-[10px] text-stone-400 font-normal">/km</span></span>
        </div>

        <div className="flex items-center justify-between p-3 bg-stone-800/30 rounded-xl border border-stone-800/50">
          <div className="flex items-center gap-3">
            <Minus size={16} className="text-blue-400" />
            <div>
              <span className="text-xs font-bold block text-stone-300">Llano / Asfalto</span>
            </div>
          </div>
          <span className="font-mono text-base font-bold text-stone-200">{paces.flat}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-stone-800/30 rounded-xl border border-stone-800/50">
          <div className="flex items-center gap-3">
            <TrendingUp size={16} className="text-red-400" />
             <div>
              <span className="text-xs font-bold block text-stone-300">Subidas / Arena</span>
            </div>
          </div>
          <span className="font-mono text-base font-bold text-stone-200">{paces.uphill}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-stone-800/30 rounded-xl border border-stone-800/50">
          <div className="flex items-center gap-3">
            <TrendingDown size={16} className="text-green-400" />
             <div>
              <span className="text-xs font-bold block text-stone-300">Bajadas</span>
            </div>
          </div>
          <span className="font-mono text-base font-bold text-stone-200">{paces.downhill}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-stone-800 text-[10px] text-stone-500 text-center leading-tight">
        Modifica el tiempo y observa como se actualiza la <strong className="text-emerald-500">Tabla Táctica</strong> del panel principal.
      </div>
    </div>
  );
};

export default PaceCalculator;