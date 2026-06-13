import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { AuthProvider } from '@/providers/auth-provider'
import { Toaster } from 'sonner'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Login } from '@/pages/Login'
import { Cadastro } from '@/pages/Cadastro'
import { RecuperarSenha } from '@/pages/RecuperarSenha'
import { NotFound } from '@/pages/NotFound'
import { Loader2 } from 'lucide-react'

const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Abastecimentos = lazy(() => import('@/pages/Abastecimentos').then(m => ({ default: m.Abastecimentos })))
const Veiculos = lazy(() => import('@/pages/Veiculos').then(m => ({ default: m.Veiculos })))
const Motoristas = lazy(() => import('@/pages/Motoristas').then(m => ({ default: m.Motoristas })))
const Postos = lazy(() => import('@/pages/Postos').then(m => ({ default: m.Postos })))
const Despesas = lazy(() => import('@/pages/Despesas').then(m => ({ default: m.Despesas })))
const Manutencoes = lazy(() => import('@/pages/Manutencoes').then(m => ({ default: m.Manutencoes })))
const Relatorios = lazy(() => import('@/pages/Relatorios').then(m => ({ default: m.Relatorios })))
const Alertas = lazy(() => import('@/pages/Alertas').then(m => ({ default: m.Alertas })))
const Configuracoes = lazy(() => import('@/pages/Configuracoes').then(m => ({ default: m.Configuracoes })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="fuel-track-theme">
      <AuthProvider>
        <QueryProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/recuperar-senha" element={<RecuperarSenha />} />
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Dashboard /></Suspense></ProtectedRoute>} />
                <Route path="/abastecimentos" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Abastecimentos /></Suspense></ProtectedRoute>} />
                <Route path="/veiculos" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Veiculos /></Suspense></ProtectedRoute>} />
                <Route path="/motoristas" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Motoristas /></Suspense></ProtectedRoute>} />
                <Route path="/postos" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Postos /></Suspense></ProtectedRoute>} />
                <Route path="/despesas" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Despesas /></Suspense></ProtectedRoute>} />
                <Route path="/manutencoes" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Manutencoes /></Suspense></ProtectedRoute>} />
                <Route path="/relatorios" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Relatorios /></Suspense></ProtectedRoute>} />
                <Route path="/alertas" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Alertas /></Suspense></ProtectedRoute>} />
                <Route path="/configuracoes" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Configuracoes /></Suspense></ProtectedRoute>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster richColors closeButton position="top-right" />
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
