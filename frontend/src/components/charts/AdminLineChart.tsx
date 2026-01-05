'use client'

import dynamic from 'next/dynamic'
import { memo } from 'react'

interface LineChartData {
  name: string | number
  value: number
}

interface AdminLineChartProps {
  data: LineChartData[]
  dataKey?: string
  color?: string
}

const RechartsLineChart = dynamic(
  () => import('recharts').then(mod => {
    const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = mod
    return function LineChartComponent({ data, dataKey = 'value', color = '#297BFF' }: AdminLineChartProps) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontFamily: 'Inter',
                color: '#FFFFFF'
              }}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )
    }
  }),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-white/50 text-sm">Chargement du graphique...</div>
      </div>
    )
  }
)

export const AdminLineChart = memo(function AdminLineChart({ data, dataKey, color }: AdminLineChartProps) {
  return <RechartsLineChart data={data} dataKey={dataKey} color={color} />
})





