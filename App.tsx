import React, { useRef, useState, useEffect, useMemo } from 'react';
import { 
  Map as MapIcon, 
  TrendingUp, 
  Timer, 
  Download, 
  Mountain, 
  Footprints, 
  Flame, 
  Navigation,
  Trophy,
  BookOpen,
  User,
  Medal,
  ChevronRight,
  Target,
  Clock,
  Activity,
  Calendar,
  AlertTriangle,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ElevationChart from './components/ElevationChart';
import PaceCalculator from './components/PaceCalculator';
import HelikeMap from './components/HelikeMap';
import ChatWidget from './components/ChatWidget';
import RegulationsModal from './components/RegulationsModal';
import { ElevationPoint, RacePace, RouteSegment, Checkpoint } from './types';

// --- LOGO FLOWNEXION COMPONENT (RECREATED EXACTLY) ---
const FlownexionLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 256 256" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gradTop" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan */}
        <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
      </linearGradient>
      <linearGradient id="gradMiddle" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8b5cf6" /> {/* Purple */}
        <stop offset="100%" stopColor="#d946ef" /> {/* Fuchsia */}
      </linearGradient>
      <linearGradient id="gradBottom" x1="0%" y1="0%" x2="100%" y2="0%">
         <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan */}
         <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
      </linearGradient>
    </defs>
    
    {/* Top Band: Wide Trapezoid */}
    <path 
      d="M20 30 C20 18 30 10 45 10 H211 C226 10 236 18 236 30 V50 C236 62 226 70 211 70 H45 C30 70 20 62 20 50 V30 Z" 
      fill="url(#gradTop)" 
    />
    
    {/* Middle Band: Medium Trapezoid, shifted inward */}
    <path 
      d="M55 100 C55 88 65 80 80 80 H176 C191 80 201 88 201 100 V120 C201 132 191 140 176 140 H80 C65 140 55 132 55 120 V100 Z" 
      fill="url(#gradMiddle)" 
    />
    
    {/* Bottom Tip: Triangle/Cone */}
    <path 
      d="M90 170 C90 158 98 150 110 150 H146 C158 150 166 158 166 170 V180 C166 200 150 225 128 225 C106 225 90 200 90 180 V170 Z" 
      fill="url(#gradBottom)" 
    />
  </svg>
);

