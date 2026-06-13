import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/providers/auth-provider'
import { useTheme } from '@/providers/theme-provider'
import { Bell, Moon, Sun, User, Building2, CreditCard } from 'lucide-react'

export function Configuracoes() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [notificacoes, setNotificacoes] = useState({
    email: true,
    abastecimentos: true,
    manutencoes: true,
    alertas: true,
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-4xl font-bold">Configurações</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Perfil</CardTitle>
          </div>
          <CardDescription>Suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={user?.user_metadata?.full_name ?? ''} readOnly />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={user?.email ?? ''} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Empresa</CardTitle>
          </div>
          <CardDescription>Dados da sua transportadora</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Input value={user?.user_metadata?.empresa ?? ''} readOnly />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input value={user?.user_metadata?.cnpj ?? ''} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {theme === 'light' ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
            <CardTitle className="text-lg">Aparência</CardTitle>
          </div>
          <CardDescription>Personalize o tema do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="gap-2"
            >
              <Sun className="h-4 w-4" /> Claro
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="gap-2"
            >
              <Moon className="h-4 w-4" /> Escuro
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Notificações</CardTitle>
          </div>
          <CardDescription>Configure quais notificações receber</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'abastecimentos', label: 'Abastecimentos suspeitos' },
            { key: 'manutencoes', label: 'Manutenções programadas' },
            { key: 'alertas', label: 'Alertas do sistema' },
            { key: 'email', label: 'Receber e-mails' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm">{item.label}</span>
              <Select
                value={String(notificacoes[item.key as keyof typeof notificacoes])}
                onValueChange={(v) => setNotificacoes((prev) => ({ ...prev, [item.key]: v === 'true' }))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativado</SelectItem>
                  <SelectItem value="false">Desativado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Plano</CardTitle>
          </div>
          <CardDescription>Informações do seu plano atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Plano Gratuito</p>
              <p className="text-sm text-muted-foreground">Até 5 veículos • 1 usuário</p>
            </div>
            <Button variant="outline" disabled>Gerenciar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
