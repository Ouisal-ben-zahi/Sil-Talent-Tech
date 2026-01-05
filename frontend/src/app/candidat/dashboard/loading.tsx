export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#297BFF] mb-4"></div>
        <p className="text-white text-lg">Chargement du tableau de bord...</p>
      </div>
    </div>
  )
}











