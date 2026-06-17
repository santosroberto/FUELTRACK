import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { BadgeStatus } from '@/components/shared/badge-status'
import { Badge } from '@/components/ui/badge'
import { PieGastoCategoria } from '@/components/charts/pie-gasto-categoria'
import { BarGastoVeiculo } from '@/components/charts/bar-gasto-veiculo'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { useAuth } from '@/providers/auth-provider'
import { fetchAbastecimentos, fetchManutencoes } from '@/lib/supabase/queries'
import { Search, CreditCard, Fuel, Wrench } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface DespesaItem {
  id: string
  data: string
  tipo: 'combustivel' | 'manutencao' | 'outros'
  descricao: string
  veiculo: string
  valor: number
  categoria_label: string
  status?: 'confirmado' | 'pendente' | 'suspeito'
}

export function Despesas() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [despesas, setDespesas] = useState<DespesaItem[]>([])
  const [search, setSearch] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')

  useEffect(() => {
    if (!user) return
    Promise.all([fetchAbastecimentos(user.id), fetchManutencoes(user.id)])
      .then(([abastecimentos, manutencoes]) => {
        const items: DespesaItem[] = [
          ...abastecimentos.map((a) => ({
            id: `comb-${a.id}`,
            data: new Date(a.data_hora).toLocaleDateString('pt-BR'),
            tipo: 'combustivel' as const,
            descricao: a.postos?.nome ?? a.posto_nome ?? 'Posto',
            veiculo: a.veiculos?.placa ?? '-',
            valor: a.valor_total,
            categoria_label: 'Combustível',
            status: a.status as 'confirmado' | 'pendente' | 'suspeito',
          })),
          ...manutencoes.map((m) => ({
            id: `man-${m.id}`,
            data: m.data_agendada ? new Date(m.data_agendada).toLocaleDateString('pt-BR') : '-',
            tipo: 'manutencao' as const,
            descricao: m.descricao ?? m.tipo,
            veiculo: m.veiculos?.placa ?? '-',
            valor: m.valor ?? 0,
            categoria_label: 'Manutenção',
          })),
        ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        setDespesas(items)
      })
      .catch(() => toast.error('Erro ao carregar despesas'))
      .finally(() => setLoading(false))
  }, [user])

  const totalCombustivel = despesas.filter((d) => d.tipo === 'combustivel').reduce((a, d) => a + d.valor, 0)
  const totalManutencao = despesas.filter((d) => d.tipo === 'manutencao').reduce((a, d) => a + d.valor, 0)
  const totalGeral = despesas.reduce((a, d) => a + d.valor, 0)

  const filtrados = despesas.filter((d) => {
    const matchSearch = d.descricao.toLowerCase().includes(search.toLowerCase()) ||
      d.veiculo.toLowerCase().includes(search.toLowerCase())
    const matchCategoria = filtroCategoria === 'todas' || d.tipo === filtroCategoria
    return matchSearch && matchCategoria
  })

  const pieData = [
    { nome: 'Combustível', valor: totalCombustivel },
    { nome: 'Manutenção', valor: totalManutencao },
  ]

  const gastoPorVeiculo: Record<string, number> = {}
  despesas.forEach((d) => {
    const v = d.veiculo || 'Outros'
    gastoPorVeiculo[v] = (gastoPorVeiculo[v] ?? 0) + d.valor
  })
  const barData = Object.entries(gastoPorVeiculo)
    .map(([placa, gasto]) => ({ placa, gasto }))
    .sort((a, b) => b.gasto - a.gasto)
    .slice(0, 5)

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Despesas</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">Total Despesas</span></div>
          <p className="mt-2 text-3xl font-bold font-mono">{formatCurrency(totalGeral)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2"><Fuel className="h-5 w-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">Combustível</span></div>
          <p className="mt-2 text-3xl font-bold font-mono">{formatCurrency(totalCombustivel)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2"><Wrench className="h-5 w-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">Manutenção</span></div>
          <p className="mt-2 text-3xl font-bold font-mono">{formatCurrency(totalManutencao)}</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieGastoCategoria data={pieData} />
        <BarGastoVeiculo data={barData} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar despesas..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="combustivel">Combustível</SelectItem>
            <SelectItem value="manutencao">Manutenção</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs">{d.data}</TableCell>
                <TableCell>{d.tipo === 'combustivel' ? <Fuel className="h-4 w-4 text-muted-foreground" /> : <Wrench className="h-4 w-4 text-muted-foreground" />}</TableCell>
                <TableCell className="max-w-[200px] truncate">{d.descricao}</TableCell>
                <TableCell>{d.veiculo}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(d.valor)}</TableCell>
                <TableCell>
                  <Badge variant={d.tipo === 'combustivel' ? 'info' : 'warning'}>{d.categoria_label}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  {d.status ? <BadgeStatus status={d.status} /> : <Badge variant="secondary">—</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
          <span>Mostrando {filtrados.length} de {despesas.length} registros</span>
          <span className="font-mono font-medium text-foreground">Total: {formatCurrency(filtrados.reduce((a, d) => a + d.valor, 0))}</span>
        </div>
      </div>
    </div>
  )
}
