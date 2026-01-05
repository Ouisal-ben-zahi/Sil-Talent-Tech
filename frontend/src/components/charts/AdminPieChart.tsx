'use client'

import dynamic from 'next/dynamic'
import { memo } from 'react'

interface PieChartData {
  name: string
  value: number
  color?: string
  [key: string]: any
}

interface AdminPieChartProps {
  data: PieChartData[]
}

const RechartsPieChart = dynamic(
  () => import('recharts').then(mod => {
    const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } = mod
    return function PieChartComponent({ data }: AdminPieChartProps) {
      const COLORS = ['#297BFF', '#EC4899', '#10B981', '#F97316', '#9333EA', '#EF4444']
      
      return (
        <div className="w-full">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  color: '#FFFFFF'
                }}
                formatter={(value: number | undefined, name: string | undefined) => {
                  const numValue = value ?? 0
                  const nameValue = name ?? ''
                  const total = data.reduce((sum, item) => sum + item.value, 0)
                  const percentage = total > 0 ? ((numValue / total) * 100).toFixed(0) : '0'
                  return [`${numValue} (${percentage}%)`, nameValue]
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Légende personnalisée avec wrap */}
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center mt-4 px-2">
            {data.map((entry, index) => {
              const total = data.reduce((sum, item) => sum + item.value, 0)
              const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0
              return (
                <div 
                  key={`legend-${index}`} 
                  className="flex items-center gap-1.5 md:gap-2 flex-shrink-0"
                  style={{ maxWidth: 'calc(50% - 8px)' }}
                >
                  <div
                    className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
                  />
                  <span
                    className="text-white truncate"
                    style={{ 
                      fontFamily: 'Inter', 
                      fontSize: 'clamp(11px, 2.5vw, 13px)',
                      lineHeight: '1.2'
                    }}
                    title={`${entry.name}: ${entry.value} (${percentage}%)`}
                  >
                    {entry.name}: {percentage}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
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

export const AdminPieChart = memo(function AdminPieChart({ data }: AdminPieChartProps) {
  return <RechartsPieChart data={data} />
})

