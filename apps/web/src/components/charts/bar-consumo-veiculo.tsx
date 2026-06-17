
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartContainer, CHART_HEIGHT } from '@/components/charts/chart-container'

interface ConsumoVeiculo {
  placa: string
  consumo: number
}

interface BarConsumoVeiculoProps {
  data: ConsumoVeiculo[]
}

export function BarConsumoVeiculo({ data }: BarConsumoVeiculoProps) {
  const height = CHART_HEIGHT

  return (
    <ChartContainer
      title="Consumo por Veículo"
      description="km/L médio no período"
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            type="number"
            className="text-xs text-muted-foreground font-mono"
            tickLine={false}
            axisLine={false}
            domain={[0, 'auto']}
          />
          <YAxis
            type="category"
            dataKey="placa"
            className="text-xs text-muted-foreground"
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(v: number) => [`${v.toFixed(2)} km/L`, 'Consumo']}
          />
          <Bar
            dataKey="consumo"
            fill="#10b981"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
