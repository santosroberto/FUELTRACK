import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import {
  Plus,
  Wrench,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  Calendar,
  Gauge,
  DollarSign,
  Building2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type StatusManutencao = 'agendado' | 'em_andamento' | 'concluido' | 'cancelado'
type TipoManutencao = 'preventiva' | 'corretiva'

interface Manutencao {
  id: string
  veiculo_placa: string
  veiculo_nome: string
  tipo: TipoManutencao
  data: string
  descricao: string
  km_atual: number
  valor: number
  oficina: string
  proxima_manutencao_km: number | null
  status: StatusManutencao
}

const manutencoesMock: Manutencao[] = [
  { id: '1', veiculo_placa: 'ABC-1234', veiculo_nome: 'VW Constellation', tipo: 'preventiva', data: '15/06/2026', descricao: 'Revisão 50.000 km — troca de óleo, filtros e calibragem', km_atual: 84230, valor: 800, oficina: 'Auto Mecânica Silva', proxima_manutencao_km: 100000, status: 'agendado' },
  { id: '2', veiculo_placa: 'XYZ-5678', veiculo_nome: 'Ford Cargo', tipo: 'corretiva', data: '10/06/2026', descricao: 'Troca de óleo do motor', km_atual: 120500, valor: 3200, oficina: 'Oficina do Zé', proxima_manutencao_km: 125000, status: 'em_andamento' },
  { id: '3', veiculo_placa: 'DEF-9012', veiculo_nome: 'Mercedes Actros', tipo: 'preventiva', data: '05/06/2026', descricao: 'Alinhamento e balanceamento', km_atual: 45800, valor: 250, oficina: 'Pneus & Cia', proxima_manutencao_km: null, status: 'concluido' },
  { id: '4', veiculo_placa: 'ABC-1234', veiculo_nome: 'VW Constellation', tipo: 'corretiva', data: '01/06/2026', descricao: 'Troca de pastilhas de freio dianteiras', km_atual: 83950, valor: 1200, oficina: 'Freios Expert', proxima_manutencao_km: null, status: 'concluido' },
  { id: '5', veiculo_placa: 'GHI-3456', veiculo_nome: 'VW Delivery', tipo: 'preventiva', data: '20/06/2026', descricao: 'Troca de pneus (4 unidades)', km_atual: 92100, valor: 4500, oficina: 'Pneus & Cia', proxima_manutencao_km: 100000, status: 'agendado' },
  { id: '6', veiculo_placa: 'DEF-9012', veiculo_nome: 'Mercedes Actros', tipo: 'preventiva', data: '25/06/2026', descricao: 'Troca de filtro de ar e cabine', km_atual: 46200, valor: 180, oficina: 'Auto Mecânica Silva', proxima_manutencao_km: 55000, status: 'agendado' },
]

const statusLabel: Record<StatusManutencao, string> = {
  agendado: 'Agendado',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

const statusVariant: Record<StatusManutencao, 'warning' | 'info' | 'success' | 'secondary'> = {
  agendado: 'warning',
  em_andamento: 'info',
  concluido: 'success',
  cancelado: 'secondary',
}

const tipoVariant: Record<TipoManutencao, 'outline' | 'secondary'> = {
  preventiva: 'outline',
  corretiva: 'secondary',
}

function ManutencaoForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Veículo *</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o veículo..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="abc">ABC-1234 — VW Constellation</SelectItem>
            <SelectItem value="xyz">XYZ-5678 — Ford Cargo</SelectItem>
            <SelectItem value="def">DEF-9012 — Mercedes Actros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo *</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preventiva">Preventiva</SelectItem>
              <SelectItem value="corretiva">Corretiva</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="data">Data *</Label>
          <Input id="data" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="km">KM Atual</Label>
          <Input id="km" type="number" placeholder="84230" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="valor">Valor (R$)</Label>
          <Input id="valor" type="number" step="0.01" placeholder="800,00" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição *</Label>
        <Textarea id="descricao" placeholder="Descreva o serviço realizado..." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="oficina">Oficina</Label>
          <Input id="oficina" placeholder="Auto Mecânica Silva" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prox_km">Próxima Manutenção (km)</Label>
          <Input id="prox_km" type="number" placeholder="100000" />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button>Salvar Manutenção</Button>
      </DialogFooter>
    </div>
  )
}

export function Manutencoes() {
  const [search, setSearch] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todas')
  const [formAberto, setFormAberto] = useState(false)

  const agendadas = manutencoesMock.filter((m) => m.status === 'agendado')
  const emAndamento = manutencoesMock.filter((m) => m.status === 'em_andamento')
  const custoTotal = manutencoesMock
    .filter((m) => m.status !== 'cancelado')
    .reduce((a, m) => a + m.valor, 0)

  const filtrados = manutencoesMock.filter((m) => {
    const matchSearch =
      m.veiculo_placa.toLowerCase().includes(search.toLowerCase()) ||
      m.descricao.toLowerCase().includes(search.toLowerCase()) ||
      m.oficina.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filtroStatus === 'todas' || m.status === filtroStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Manutenções</h1>
        <Dialog open={formAberto} onOpenChange={setFormAberto}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Manutenção
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Nova Manutenção</DialogTitle>
              <DialogDescription>Registre uma manutenção para o veículo</DialogDescription>
            </DialogHeader>
            <ManutencaoForm onClose={() => setFormAberto(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Custo Total (mês)</p>
            <p className="mt-1 text-2xl font-bold font-mono">{formatCurrency(custoTotal)}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-muted-foreground">Agendadas</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{agendadas.length}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Em Andamento</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{emAndamento.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total de Registros</p>
            <p className="mt-1 text-2xl font-bold">{manutencoesMock.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming maintenances */}
      {agendadas.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-500" />
              Próximas manutenções agendadas (próximos 30 dias)
            </h3>
            <div className="space-y-2">
              {agendadas.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{m.data}</span>
                    <span className="font-medium">{m.veiculo_placa}</span>
                    <span className="text-muted-foreground truncate max-w-[300px]">— {m.descricao}</span>
                  </div>
                  <span className="font-mono font-medium">{formatCurrency(m.valor)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa, descrição..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="agendado">Agendadas</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluídas</SelectItem>
            <SelectItem value="cancelado">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtrados.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-16 w-16" />}
          title="Nenhuma manutenção encontrada"
          description="Registre a primeira manutenção da sua frota."
          action={<Button onClick={() => setFormAberto(true)}>Nova Manutenção</Button>}
        />
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Veículo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">KM</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Oficina</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{m.veiculo_placa}</p>
                      <p className="text-xs text-muted-foreground">{m.veiculo_nome}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tipoVariant[m.tipo]}>
                      {m.tipo === 'preventiva' ? 'Preventiva' : 'Corretiva'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{m.data}</TableCell>
                  <TableCell className="max-w-[250px] truncate">{m.descricao}</TableCell>
                  <TableCell className="text-right font-mono">{m.km_atual.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(m.valor)}</TableCell>
                  <TableCell className="max-w-[120px] truncate">{m.oficina}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusVariant[m.status]}>
                      {statusLabel[m.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Concluir
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Cancelar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
