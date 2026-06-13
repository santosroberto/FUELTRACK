import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { BarChart3, FileText, Download, Calendar } from 'lucide-react'

const relatorios = [
  { id: 'consumo', titulo: 'Relatório de Consumo', desc: 'Consumo médio por veículo no período', icone: BarChart3 },
  { id: 'gastos', titulo: 'Relatório de Gastos', desc: 'Gastos detalhados por categoria', icone: FileText },
  { id: 'manutencao', titulo: 'Relatório de Manutenções', desc: 'Manutenções realizadas e programadas', icone: FileText },
  { id: 'alertas', titulo: 'Relatório de Alertas', desc: 'Alertas gerados no período', icone: FileText },
]

export function Relatorios() {
  const [periodo, setPeriodo] = useState('mes')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Relatórios</h1>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Este mês</SelectItem>
              <SelectItem value="trimestre">Último trimestre</SelectItem>
              <SelectItem value="ano">Último ano</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatorios.map((r) => {
          const Icon = r.icone
          return (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <Icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base">{r.titulo}</CardTitle>
                <CardDescription>{r.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full gap-2">
                  <Download className="h-4 w-4" /> Exportar
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exportação em massa</CardTitle>
          <CardDescription>Exporte todos os dados do sistema</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" disabled>Exportar como PDF</Button>
          <Button variant="outline" disabled>Exportar como CSV</Button>
          <Button variant="outline" disabled>Exportar como Excel</Button>
        </CardContent>
      </Card>
    </div>
  )
}
