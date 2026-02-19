import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { StatData } from '../types';

interface StatsChartProps {
  data: StatData[];
}

const StatsChart: React.FC<StatsChartProps> = ({ data }) => {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPalms" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#78716c', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#78716c', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              fontFamily: 'inherit'
            }} 
            labelStyle={{ color: '#064e3b', fontWeight: 600 }}
          />
          <Area 
            type="monotone" 
            dataKey="visitors" 
            stroke="#059669" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorVisitors)" 
            name="Visitantes"
          />
          {/* We only render one area for visual clarity in this specific dashboard design, 
              but data exists for palms if we wanted to toggle it */}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;
