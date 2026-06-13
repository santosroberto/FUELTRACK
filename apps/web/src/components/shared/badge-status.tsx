import { cn } from '@/lib/utils'

type AbastecimentoStatus = 'confirmado' | 'pendente' | 'suspeito' | 'rejeitado'

interface BadgeStatusProps {
  status: AbastecimentoStatus
  className?: string
}

const statusConfig: Record<AbastecimentoStatus, { label: string; dotClass: string; badgeClass: string }> = {
  confirmado: {
    label: 'Confirmado',
    dotClass: 'bg-green-500',
    badgeClass: 'border-green-300 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  pendente: {
    label: 'Pendente',
    dotClass: 'bg-yellow-500',
    badgeClass: 'border-yellow-300 bg-yellow-100 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  suspeito: {
    label: 'Suspeito',
    dotClass: 'bg-red-500',
    badgeClass: 'border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  rejeitado: {
    label: 'Rejeitado',
    dotClass: 'bg-gray-400',
    badgeClass: 'border-gray-300 bg-gray-100 text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
}

export function BadgeStatus({ status, className }: BadgeStatusProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.badgeClass,
        className
      )}
    >
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  )
}
