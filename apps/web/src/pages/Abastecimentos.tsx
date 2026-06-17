import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BadgeStatus } from '@/components/shared/badge-status'
import { EmptyState } from '@/components/shared/empty-state'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { useAuth } from '@/providers/auth-provider'
import { fetchAbastecimentos, createAbastecimento, fetchVeiculos, fetchMotoristas, type VeiculoDB, type MotoristaDB } from '@/lib/supabase/queries'
import type { AbastecimentoDB } from '@/lib/supabase/queries'
import { toast } from 'sonner'
import {
  Plus, Search, MoreHorizontal, Fuel, FileDown, Camera, MapPin, Ban, ImageIcon, Pencil, Loader2, X,
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

type AbastecimentoRow = AbastecimentoDB & {
  veiculos?: { placa: string; modelo: string } | null
  motoristas?: { nome: string } | null
  postos?: { nome: string; endereco: string } | null
}

function NovoAbastecimentoForm({ onClose, veiculos, motoristas }: {
  onClose: () => void
  veiculos: VeiculoDB[]
  motoristas: MotoristaDB[]
}) {
  const { user } = useAuth()
  const [veiculoId, setVeiculoId] = useState('')
  const [motoristaId, setMotoristaId] = useState('')
  const [km, setKm] = useState('')
  const [litros, setLitros] = useState('')
  const [valor, setValor] = useState('')
  const [combustivel, setCombustivel] = useState('')
  const [postoNome, setPostoNome] = useState('')
  const [pagamento, setPagamento] = useState('')
  const [obs, setObs] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFotoClick() { fileInputRef.current?.click() }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setFoto(file)
      const reader = new FileReader()
      reader.onloadend = () => setFotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  function removeFoto() { setFoto(null); setFotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }

  async function handleSubmit() {
    if (!user) return
    if (!veiculoId || !motoristaId || !km || !litros || !valor || !combustivel || !pagamento) {
      toast.error('Preencha todos os campos obrigatórios'); return
    }
    setIsLoading(true)
    try {
      await createAbastecimento(user.id, {
        veiculo_id: veiculoId, motorista_id: motoristaId,
        km_atual: parseInt(km), litros: parseFloat(litros), valor_total: parseFloat(valor),
        tipo_combustivel: combustivel, forma_pagamento: pagamento,
        posto_nome: postoNome.trim() || null, observacao: obs.trim() || null,
      })
      toast.success('Abastecimento registrado!')
      onClose()
    } catch { toast.error('Erro ao registrar abastecimento') }
    finally { setIsLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Veículo *</Label>
          <Select value={veiculoId} onValueChange={setVeiculoId}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {veiculos.filter((v) => v.ativo).map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Motorista *</Label>
          <Select value={motoristaId} onValueChange={setMotoristaId}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {motoristas.filter((m) => m.vinculo === 'ativo').map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
              ))}
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
          <Input id="posto" placeholder="Nome do posto" value={postoNome} onChange={(e) => setPostoNome(e.target.value)} />
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

      <div className="space-y-2">
        <Label>Foto do Cupom Fiscal</Label>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFotoChange} />
        {fotoPreview ? (
          <div className="relative rounded-lg border overflow-hidden">
            <img src={fotoPreview} alt="Preview" className="max-h-48 w-full object-contain bg-muted" />
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-background/80 hover:bg-background" onClick={removeFoto}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border-2 border-dashed p-6 text-center hover:bg-muted/30 cursor-pointer transition-colors" onClick={handleFotoClick}>
            <Camera className="h-8 w-8 text-muted-foreground/50 mx-auto" />
            <div><p className="text-sm font-medium">Clique para fotografar</p><p className="text-xs text-muted-foreground">ou arraste uma imagem</p></div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 text-primary" /> Localização detectada automaticamente
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
  const { user } = useAuth()
  const [abastecimentos, setAbastecimentos] = useState<AbastecimentoRow[]>([])
  const [veiculos, setVeiculos] = useState<VeiculoDB[]>([])
  const [motoristas, setMotoristas] = useState<MotoristaDB[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [detailAberto, setDetailAberto] = useState(false)
  const [formAberto, setFormAberto] = useState(false)
  const [itemDetalhe, setItemDetalhe] = useState<AbastecimentoRow | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([fetchAbastecimentos(user.id), fetchVeiculos(user.id), fetchMotoristas(user.id)])
      .then(([a, v, m]) => { setAbastecimentos(a); setVeiculos(v); setMotoristas(m) })
      .catch(() => toast.error('Erro ao carregar dados'))
      .finally(() => setLoading(false))
  }, [user])

  const totalLitros = abastecimentos.reduce((acc, a) => acc + a.litros, 0)
  const totalValor = abastecimentos.reduce((acc, a) => acc + a.valor_total, 0)
  const precoMedio = totalLitros > 0 ? totalValor / totalLitros : 0

  const filtrados = abastecimentos.filter((a) => {
    const placa = a.veiculos?.placa ?? ''
    const motorista = a.motoristas?.nome ?? ''
    const posto = a.postos?.nome ?? ''
    const matchSearch = placa.toLowerCase().includes(search.toLowerCase()) ||
      motorista.toLowerCase().includes(search.toLowerCase()) ||
      posto.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filtroStatus === 'todos' || a.status === filtroStatus
    return matchSearch && matchStatus
  })

  function abrirDetalhe(a: AbastecimentoRow) { setItemDetalhe(a); setDetailAberto(true) }

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Abastecimentos</h1>
        <Dialog open={formAberto} onOpenChange={setFormAberto}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Novo Abastecimento</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Novo Abastecimento</DialogTitle>
              <DialogDescription>Preencha os dados do abastecimento</DialogDescription>
            </DialogHeader>
            <NovoAbastecimentoForm onClose={() => setFormAberto(false)} veiculos={veiculos} motoristas={motoristas} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Abastecimentos</p><p className="mt-1 text-2xl font-bold">{abastecimentos.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Valor Total</p><p className="mt-1 text-2xl font-bold font-mono">{formatCurrency(totalValor)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Litros</p><p className="mt-1 text-2xl font-bold font-mono">{formatNumber(totalLitros, 1)} L</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Preço Médio</p><p className="mt-1 text-2xl font-bold font-mono">{formatCurrency(precoMedio)}/L</p></CardContent></Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por placa, motorista, posto..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="suspeito">Suspeito</SelectItem>
            <SelectItem value="rejeitado">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState icon={<Fuel className="h-16 w-16" />} title="Nenhum abastecimento encontrado" description="Registre o primeiro abastecimento da sua frota."
          action={<Button onClick={() => setFormAberto(true)}>Novo Abastecimento</Button>} />
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
                <TableRow key={a.id} className="cursor-pointer" onClick={() => abrirDetalhe(a)}>
                  <TableCell className="font-mono text-xs">{new Date(a.data_hora).toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="font-medium">{a.veiculos?.placa ?? '-'}</TableCell>
                  <TableCell>{a.motoristas?.nome ?? '-'}</TableCell>
                  <TableCell className="text-right font-mono">{a.litros.toFixed(1)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(a.valor_total)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(a.preco_litro)}</TableCell>
                  <TableCell className="text-right font-mono">{a.km_atual.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="max-w-[120px] truncate">{a.postos?.nome ?? a.posto_nome ?? '-'}</TableCell>
                  <TableCell className="text-center"><BadgeStatus status={a.status as 'confirmado' | 'pendente' | 'suspeito' | 'rejeitado'} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => abrirDetalhe(a)}>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={detailAberto} onOpenChange={setDetailAberto}>
        <DialogContent className="sm:max-w-2xl">
          {itemDetalhe && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes do Abastecimento — {new Date(itemDetalhe.data_hora).toLocaleString('pt-BR')}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Dados</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Veículo</span><span className="font-medium">{itemDetalhe.veiculos?.placa ?? '-'} — {itemDetalhe.veiculos?.modelo ?? ''}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Motorista</span><span className="font-medium">{itemDetalhe.motoristas?.nome ?? '-'}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Posto</span><span className="font-medium">{itemDetalhe.postos?.nome ?? itemDetalhe.posto_nome ?? '-'}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Registrado por</span><span className="font-medium capitalize">{itemDetalhe.registrado_por}</span></div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Valores</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Litros</span><span className="font-medium font-mono">{itemDetalhe.litros.toFixed(1)} L</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Valor Total</span><span className="font-medium font-mono">{formatCurrency(itemDetalhe.valor_total)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Preço/L</span><span className="font-medium font-mono">{formatCurrency(itemDetalhe.preco_litro)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Forma Pagamento</span><span className="font-medium">{itemDetalhe.forma_pagamento}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">KM Atual</span><span className="font-medium font-mono">{itemDetalhe.km_atual.toLocaleString('pt-BR')} km</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">KM/L</span><span className="font-medium font-mono">{itemDetalhe.km_l?.toFixed(1) ?? '-'} km/L</span></div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Status</h4>
                    <div className="flex items-center gap-2">
                      <BadgeStatus status={itemDetalhe.status as 'confirmado' | 'pendente' | 'suspeito' | 'rejeitado'} />
                      <span className="text-xs text-muted-foreground">
                        {itemDetalhe.status === 'confirmado' && 'Verificado automaticamente'}
                        {itemDetalhe.status === 'suspeito' && 'Requer revisão do gestor'}
                        {itemDetalhe.status === 'pendente' && 'Aguardando validação'}
                        {itemDetalhe.status === 'rejeitado' && 'Rejeitado pelo gestor'}
                      </span>
                    </div>
                  </div>
                  {itemDetalhe.observacao && (<><Separator /><div><h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Observação</h4><p className="text-sm text-muted-foreground">{itemDetalhe.observacao}</p></div></>)}
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Foto do Cupom Fiscal</h4>
                  <div className="flex items-center justify-center rounded-lg border bg-muted h-64">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                      <p className="mt-2 text-sm text-muted-foreground">{itemDetalhe.foto_url ? 'Foto disponível' : 'Cupom fiscal não disponível'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
