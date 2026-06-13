import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, AlertCircle, Info, Skull, Search, Eye, EyeOff, Trash2 } from 'lucide-react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/shared/empty-state'

interface Alerta {
  id: string
  titulo: string
  mensagem: string
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  lido: boolean
  data: string
}

const mockAlertas: Alerta[] = [
  { id: '1', titulo: 'Abastecimento suspeito', mensagem: 'Consumo anômalo detectado no veículo ABC-1234 (7,3 km/L → 4,2 km/L)', severidade: 'alta', lido: false, data: '12/06/2026 14:30' },
  { id: '2', titulo: 'Fora do perímetro autorizado', mensagem: 'Abastecimento realizado fora da área autorizada - XYZ-5678', severidade: 'critica', lido: false, data: '12/06/2026 08:15' },
  { id: '3', titulo: 'Manutenção programada', mensagem: 'VW Constellation (ABC-1234) tem revisão programada para 20/06/2026', severidade: 'baixa', lido: false, data: '11/06/2026 10:00' },
  { id: '4', titulo: 'Limite de gastos excedido', mensagem: 'Frota excedeu 90% do orçamento mensal de combustível', severidade: 'media', lido: true, data: '10/06/2026 09:00' },
  { id: '5', titulo: 'Motorista inativo', mensagem: 'Pedro Santos não realiza abastecimentos há 15 dias', severidade: 'baixa', lido: true, data: '08/06/2026 16:00' },
]

const severidadeIcon = {
  critica: Skull,
  alta: AlertTriangle,
  media: AlertCircle,
  baixa: Info,
}

const severidadeCor = {
  critica: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
  alta: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700',
  media: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
  baixa: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
}

export function Alertas() {
  const [search, setSearch] = useState('')
  const [filtroSeveridade, setFiltroSeveridade] = useState('todas')
  const [alertas, setAlertas] = useState(mockAlertas)

  function toggleLido(id: string) {
    setAlertas((prev) => prev.map((a) => a.id === id ? { ...a, lido: !a.lido } : a))
  }

  function dismiss(id: string) {
    setAlertas((prev) => prev.filter((a) => a.id !== id))
  }

  const filtrados = alertas.filter((a) => {
    const matchSearch = a.titulo.toLowerCase().includes(search.toLowerCase()) || a.mensagem.toLowerCase().includes(search.toLowerCase())
    const matchSeveridade = filtroSeveridade === 'todas' || a.severidade === filtroSeveridade
    return matchSearch && matchSeveridade
  })

  const naoLidos = alertas.filter((a) => !a.lido).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Alertas</h1>
          {naoLidos > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{naoLidos} não lido{naoLidos > 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar alertas..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filtroSeveridade} onValueChange={setFiltroSeveridade}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="critica">Crítica</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState icon={<AlertCircle className="h-16 w-16" />} title="Nenhum alerta" description="Você não tem alertas no momento." />
      ) : (
        <div className="space-y-2">
          {filtrados.map((a) => {
            const Icon = severidadeIcon[a.severidade]
            return (
              <div
                key={a.id}
                className={cn(
                  'rounded-lg border p-4 transition-colors',
                  a.lido ? 'bg-card opacity-70' : 'bg-card border-l-4'
                )}
                style={!a.lido ? { borderLeftColor: 'hsl(var(--primary))' } : undefined}
              >
                <div className="flex items-start gap-3">
                  <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', a.lido && 'text-muted-foreground')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={cn('font-medium', a.lido && 'text-muted-foreground')}>{a.titulo}</h3>
                      <Badge variant="outline" className={cn('text-xs', severidadeCor[a.severidade])}>
                        {a.severidade}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{a.mensagem}</p>
                    <p className="text-xs text-muted-foreground mt-1">{a.data}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => toggleLido(a.id)} title={a.lido ? 'Marcar não lido' : 'Marcar lido'}>
                      {a.lido ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => dismiss(a.id)} title="Remover">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
