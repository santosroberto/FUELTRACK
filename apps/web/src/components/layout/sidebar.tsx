import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import {
  BarChart3,
  Fuel,
  Truck,
  Users,
  MapPin,
  FileText,
  Bell,
  Settings,
  ChevronLeft,
  CreditCard,
  Menu,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/abastecimentos', label: 'Abastecimentos', icon: Fuel },
  { href: '/veiculos', label: 'Veículos', icon: Truck },
  { href: '/motoristas', label: 'Motoristas', icon: Users },
  { href: '/postos', label: 'Postos', icon: MapPin },
  { href: '/despesas', label: 'Despesas', icon: CreditCard },
  { href: '/manutencoes', label: 'Manutenções', icon: Wrench },
  { href: '/relatorios', label: 'Relatórios', icon: FileText },
  { href: '/alertas', label: 'Alertas', icon: Bell },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()

  return (
    <nav className="flex-1 space-y-1 p-3">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function UserInfo() {
  const { user } = useAuth()
  return (
    <div className="border-t p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
          {user?.email?.charAt(0).toUpperCase() ?? 'U'}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">{user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Usuário'}</p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.email ?? 'usuario@email.com'}
          </p>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r bg-card transition-all duration-300',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <Link to="/dashboard" className="text-xl font-bold text-fuel-600">
              FuelTrack
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground"
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                collapsed && 'rotate-180'
              )}
            />
          </Button>
        </div>

        <NavList />

        {!collapsed && <UserInfo />}
      </aside>

      {/* Mobile sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <SheetHeader className="border-b px-4 h-16 flex-row items-center justify-center">
            <SheetTitle className="text-xl font-bold text-fuel-600">FuelTrack</SheetTitle>
          </SheetHeader>
          <NavList onNavigate={() => document.body.click()} />
          <UserInfo />
        </SheetContent>
      </Sheet>
    </>
  )
}
