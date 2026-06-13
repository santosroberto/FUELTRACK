
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartContainer } from '@/components/charts/chart-container'

interface ConsumoHistorico {
  data: string
  consumo: number
}

interface LineConsumoHistoricoProps {
  data: ConsumoHistorico[]
}

export function LineConsumoHistorico({ data }: LineConsumoHistoricoProps) {
  return (
    <ChartContainer
      title="Consumo HistÃ³rico"
      description="km/L por abastecimento"
    >
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="data"
            className="text-xs text-muted-foreground"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            className="text-xs text-muted-foreground font-mono"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(v: number) => [`${v.toFixed(2)} km/L`, 'Consumo']}
          />
          <Line
            type="monotone"
            dataKey="consumo"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 4, fill: '#2563eb' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