const App: React.FC = () => {
  const [runnerName, setRunnerName] = useState('');
  const [showRegulations, setShowRegulations] = useState(false);
  
  // Lifted state for PaceCalculator
  const [targetHours, setTargetHours] = useState<number>(14);
  const [targetMinutes, setTargetMinutes] = useState<number>(0);
  const [paces, setPaces] = useState<RacePace>({ avg: "0:00", flat: "0:00", uphill: "0:00", downhill: "0:00" });

  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // --- CONFIGURACIÓN BASE DE SEGMENTOS ---
  const baseSegments: RouteSegment[] = [
    { 
      id: 1, 
      name: "Salida y Vinalopó", 
      startKm: 0, endKm: 18, 
      terrain: "Pista", 
      terrainFactor: 0.95,
      elevation: "+250m", 
      strategy: "No te calientes. Ritmo fluido y constante.", 
      color: "border-l-amber-400" 
    },
    { 
      id: 2, 
      name: "Sierra y Pantano", 
      startKm: 18, endKm: 35, 
      terrain: "Montaña", 
      terrainFactor: 1.35,
      elevation: "+600m", 
      strategy: "Zona técnica. Usa bastones. Bebe isotónico.", 
      color: "border-l-red-500" 
    },
    { 
      id: 3, 
      name: "Bajada a Costa", 
      startKm: 35, endKm: 60, 
      terrain: "Arena", 
      terrainFactor: 1.10,
      elevation: "-400m", 
      strategy: "Paso corto en arena. Cuidado ampollas.", 
      color: "border-l-blue-500" 
    },
    { 
      id: 4, 
      name: "El Muro (Clot/Altet)", 
      startKm: 60, endKm: 85, 
      terrain: "Asfalto/Mixto", 
      terrainFactor: 1.05,
      elevation: "+150m", 
      strategy: "Juego mental. Come sólido. Corre-anda.", 
      color: "border-l-slate-400" 
    },
    { 
      id: 5, 
      name: "Gloria (Vuelta)", 
      startKm: 85, endKm: 100, 
      terrain: "Urbano", 
      terrainFactor: 1.0,
      elevation: "-50m", 
      strategy: "Vacia el tanque. Visualiza la meta.", 
      color: "border-l-emerald-500" 
    },
  ];

  // --- HELPER: Calcular Hora en KM específico (Crucial para el PDF) ---
  const calculateTimeAtKm = (km: number): string => {
    const totalMinutesInput = (targetHours * 60) + targetMinutes;
    if (totalMinutesInput <= 0) return "00:00";
    
    const avgPaceDecimal = totalMinutesInput / 100;
    const raceStartTime = new Date();
    raceStartTime.setHours(6, 0, 0, 0);

    let accumulatedMinutes = 0;
    let remainingKm = km;

    for (const seg of baseSegments) {
      const segDist = seg.endKm - seg.startKm;
      
      if (remainingKm <= 0) break;

      const distInThisSeg = Math.min(remainingKm, segDist);
      const segPace = avgPaceDecimal * seg.terrainFactor;
      
      accumulatedMinutes += (distInThisSeg * segPace);
      remainingKm -= distInThisSeg;
    }

    const arrivalTime = new Date(raceStartTime.getTime() + (accumulatedMinutes * 60000));
    return arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- LÓGICA DE CÁLCULO DINÁMICO ---
  const calculateSegments = useMemo(() => {
    const totalMinutes = (targetHours * 60) + targetMinutes;
    if (totalMinutes <= 0) return baseSegments;

    const avgPaceDecimal = totalMinutes / 100;
    const raceStartTime = new Date();
    raceStartTime.setHours(6, 0, 0, 0);

    let accumulatedMinutes = 0;

    return baseSegments.map(seg => {
      const distance = seg.endKm - seg.startKm;
      const segmentPaceDecimal = avgPaceDecimal * seg.terrainFactor;
      const segmentDurationMinutes = segmentPaceDecimal * distance;
      accumulatedMinutes += segmentDurationMinutes;

      const pMin = Math.floor(segmentPaceDecimal);
      const pSec = Math.round((segmentPaceDecimal - pMin) * 60);
      const paceStr = `${pMin}:${pSec.toString().padStart(2, '0')}`;

      const arrivalTime = new Date(raceStartTime.getTime() + (accumulatedMinutes * 60000));
      const timeStr = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        ...seg,
        calculatedPace: paceStr,
        arrivalClockTime: timeStr
      };
    });
  }, [targetHours, targetMinutes]);

  // Checkpoints dinámicos para el gráfico del PDF
  const pdfCheckpoints: Checkpoint[] = [
    { name: "SALIDA", km: 0, pos: [0,0], type: 'start', arrival: "06:00" },
    { name: "PANTANO", km: 18, pos: [0,0], type: 'aid', arrival: calculateTimeAtKm(18) },
    { name: "MARINA", km: 45, pos: [0,0], type: 'aid', arrival: calculateTimeAtKm(45) },
    { name: "ALTET", km: 65, pos: [0,0], type: 'aid', arrival: calculateTimeAtKm(65) },
    { name: "TORRELLANO", km: 82, pos: [0,0], type: 'aid', arrival: calculateTimeAtKm(82) },
    { name: "META", km: 100, pos: [0,0], type: 'finish', arrival: calculateTimeAtKm(100) },
  ];

  const elevationData: ElevationPoint[] = [
    { km: 0, altitude: 86, label: "ELCHE" },
    { km: 10, altitude: 120 },
    { km: 18, altitude: 250, label: "PANTANO" },
    { km: 25, altitude: 320, terrain: "mountain" },
    { km: 35, altitude: 150 },
    { km: 45, altitude: 5, label: "LA MARINA" },
    { km: 55, altitude: 10, terrain: "sand" },
    { km: 65, altitude: 80, label: "ALTET" },
    { km: 75, altitude: 110 },
    { km: 85, altitude: 90, label: "PARQUE EMP." },
    { km: 95, altitude: 86 },
    { km: 100, altitude: 86, label: "META" },
  ];

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    
    // Slight delay to allow render
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(printRef.current!, {
          scale: 2, // High quality
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`RacePlan_UltraHelike_${runnerName || 'PRO'}.pdf`);
      } catch (err) {
        console.error("Export failed", err);
      } finally {
        setIsExporting(false);
      }
    }, 200);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRunnerName(e.target.value.toUpperCase());
  };

  return (
    <div className="flex min-h-screen bg-stone-100 selection:bg-emerald-200 selection:text-emerald-900 font-sans text-stone-900">
      <RegulationsModal isOpen={showRegulations} onClose={() => setShowRegulations(false)} />

      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-0 h-full w-20 md:w-24 bg-stone-950 text-stone-400 flex flex-col items-center py-8 gap-8 z-50 border-r border-stone-800 shadow-2xl">
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl text-white shadow-lg shadow-emerald-500/20 ring-1 ring-white/10">
          <Trophy size={28} />
        </div>
        
        <div className="flex flex-col gap-8 mt-8 w-full items-center">
          <NavItem icon={Activity} active label="Control" />
        </div>

        <div className="mt-auto mb-6 opacity-50">
           <div className="text-[10px] font-mono text-stone-500 text-center rotate-180 writing-vertical tracking-widest uppercase">
             Ultra Helike 2025
           </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="ml-20 md:ml-24 flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto h-screen relative custom-scrollbar">
        
        {/* Top Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-stone-900 uppercase italic leading-[0.85]">
              Ultra <span className="text-emerald-600">Helike</span>
            </h1>
            <p className="text-stone-500 font-bold text-sm md:text-base flex items-center gap-2">
              <span className="bg-stone-900 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border border-stone-700">100 KM</span>
              <span className="bg-stone-200 text-stone-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Alicante</span>
              Planificación Técnica de Carrera
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-end md:items-center w-full md:w-auto">
            <div className="flex items-center bg-white border border-stone-300 rounded-xl px-4 py-3 shadow-sm w-full md:w-auto focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
              <User size={18} className="text-stone-400 mr-3" />
              <input 
                type="text" 
                placeholder="NOMBRE DEL CORREDOR" 
                value={runnerName}
                onChange={handleNameChange}
                className="bg-transparent outline-none text-stone-800 font-bold placeholder-stone-400 w-full text-sm uppercase tracking-wide"
              />
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowRegulations(true)}
                  className="bg-white border border-stone-300 text-stone-600 px-4 py-3 rounded-xl font-bold hover:bg-stone-50 hover:text-stone-900 transition-colors flex items-center gap-2 text-sm shadow-sm"
                >
                  <BookOpen size={18} /> <span className="hidden md:inline">Reglamento</span>
                </button>

                <button 
                  onClick={handleExportPDF}
                  className="group flex items-center gap-3 bg-stone-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-stone-800 transition-all active:scale-95 shadow-xl hover:shadow-2xl"
                >
                  <Download size={18} />
                  <span className="block text-xs uppercase tracking-wider font-bold">Descargar PDF</span>
                </button>
              </div>
              
              {/* Relocated Powered By Link with margin */}
              <a 
                href="https://www.flownexion.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-3 text-[10px] text-stone-400 font-bold hover:text-emerald-600 flex items-center gap-1.5 transition-colors pr-1"
              >
                 Powered by <FlownexionLogo className="w-5 h-5" /> <span className="tracking-tighter font-black text-xs">Flownexion</span>
              </a>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">
          
          {/* Key Stats Row */}
          <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Distancia Real" value="102.4 KM" icon={Footprints} color="emerald" sub="Oficial ITRA" />
            <StatCard title="Desnivel Positivo" value="+1,250 m" icon={Mountain} color="orange" sub="Corrible pero duro" />
            <StatCard title="Corte Meta" value="24:00 h" icon={Timer} color="red" sub="10.4 min/km media" />
            <StatCard title="Gasto Calórico" value="~9,000" icon={Flame} color="stone" sub="Kcal estimadas" />
          </div>

          {/* LEFT COLUMN: Map & Tactical Table */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            
            {/* Map Component */}
            <div className="bg-white p-1 rounded-[2rem] border border-stone-200 shadow-xl h-[450px] relative overflow-hidden group z-0">
               <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-stone-100 pointer-events-none">
                 <h3 className="font-bold text-stone-800 flex items-center gap-2 text-xs uppercase tracking-widest">
                   <Navigation size={14} className="text-emerald-600" />
                   Mapa Táctico del Recorrido
                 </h3>
               </div>
               <HelikeMap />
            </div>

            {/* Tactical Breakdown Table */}
            <div className="bg-white rounded-[2rem] border border-stone-200 shadow-lg overflow-hidden">
               <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                  <div>
                    <h3 className="font-black text-lg text-stone-800 uppercase tracking-tight flex items-center gap-2">
                      <Target className="text-emerald-600" size={20} />
                      Plan de Carrera Dinámico
                    </h3>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1 ml-7">
                      Basado en objetivo de {targetHours}h {targetMinutes}m • Salida 06:00 AM
                    </p>
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-white text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-100">
                     <tr>
                       <th className="px-6 py-4">Tramo (KM)</th>
                       <th className="px-6 py-4">Terreno</th>
                       <th className="px-6 py-4 text-center bg-emerald-50/50 text-emerald-800">Ritmo Obj.</th>
                       <th className="px-6 py-4 text-center bg-stone-50 text-stone-600">Hora Paso</th>
                       <th className="px-6 py-4">Estrategia</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-stone-100">
                     {calculateSegments.map((seg) => (
                       <tr key={seg.id} className={`hover:bg-stone-50 transition-colors border-l-4 ${seg.color}`}>
                         <td className="px-6 py-4">
                           <span className="block font-bold text-stone-800 text-base">{seg.name}</span>
                           <span className="text-xs text-stone-500 font-mono">Km {seg.startKm} - {seg.endKm}</span>
                         </td>
                         <td className="px-6 py-4">
                           <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                             seg.terrain === 'Montaña' ? 'bg-red-50 text-red-700 border-red-200' :
                             seg.terrain === 'Arena' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                             'bg-amber-50 text-amber-700 border-amber-200'
                           }`}>
                             {seg.terrain}
                           </span>
                         </td>
                         <td className="px-6 py-4 text-center bg-emerald-50/30">
                           <span className="font-mono text-lg font-black text-emerald-700 tracking-tight">{seg.calculatedPace}</span>
                           <span className="block text-[10px] text-emerald-500 font-bold">min/km</span>
                         </td>
                         <td className="px-6 py-4 text-center bg-stone-50/50">
                            <div className="flex items-center justify-center gap-1.5 text-stone-700">
                              <Clock size={14} className="opacity-50" />
                              <span className="font-mono font-bold text-base">{seg.arrivalClockTime}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-stone-600 italic font-medium text-xs max-w-[200px] leading-relaxed">
                           "{seg.strategy}"
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

            {/* Elevation Chart - Screen Version */}
            <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-lg h-[300px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={16} className="text-orange-500" />
                  Perfil Altimétrico
                </h3>
              </div>
              <div className="flex-1 w-full">
                <ElevationChart data={elevationData} />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Calculator & AI */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="bg-stone-900 rounded-[2rem] shadow-2xl relative z-10">
              <PaceCalculator 
                targetHours={targetHours} setTargetHours={setTargetHours}
                targetMinutes={targetMinutes} setTargetMinutes={setTargetMinutes}
                paces={paces} setPaces={setPaces}
              />
            </div>
            <div className="flex-1 min-h-[500px]">
              <ChatWidget />
            </div>
          </div>
        </div>

        {/* --- FLOWNEXION PROMO SECTION --- */}
        <div className="mt-16 mb-8">
           <div className="bg-[#0b1120] rounded-[2rem] p-8 md:p-12 text-center relative overflow-hidden border border-slate-800 shadow-2xl">
             {/* Gradient Background Effect */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
             
             {/* Logo & Name Link */}
             <div className="relative z-10 flex justify-center mb-6">
                <a 
                  href="https://www.flownexion.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group transition-transform hover:scale-105"
                >
                  <FlownexionLogo className="w-12 h-12" />
                  <span className="text-4xl font-black text-white tracking-tighter">Flownexion</span>
                </a>
             </div>

             {/* Copy */}
             <h3 className="relative z-10 text-xl md:text-3xl font-bold text-white mb-4 leading-tight">
               ¿Tu empresa ya aprovecha la IA o sigue perdiendo horas en procesos obsoletos?
             </h3>
             
             <p className="relative z-10 text-slate-400 max-w-2xl mx-auto mb-8 text-sm md:text-lg font-medium leading-relaxed">
               Creamos automatizaciones e IA a medida que devuelven el tiempo a tu equipo y optimizan cada proceso.
             </p>

             {/* CTA */}
             <div className="relative z-10 flex flex-col items-center gap-3">
               <span className="text-slate-500 text-sm font-bold tracking-wider uppercase">¿Hablamos de tu caso? 👇</span>
               <a 
                 href="mailto:juancarlos@flownexion.com"
                 className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95"
               >
                 <Mail className="w-6 h-6" />
                 Contáctanos
               </a>
             </div>
           </div>
        </div>

      </main>

      {/* --- PROFESSIONAL PDF EXPORT VIEW --- */}
      <div 
        className={`fixed top-0 left-0 w-[210mm] bg-white z-[-50] p-0 font-sans ${isExporting ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        ref={printRef}
        style={{ height: 'auto', minHeight: '297mm' }}
      >
        {/* PDF HEADER */}
        <div className="bg-stone-900 text-white p-8">
           <div className="flex justify-between items-start border-b border-stone-700 pb-6 mb-6">
              <div>
                <h1 className="text-6xl font-black italic tracking-tighter leading-none uppercase">Ultra <span className="text-emerald-500">Helike</span></h1>
                <p className="text-stone-400 font-bold uppercase tracking-[0.2em] text-sm mt-2">Race Day Strategy • 100 KM</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white">{runnerName || 'CORREDOR'}</div>
                <div className="text-emerald-400 font-mono text-xl font-bold mt-1">{targetHours}h {targetMinutes}m <span className="text-stone-500 text-sm">OBJETIVO</span></div>
              </div>
           </div>
           
           <div className="grid grid-cols-4 gap-4 text-center">
             <div className="bg-stone-800 p-2 rounded border border-stone-700">
               <div className="text-[10px] uppercase text-stone-500 font-bold">Salida</div>
               <div className="text-xl font-bold text-white">06:00 AM</div>
             </div>
             <div className="bg-stone-800 p-2 rounded border border-stone-700">
               <div className="text-[10px] uppercase text-stone-500 font-bold">Ritmo Medio</div>
               <div className="text-xl font-bold text-white">{paces.avg}</div>
             </div>
             <div className="bg-stone-800 p-2 rounded border border-stone-700">
               <div className="text-[10px] uppercase text-stone-500 font-bold">Desnivel</div>
               <div className="text-xl font-bold text-white">+1,250m</div>
             </div>
             <div className="bg-stone-800 p-2 rounded border border-stone-700">
               <div className="text-[10px] uppercase text-stone-500 font-bold">Sunset</div>
               <div className="text-xl font-bold text-white">20:30 PM</div>
             </div>
           </div>
        </div>

        {/* PDF CONTENT BODY */}
        <div className="p-8 space-y-8 bg-white">
           
           {/* SECTION: ELEVATION PROFILE WITH ARRIVAL TIMES */}
           <div className="border-4 border-stone-900 rounded-xl overflow-hidden bg-white">
             <div className="bg-stone-900 px-4 py-2 flex justify-between items-center">
                <h3 className="font-black text-lg text-white uppercase tracking-tight flex items-center gap-2">
                  <Mountain size={20} className="text-emerald-500"/> VISTA TÁCTICA
                </h3>
             </div>
             <div className="p-4 h-[300px] relative bg-white">
               <ElevationChart data={elevationData} checkpoints={pdfCheckpoints} isPrintMode={true} />
             </div>
             
             {/* Time Strip Table - FIXED GRID LAYOUT WITH EXPLICIT SPACING AND BORDERS */}
             <div className="grid grid-cols-6 border-t-4 border-stone-900 bg-white">
                {pdfCheckpoints.map((cp, idx) => (
                  <div key={idx} className={`
                    flex flex-col items-center justify-between py-6 px-1 h-48
                    ${idx < pdfCheckpoints.length - 1 ? 'border-r-2 border-stone-200' : ''}
                  `}>
                    {/* Name at top */}
                    <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest leading-none text-center">
                      {cp.name}
                    </div>
                    
                    {/* Time in center - SIZED TO FIT COLUMN */}
                    <div className="text-4xl font-black text-stone-900 tracking-tighter tabular-nums">
                      {cp.arrival}
                    </div>
                    
                    {/* KM Badge at bottom - DISTINCT SEPARATION */}
                    <div className="bg-emerald-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-sm leading-none tracking-wide block">
                      KM {cp.km}
                    </div>
                  </div>
                ))}
             </div>
           </div>

           {/* SECTION: SEGMENTS */}
           <div>
             <h3 className="font-black text-lg text-stone-900 uppercase tracking-tight border-l-8 border-emerald-500 pl-3 mb-4">
               Estrategia de Segmentos
             </h3>
             <table className="w-full text-sm border-2 border-stone-300">
               <thead className="bg-stone-200 text-stone-900 uppercase text-[10px] font-black">
                 <tr>
                   <th className="p-3 text-left border-b-2 border-stone-300">Sector</th>
                   <th className="p-3 text-center border-b-2 border-stone-300">Terreno</th>
                   <th className="p-3 text-center border-b-2 border-stone-300">Ritmo</th>
                   <th className="p-3 text-center border-b-2 border-stone-300">Llegada Est.</th>
                 </tr>
               </thead>
               <tbody className="divide-y-2 divide-stone-200">
                 {calculateSegments.map((seg, i) => (
                   <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                     <td className="p-3 font-bold text-stone-900 border-r border-stone-200">
                       {seg.name} 
                       <span className="block text-stone-500 font-normal text-xs">({seg.endKm - seg.startKm} km)</span>
                     </td>
                     <td className="p-3 text-center text-xs uppercase font-bold border-r border-stone-200">{seg.terrain}</td>
                     <td className="p-3 text-center font-mono font-bold text-stone-900 border-r border-stone-200 text-lg">{seg.calculatedPace}</td>
                     <td className="p-3 text-center font-mono text-stone-600 font-bold">{seg.arrivalClockTime}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>

           {/* REMOVED BOTTOM SECTION (Información Crítica & Footer) */}
           
        </div>
      </div>
    </div>
  );
};

// Sub-components

const NavItem: React.FC<{ icon: React.ElementType, active?: boolean, label?: string }> = ({ icon: Icon, active, label }) => (
  <div className="group flex flex-col items-center gap-1 cursor-pointer w-full">
    <div className={`
      p-3 rounded-2xl transition-all duration-300 relative
      ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-110' : 'text-stone-500 hover:bg-stone-900 hover:text-stone-300'}
    `}>
      <Icon size={22} />
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${active ? 'text-emerald-500' : 'text-stone-600 group-hover:text-stone-400'}`}>
      {label}
    </span>
  </div>
);

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  sub: string;
  icon: React.ElementType; 
  color: 'emerald' | 'orange' | 'red' | 'stone';
}> = ({ title, value, sub, icon: Icon, color }) => {
  const colorStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    stone: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`p-4 rounded-2xl border ${colorStyles[color].split(' ')[2]} bg-white shadow-sm flex items-start gap-3`}
    >
      <div className={`p-2.5 rounded-xl ${colorStyles[color]} border-none`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-stone-400 font-bold text-[10px] uppercase tracking-wider mb-0.5">{title}</p>
        <h4 className="text-xl font-black text-stone-900 tracking-tight leading-none">{value}</h4>
        <p className="text-[10px] text-stone-500 font-medium mt-1">{sub}</p>
      </div>
    </motion.div>
  );
};

export default App;