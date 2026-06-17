import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { useAuth } from '@/providers/auth-provider'
import { fetchManutencoes, fetchVeiculos, createManutencao, updateManutencao, deleteManutencao, type ManutencaoDB, type VeiculoDB } from '@/lib/supabase/queries'
import { toast } from 'sonner'
import { Plus, Wrench, MoreHorizontal, Pencil, Trash2, Search, Calendar, Gauge, DollarSign, Building2, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const statusLabel: Record<string, string> = {
  agendado: 'Agendado', em_andamento: 'Em Andamento', concluido: 'Concluído', cancelado: 'Cancelado',
}

const statusVariant: Record<string, 'warning' | 'info' | 'success' | 'secondary'> = {
  agendado: 'warning', em_andamento: 'info', concluido: 'success', cancelado: 'secondary',
}

const tipoVariant: Record<string, 'outline' | 'secondary'> = {
  preventiva: 'outline', corretiva: 'secondary',
}

function ManutencaoForm({ manutencao, veiculos, onClose, onSave }: {
  manutencao?: ManutencaoDB
  veiculos: VeiculoDB[]
  onClose: () => void
  onSave: (data: Partial<ManutencaoDB>) => Promise<void>
}) {
  const [veiculoId, setVeiculoId] = useState(manutencao?.veiculo_id ?? '')
  const [tipo, setTipo] = useState(manutencao?.tipo ?? 'preventiva')
  const [descricao, setDescricao] = useState(manutencao?.descricao ?? '')
  const [dataAgendada, setDataAgendada] = useState(manutencao?.data_agendada ?? '')
  const [kmAtual, setKmAtual] = useState(manutencao?.km_atual?.toString() ?? '')
  const [valor, setValor] = useState(manutencao?.valor?.toString() ?? '')
  const [oficina, setOficina] = useState(manutencao?.oficina ?? '')
  const [kmProxima, setKmProxima] = useState(manutencao?.km_proxima?.toString() ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!veiculoId || !tipo) { toast.error('Preencha os campos obrigatórios'); return }
    setSaving(true)
    try {
      await onSave({
        veiculo_id: veiculoId, tipo, descricao: descricao.trim() || null,
        data_agendada: dataAgendada || null, km_atual: kmAtual ? parseInt(kmAtual) : null,
        km_proxima: kmProxima ? parseInt(kmProxima) : null, valor: valor ? parseFloat(valor) : null,
        oficina: oficina.trim() || null,
      })
      onClose()
    } catch { toast.error('Erro ao salvar manutenção') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Veículo *</Label>
        <Select value={veiculoId} onValueChange={setVeiculoId}>
          <SelectTrigger><SelectValue placeholder="Selecione o veículo..." /></SelectTrigger>
          <SelectContent>
            {veiculos.filter((v) => v.ativo).map((v) => (
              <SelectItem key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo *</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="preventiva">Preventiva</SelectItem>
              <SelectItem value="corretiva">Corretiva</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="data">Data Agendada</Label>
          <Input id="data" type="date" value={dataAgendada} onChange={(e) => setDataAgendada(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="km">KM Atual</Label>
          <Input id="km" type="number" value={kmAtual} onChange={(e) => setKmAtual(e.target.value)} placeholder="84230" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="valor">Valor (R$)</Label>
          <Input id="valor" type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="800,00" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva o serviço..." />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="oficina">Oficina</Label>
          <Input id="oficina" value={oficina} onChange={(e) => setOficina(e.target.value)} placeholder="Auto Mecânica Silva" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prox_km">Próxima Manutenção (km)</Label>
          <Input id="prox_km" type="number" value={kmProxima} onChange={(e) => setKmProxima(e.target.value)} placeholder="100000" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {manutencao ? 'Salvar Alterações' : 'Salvar Manutenção'}
        </Button>
      </DialogFooter>
    </div>
  )
}

export function Manutencoes() {
  const { user } = useAuth()
  const [manutencoes, setManutencoes] = useState<(ManutencaoDB & { veiculos?: { placa: string; modelo: string } | null })[]>([])
  const [veiculos, setVeiculos] = useState<VeiculoDB[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todas')
  const [formAberto, setFormAberto] = useState(false)
  const [editManutencao, setEditManutencao] = useState<ManutencaoDB | undefined>()

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([fetchManutencoes(user.id), fetchVeiculos(user.id)])
      .then(([m, v]) => { setManutencoes(m); setVeiculos(v) })
      .catch(() => toast.error('Erro ao carregar dados'))
      .finally(() => setLoading(false))
  }, [user])

  async function handleSave(data: Partial<ManutencaoDB>) {
    if (!user) return
    if (editManutencao) {
      const updated = await updateManutencao(editManutencao.id, data)
      setManutencoes((prev) => prev.map((m) => m.id === editManutencao.id ? { ...updated, veiculos: m.veiculos } : m))
      toast.success('Manutenção atualizada')
    } else {
      const created = await createManutencao(user.id, data) as ManutencaoDB & { veiculos?: { placa: string; modelo: string } | null }
      const veiculo = veiculos.find((v) => v.id === data.veiculo_id)
      created.veiculos = veiculo ? { placa: veiculo.placa, modelo: veiculo.modelo } : null
      setManutencoes((prev) => [created, ...prev])
      toast.success('Manutenção registrada')
    }
  }

  async function handleDelete(id: string) {
    await deleteManutencao(id)
    setManutencoes((prev) => prev.filter((m) => m.id !== id))
    toast.success('Manutenção removida')
  }

  const agendadas = manutencoes.filter((m) => m.status === 'agendado')
  const emAndamento = manutencoes.filter((m) => m.status === 'em_andamento')
  const custoTotal = manutencoes.filter((m) => m.status !== 'cancelado').reduce((a, m) => a + (m.valor ?? 0), 0)

  const filtrados = manutencoes.filter((m) => {
    const placa = m.veiculos?.placa ?? ''
    const matchSearch = placa.toLowerCase().includes(search.toLowerCase()) ||
      (m.descricao ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (m.oficina ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = filtroStatus === 'todas' || m.status === filtroStatus
    return matchSearch && matchStatus
  })

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Manutenções</h1>
        <Dialog open={formAberto} onOpenChange={setFormAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditManutencao(undefined); setFormAberto(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Nova Manutenção
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editManutencao ? 'Editar Manutenção' : 'Nova Manutenção'}</DialogTitle>
              <DialogDescription>Registre uma manutenção para o veículo</DialogDescription>
            </DialogHeader>
            <ManutencaoForm manutencao={editManutencao} veiculos={veiculos} onClose={() => setFormAberto(false)} onSave={handleSave} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Custo Total (mês)</p>
          <p className="mt-1 text-2xl font-bold font-mono">{formatCurrency(custoTotal)}</p>
        </CardContent></Card>
        <Card className="border-amber-200 dark:border-amber-800"><CardContent className="p-4">
          <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-amber-500" /><p className="text-sm text-muted-foreground">Agendadas</p></div>
          <p className="mt-1 text-2xl font-bold">{agendadas.length}</p>
        </CardContent></Card>
        <Card className="border-blue-200 dark:border-blue-800"><CardContent className="p-4">
          <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-blue-500" /><p className="text-sm text-muted-foreground">Em Andamento</p></div>
          <p className="mt-1 text-2xl font-bold">{emAndamento.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Total de Registros</p>
          <p className="mt-1 text-2xl font-bold">{manutencoes.length}</p>
        </CardContent></Card>
      </div>

      {agendadas.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-500" /> Próximas manutenções agendadas
            </h3>
            <div className="space-y-2">
              {agendadas.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{m.data_agendada ? new Date(m.data_agendada).toLocaleDateString('pt-BR') : '-'}</span>
                    <span className="font-medium">{m.veiculos?.placa ?? '-'}</span>
                    <span className="text-muted-foreground truncate max-w-[300px]">— {m.descricao}</span>
                  </div>
                  <span className="font-mono font-medium">{m.valor ? formatCurrency(m.valor) : '-'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por placa, descrição..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="agendado">Agendadas</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluídas</SelectItem>
            <SelectItem value="cancelado">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState icon={<Wrench className="h-16 w-16" />} title="Nenhuma manutenção encontrada" description="Registre a primeira manutenção da sua frota."
          action={<Button onClick={() => { setEditManutencao(undefined); setFormAberto(true) }}>Nova Manutenção</Button>} />
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
                      <p className="font-medium">{m.veiculos?.placa ?? '-'}</p>
                      <p className="text-xs text-muted-foreground">{m.veiculos?.modelo ?? ''}</p>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={tipoVariant[m.tipo] ?? 'outline'}>{m.tipo === 'preventiva' ? 'Preventiva' : 'Corretiva'}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{m.data_agendada ? new Date(m.data_agendada).toLocaleDateString('pt-BR') : '-'}</TableCell>
                  <TableCell className="max-w-[250px] truncate">{m.descricao}</TableCell>
                  <TableCell className="text-right font-mono">{m.km_atual?.toLocaleString('pt-BR') ?? '-'}</TableCell>
                  <TableCell className="text-right font-mono">{m.valor ? formatCurrency(m.valor) : '-'}</TableCell>
                  <TableCell className="max-w-[120px] truncate">{m.oficina}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusVariant[m.status] ?? 'secondary'}>{statusLabel[m.status] ?? m.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => { setEditManutencao(m); setFormAberto(true) }}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        {m.status === 'agendado' && (
                          <DropdownMenuItem onClick={async () => {
                            await updateManutencao(m.id, { status: 'concluido' })
                            setManutencoes((prev) => prev.map((x) => x.id === m.id ? { ...x, status: 'concluido' } : x))
                            toast.success('Manutenção concluída')
                          }}>
                            Concluir
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(m.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Remover
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
