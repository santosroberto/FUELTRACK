import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Search, MapPin, Loader2 } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { useAuth } from '@/providers/auth-provider'
import { fetchPostos, createPosto, updatePosto, type PostoDB } from '@/lib/supabase/queries'
import { toast } from 'sonner'

function PostoForm({ posto, onClose, onSave }: {
  posto?: PostoDB
  onClose: () => void
  onSave: (data: Partial<PostoDB>) => Promise<void>
}) {
  const [nome, setNome] = useState(posto?.nome ?? '')
  const [endereco, setEndereco] = useState(posto?.endereco ?? '')
  const [cidade, setCidade] = useState(posto?.cidade ?? '')
  const [estado, setEstado] = useState(posto?.estado ?? '')
  const [contato, setContato] = useState(posto?.contato ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!nome.trim()) { toast.error('Nome do posto é obrigatório'); return }
    setSaving(true)
    try {
      await onSave({ nome: nome.trim(), endereco: endereco.trim() || null, cidade: cidade.trim() || null, estado: estado.trim().toUpperCase() || null, contato: contato.trim() || null })
      onClose()
    } catch { toast.error('Erro ao salvar posto') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome do Posto *</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do posto" />
        </div>
        <div className="space-y-2">
          <Label>Contato</Label>
          <Input value={contato} onChange={(e) => setContato(e.target.value)} placeholder="(11) 3333-0000" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Endereço</Label>
          <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, número" />
        </div>
        <div className="space-y-2">
          <Label>Cidade</Label>
          <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="São Paulo" />
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Input value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="SP" maxLength={2} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {posto ? 'Salvar Alterações' : 'Salvar Posto'}
        </Button>
      </DialogFooter>
    </div>
  )
}

export function Postos() {
  const { user } = useAuth()
  const [postos, setPostos] = useState<PostoDB[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [formAberto, setFormAberto] = useState(false)
  const [editPosto, setEditPosto] = useState<PostoDB | undefined>()

  useEffect(() => {
    if (!user) return
    fetchPostos(user.id).then(setPostos).catch(() => toast.error('Erro ao carregar postos'))
    .finally(() => setLoading(false))
  }, [user])

  async function handleSave(data: Partial<PostoDB>) {
    if (!user) return
    if (editPosto) {
      const updated = await updatePosto(editPosto.id, data)
      setPostos((prev) => prev.map((p) => p.id === editPosto.id ? updated : p))
      toast.success('Posto atualizado')
    } else {
      const created = await createPosto(user.id, data)
      setPostos((prev) => [created, ...prev])
      toast.success('Posto criado')
    }
  }

  const filtrados = postos.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.cidade ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.endereco ?? '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Postos</h1>
        <Dialog open={formAberto} onOpenChange={setFormAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditPosto(undefined); setFormAberto(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Novo Posto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editPosto ? 'Editar Posto' : 'Novo Posto'}</DialogTitle>
            </DialogHeader>
            <PostoForm posto={editPosto} onClose={() => setFormAberto(false)} onSave={handleSave} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar postos..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtrados.length === 0 ? (
        <EmptyState icon={<MapPin className="h-16 w-16" />} title="Nenhum posto encontrado" description="Cadastre postos para registrar abastecimentos." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead className="hidden sm:table-cell">Cidade</TableHead>
                <TableHead className="hidden md:table-cell">Contato</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{p.endereco}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{p.cidade}/{p.estado}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{p.contato}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => { setEditPosto(p); setFormAberto(true) }}>
                      <Pencil className="h-4 w-4" />
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
