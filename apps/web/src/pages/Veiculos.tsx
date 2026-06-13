import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { BadgeStatus } from '@/components/shared/badge-status'
import { EmptyState } from '@/components/shared/empty-state'
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Truck,
  Eye,
  History,
  Fuel,
  Gauge,
  Calendar,
  ChevronDown,
  X,
} from 'lucide-react'
import { cn, formatKm } from '@/lib/utils'

type Combustivel = 'diesel_s10' | 'diesel_s500' | 'gasolina_comum' | 'gasolina_aditivada' | 'etanol' | 'gnv' | 'eletrico'

interface Veiculo {
  id: string
  placa: string
  marca: string
  modelo: string
  ano: number
  tipo_combustivel: Combustivel
  capacidade_tanque: number
  km_atual: number
  consumo_medio: number
  ativo: boolean
  observacoes: string | null
  created_at: string
}

interface AbastecimentoResumo {
  data: string
  motorista: string
  litros: number
  valor: number
  km_l: number
  status: 'confirmado' | 'pendente' | 'suspeito'
}

const combustivelLabel: Record<Combustivel, string> = {
  diesel_s10: 'Diesel S10',
  diesel_s500: 'Diesel S500',
  gasolina_comum: 'Gasolina Comum',
  gasolina_aditivada: 'Gasolina Aditivada',
  etanol: 'Etanol',
  gnv: 'GNV',
  eletrico: 'Elétrico',
}

const veiculosMock: Veiculo[] = [
  { id: '1', placa: 'ABC-1234', marca: 'Volkswagen', modelo: 'Constellation 24.280', ano: 2022, tipo_combustivel: 'diesel_s10', capacidade_tanque: 300, km_atual: 84230, consumo_medio: 7.2, ativo: true, observacoes: null, created_at: '2024-01-15' },
  { id: '2', placa: 'XYZ-5678', marca: 'Ford', modelo: 'Cargo 1719', ano: 2021, tipo_combustivel: 'diesel_s500', capacidade_tanque: 250, km_atual: 120500, consumo_medio: 6.8, ativo: true, observacoes: 'Veículo do setor de entregas', created_at: '2024-01-20' },
  { id: '3', placa: 'DEF-9012', marca: 'Mercedes-Benz', modelo: 'Actros 2651', ano: 2023, tipo_combustivel: 'diesel_s10', capacidade_tanque: 400, km_atual: 45800, consumo_medio: 8.1, ativo: true, observacoes: null, created_at: '2024-03-01' },
  { id: '4', placa: 'GHI-3456', marca: 'Volkswagen', modelo: 'Delivery 11.180', ano: 2020, tipo_combustivel: 'gasolina_comum', capacidade_tanque: 150, km_atual: 92100, consumo_medio: 10.5, ativo: false, observacoes: 'Desativado - aguardando venda', created_at: '2024-01-10' },
  { id: '5', placa: 'JKL-7890', marca: 'Scania', modelo: 'R440', ano: 2022, tipo_combustivel: 'diesel_s10', capacidade_tanque: 500, km_atual: 156300, consumo_medio: 7.9, ativo: true, observacoes: 'Rota SP-RJ', created_at: '2024-02-15' },
  { id: '6', placa: 'MNO-1234', marca: 'Ford', modelo: 'Transit 350', ano: 2023, tipo_combustivel: 'diesel_s500', capacidade_tanque: 80, km_atual: 28400, consumo_medio: 7.5, ativo: true, observacoes: null, created_at: '2024-04-01' },
  { id: '7', placa: 'PQR-5678', marca: 'Volkswagen', modelo: 'Crafter 35', ano: 2021, tipo_combustivel: 'diesel_s10', capacidade_tanque: 75, km_atual: 67900, consumo_medio: 8.3, ativo: true, observacoes: null, created_at: '2024-01-25' },
]

