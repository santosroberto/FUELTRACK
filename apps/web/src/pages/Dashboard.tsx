import { useState, useEffect } from 'react'
import { KPICard } from '@/components/shared/kpi-card'
import { AreaGasto } from '@/components/charts/area-gasto'
import { BarConsumoVeiculo } from '@/components/charts/bar-consumo-veiculo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BadgeStatus } from '@/components/shared/badge-status'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { useAuth } from '@/providers/auth-provider'
import { fetchAbastecimentos, fetchVeiculos, fetchAlertas } from '@/lib/supabase/queries'
import { DollarSign, Beaker, Fuel, MapPin } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ gastoTotal: 0, totalLitros: 0, kmRodados: 0, consumoMedio: 0 })
  const [gastoSemanal, setGastoSemanal] = useState<{ semana: string; gasto: number }[]>([])
  const [consumoVeiculos, setConsumoVeiculos] = useState<{ placa: string; consumo: number }[]>([])
  const [alertasRecentes, setAlertasRecentes] = useState<{ alerta: string; veiculo: string; tempo: string; status: 'suspeito' | 'confirmado' }[]>([])

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetchAbastecimentos(user.id),
      fetchVeiculos(user.id),
      fetchAlertas(user.id),
    ]).then(([abastecimentos, , alertas]) => {
      const gastoTotal = abastecimentos.reduce((a, b) => a + b.valor_total, 0)
      const totalLitros = abastecimentos.reduce((a, b) => a + b.litros, 0)
      const kmRodados = abastecimentos.reduce((a, b) => a + b.km_atual, 0)
      const comKm = abastecimentos.filter((a) => a.km_l != null)
      const consumoMedio = comKm.length > 0 ? comKm.reduce((a, b) => a + (b.km_l ?? 0), 0) / comKm.length : 0

      setStats({ gastoTotal, totalLitros, kmRodados, consumoMedio })

      const weekly: Record<string, number> = {}
      abastecimentos.forEach((a) => {
        const d = new Date(a.data_hora)
        const week = `Sem ${Math.ceil(d.getDate() / 7)}`
        weekly[week] = (weekly[week] ?? 0) + a.valor_total
      })
      setGastoSemanal(Object.entries(weekly).map(([semana, gasto]) => ({ semana, gasto })))

      const consumoPorVeiculo: Record<string, { total: number; count: number }> = {}
      abastecimentos.forEach((a) => {
        if (!a.km_l) return
        const placa = a.veiculos?.placa ?? a.veiculo_id
        if (!consumoPorVeiculo[placa]) consumoPorVeiculo[placa] = { total: 0, count: 0 }
        consumoPorVeiculo[placa].total += a.km_l
        consumoPorVeiculo[placa].count += 1
      })
      setConsumoVeiculos(
        Object.entries(consumoPorVeiculo).map(([placa, v]) => ({
          placa, consumo: Math.round((v.total / v.count) * 10) / 10,
        }))
      )

      const recentes = alertas.slice(0, 3).map((a) => ({
        alerta: a.titulo,
        veiculo: a.mensagem.substring(0, 40),
        tempo: formatTimeAgo(a.created_at),
        status: a.severidade === 'critica' || a.severidade === 'alta' ? 'suspeito' as const : 'confirmado' as const,
      }))
      setAlertasRecentes(recentes)
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [user])

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KPICard icon={<DollarSign className="h-5 w-5" />} label="Gasto Total" value={formatCurrency(stats.gastoTotal)} trend="up" percent={0} />
        <KPICard icon={<Fuel className="h-5 w-5" />} label="Consumo Médio" value={`${stats.consumoMedio.toFixed(1)} km/L`} trend="down" percent={0} />
        <KPICard icon={<Beaker className="h-5 w-5" />} label="Total Litros" value={`${stats.totalLitros.toFixed(0)} L`} trend="up" percent={0} />
        <KPICard icon={<MapPin className="h-5 w-5" />} label="KM Rodados" value={`${stats.kmRodados.toLocaleString('pt-BR')} km`} trend="up" percent={0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaGasto data={gastoSemanal} />
        <BarConsumoVeiculo data={consumoVeiculos} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Alertas Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertasRecentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum alerta recente.</p>
            ) : alertasRecentes.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border p-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{item.alerta}</p>
                  <p className="text-xs text-muted-foreground">{item.veiculo} — {item.tempo}</p>
                </div>
                <BadgeStatus status={item.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Consumo por Veículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {consumoVeiculos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum dado de consumo disponível.</p>
            ) : consumoVeiculos.sort((a, b) => b.consumo - a.consumo).map((v, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-bold text-muted-foreground">{i + 1}º</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{v.placa}</span>
                    <span className="text-sm font-mono">{v.consumo} km/L</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min((v.consumo / 12) * 100, 100)}%` }} />
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

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Agora há pouco'
  if (hours < 24) return `Há ${hours}h`
  const days = Math.floor(hours / 24)
  return `Há ${days}d`
}
