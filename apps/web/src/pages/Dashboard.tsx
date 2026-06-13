import { KPICard } from '@/components/shared/kpi-card'
import { AreaGasto } from '@/components/charts/area-gasto'
import { BarConsumoVeiculo } from '@/components/charts/bar-consumo-veiculo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BadgeStatus } from '@/components/shared/badge-status'
import { DollarSign, Beaker, Fuel, MapPin } from 'lucide-react'

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <option>Junho 2026</option>
          <option>Maio 2026</option>
          <option>Abril 2026</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KPICard
          icon={<DollarSign className="h-5 w-5" />}
          label="Gasto Total"
          value="R$ 47.250"
          trend="up"
          percent={12}
        />
        <KPICard
          icon={<Fuel className="h-5 w-5" />}
          label="Consumo Médio"
          value="7,8 km/L"
          trend="down"
          percent={5}
        />
        <KPICard
          icon={<Beaker className="h-5 w-5" />}
          label="Total Litros"
          value="6.230 L"
          trend="up"
          percent={8}
        />
        <KPICard
          icon={<MapPin className="h-5 w-5" />}
          label="KM Rodados"
          value="48.594 km"
          trend="up"
          percent={10}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaGasto
          data={[
            { semana: 'Sem 1', gasto: 8500 },
            { semana: 'Sem 2', gasto: 10200 },
            { semana: 'Sem 3', gasto: 7800 },
            { semana: 'Sem 4', gasto: 12400 },
          ]}
        />
        <BarConsumoVeiculo
          data={[
            { placa: 'ABC-1234', consumo: 8.2 },
            { placa: 'XYZ-5678', consumo: 7.5 },
            { placa: 'DEF-9012', consumo: 5.1 },
            { placa: 'GHI-3456', consumo: 6.8 },
            { placa: 'JKL-7890', consumo: 9.0 },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Alertas Recentes</CardTitle>
            <span className="text-sm text-primary hover:underline cursor-pointer">
              Ver todos
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { alerta: 'Consumo anômalo (3,2 km/L)', veiculo: 'ABC-1234', tempo: 'Há 2h', status: 'suspeito' as const },
              { alerta: 'Fora do perímetro autorizado', veiculo: 'XYZ-5678', tempo: 'Há 5h', status: 'suspeito' as const },
              { alerta: 'Abastecimento confirmado', veiculo: 'DEF-9012', tempo: 'Há 1d', status: 'confirmado' as const },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{item.alerta}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.veiculo} — {item.tempo}
                  </p>
                </div>
                <BadgeStatus status={item.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Ranking de Motoristas</CardTitle>
            <span className="text-sm text-primary hover:underline cursor-pointer">
              Ver ranking completo
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { nome: 'Carlos', eficiencia: 8.5, pontos: 95 },
              { nome: 'Ana', eficiencia: 8.2, pontos: 91 },
              { nome: 'Pedro', eficiencia: 7.9, pontos: 87 },
              { nome: 'João', eficiencia: 7.1, pontos: 79 },
              { nome: 'Maria', eficiencia: 6.2, pontos: 68 },
            ].map((driver, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                  {i + 1}º
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{driver.nome}</span>
                    <span className="text-sm font-mono">
                      {driver.eficiencia} km/L
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${driver.pontos}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