const abastecimentosMock: Record<string, AbastecimentoResumo[]> = {
  '1': [
    { data: '10/06', motorista: 'Carlos', litros: 280, valor: 1624, km_l: 7.3, status: 'confirmado' },
    { data: '05/06', motorista: 'Carlos', litros: 285, valor: 1653, km_l: 7.5, status: 'confirmado' },
    { data: '01/06', motorista: 'Pedro', litros: 270, valor: 1539, km_l: 6.8, status: 'suspeito' },
  ],
}

function VeiculoForm({
  veiculo,
  onClose,
}: {
  veiculo?: Veiculo
  onClose: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="placa">Placa *</Label>
          <Input id="placa" defaultValue={veiculo?.placa} placeholder="ABC-1234" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="marca">Marca *</Label>
          <Input id="marca" defaultValue={veiculo?.marca} placeholder="Volkswagen" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo *</Label>
          <Input id="modelo" defaultValue={veiculo?.modelo} placeholder="Constellation" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ano">Ano *</Label>
          <Input id="ano" type="number" defaultValue={veiculo?.ano} placeholder="2024" />
        </div>
        <div className="space-y-2">
          <Label>Tipo de Combustível *</Label>
          <Select defaultValue={veiculo?.tipo_combustivel}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(combustivelLabel).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacidade">Capacidade do Tanque (L)</Label>
          <Input id="capacidade" type="number" defaultValue={veiculo?.capacidade_tanque} placeholder="300" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" defaultValue={veiculo?.observacoes ?? ''} placeholder="Informações adicionais..." />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button>{veiculo ? 'Salvar Alterações' : 'Salvar Veículo'}</Button>
      </DialogFooter>
    </div>
  )
}

