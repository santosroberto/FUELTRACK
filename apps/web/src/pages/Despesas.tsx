import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { BadgeStatus } from '@/components/shared/badge-status'
import { Badge } from '@/components/ui/badge'
import { PieGastoCategoria } from '@/components/charts/pie-gasto-categoria'
import { BarGastoVeiculo } from '@/components/charts/bar-gasto-veiculo'
import {
  Search,
  CreditCard,
  Fuel,
  Wrench,
  Package,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  FileDown,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type Categoria = 'combustivel' | 'manutencao' | 'outros'

interface Despesa {
  id: string
  data: string
  tipo: Categoria
  icone: typeof Fuel | typeof Wrench | typeof Package
  descricao: string
  veiculo: string
  valor: number
  categoria_label: string
  status?: 'confirmado' | 'pendente' | 'suspeito'
}

const despesasMock: Despesa[] = [
  { id: '1', data: '10/06', tipo: 'combustivel', icone: Fuel, descricao: 'Posto Shell', veiculo: 'ABC-1234', valor: 1624.00, categoria_label: 'Combustível', status: 'confirmado' },
  { id: '2', data: '09/06', tipo: 'manutencao', icone: Wrench, descricao: 'Troca de óleo — Revisão 50.000 km', veiculo: 'XYZ-5678', valor: 3200.00, categoria_label: 'Manutenção' },
  { id: '3', data: '08/06', tipo: 'combustivel', icone: Fuel, descricao: 'Posto Ipiranga', veiculo: 'DEF-9012', valor: 1682.00, categoria_label: 'Combustível', status: 'confirmado' },
  { id: '4', data: '07/06', tipo: 'outros', icone: Package, descricao: 'Pedágio — Rodoanel', veiculo: '-', valor: 450.00, categoria_label: 'Outros' },
  { id: '5', data: '06/06', tipo: 'combustivel', icone: Fuel, descricao: 'Posto Shell', veiculo: 'ABC-1234', valor: 1653.00, categoria_label: 'Combustível', status: 'confirmado' },
  { id: '6', data: '05/06', tipo: 'manutencao', icone: Wrench, descricao: 'Alinhamento e balanceamento', veiculo: 'DEF-9012', valor: 250.00, categoria_label: 'Manutenção' },
  { id: '7', data: '04/06', tipo: 'combustivel', icone: Fuel, descricao: 'Auto Posto BR', veiculo: 'XYZ-5678', valor: 1083.00, categoria_label: 'Combustível', status: 'suspeito' },
  { id: '8', data: '03/06', tipo: 'manutencao', icone: Wrench, descricao: 'Pastilhas de freio', veiculo: 'ABC-1234', valor: 1200.00, categoria_label: 'Manutenção' },
  { id: '9', data: '02/06', tipo: 'combustivel', icone: Fuel, descricao: 'Posto Shell', veiculo: 'ABC-1234', valor: 1539.00, categoria_label: 'Combustível', status: 'confirmado' },
  { id: '10', data: '01/06', tipo: 'outros', icone: Package, descricao: 'Lavagem completa', veiculo: 'JKL-7890', valor: 180.00, categoria_label: 'Outros' },
]

export function Despesas() {
  const [search, setSearch] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')

  const totalCombustivel = despesasMock.filter((d) => d.tipo === 'combustivel').reduce((a, d) => a + d.valor, 0)
  const totalManutencao = despesasMock.filter((d) => d.tipo === 'manutencao').reduce((a, d) => a + d.valor, 0)
  const totalOutros = despesasMock.filter((d) => d.tipo === 'outros').reduce((a, d) => a + d.valor, 0)
  const totalGeral = totalCombustivel + totalManutencao + totalOutros

  const filtrados = despesasMock.filter((d) => {
    const matchSearch = d.descricao.toLowerCase().includes(search.toLowerCase()) || d.veiculo.toLowerCase().includes(search.toLowerCase())
    const matchCategoria = filtroCategoria === 'todas' || d.tipo === filtroCategoria
    return matchSearch && matchCategoria
  })

  const pieData = [
    { nome: 'Combustível', valor: totalCombustivel },
    { nome: 'Manutenção', valor: totalManutencao },
    { nome: 'Outros', valor: totalOutros },
  ]

  const barData = [
    { placa: 'ABC-1234', gasto: 15200 },
    { placa: 'XYZ-5678', gasto: 12800 },
    { placa: 'DEF-9012', gasto: 11500 },
    { placa: 'JKL-7890', gasto: 9800 },
    { placa: 'Outros', gasto: 13000 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Despesas</h1>
        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Exportar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">Exportar PDF</SelectItem>
              <SelectItem value="csv">Exportar CSV</SelectItem>
              <SelectItem value="excel">Exportar Excel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Despesas</span>
            </div>
            <p className="mt-2 text-3xl font-bold font-mono">{formatCurrency(totalGeral)}</p>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" /> 8% vs. mês anterior
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2">
              <Fuel className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Combustível</span>
            </div>
            <p className="mt-2 text-3xl font-bold font-mono">{formatCurrency(totalCombustivel)}</p>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" /> 12% vs. mês anterior
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Manutenção</span>
            </div>
            <p className="mt-2 text-3xl font-bold font-mono">{formatCurrency(totalManutencao)}</p>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 mt-1">
              <TrendingDown className="h-3 w-3" /> 3% vs. mês anterior
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Outros</span>
            </div>
            <p className="mt-2 text-3xl font-bold font-mono">{formatCurrency(totalOutros)}</p>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" /> 15% vs. mês anterior
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieGastoCategoria data={pieData} />
        <BarGastoVeiculo data={barData} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar despesas..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="combustivel">Combustível</SelectItem>
            <SelectItem value="manutencao">Manutenção</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="junho">Junho 2026</SelectItem>
            <SelectItem value="maio">Maio 2026</SelectItem>
            <SelectItem value="abril">Abril 2026</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
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
              <TableHead className="text-right w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((d) => {
              const Icon = d.icone
              return (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs">{d.data}</TableCell>
                  <TableCell>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{d.descricao}</TableCell>
                  <TableCell>{d.veiculo}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(d.valor)}</TableCell>
                  <TableCell>
                    <Badge variant={d.tipo === 'combustivel' ? 'info' : d.tipo === 'manutencao' ? 'warning' : 'secondary'}>
                      {d.categoria_label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {d.status ? (
                      <BadgeStatus status={d.status} />
                    ) : (
                      <Badge variant="secondary">—</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
          <span>Mostrando {filtrados.length} de {despesasMock.length} registros</span>
          <span className="font-mono font-medium text-foreground">
            Total: {formatCurrency(filtrados.reduce((a, d) => a + d.valor, 0))}
          </span>
        </div>
      </div>
    </div>
  )
}
