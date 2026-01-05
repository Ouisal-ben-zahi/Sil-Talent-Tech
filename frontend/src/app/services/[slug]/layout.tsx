// Required for static export with dynamic routes
export async function generateStaticParams() {
  // Return empty array to generate pages on-demand
  return []
}

export default function ServiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

