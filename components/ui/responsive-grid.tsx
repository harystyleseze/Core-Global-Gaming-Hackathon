interface ResponsiveGridProps {
  children: React.ReactNode
}

export function ResponsiveGrid({ children }: ResponsiveGridProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  )
} 