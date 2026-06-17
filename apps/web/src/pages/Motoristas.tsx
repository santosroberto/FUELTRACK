import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Search, Trash2, UserCheck, Loader2 } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { BadgeStatus } from '@/components/shared/badge-status'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { useAuth } from '@/providers/auth-provider'
import { fetchMotoristas, createMotorista, updateMotorista, deleteMotorista, type MotoristaDB } from '@/lib/supabase/queries'
import { toast } from 'sonner'

const vinculoVariante: Record<string, 'confirmado' | 'suspeito' | 'pendente' | 'rejeitado'> = {
  ativo: 'confirmado',
  afastado: 'pendente',
  desligado: 'rejeitado',
}

function MotoristaForm({ motorista, onClose, onSave }: {
  motorista?: MotoristaDB
  onClose: () => void
  onSave: (data: Partial<MotoristaDB>) => Promise<void>
}) {
  const [nome, setNome] = useState(motorista?.nome ?? '')
  const [email, setEmail] = useState(motorista?.email ?? '')
  const [telefone, setTelefone] = useState(motorista?.telefone ?? '')
  const [cpf, setCpf] = useState(motorista?.cpf ?? '')
  const [vinculo, setVinculo] = useState(motorista?.vinculo ?? 'ativo')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!nome.trim()) { toast.error('Nome é obrigatório'); return }
    setSaving(true)
    try {
      await onSave({ nome: nome.trim(), email: email.trim() || null, telefone: telefone.trim() || null, cpf: cpf.trim() || null, vinculo })
      onClose()
    } catch { toast.error('Erro ao salvar motorista') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome *</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
        </div>
        <div className="space-y-2">
          <Label>E-mail</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
        </div>
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" />
        </div>
        <div className="space-y-2">
          <Label>CPF</Label>
          <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
        </div>
        <div className="space-y-2">
          <Label>Vínculo</Label>
          <Select value={vinculo} onValueChange={setVinculo}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="afastado">Afastado</SelectItem>
              <SelectItem value="desligado">Desligado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </DialogFooter>
    </div>
  )
}

export function Motoristas() {
  const { user } = useAuth()
  const [motoristas, setMotoristas] = useState<MotoristaDB[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formAberto, setFormAberto] = useState(false)
  const [editMotorista, setEditMotorista] = useState<MotoristaDB | undefined>()

  useEffect(() => {
    if (!user) return
    fetchMotoristas(user.id).then(setMotoristas).catch(() => toast.error('Erro ao carregar motoristas'))
    .finally(() => setLoading(false))
  }, [user])

  async function handleSave(data: Partial<MotoristaDB>) {
    if (!user) return
    if (editMotorista) {
      const updated = await updateMotorista(editMotorista.id, data)
      setMotoristas((prev) => prev.map((m) => m.id === editMotorista.id ? updated : m))
      toast.success('Motorista atualizado')
    } else {
      const created = await createMotorista(user.id, data)
      setMotoristas((prev) => [created, ...prev])
      toast.success('Motorista cadastrado')
    }
  }

  async function handleDelete(id: string) {
    await deleteMotorista(id)
    setMotoristas((prev) => prev.filter((m) => m.id !== id))
    toast.success('Motorista removido')
  }

  const filtrados = motoristas.filter((m) =>
    m.nome.toLowerCase().includes(search.toLowerCase()) ||
    (m.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (m.cpf ?? '').includes(search)
  )

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Motoristas</h1>
        <Dialog open={formAberto} onOpenChange={setFormAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditMotorista(undefined); setFormAberto(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Novo Motorista
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editMotorista ? 'Editar Motorista' : 'Novo Motorista'}</DialogTitle>
            </DialogHeader>
            <MotoristaForm motorista={editMotorista} onClose={() => setFormAberto(false)} onSave={handleSave} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar motoristas..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtrados.length === 0 ? (
        <EmptyState icon={<UserCheck className="h-16 w-16" />} title="Nenhum motorista encontrado" description="Cadastre motoristas para começar a acompanhar." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">E-mail</TableHead>
                <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                <TableHead>Vínculo</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.nome}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{m.email}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{m.telefone}</TableCell>
                  <TableCell>
                    <BadgeStatus status={vinculoVariante[m.vinculo] ?? 'pendente'} />
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditMotorista(m); setFormAberto(true) }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
