
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartContainerProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function ChartContainer({
  title,
  description,
  children,
  className,
}: ChartContainerProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export const CHART_COLORS = {
  diesel_s10: '#2563eb',
  diesel_s500: '#1d4ed8',
  gasolina: '#f59e0b',
  etanol: '#10b981',
  gnv: '#06b6d4',
  eletrico: '#8b5cf6',
} as const

export const CHART_PALETTE = [
  '#2563eb',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
] as const

export const CHART_HEIGHT = 300
