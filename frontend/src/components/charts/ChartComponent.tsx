'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface ChartData {
  name: string
  Femme: number
  Homme: number
}

interface ChartComponentProps {
  data: ChartData[]
}

export function ChartComponent({ data }: ChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 0, left: 0, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis 
          dataKey="name" 
          stroke="#999999"
          style={{ fontFamily: 'Inter', fontSize: '12px' }}
          tick={{ fill: '#999999' }}
        />
        <YAxis 
          stroke="#999999"
          style={{ fontFamily: 'Inter', fontSize: '12px' }}
          tick={{ fill: '#999999' }}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            fontFamily: 'Inter',
            color: '#FFFFFF'
          }}
          labelStyle={{ color: '#FFFFFF', fontWeight: 600 }}
          formatter={(value: number | undefined, name: string | undefined) => [value ?? 0, name ?? '']}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '8px', paddingBottom: '0' }}
          iconType="circle"
          align="left"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontFamily: 'Inter', color: '#FFFFFF', fontSize: '13px', marginLeft: '4px', marginRight: '12px' }}>
              {value}
            </span>
          )}
        />
        <Bar 
          dataKey="Femme" 
          fill="#EC4899"
          radius={[4, 4, 0, 0]}
          style={{ filter: 'drop-shadow(0 4px 12px rgba(236, 72, 153, 0.3))' }}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-femme-${index}`} 
              fill={entry.Femme > 0 ? '#EC4899' : 'transparent'}
            />
          ))}
        </Bar>
        <Bar 
          dataKey="Homme" 
          fill="#297BFF"
          radius={[4, 4, 0, 0]}
          style={{ filter: 'drop-shadow(0 4px 12px rgba(41, 123, 255, 0.3))' }}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-homme-${index}`} 
              fill={entry.Homme > 0 ? '#297BFF' : 'transparent'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}












