import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { useAuth } from '@/providers/auth-provider'
import { fetchVeiculos, createVeiculo, updateVeiculo, type VeiculoDB } from '@/lib/supabase/queries'
import { toast } from 'sonner'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Truck, Eye, Loader2 } from 'lucide-react'

const combustivelLabel: Record<string, string> = {
  diesel_s10: 'Diesel S10', diesel_s500: 'Diesel S500', gasolina_comum: 'Gasolina Comum',
  gasolina_aditivada: 'Gasolina Aditivada', etanol: 'Etanol', gnv: 'GNV', eletrico: 'Elétrico',
}

function VeiculoForm({ veiculo, onClose, onSave }: {
  veiculo?: VeiculoDB
  onClose: () => void
  onSave: (data: Partial<VeiculoDB>) => Promise<void>
}) {
  const [placa, setPlaca] = useState(veiculo?.placa ?? '')
  const [marca, setMarca] = useState(veiculo?.marca ?? '')
  const [modelo, setModelo] = useState(veiculo?.modelo ?? '')
  const [ano, setAno] = useState(veiculo?.ano?.toString() ?? '')
  const [tipoCombustivel, setTipoCombustivel] = useState(veiculo?.tipo_combustivel ?? '')
  const [capacidade, setCapacidade] = useState(veiculo?.capacidade_tanque?.toString() ?? '')
  const [observacoes, setObservacoes] = useState(veiculo?.observacoes ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!placa.trim() || !marca.trim() || !modelo.trim() || !ano || !tipoCombustivel) {
      toast.error('Preencha todos os campos obrigatórios'); return
    }
    setSaving(true)
    try {
      await onSave({
        placa: placa.trim().toUpperCase(), marca: marca.trim(), modelo: modelo.trim(),
        ano: parseInt(ano), tipo_combustivel: tipoCombustivel,
        capacidade_tanque: capacidade ? parseFloat(capacidade) : null,
        observacoes: observacoes.trim() || null,
      })
      onClose()
    } catch { toast.error('Erro ao salvar veículo') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="placa">Placa *</Label>
          <Input id="placa" value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="ABC-1234" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="marca">Marca *</Label>
          <Input id="marca" value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Volkswagen" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo *</Label>
          <Input id="modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Constellation" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ano">Ano *</Label>
          <Input id="ano" type="number" value={ano} onChange={(e) => setAno(e.target.value)} placeholder="2024" />
        </div>
        <div className="space-y-2">
          <Label>Tipo Combustível *</Label>
          <Select value={tipoCombustivel} onValueChange={setTipoCombustivel}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {Object.entries(combustivelLabel).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacidade">Capacidade Tanque (L)</Label>
          <Input id="capacidade" type="number" value={capacidade} onChange={(e) => setCapacidade(e.target.value)} placeholder="300" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Informações adicionais..." />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {veiculo ? 'Salvar Alterações' : 'Salvar Veículo'}
        </Button>
      </DialogFooter>
    </div>
  )
}

export function Veiculos() {
  const { user } = useAuth()
  const [veiculos, setVeiculos] = useState<VeiculoDB[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [veiculoDetalhe, setVeiculoDetalhe] = useState<VeiculoDB | null>(null)
  const [veiculoEditando, setVeiculoEditando] = useState<VeiculoDB | undefined>(undefined)
  const [formAberto, setFormAberto] = useState(false)
  const [detailAberto, setDetailAberto] = useState(false)
  const [filtroCombustivel, setFiltroCombustivel] = useState<string>('todos')
  const [filtroAtivo, setFiltroAtivo] = useState<string>('todos')

  useEffect(() => {
    if (!user) return
    fetchVeiculos(user.id).then(setVeiculos).catch(() => toast.error('Erro ao carregar veículos'))
    .finally(() => setLoading(false))
  }, [user])

  async function handleSave(data: Partial<VeiculoDB>) {
    if (!user) return
    if (veiculoEditando) {
      const updated = await updateVeiculo(veiculoEditando.id, data)
      setVeiculos((prev) => prev.map((v) => v.id === veiculoEditando.id ? updated : v))
      toast.success('Veículo atualizado')
    } else {
      const created = await createVeiculo(user.id, data)
      setVeiculos((prev) => [created, ...prev])
      toast.success('Veículo cadastrado')
    }
  }

  const veiculosFiltrados = veiculos.filter((v) => {
    const matchSearch = v.placa.toLowerCase().includes(search.toLowerCase()) ||
      v.marca.toLowerCase().includes(search.toLowerCase()) ||
      v.modelo.toLowerCase().includes(search.toLowerCase())
    const matchCombustivel = filtroCombustivel === 'todos' || v.tipo_combustivel === filtroCombustivel
    const matchAtivo = filtroAtivo === 'todos' ||
      (filtroAtivo === 'ativos' && v.ativo) ||
      (filtroAtivo === 'inativos' && !v.ativo)
    return matchSearch && matchCombustivel && matchAtivo
  })

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Veículos</h1>
        <Dialog open={formAberto} onOpenChange={setFormAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => { setVeiculoEditando(undefined); setFormAberto(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{veiculoEditando ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
              <DialogDescription>{veiculoEditando ? 'Altere os dados do veículo' : 'Preencha os dados do novo veículo'}</DialogDescription>
            </DialogHeader>
            <VeiculoForm veiculo={veiculoEditando} onClose={() => setFormAberto(false)} onSave={handleSave} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por placa, marca..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filtroCombustivel} onValueChange={setFiltroCombustivel}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Combustível" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {Object.entries(combustivelLabel).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroAtivo} onValueChange={setFiltroAtivo}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativos">Ativos</SelectItem>
            <SelectItem value="inativos">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {veiculosFiltrados.length === 0 ? (
        <EmptyState icon={<Truck className="h-16 w-16" />} title="Nenhum veículo encontrado" description="Cadastre o primeiro veículo da sua frota."
          action={<Button onClick={() => { setVeiculoEditando(undefined); setFormAberto(true) }}>Novo Veículo</Button>} />
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
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {veiculosFiltrados.map((v) => (
                <TableRow key={v.id} className="cursor-pointer" onClick={() => { setVeiculoDetalhe(v); setDetailAberto(true) }}>
                  <TableCell className="font-medium">{v.placa}</TableCell>
                  <TableCell className="text-muted-foreground">{v.marca} {v.modelo}</TableCell>
                  <TableCell className="text-center">{v.ano}</TableCell>
                  <TableCell>{combustivelLabel[v.tipo_combustivel] ?? v.tipo_combustivel}</TableCell>
                  <TableCell className="text-right font-mono">{v.km_atual.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={v.ativo ? 'success' : 'secondary'}>{v.ativo ? 'Ativo' : 'Inativo'}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => { setVeiculoDetalhe(v); setDetailAberto(true) }}>
                          <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setVeiculoEditando(v); setFormAberto(true) }}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={async () => {
                          await updateVeiculo(v.id, { ativo: !v.ativo })
                          setVeiculos((prev) => prev.map((x) => x.id === v.id ? { ...x, ativo: !x.ativo } : x))
                          toast.success(v.ativo ? 'Veículo inativado' : 'Veículo ativado')
                        }}>
                          <Trash2 className="mr-2 h-4 w-4" /> {v.ativo ? 'Inativar' : 'Ativar'}
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

      <Dialog open={detailAberto} onOpenChange={setDetailAberto}>
        <DialogContent className="sm:max-w-2xl">
          {veiculoDetalhe && (
            <>
              <DialogHeader>
                <DialogTitle>{veiculoDetalhe.placa} — {veiculoDetalhe.marca} {veiculoDetalhe.modelo} {veiculoDetalhe.ano}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-center rounded-lg bg-muted h-40 md:h-full">
                  <Truck className="h-16 w-16 text-muted-foreground/40" />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div><span className="text-muted-foreground">Placa:</span><p className="font-medium">{veiculoDetalhe.placa}</p></div>
                    <div><span className="text-muted-foreground">Marca:</span><p className="font-medium">{veiculoDetalhe.marca}</p></div>
                    <div><span className="text-muted-foreground">Modelo:</span><p className="font-medium">{veiculoDetalhe.modelo}</p></div>
                    <div><span className="text-muted-foreground">Ano:</span><p className="font-medium">{veiculoDetalhe.ano}</p></div>
                    <div><span className="text-muted-foreground">Combustível:</span><p className="font-medium">{combustivelLabel[veiculoDetalhe.tipo_combustivel] ?? veiculoDetalhe.tipo_combustivel}</p></div>
                    <div><span className="text-muted-foreground">Capacidade:</span><p className="font-medium">{veiculoDetalhe.capacidade_tanque ?? '-'}L</p></div>
                    <div><span className="text-muted-foreground">KM Atual:</span><p className="font-medium font-mono">{veiculoDetalhe.km_atual.toLocaleString('pt-BR')} km</p></div>
                    <div><span className="text-muted-foreground">Status:</span><Badge variant={veiculoDetalhe.ativo ? 'success' : 'secondary'}>{veiculoDetalhe.ativo ? 'Ativo' : 'Inativo'}</Badge></div>
                  </div>
                  {veiculoDetalhe.observacoes && <p className="text-sm text-muted-foreground italic">Obs: {veiculoDetalhe.observacoes}</p>}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => { setDetailAberto(false); setVeiculoEditando(veiculoDetalhe); setFormAberto(true) }}>
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </Button>
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
