import { useState, useRef } from 'react'
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
import { BadgeStatus } from '@/components/shared/badge-status'
import { EmptyState } from '@/components/shared/empty-state'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  MoreHorizontal,
  Fuel,
  FileDown,
  Camera,
  MapPin,
  Ban,
  ImageIcon,
  Pencil,
  Loader2,
  X,
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

type StatusAbast = 'confirmado' | 'pendente' | 'suspeito' | 'rejeitado'

interface Abastecimento {
  id: string
  data_hora: string
  veiculo_placa: string
  veiculo_nome: string
  motorista: string
  litros: number
  valor_total: number
  preco_litro: number
  tipo_combustivel: string
  km_atual: number
  km_l: number
  posto_nome: string
  posto_endereco: string
  forma_pagamento: string
  status: StatusAbast
  foto_url: string | null
  observacao: string | null
  registrado_por: 'motorista' | 'gestor'
}

const abastecimentosMock: Abastecimento[] = [
  { id: '1', data_hora: '12/06/2026 14:30', veiculo_placa: 'ABC-1234', veiculo_nome: 'VW Constellation', motorista: 'Carlos Silva', litros: 280.0, valor_total: 1624.00, preco_litro: 5.80, tipo_combustivel: 'Diesel S10', km_atual: 84230, km_l: 7.3, posto_nome: 'Posto Shell', posto_endereco: 'Av. Brasil, 1500', forma_pagamento: 'Vale Combustível', status: 'confirmado', foto_url: null, observacao: null, registrado_por: 'motorista' },
  { id: '2', data_hora: '12/06/2026 08:15', veiculo_placa: 'XYZ-5678', veiculo_nome: 'Ford Cargo', motorista: 'Ana Oliveira', litros: 180.5, valor_total: 1083.00, preco_litro: 6.00, tipo_combustivel: 'Diesel S500', km_atual: 120500, km_l: 6.5, posto_nome: 'Auto Posto BR', posto_endereco: 'Rua Augusta, 500', forma_pagamento: 'Cartão Crédito', status: 'suspeito', foto_url: null, observacao: 'Fora do perímetro autorizado', registrado_por: 'motorista' },
  { id: '3', data_hora: '11/06/2026 22:40', veiculo_placa: 'DEF-9012', veiculo_nome: 'Mercedes Actros', motorista: 'Pedro Santos', litros: 290.0, valor_total: 1682.00, preco_litro: 5.80, tipo_combustivel: 'Diesel S10', km_atual: 45800, km_l: 5.1, posto_nome: 'Posto Ipiranga', posto_endereco: 'Av. Paulista, 2000', forma_pagamento: 'Vale Combustível', status: 'pendente', foto_url: null, observacao: 'Aguardando foto do cupom', registrado_por: 'gestor' },
  { id: '4', data_hora: '10/06/2026 16:00', veiculo_placa: 'ABC-1234', veiculo_nome: 'VW Constellation', motorista: 'Carlos Silva', litros: 285.0, valor_total: 1653.00, preco_litro: 5.80, tipo_combustivel: 'Diesel S10', km_atual: 83950, km_l: 7.5, posto_nome: 'Posto Shell', posto_endereco: 'Av. Brasil, 1500', forma_pagamento: 'Vale Combustível', status: 'confirmado', foto_url: null, observacao: null, registrado_por: 'motorista' },
  { id: '5', data_hora: '10/06/2026 07:30', veiculo_placa: 'GHI-3456', veiculo_nome: 'VW Delivery', motorista: 'Maria Souza', litros: 45.0, valor_total: 261.00, preco_litro: 5.80, tipo_combustivel: 'Gasolina Comum', km_atual: 92100, km_l: 10.5, posto_nome: 'Posto Ipiranga', posto_endereco: 'Rua Augusta, 500', forma_pagamento: 'Dinheiro', status: 'confirmado', foto_url: null, observacao: null, registrado_por: 'motorista' },
  { id: '6', data_hora: '09/06/2026 18:00', veiculo_placa: 'ABC-1234', veiculo_nome: 'VW Constellation', motorista: 'Carlos Silva', litros: 270.0, valor_total: 1539.00, preco_litro: 5.70, tipo_combustivel: 'Diesel S10', km_atual: 83680, km_l: 7.0, posto_nome: 'Posto Shell', posto_endereco: 'Av. Brasil, 1500', forma_pagamento: 'Vale Combustível', status: 'confirmado', foto_url: null, observacao: null, registrado_por: 'motorista' },
  { id: '7', data_hora: '09/06/2026 05:45', veiculo_placa: 'XYZ-5678', veiculo_nome: 'Ford Cargo', motorista: 'Ana Oliveira', litros: 200.0, valor_total: 1200.00, preco_litro: 6.00, tipo_combustivel: 'Diesel S500', km_atual: 120300, km_l: 4.2, posto_nome: 'Auto Posto BR', posto_endereco: 'Rua Augusta, 500', forma_pagamento: 'Cartão Crédito', status: 'suspeito', foto_url: null, observacao: 'Consumo anômalo (4,2 km/L, média é 6,5)', registrado_por: 'motorista' },
]

