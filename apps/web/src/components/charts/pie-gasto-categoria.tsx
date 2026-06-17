
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts'
import { ChartContainer, CHART_PALETTE } from '@/components/charts/chart-container'

interface GastoCategoria {
  nome: string
  valor: number
}

interface PieGastoCategoriaProps {
  data: GastoCategoria[]
}

export function PieGastoCategoria({ data }: PieGastoCategoriaProps) {
  return (
    <ChartContainer title="Gasto por Categoria" description="Distribuição dos gastos">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="valor"
            nameKey="nome"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_PALETTE[index % CHART_PALETTE.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(v: number) => [
              `R$${v.toLocaleString('pt-BR')}`,
              'Valor',
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
