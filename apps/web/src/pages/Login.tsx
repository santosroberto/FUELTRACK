import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setIsLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-7/12 flex-col items-center justify-center bg-gradient-to-br from-fuel-600 to-fuel-900 p-12 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold">FuelTrack</h1>
          <p className="mt-4 text-lg text-fuel-200">
            Controle sua frota com inteligência
          </p>
          <div className="mt-12 rounded-xl bg-white/10 p-8 backdrop-blur-sm">
            <p className="text-fuel-100 leading-relaxed">
              &ldquo;Reduzimos em 23% os gastos com combustível nos primeiros
              3 meses usando o FuelTrack.&rdquo;
            </p>
            <p className="mt-4 font-semibold">— João Silva, Gestor de Frota</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold">Entrar</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesse sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  to="/recuperar-senha"
                  className="text-xs text-primary hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              ou
            </span>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
          >
            Entrar com Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-primary font-medium hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
