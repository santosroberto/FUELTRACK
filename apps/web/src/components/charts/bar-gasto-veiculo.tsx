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
import { formatCurrency } from '@/lib/utils'

interface GastoVeiculo {
  placa: string
  gasto: number
}

interface BarGastoVeiculoProps {
  data: GastoVeiculo[]
}

export function BarGastoVeiculo({ data }: BarGastoVeiculoProps) {
  const height = CHART_HEIGHT

  return (
    <ChartContainer
      title="Gasto por Veículo"
      description="Valor total gasto no período"
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
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              fontSize: '13px',
            }}
            formatter={(value: number) => [formatCurrency(value), 'Gasto']}
          />
          <Bar dataKey="gasto" fill="#2563eb" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
