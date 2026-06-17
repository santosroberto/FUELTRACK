import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Step = 1 | 2 | 3

const step1Schema = z.object({
  empresa: z.string().min(2, 'Nome da empresa é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
})

const step2Schema = z.object({
  nome: z.string().min(3, 'Nome completo é obrigatório'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Mínimo de 6 caracteres'),
  confirmarSenha: z.string(),
}).refine((d) => d.senha === d.confirmarSenha, {
  message: 'Senhas não conferem',
  path: ['confirmarSenha'],
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

export function Cadastro() {
  const [step, setStep] = useState<Step>(1)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [frotaRange, setFrotaRange] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  })

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  })

  function handleStep1(data: Step1Data) {
    setStep1Data(data)
    setStep(2)
  }

  async function handleStep2(data: Step2Data) {
    setIsLoading(true)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.senha,
      options: {
        data: {
          full_name: data.nome,
          empresa: step1Data?.empresa ?? '',
          cnpj: step1Data?.cnpj ?? '',
          telefone: step1Data?.telefone ?? '',
          frota_range: frotaRange,
        },
      },
    })
    setIsLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Conta criada com sucesso!')
    setStep(3)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-fuel-600">FuelTrack</Link>
          <p className="text-sm text-muted-foreground">Crie sua conta</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  step > s
                    ? 'bg-primary text-primary-foreground'
                    : step === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              <span
                className={cn(
                  'text-sm hidden sm:inline',
                  step === s ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {s === 1 ? 'Empresa' : s === 2 ? 'Seus Dados' : 'Convites'}
              </span>
              {s < 3 && (
                <div
                  className={cn(
                    'h-px w-8 sm:w-16',
                    step > s ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={step1Form.handleSubmit(handleStep1)} className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Dados da Empresa</h2>
            <p className="text-sm text-muted-foreground">Informe os dados da sua frota</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresa">Nome da Empresa *</Label>
                <Input id="empresa" {...step1Form.register('empresa')} placeholder="Transportadora ABC Ltda" />
                {step1Form.formState.errors.empresa && (
                  <p className="text-xs text-destructive">{step1Form.formState.errors.empresa.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input id="cnpj" {...step1Form.register('cnpj')} placeholder="00.000.000/0001-00" />
                {step1Form.formState.errors.cnpj && (
                  <p className="text-xs text-destructive">{step1Form.formState.errors.cnpj.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input id="telefone" {...step1Form.register('telefone')} placeholder="(11) 99999-9999" />
                {step1Form.formState.errors.telefone && (
                  <p className="text-xs text-destructive">{step1Form.formState.errors.telefone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Segmento</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Selecione...</option>
                  <option value="transportes">Transportes</option>
                  <option value="agronegocio">Agronegócio</option>
                  <option value="construcao">Construção</option>
                  <option value="mobilidade">Mobilidade</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quantos veículos sua frota possui?</Label>
              <div className="flex flex-wrap gap-2">
                {['1-10', '11-50', '51-200', '200+'].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setFrotaRange(range)}
                    className={cn(
                      'rounded-md border px-4 py-2 text-sm transition-colors',
                      frotaRange === range ? 'border-primary bg-primary/10 text-primary' : 'border-input hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit">
                Próxima Etapa
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={step2Form.handleSubmit(handleStep2)} className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Seus Dados</h2>
            <p className="text-sm text-muted-foreground">Crie seu usuário administrador</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input id="nome" {...step2Form.register('nome')} placeholder="Seu nome" />
                {step2Form.formState.errors.nome && (
                  <p className="text-xs text-destructive">{step2Form.formState.errors.nome.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input id="email" type="email" {...step2Form.register('email')} placeholder="seu@email.com" />
                {step2Form.formState.errors.email && (
                  <p className="text-xs text-destructive">{step2Form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <Input id="senha" type="password" {...step2Form.register('senha')} placeholder="••••••••" />
                {step2Form.formState.errors.senha && (
                  <p className="text-xs text-destructive">{step2Form.formState.errors.senha.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar senha *</Label>
                <Input id="confirmarSenha" type="password" {...step2Form.register('confirmarSenha')} placeholder="••••••••" />
                {step2Form.formState.errors.confirmarSenha && (
                  <p className="text-xs text-destructive">{step2Form.formState.errors.confirmarSenha.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Conta
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Conta criada!</h2>
            <p className="text-sm text-muted-foreground">Sua conta foi criada com sucesso.</p>

            <Button asChild className="w-full">
              <Link to="/dashboard">Ir para o Dashboard</Link>
            </Button>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">Fazer login</Link>
        </p>
      </div>
    </div>
  )
}