function NovoAbastecimentoForm({ onClose }: { onClose: () => void }) {
  const [veiculo, setVeiculo] = useState('')
  const [motorista, setMotorista] = useState('')
  const [km, setKm] = useState('')
  const [litros, setLitros] = useState('')
  const [valor, setValor] = useState('')
  const [combustivel, setCombustivel] = useState('')
  const [posto, setPosto] = useState('')
  const [pagamento, setPagamento] = useState('')
  const [obs, setObs] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFotoClick() {
    fileInputRef.current?.click()
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setFoto(file)
      const reader = new FileReader()
      reader.onloadend = () => setFotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  function removeFoto() {
    setFoto(null)
    setFotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSubmit() {
    if (!veiculo || !motorista || !km || !litros || !valor || !combustivel || !pagamento) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Abastecimento registrado com sucesso!')
      onClose()
    }, 800)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Veículo *</Label>
          <Select value={veiculo} onValueChange={setVeiculo}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ABC-1234">ABC-1234 — VW Constellation</SelectItem>
              <SelectItem value="XYZ-5678">XYZ-5678 — Ford Cargo</SelectItem>
              <SelectItem value="DEF-9012">DEF-9012 — Mercedes Actros</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Motorista *</Label>
          <Select value={motorista} onValueChange={setMotorista}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Carlos Silva">Carlos Silva</SelectItem>
              <SelectItem value="Ana Oliveira">Ana Oliveira</SelectItem>
              <SelectItem value="Pedro Santos">Pedro Santos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="km">KM Atual *</Label>
          <Input id="km" type="number" placeholder="84230" value={km} onChange={(e) => setKm(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="litros">Litros *</Label>
          <Input id="litros" type="number" step="0.1" placeholder="280,0" value={litros} onChange={(e) => setLitros(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="valor">Valor Total (R$) *</Label>
          <Input id="valor" type="number" step="0.01" placeholder="1624,00" value={valor} onChange={(e) => setValor(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Tipo Combustível *</Label>
          <Select value={combustivel} onValueChange={setCombustivel}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Diesel S10">Diesel S10</SelectItem>
              <SelectItem value="Diesel S500">Diesel S500</SelectItem>
              <SelectItem value="Gasolina">Gasolina Comum</SelectItem>
              <SelectItem value="Etanol">Etanol</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="posto">Posto</Label>
          <Input id="posto" placeholder="Nome do posto" value={posto} onChange={(e) => setPosto(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Forma Pagamento *</Label>
          <Select value={pagamento} onValueChange={setPagamento}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Vale Combustível">Vale Combustível</SelectItem>
              <SelectItem value="Cartão Crédito">Cartão Crédito</SelectItem>
              <SelectItem value="Cartão Débito">Cartão Débito</SelectItem>
              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
              <SelectItem value="Pix">Pix</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Photo upload */}
      <div className="space-y-2">
        <Label>Foto do Cupom Fiscal</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFotoChange}
        />
        {fotoPreview ? (
          <div className="relative rounded-lg border overflow-hidden">
            <img src={fotoPreview} alt="Preview" className="max-h-48 w-full object-contain bg-muted" />
            <Button
              variant="ghost" size="icon"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background"
              onClick={removeFoto}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 rounded-lg border-2 border-dashed p-6 text-center hover:bg-muted/30 cursor-pointer transition-colors"
            onClick={handleFotoClick}
          >
            <Camera className="h-8 w-8 text-muted-foreground/50 mx-auto" />
            <div>
              <p className="text-sm font-medium">Clique para fotografar</p>
              <p className="text-xs text-muted-foreground">ou arraste uma imagem</p>
            </div>
          </div>
        )}
      </div>

      {/* Geolocation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 text-primary" />
        Localização detectada: Av. Brasil, 1500 — São Paulo, SP
      </div>

      <div className="space-y-2">
        <Label htmlFor="obs">Observação</Label>
        <Textarea id="obs" placeholder="Informações adicionais..." value={obs} onChange={(e) => setObs(e.target.value)} />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Registrar Abastecimento
        </Button>
      </DialogFooter>
    </div>
  )
}

export function Abastecimentos() {
  const [search, setSearch] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [detailAberto, setDetailAberto] = useState(false)
  const [formAberto, setFormAberto] = useState(false)
  const [itemDetalhe, setItemDetalhe] = useState<Abastecimento | null>(null)

  const totalLitros = abastecimentosMock.reduce((acc, a) => acc + a.litros, 0)
  const totalValor = abastecimentosMock.reduce((acc, a) => acc + a.valor_total, 0)
  const precoMedio = totalValor / totalLitros

  const filtrados = abastecimentosMock.filter((a) => {
    const matchSearch =
      a.veiculo_placa.toLowerCase().includes(search.toLowerCase()) ||
      a.motorista.toLowerCase().includes(search.toLowerCase()) ||
      a.posto_nome.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filtroStatus === 'todos' || a.status === filtroStatus
    return matchSearch && matchStatus
  })

  function abrirDetalhe(a: Abastecimento) {
    setItemDetalhe(a)
    setDetailAberto(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Abastecimentos</h1>
        <Dialog open={formAberto} onOpenChange={setFormAberto}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Abastecimento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Novo Abastecimento</DialogTitle>
              <DialogDescription>Preencha os dados do abastecimento</DialogDescription>
            </DialogHeader>
            <NovoAbastecimentoForm onClose={() => setFormAberto(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Abastecimentos</p>
            <p className="mt-1 text-2xl font-bold">{filtrados.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="mt-1 text-2xl font-bold font-mono">{formatCurrency(totalValor)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Litros</p>
            <p className="mt-1 text-2xl font-bold font-mono">{formatNumber(totalLitros, 1)} L</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Preço Médio</p>
            <p className="mt-1 text-2xl font-bold font-mono">{formatCurrency(precoMedio)}/L</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa, motorista, posto..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="suspeito">Suspeito</SelectItem>
            <SelectItem value="rejeitado">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="junho">Junho 2026</SelectItem>
            <SelectItem value="maio">Maio 2026</SelectItem>
            <SelectItem value="abril">Abril 2026</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtrados.length === 0 ? (
        <EmptyState
          icon={<Fuel className="h-16 w-16" />}
          title="Nenhum abastecimento encontrado"
          description="Registre o primeiro abastecimento da sua frota."
          action={<Button onClick={() => setFormAberto(true)}>Novo Abastecimento</Button>}
        />
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead className="text-right">Litros</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Preço/L</TableHead>
                <TableHead className="text-right">KM</TableHead>
                <TableHead>Posto</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((a) => (
                <TableRow
                  key={a.id}
                  className="cursor-pointer"
                  onClick={() => abrirDetalhe(a)}
                >
                  <TableCell className="font-mono text-xs">{a.data_hora}</TableCell>
                  <TableCell className="font-medium">{a.veiculo_placa}</TableCell>
                  <TableCell>{a.motorista}</TableCell>
                  <TableCell className="text-right font-mono">{a.litros.toFixed(1)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(a.valor_total)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(a.preco_litro)}</TableCell>
                  <TableCell className="text-right font-mono">{a.km_atual.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="max-w-[120px] truncate">{a.posto_nome}</TableCell>
                  <TableCell className="text-center">
                    <BadgeStatus status={a.status} />
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
                        <DropdownMenuItem onClick={() => abrirDetalhe(a)}>
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileDown className="mr-2 h-4 w-4" /> Baixar foto
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Ban className="mr-2 h-4 w-4" /> Rejeitar
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
          {itemDetalhe && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Detalhes do Abastecimento — {itemDetalhe.data_hora}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dados */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Dados</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Veículo</span>
                        <span className="font-medium">{itemDetalhe.veiculo_placa} — {itemDetalhe.veiculo_nome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Motorista</span>
                        <span className="font-medium">{itemDetalhe.motorista}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Posto</span>
                        <span className="font-medium">{itemDetalhe.posto_nome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Endereço</span>
                        <span className="font-medium text-right max-w-[200px]">{itemDetalhe.posto_endereco}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Registrado por</span>
                        <span className="font-medium capitalize">{itemDetalhe.registrado_por}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Valores</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Litros</span>
                        <span className="font-medium font-mono">{itemDetalhe.litros.toFixed(1)} L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor Total</span>
                        <span className="font-medium font-mono">{formatCurrency(itemDetalhe.valor_total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Preço/L</span>
                        <span className="font-medium font-mono">{formatCurrency(itemDetalhe.preco_litro)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Forma Pagamento</span>
                        <span className="font-medium">{itemDetalhe.forma_pagamento}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">KM Atual</span>
                        <span className="font-medium font-mono">{itemDetalhe.km_atual.toLocaleString('pt-BR')} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">KM/L</span>
                        <span className="font-medium font-mono">{itemDetalhe.km_l.toFixed(1)} km/L</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Status</h4>
                    <div className="flex items-center gap-2">
                      <BadgeStatus status={itemDetalhe.status} />
                      <span className="text-xs text-muted-foreground">
                        {itemDetalhe.status === 'confirmado' && 'Verificado automaticamente'}
                        {itemDetalhe.status === 'suspeito' && 'Requer revisão do gestor'}
                        {itemDetalhe.status === 'pendente' && 'Aguardando validação'}
                        {itemDetalhe.status === 'rejeitado' && 'Rejeitado pelo gestor'}
                      </span>
                    </div>
                  </div>

                  {itemDetalhe.observacao && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Observação</h4>
                        <p className="text-sm text-muted-foreground">{itemDetalhe.observacao}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Photo */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Foto do Cupom Fiscal</h4>
                  <div className="flex items-center justify-center rounded-lg border bg-muted h-64">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                      <p className="mt-2 text-sm text-muted-foreground">Cupom fiscal não disponível</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Camera className="mr-2 h-4 w-4" /> Ver foto
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm">
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </Button>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Ban className="mr-2 h-4 w-4" /> Rejeitar
                </Button>
                <Button variant="outline" size="sm" className="ml-auto">
                  <FileDown className="mr-2 h-4 w-4" /> Exportar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