export function Veiculos() {
  const [search, setSearch] = useState('')
  const [veiculoDetalhe, setVeiculoDetalhe] = useState<Veiculo | null>(null)
  const [veiculoEditando, setVeiculoEditando] = useState<Veiculo | undefined>(undefined)
  const [formAberto, setFormAberto] = useState(false)
  const [detailAberto, setDetailAberto] = useState(false)
  const [filtroCombustivel, setFiltroCombustivel] = useState<string>('todos')
  const [filtroAtivo, setFiltroAtivo] = useState<string>('todos')

  const veiculosFiltrados = veiculosMock.filter((v) => {
    const matchSearch =
      v.placa.toLowerCase().includes(search.toLowerCase()) ||
      v.marca.toLowerCase().includes(search.toLowerCase()) ||
      v.modelo.toLowerCase().includes(search.toLowerCase())
    const matchCombustivel =
      filtroCombustivel === 'todos' || v.tipo_combustivel === filtroCombustivel
    const matchAtivo =
      filtroAtivo === 'todos' ||
      (filtroAtivo === 'ativos' && v.ativo) ||
      (filtroAtivo === 'inativos' && !v.ativo)
    return matchSearch && matchCombustivel && matchAtivo
  })

  function abrirDetalhe(v: Veiculo) {
    setVeiculoDetalhe(v)
    setDetailAberto(true)
  }

  function abrirForm(v?: Veiculo) {
    setVeiculoEditando(v)
    setFormAberto(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Veículos</h1>
        <Dialog open={formAberto} onOpenChange={setFormAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{veiculoEditando ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
              <DialogDescription>
                {veiculoEditando
                  ? 'Altere os dados do veículo'
                  : 'Preencha os dados do novo veículo'}
              </DialogDescription>
            </DialogHeader>
            <VeiculoForm
              veiculo={veiculoEditando}
              onClose={() => setFormAberto(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa, marca..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filtroCombustivel} onValueChange={setFiltroCombustivel}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Combustível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {Object.entries(combustivelLabel).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroAtivo} onValueChange={setFiltroAtivo}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativos">Ativos</SelectItem>
            <SelectItem value="inativos">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {veiculosFiltrados.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-16 w-16" />}
          title="Nenhum veículo encontrado"
          description="Cadastre o primeiro veículo da sua frota."
          action={<Button onClick={() => abrirForm()}>Novo Veículo</Button>}
        />
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Veículo</TableHead>
                <TableHead>Marca/Modelo</TableHead>
                <TableHead className="text-center">Ano</TableHead>
                <TableHead>Combustível</TableHead>
                <TableHead className="text-right">KM</TableHead>
                <TableHead className="text-right">Consumo</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {veiculosFiltrados.map((v) => (
                <TableRow
                  key={v.id}
                  className="cursor-pointer"
                  onClick={() => abrirDetalhe(v)}
                >
                  <TableCell className="font-medium">{v.placa}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {v.marca} {v.modelo}
                  </TableCell>
                  <TableCell className="text-center">{v.ano}</TableCell>
                  <TableCell>{combustivelLabel[v.tipo_combustivel]}</TableCell>
                  <TableCell className="text-right font-mono">
                    {v.km_atual.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {v.consumo_medio.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={v.ativo ? 'success' : 'secondary'}>
                      {v.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => abrirDetalhe(v)}>
                          <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => abrirForm(v)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Inativar
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

      {/* Detail Modal */}
      <Dialog open={detailAberto} onOpenChange={setDetailAberto}>
        <DialogContent className="sm:max-w-2xl">
          {veiculoDetalhe && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {veiculoDetalhe.placa} — {veiculoDetalhe.marca} {veiculoDetalhe.modelo} {veiculoDetalhe.ano}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Photo placeholder */}
                <div className="flex items-center justify-center rounded-lg bg-muted h-40 md:h-full">
                  <Truck className="h-16 w-16 text-muted-foreground/40" />
                </div>

                {/* Info */}
                <div className="md:col-span-2 space-y-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Placa:</span>
                      <p className="font-medium">{veiculoDetalhe.placa}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Marca:</span>
                      <p className="font-medium">{veiculoDetalhe.marca}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Modelo:</span>
                      <p className="font-medium">{veiculoDetalhe.modelo}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ano:</span>
                      <p className="font-medium">{veiculoDetalhe.ano}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Combustível:</span>
                      <p className="font-medium">{combustivelLabel[veiculoDetalhe.tipo_combustivel]}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Capacidade:</span>
                      <p className="font-medium">{veiculoDetalhe.capacidade_tanque}L</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">KM Atual:</span>
                      <p className="font-medium font-mono">{veiculoDetalhe.km_atual.toLocaleString('pt-BR')} km</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Consumo Médio:</span>
                      <p className="font-medium font-mono">{veiculoDetalhe.consumo_medio.toFixed(1)} km/L</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={veiculoDetalhe.ativo ? 'success' : 'secondary'}>
                        {veiculoDetalhe.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>

                  {veiculoDetalhe.observacoes && (
                    <p className="text-sm text-muted-foreground italic">
                      Obs: {veiculoDetalhe.observacoes}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => { setDetailAberto(false); abrirForm(veiculoDetalhe) }}>
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                      Inativar
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Last fuelings */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Últimos Abastecimentos</h4>
                {(abastecimentosMock[veiculoDetalhe.id] ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum abastecimento registrado.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Motorista</TableHead>
                        <TableHead className="text-right">Litros</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">KM/L</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(abastecimentosMock[veiculoDetalhe.id] ?? []).map((a, i) => (
                        <TableRow key={i}>
                          <TableCell>{a.data}</TableCell>
                          <TableCell>{a.motorista}</TableCell>
                          <TableCell className="text-right font-mono">{a.litros}L</TableCell>
                          <TableCell className="text-right font-mono">R$ {a.valor.toLocaleString('pt-BR')}</TableCell>
                          <TableCell className="text-right font-mono">{a.km_l}</TableCell>
                          <TableCell className="text-center">
                            <BadgeStatus status={a.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <div className="mt-2">
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                    Ver todos os abastecimentos
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
