import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Search, Trash2, Phone, Mail, UserCheck } from 'lucide-react'
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
import { useAuth } from '@/providers/auth-provider'

interface Motorista {
  id: string
  nome: string
  email: string
  telefone: string
  cpf: string
  vinculo: 'ativo' | 'afastado' | 'desligado'
  data_contratacao: string
}

const mockMotoristas: Motorista[] = [
  { id: '1', nome: 'Carlos Silva', email: 'carlos@transportadora.com', telefone: '(11) 98888-1111', cpf: '111.222.333-44', vinculo: 'ativo', data_contratacao: '10/01/2024' },
  { id: '2', nome: 'Ana Oliveira', email: 'ana@transportadora.com', telefone: '(11) 98888-2222', cpf: '222.333.444-55', vinculo: 'ativo', data_contratacao: '15/03/2024' },
  { id: '3', nome: 'Pedro Santos', email: 'pedro@transportadora.com', telefone: '(11) 98888-3333', cpf: '333.444.555-66', vinculo: 'afastado', data_contratacao: '20/06/2023' },
  { id: '4', nome: 'Maria Souza', email: 'maria@transportadora.com', telefone: '(11) 98888-4444', cpf: '444.555.666-77', vinculo: 'ativo', data_contratacao: '02/02/2024' },
]

const vinculoVariante: Record<string, 'confirmado' | 'suspeito' | 'pendente' | 'rejeitado'> = {
  ativo: 'confirmado',
  afastado: 'pendente',
  desligado: 'rejeitado',
}

const vinculoLabel: Record<string, string> = {
  ativo: 'Ativo',
  afastado: 'Afastado',
  desligado: 'Desligado',
}

function MotoristaForm({ motorista, onClose }: { motorista?: Motorista; onClose: () => void }) {
  const [nome, setNome] = useState(motorista?.nome ?? '')
  const [email, setEmail] = useState(motorista?.email ?? '')
  const [telefone, setTelefone] = useState(motorista?.telefone ?? '')
  const [cpf, setCpf] = useState(motorista?.cpf ?? '')
  const [vinculo, setVinculo] = useState(motorista?.vinculo ?? 'ativo')

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
          <Select value={vinculo} onValueChange={(v: 'ativo' | 'afastado' | 'desligado') => setVinculo(v)}>
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
        <Button onClick={onClose}>Salvar</Button>
      </DialogFooter>
    </div>
  )
}

export function Motoristas() {
  const [search, setSearch] = useState('')
  const [formAberto, setFormAberto] = useState(false)
  const [editMotorista, setEditMotorista] = useState<Motorista | undefined>()

  const filtrados = mockMotoristas.filter((m) =>
    m.nome.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.cpf.includes(search)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Motoristas</h1>
        <Dialog open={formAberto} onOpenChange={setFormAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditMotorista(undefined); setFormAberto(true) }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Motorista
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editMotorista ? 'Editar Motorista' : 'Novo Motorista'}</DialogTitle>
            </DialogHeader>
            <MotoristaForm motorista={editMotorista} onClose={() => setFormAberto(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar motoristas..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          icon={<UserCheck className="h-16 w-16" />}
          title="Nenhum motorista encontrado"
          description="Cadastre motoristas para começar a acompanhar."
        />
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
                    <BadgeStatus status={vinculoVariante[m.vinculo]} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => { setEditMotorista(m); setFormAberto(true) }}
                    >
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
