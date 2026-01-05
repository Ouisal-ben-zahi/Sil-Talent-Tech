// Layout file required for static export with dynamic routes
export async function generateStaticParams() {
  // Return empty array for dynamic rendering at runtime
  // All routes will be generated on-demand
  return []
}

export default function BlogSlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

