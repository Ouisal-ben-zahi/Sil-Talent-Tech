'use client'

import dynamic from 'next/dynamic'
import { memo } from 'react'

// Dynamic import pour Recharts - Réduit le bundle initial de ~200KB
const RechartsChart = dynamic(
  () => import('recharts').then(mod => {
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } = mod
    return function ChartWrapper(props: any) {
      return (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={props.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="name" 
              stroke="#999"
              style={{ fontFamily: 'Inter', fontSize: '12px' }}
            />
            <YAxis 
              stroke="#999"
              style={{ fontFamily: 'Inter', fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1A1A1A', 
                border: '1px solid #333',
                borderRadius: '4px',
                fontFamily: 'Inter'
              }}
            />
            <Legend 
              wrapperStyle={{ fontFamily: 'Inter', fontSize: '12px' }}
            />
            <Bar dataKey="candidats" fill="#297BFF" radius={[4, 4, 0, 0]}>
              {props.data?.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill="#297BFF" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )
    }
  }),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[280px]">
        <div className="text-white/50">Chargement du graphique...</div>
      </div>
    )
  }
)

interface AdminChartProps {
  data: Array<{ name: string; candidats: number }>
}

export const AdminChart = memo(function AdminChart({ data }: AdminChartProps) {
  return <RechartsChart data={data} />
})













