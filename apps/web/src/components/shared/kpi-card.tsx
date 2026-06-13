import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  icon: React.ReactNode
  label: string
  value: string
  trend?: 'up' | 'down'
  percent?: number
  className?: string
}

export function KPICard({
  icon,
  label,
  value,
  trend,
  percent,
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        'kpi-card group cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-value font-mono">{value}</div>
      {trend && percent !== undefined && (
        <div
          className={cn(
            'mt-1 flex items-center gap-1 text-xs',
            trend === 'up' ? 'kpi-trend-up' : 'kpi-trend-down'
          )}
        >
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {percent}% vs. período anterior
        </div>
      )}
    </div>
  )
}
