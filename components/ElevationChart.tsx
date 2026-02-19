import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label 
} from 'recharts';
import { ElevationPoint, Checkpoint } from '../types';

interface ElevationChartProps {
  data: ElevationPoint[];
  checkpoints?: Checkpoint[]; // Optional checkpoints with times for the PDF view
  isPrintMode?: boolean;
}

const ElevationChart: React.FC<ElevationChartProps> = ({ data, checkpoints, isPrintMode = false }) => {
  return (
    <div className="w-full h-full font-sans">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAltitude" x1="0" y1="0" x2="0" y2="1">
              {/* En modo impresión usamos colores sólidos, sin transparencia compleja para asegurar visibilidad */}
              <stop offset="5%" stopColor={isPrintMode ? "#f59e0b" : "#d97706"} stopOpacity={isPrintMode ? 1 : 0.4}/>
              <stop offset="95%" stopColor={isPrintMode ? "#f59e0b" : "#d97706"} stopOpacity={isPrintMode ? 0.3 : 0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray={isPrintMode ? "0" : "3 3"} vertical={false} stroke={isPrintMode ? "#e5e5e5" : "#e5e5e5"} />
          <XAxis 
            dataKey="km" 
            type="number"
            domain={[0, 100]}
            tickCount={11}
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isPrintMode ? '#000' : '#78716c', fontSize: isPrintMode ? 12 : 10, fontWeight: 700 }} 
            unit="km"
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isPrintMode ? '#000' : '#78716c', fontSize: isPrintMode ? 12 : 10, fontWeight: 600 }}
            unit="m"
          />
          {!isPrintMode && (
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                fontSize: '12px'
              }}
              formatter={(value: number, name: string, props: any) => {
                const pointDesc = props.payload.label ? ` - ${props.payload.label}` : '';
                return [`${value}m${pointDesc}`, 'Altitud'];
              }}
              labelFormatter={(label: number) => `Kilómetro ${label}`}
            />
          )}
          <Area 
            type="monotone" 
            dataKey="altitude" 
            stroke={isPrintMode ? "#000" : "#d97706"} 
            strokeWidth={isPrintMode ? 3 : 2} 
            fillOpacity={1} 
            fill="url(#colorAltitude)" 
            isAnimationActive={!isPrintMode}
          />

          {/* Render Checkpoints with Times (Crucial for PDF) */}
          {checkpoints && checkpoints.map((cp, idx) => (
             <ReferenceLine 
               key={idx} 
               x={cp.km} 
               stroke={isPrintMode ? "#000" : "#059669"} 
               strokeWidth={isPrintMode ? 2 : 1}
               strokeDasharray="3 3"
             >
               <Label 
                 value={isPrintMode ? `${cp.arrival}` : cp.name} 
                 position="insideTop" 
                 fill={isPrintMode ? "#000" : "#065f46"} 
                 fontSize={isPrintMode ? 14 : 12} 
                 fontWeight="900"
                 offset={15}
                 className={isPrintMode ? "bg-white px-1" : ""}
               />
               {isPrintMode && (
                 <Label 
                   value={`Km ${cp.km}`} 
                   position="insideBottom" 
                   fill="#000" 
                   fontSize={11} 
                   fontWeight="bold"
                   offset={5}
                 />
               )}
             </ReferenceLine>
          ))}

          {/* Default Reference Lines if no custom checkpoints provided (Legacy mode) */}
          {!checkpoints && (
            <>
              <ReferenceLine x={18} stroke="#10b981" strokeDasharray="3 3" label={{ value: "PANTANO", position: "insideTop", fill: "#065f46", fontSize: 10, fontWeight: 'bold' }} />
              <ReferenceLine x={45} stroke="#0ea5e9" strokeDasharray="3 3" label={{ value: "PLAYA", position: "insideTop", fill: "#0369a1", fontSize: 10, fontWeight: 'bold' }} />
              <ReferenceLine x={85} stroke="#6366f1" strokeDasharray="3 3" label={{ value: "PARQUE EMP.", position: "insideTop", fill: "#4338ca", fontSize: 10, fontWeight: 'bold' }} />
            </>
          )}

        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ElevationChart;