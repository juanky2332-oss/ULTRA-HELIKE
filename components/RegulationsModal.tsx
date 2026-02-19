import React, { useState } from 'react';
import { X, Shield, Clock, Coffee, ChevronRight } from 'lucide-react';

interface RegulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegulationsModal: React.FC<RegulationsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'gear' | 'times' | 'aid'>('gear');

  if (!isOpen) return null;

  const content = {
    gear: [
      { item: "Sistema de Hidratación", desc: "Mínimo 1 litro de capacidad." },
      { item: "Manta Térmica", desc: "Tamaño mínimo 1.40 x 2.00 m." },
      { item: "Teléfono Móvil", desc: "Encendido y con batería. Número de org guardado." },
      { item: "Luz Delantera (Frontal)", desc: "Con pilas/batería de repuesto." },
      { item: "Luz Roja Trasera", desc: "Obligatoria en tramos nocturnos y urbanos." },
      { item: "Vaso Personal", desc: "No hay vasos en los avituallamientos." },
      { item: "Chaqueta Cortavientos", desc: "Si la previsión es mala." },
    ],
    times: [
      { item: "Tiempo Límite Meta", desc: "24 Horas." },
      { item: "Corte Km 45 (Marina)", desc: "10 Horas 30 min." },
      { item: "Corte Km 65 (Altet)", desc: "15 Horas 30 min." },
      { item: "Corte Km 82 (Torrellano)", desc: "19 Horas 30 min." },
    ],
    aid: [
      { item: "Km 18 (Pantano)", desc: "Líquido + Sólido (Fruta, gominolas)." },
      { item: "Km 45 (La Marina)", desc: "BASE DE VIDA. Pasta, caldo caliente." },
      { item: "Km 65 (El Altet)", desc: "Líquido + Sólido + Café." },
      { item: "Km 82 (Torrellano)", desc: "Líquido + Sólido (Bocadillos)." },
      { item: "Meta", desc: "Avituallamiento final completo." },
    ]
  };

  return (
    <div className="fixed inset-0 z-[999] bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50 rounded-t-[2rem]">
          <div>
            <h2 className="text-2xl font-black text-stone-800 uppercase tracking-tight">Reglamento Oficial</h2>
            <p className="text-stone-500 text-sm font-medium">Ultra Helike 2025</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <X size={24} className="text-stone-600" />
          </button>
        </div>

        <div className="flex border-b border-stone-200">
          <button 
            onClick={() => setActiveTab('gear')}
            className={`flex-1 py-4 font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${activeTab === 'gear' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <Shield size={18} /> Material
          </button>
          <button 
            onClick={() => setActiveTab('times')}
            className={`flex-1 py-4 font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${activeTab === 'times' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <Clock size={18} /> Cortes
          </button>
          <button 
            onClick={() => setActiveTab('aid')}
            className={`flex-1 py-4 font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${activeTab === 'aid' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <Coffee size={18} /> Avituallamiento
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-stone-50">
          <ul className="space-y-3">
            {content[activeTab].map((rule, idx) => (
              <li key={idx} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex justify-between items-center group hover:border-emerald-300 transition-colors">
                <div>
                  <span className="block font-bold text-stone-800">{rule.item}</span>
                  <span className="text-sm text-stone-500">{rule.desc}</span>
                </div>
                <ChevronRight size={18} className="text-stone-300 group-hover:text-emerald-500" />
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-4 bg-stone-100 rounded-b-[2rem] text-center">
          <p className="text-xs text-stone-500">El incumplimiento del material obligatorio conlleva descalificación inmediata.</p>
        </div>
      </div>
    </div>
  );
};

export default RegulationsModal;
