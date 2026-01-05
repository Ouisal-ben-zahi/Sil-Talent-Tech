'use client'

import dynamic from 'next/dynamic'
import { memo } from 'react'

interface ChartData {
  name: string
  Femme: number
  Homme: number
}

interface AdminBarChartProps {
  data: ChartData[]
}

// Dynamic import pour Recharts - Réduit le bundle initial de ~200KB
const RechartsBarChart = dynamic(
  () => import('./ChartComponent').then(mod => mod.ChartComponent),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[280px]">
        <div className="text-white/50 text-sm">Chargement du graphique...</div>
      </div>
    )
  }
)

export const AdminBarChart = memo(function AdminBarChart({ data }: AdminBarChartProps) {
  return <RechartsBarChart data={data} />
})
