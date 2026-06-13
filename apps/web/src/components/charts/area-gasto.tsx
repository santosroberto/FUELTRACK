
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartContainer, CHART_HEIGHT } from '@/components/charts/chart-container'

interface GastoPorSemana {
  semana: string
  gasto: number
}

interface AreaGastoProps {
  data: GastoPorSemana[]
}

export function AreaGasto({ data }: AreaGastoProps) {
  const height = CHART_HEIGHT

  return (
    <ChartContainer title="Gasto x Tempo" description="EvoluÃ§Ã£o do gasto semanal">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="semana"
            className="text-xs text-muted-foreground"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            className="text-xs text-muted-foreground font-mono"
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `R$${(v / 1000).toFixed(1)}k`}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(v: number) => [
              `R$${v.toLocaleString('pt-BR')}`,
              'Gasto',
            ]}
          />
          <Area
            type="monotone"
            dataKey="gasto"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#colorGasto)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
