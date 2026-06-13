# FuelTrack — Design System

> Base: Tailwind CSS v4 + shadcn/ui
> Pacotes: `tailwindcss-animate`, `class-variance-authority`, `lucide-react`, `recharts`

---

## 1. Paleta de Cores

### 1.1 Cores Base (shadcn/ui)

Definidas como variáveis CSS no formato HSL (hue saturation lightness) para suporte a tema claro/escuro.

```css
/* ─── TEMA CLARO ─── */
:root {
  --background:        210 40% 98%;   /* gray-50   */
  --foreground:        222 84% 5%;    /* gray-950  */
  --card:              0 0% 100%;     /* white     */
  --card-foreground:   222 84% 5%;    /* gray-950  */
  --popover:           0 0% 100%;     /* white     */
  --popover-foreground:222 84% 5%;    /* gray-950  */
  --primary:           221 83% 53%;   /* blue-600  → #2563eb */
  --primary-foreground:210 40% 98%;  /* gray-50   */
  --secondary:         160 84% 39%;   /* emerald-600 → #059669 */
  --secondary-foreground:0 0% 100%;  /* white     */
  --muted:             210 40% 96%;   /* gray-100  */
  --muted-foreground:  215 16% 47%;   /* gray-500  */
  --accent:            38 92% 50%;    /* amber-500 → #f59e0b */
  --accent-foreground: 0 0% 100%;     /* white     */
  --destructive:       0 84% 60%;     /* red-500   → #ef4444 */
  --destructive-foreground:210 40% 98%;
  --success:           142 71% 45%;   /* green-500 → #22c55e */
  --warning:           45 93% 47%;    /* amber-500 → #eab308 */
  --info:              199 89% 48%;   /* cyan-500  → #06b6d4 */
  --border:            214 32% 91%;   /* gray-200  */
  --input:             214 32% 91%;   /* gray-200  */
  --ring:              221 83% 53%;   /* blue-600  */
  --radius:            0.5rem;
}

/* ─── TEMA ESCURO ─── */
.dark {
  --background:        222 84% 5%;    /* gray-950  */
  --foreground:        210 40% 98%;   /* gray-50   */
  --card:              222 84% 7%;    /* gray-900  */
  --card-foreground:   210 40% 98%;   /* gray-50   */
  --popover:           222 84% 7%;    /* gray-900  */
  --popover-foreground:210 40% 98%;   /* gray-50   */
  --primary:           217 91% 60%;   /* blue-400  */
  --primary-foreground:222 84% 5%;    /* gray-950  */
  --secondary:         161 94% 30%;   /* emerald-700 */
  --secondary-foreground:0 0% 100%;
  --muted:             223 47% 11%;   /* gray-800  */
  --muted-foreground:  215 20% 65%;   /* gray-400  */
  --accent:            38 92% 50%;    /* amber-500 */
  --accent-foreground: 0 0% 100%;
  --destructive:       0 63% 31%;     /* red-900   */
  --destructive-foreground:210 40% 98%;
  --border:            217 33% 17%;   /* gray-800  */
  --input:             217 33% 17%;   /* gray-800  */
  --ring:              224 76% 48%;   /* blue-700  */
}
```

### 1.2 Paleta Semântica (FuelTrack)

Usada em badges, indicadores e gráficos — NÃO fazer parte do tema shadcn, mas sim como classes utilitárias Tailwind extras.

```ts
// tailwind.config.ts → theme.extend.colors
fuel: {
  50:  '#eff6ff',    // azul claríssimo
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',    // primary blue
  600: '#2563eb',    // primary
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
},
```

| Token | Light | Dark | Uso |
|---|---|---|---|
| `fuel-50` | `#eff6ff` | — | Backgrounds de seção |
| `fuel-500` | `#3b82f6` | `#60a5fa` | Ícones, links, bordas focadas |
| `fuel-600` | `#2563eb` | `#3b82f6` | Botões primary, headers |
| `fuel-700` | `#1d4ed8` | `#2563eb` | Hover de botões |

### 1.3 Cores de Status (Badges)

| Status | Light | Dark | Ícone |
|---|---|---|---|
| **confirmado** | `bg-green-100 text-green-800 border-green-300` | `bg-green-900/30 text-green-400 border-green-700` | `🟢` |
| **pendente** | `bg-yellow-100 text-yellow-800 border-yellow-300` | `bg-yellow-900/30 text-yellow-400 border-yellow-700` | `🟡` |
| **suspeito** | `bg-red-100 text-red-800 border-red-300` | `bg-red-900/30 text-red-400 border-red-700` | `🔴` |
| **rejeitado** | `bg-gray-100 text-gray-600 border-gray-300` | `bg-gray-800 text-gray-400 border-gray-600` | `⚫` |

```tsx
// Componente <BadgeStatus>
const variantMap = {
  confirmado: 'success',
  pendente:   'warning',
  suspeito:   'destructive',
  rejeitado:  'secondary',
} as const;
```

### 1.4 Cores de Combustível (Gráficos)

| Combustível | Cor |
|---|---|
| Diesel S10 | `#2563eb` (blue-600) |
| Diesel S500 | `#1d4ed8` (blue-700) |
| Gasolina Comum | `#f59e0b` (amber-500) |
| Gasolina Aditivada | `#d97706` (amber-600) |
| Etanol | `#10b981` (emerald-500) |
| GNV | `#06b6d4` (cyan-500) |
| Elétrico | `#8b5cf6` (violet-500) |

---

## 2. Tipografia

### 2.1 Font Family

```ts
// tailwind.config.ts
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
}
```

| Uso | Font | Weight |
|---|---|---|
| Body, labels, botões | Inter | 400 (regular), 500 (medium), 600 (semibold) |
| Headings | Inter | 600 (semibold), 700 (bold) |
| Dados tabulares (KM, litros, valores) | JetBrains Mono | 400, 500 |

**Decisão**: Inter tem suporte nativo a `font-numeric` para alinhamento tabular de números. JetBrains Mono garante que valores financeiros fiquem alinhados verticalmente em tabelas.

### 2.2 Type Scale

```ts
// tailwind.config.ts → theme.extend.fontSize
fontSize: {
  'xs':   ['0.75rem',  { lineHeight: '1rem'    }],  // labels auxiliares
  'sm':   ['0.875rem', { lineHeight: '1.25rem'  }],  // body small, tabelas
  'base': ['1rem',     { lineHeight: '1.5rem'   }],  // body
  'lg':   ['1.125rem', { lineHeight: '1.75rem'  }],  // subtítulo
  'xl':   ['1.25rem',  { lineHeight: '1.75rem'  }],  // card title
  '2xl':  ['1.5rem',   { lineHeight: '2rem'     }],  // page heading
  '3xl':  ['1.875rem', { lineHeight: '2.25rem'  }],  // section heading
  '4xl':  ['2.25rem',  { lineHeight: '2.5rem'   }],  // page title
}
```

### 2.3 Aplicação por Contexto

| Elemento | Size | Weight | Font |
|---|---|---|---|
| **Page title** (`<h1>`) | 4xl | 700 (bold) | Inter |
| **Section title** (`<h2>`) | 3xl | 600 (semibold) | Inter |
| **Card title** (`<h3>`) | xl | 600 (semibold) | Inter |
| **KPI value** (dashboard) | 3xl | 700 (bold) | JetBrains Mono |
| **Table header** | xs | 600 (semibold) | Inter |
| **Table cell (texto)** | sm | 400 | Inter |
| **Table cell (valor)** | sm | 500 | JetBrains Mono |
| **Badge text** | xs | 500 | Inter |
| **Button label** | sm | 500 | Inter |
| **Input label** | sm | 500 | Inter |
| **Input value** | base | 400 | Inter |
| **Toast/message** | sm | 400 | Inter |

### 2.4 Exemplo Visual

```
📊 Dashboard                    ← text-4xl font-bold

Gasto Total do Mês              ← text-2xl font-semibold text-muted-foreground

┌──────────────┐ ┌──────────────┐
│ R$ 47.250,00 │ │  7,8 km/L   │ ← text-3xl font-bold font-mono
│ Gasto Total  │ │ Consumo Méd.│ ← text-sm text-muted-foreground
│   ↑ 12%      │ │   ↓ 5%      │ ← text-xs (↑ text-green, ↓ text-red)
└──────────────┘ └──────────────┘

Veículo    │ Combustível │ KM      │ Consumo
───────────┼─────────────┼─────────┼─────────
ABC-1234   │ Diesel S10  │ 84.230  │  7,2    ← text-sm
           │             │         │         ← font-mono nos números
```

---

## 3. Espaçamentos

### 3.1 Grid e Layout

```ts
// Usar o spacing padrão do Tailwind, com estas consistências:

Layout.SIDEBAR_WIDTH     = '240px'      // desktop sidebar
Layout.SIDEBAR_COLLAPSED = '64px'       // tablet sidebar
Layout.HEADER_HEIGHT     = '64px'       // topbar
Layout.CONTENT_MAX_WIDTH = '1440px'     // max container
Layout.PAGE_PADDING      = 'px-6 py-6'  // padding padrão da página

// Gap entre cards no dashboard
// → gap-6 (24px) desktop, gap-4 (16px) mobile
```

### 3.2 Hierarquia de Espaçamento

| Token | Valor | Uso |
|---|---|---|
| `space-0` | `0` | — |
| `space-1` | `4px` | Ícone e texto lado a lado |
| `space-2` | `8px` | Gap entre label e input |
| `space-3` | `12px` | Gap entre botão e botão |
| `space-4` | `16px` | Padding interno de card, gap entre seções no mobile |
| `space-5` | `20px` | Gap entre grupos de formulário |
| `space-6` | `24px` | Padding de card, gap entre cards |
| `space-8` | `32px` | Gap entre seções da página |
| `space-10` | `40px` | Page padding vertical |
| `space-12` | `48px` | Seções maiores |

### 3.3 Padding de Componentes

```tsx
// Card padrão
<Card className="p-6">          // → 24px padding

// Card KPI (dashboard)
<Card className="p-4 md:p-6">  // → 16px mobile, 24px desktop

// Modal content
<DialogContent className="p-0">  // → header p-6, body px-6 py-4, footer p-6

// Table cell
<td className="px-4 py-3">       // → 16px horizontal, 12px vertical

// Form field spacing
<div className="space-y-2">      // → 8px entre label e input
```

---

## 4. Componentes (shadcn/ui estendidos)

### 4.1 Botões

```tsx
// Variantes (padrão shadcn/ui)
<Button variant="default">       // → bg-primary text-primary-foreground
<Button variant="secondary">     // → bg-secondary text-secondary-foreground  
<Button variant="outline">       // → border bg-transparent
<Button variant="ghost">         // → sem borda nem bg
<Button variant="destructive">   // → bg-destructive text-destructive-foreground
<Button variant="link">          // → text primary sublinhado

// Tamanhos
<Button size="default">          // → h-10 px-4 py-2
<Button size="sm">               // → h-9 rounded-md px-3
<Button size="lg">               // → h-11 rounded-md px-8
<Button size="icon">             // → h-10 w-10

// FuelTrack extras:
<Button loading>                 // → mostra spinner + desabilita
<Button icon="plus">             // → ícone + texto (lado a lado)
```

### 4.2 Inputs

```tsx
// Padrão shadcn/ui
<Input type="text" placeholder="..." />

// FuelTrack customizações:
// → focus:ring-2 focus:ring-primary/20
// → border-input hover:border-primary transition-colors
// → disabled:bg-muted disabled:opacity-50
// → placeholder:text-muted-foreground/50
// → error: border-destructive ring-destructive/20
```

### 4.3 Badges de Status (custom FuelTrack)

```tsx
<BadgeStatus status="confirmado" />
// → classes dinâmicas baseadas em status (ver seção 1.3)

<BadgeStatus status="suspeito" />
// → children opcional para texto customizado
// → dot indicador colorido antes do texto
```

### 4.4 Empty State

```tsx
<EmptyState
  icon="fuel"                    // Lucide icon
  title="Nenhum abastecimento"
  description="Registre o primeiro abastecimento da sua frota."
  action={<Button>Novo Abastecimento</Button>}
/>
// → ícone grande (h-16 w-16) em fuel-200
// → text-xl title
// → text-muted-foreground description
```

### 4.5 Data Table (Tabela Avançada)

```tsx
// Combinação de <Table> (shadcn) + filtros + paginação
// Usar @tanstack/react-table para tabelas complexas

<DataTable
  columns={columns}
  data={abastecimentos}
  filters={
    <TableFilters>
      <DateFilter />
      <SelectFilter column="veiculo" />
      <SelectFilter column="status" />
    </TableFilters>
  }
  toolbar={
    <TableToolbar>
      <Button>Exportar</Button>
      <Button>Novo</Button>
    </TableToolbar>
  }
  pagination={{ pageSize: 10 }}
  onRowClick={(row) => openDetail(row.id)}
/>
```

### 4.6 Skeleton (Loading)

```tsx
<Skeleton className="h-4 w-[250px]" />
// → bg-muted animate-pulse rounded-md

// Pattern: skeletons espelham a estrutura do conteúdo
// KPI: 4 skeletons lado a lado
// Table: header skeleton + 5 row skeletons
```

---

## 5. Cards

### 5.1 Card Padrão

```tsx
<Card className="p-6">
  <CardHeader className="p-0 pb-4">
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent className="p-0">
    {children}
  </CardContent>
  <CardFooter className="p-0 pt-4">
    {footer}
  </CardFooter>
</Card>
```

**Especificação visual**:
```
┌─────────────────────────────────┐
│  padding: 24px (p-6)            │
│  border-radius: 8px (rounded-lg)│ ← border
│  background: card (--card)       │
│  ── ou ──                        │
│  shadow: shadow-sm (padrão)     │
│  shadow: shadow-md (hover)      │ ← se interactive
│                                 │
│  Header: p-0 pb-4               │
│  ─────────────────────────      │ ← border-b (opcional)
│  Content: p-0                   │
│  ─────────────────────────      │ ← border-b (opcional)
│  Footer: p-0 pt-4               │
└─────────────────────────────────┘
```

### 5.2 Card KPI (Dashboard)

```tsx
// → layout flex column
// → gap-2 entre ícone e valor

┌──────────────────────┐
│                      │
│  [💰] Gasto Total    │ ← text-sm text-muted-foreground flex items-center gap-2
│  R$ 47.250,00        │ ← text-3xl font-bold font-mono
│                      │
│   ↑ 12% vs. mai/26   │ ← text-xs flex items-center
│     (↑ text-green)   │     ↑ LucideIcon.trending-up (text-green-500)
│                      │     ↓ LucideIcon.trending-down (text-red-500)
│                      │
└──────────────────────┘

// Hover: shadow-md, cursor-pointer, scale-[1.02] transition
// Click: filtra dashboard por aquele indicador
```

### 5.3 Card de Resumo (Relatórios)

```tsx
<Card className="p-4">
  <div className="flex items-center justify-between">
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">Label</p>
      <p className="text-2xl font-semibold">Valor</p>
    </div>
    <Icon className="h-8 w-8 text-muted-foreground" />
  </div>
</Card>
```

**Grid de cards**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6`

---

## 6. Modais

### 6.1 Modal Padrão (shadcn/ui Dialog)

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Novo Abastecimento</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>Novo Abastecimento</DialogTitle>
      <DialogDescription>
        Preencha os dados do abastecimento
      </DialogDescription>
    </DialogHeader>

    <Form /> {/* conteúdo */}

    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button>Salvar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 6.2 Especificação Visual de Modal

```
┌────────────────────────────────────────────────┐
│  Overlay:                                       │
│  - bg-background/80 (light: white 80% opacity) │
│  - backdrop-blur-sm                             │
│  - animate-in fade-in duration-200             │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │  [×]  Título               ➡  p-6      │   │      ← DialogHeader
│  │  Descrição                               │   │
│  │  ─────────────────────────────────────── │   │      ← separador sutil
│  │                                           │   │
│  │  Conteúdo do formulário                  │   │      ← p-0 (scroll)
│  │  - inputs                                │   │
│  │  - selects                               │   │
│  │  - uploads                               │   │
│  │                                           │   │
│  │  ─────────────────────────────────────── │   │
│  │  [Cancelar]             [Salvar]    p-6  │   │      ← DialogFooter
│  └──────────────────────────────────────────┘   │
│                                                 │
│  Sizes: sm:max-w-sm (detalhes rápidos)          │
│         md: sm:max-w-md                         │
│         lg: sm:max-w-lg (padrão formulários)    │
│         xl: sm:max-w-xl (relatórios)            │
│         full: sm:max-w-[calc(100%-2rem)]         │
│                                                 │
│  Animação: animate-in zoom-in-95 fade-in        │
│  Mobile: fullscreen modal (h-screen m-0)        │
└─────────────────────────────────────────────────┘
```

### 6.3 Modal de Detalhes (Visualização)

```tsx
// → sm:max-w-2xl (mais largo para acomodar foto + dados lado a lado)
// → scroll interno no body
// → grid grid-cols-2 para dados + foto
// → sem footer (botões dentro do body)
```

### 6.4 Modal de Confirmação (Destrutivo)

```tsx
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Excluir veículo?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita. O veículo será removido permanentemente.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive">
        Sim, excluir
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 7. Tabelas

### 7.1 Estrutura

```tsx
<div className="rounded-lg border bg-card overflow-hidden">
  <Table>
    <TableHeader className="bg-muted/50">
      <TableRow>
        <TableHead className="h-10 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Coluna
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="hover:bg-muted/30 transition-colors cursor-pointer">
        <TableCell className="px-4 py-3 text-sm">
          Valor
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

### 7.2 Especificação Visual

```
┌──────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐│
│  │  Header: bg-muted/50                                ││
│  │  Texto: text-xs font-semibold uppercase             ││
│  │  Altura: h-10                                       ││
│  │                                                      ││
│  ├──────────────────────────────────────────────────────┤│
│  │  Row: hover:bg-muted/30, transition-colors         ││
│  │  Altura: py-3 (aprox 44px)                          ││
│  │                                                      ││
│  │  Cells: px-4 (text-align left padrão)              ││
│  │  - Texto: text-sm font-normal                       ││
│  │  - Número: font-mono text-right (tabular-nums)      ││
│  │  - Status: <BadgeStatus>                             ││
│  │  - Ações: dropdown ⋮                                 ││
│  ├──────────────────────────────────────────────────────┤│
│  │  Striped: even:bg-muted/20 (opcional)              ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  Borda: border rounded-lg                               │
│  Shadow: shadow-sm                                       │
└──────────────────────────────────────────────────────────┘
```

### 7.3 Ordenação e Alinhamento por Tipo de Dado

| Tipo de Coluna | Alinhamento | Font | Exemplo |
|---|---|---|---|
| **Texto** (placa, nome, posto) | `text-left` | `text-sm` Inter | `ABC-1234` |
| **Data/Hora** | `text-left` | `text-sm` Inter + `tabular-nums` | `12/06/2026 14:30` |
| **Numérico inteiro** (KM) | `text-right` | `text-sm font-mono` | `84.230` |
| **Decimal** (litros, valor, preço) | `text-right` | `text-sm font-mono` | `280,0` |
| **Status** | `text-center` | — | `<BadgeStatus>` |
| **Ações** | `text-right` | — | `⋮` dropdown |

### 7.4 DataTable (TanStack Table)

```tsx
// Configuração de coluna
const columns: ColumnDef<Abastecimento>[] = [
  {
    accessorKey: 'data_hora',
    header: 'Data/Hora',
    cell: ({ row }) => formatDate(row.original.data_hora),
  },
  {
    accessorKey: 'veiculo.placa',
    header: 'Veículo',
  },
  {
    accessorKey: 'litros',
    header: () => <div className="text-right">Litros</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">{formatNumber(row.original.litros, 'L')}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => <BadgeStatus status={row.original.status} />,
  },
];
```

### 7.5 Paginação

```
[Mostrando 1-10 de 47 registros]          [< 1 2 3 4 5 >]

Componente <Pagination> (shadcn/ui):
- Botões com números
- Botão current: bg-primary text-primary-foreground
- Padrão: 10 registros por página
- Selector de page size no canto esquerdo
```

---

## 8. Gráficos

### 8.1 Stack

```json
// package.json
{
  "dependencies": {
    "recharts": "^2.12.0",
    "recharts-surface": "^1.0.0"
  }
}
```

**Decisão**: Recharts sobre Chart.js/visx porque:
- Nativo React (componentes declarativos)
- Suporte responsivo nativo
- Animação built-in
- Fácil customização de cores via props

### 8.2 Container de Gráfico

```tsx
// Componente base para todos os gráficos
<div className="w-full rounded-lg border bg-card p-4 md:p-6">
  <div className="mb-4">
    <h3 className="text-lg font-semibold">Título</h3>
    <p className="text-sm text-muted-foreground">Descrição</p>
  </div>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart | BarChart | PieChart | AreaChart>
      {/* conteúdo */}
    </LineChart>
  </ResponsiveContainer>
</div>

// Skeleton: <Skeleton className="h-[300px] w-full rounded-lg" />
```

### 8.3 Configuração de Cores (Recharts)

```tsx
const CHART_COLORS = {
  diesel_s10:    '#2563eb',  // blue-600
  diesel_s500:   '#1d4ed8',  // blue-700
  gasolina:      '#f59e0b',  // amber-500
  etanol:        '#10b981',  // emerald-500
  gnv:           '#06b6d4',  // cyan-500
  eletrico:      '#8b5cf6',  // violet-500
} as const;

const CHART_PALETTE = [
  '#2563eb',  // blue  → 1º dataset
  '#10b981',  // green → 2º
  '#f59e0b',  // amber → 3º
  '#8b5cf6',  // violet → 4º
  '#ec4899',  // pink  → 5º
  '#06b6d4',  // cyan  → 6º
] as const;
```

### 8.4 Tipos de Gráfico por Contexto

| Contexto | Tipo | Altura | Variáveis |
|---|---|---|---|
| **Gasto x Tempo** (dashboard) | `AreaChart` | 300px | X: semana, Y: R$ |
| **Consumo por Veículo** (dashboard) | `BarChart` horizontal | 300px | X: km/L, Y: placa |
| **Gasto por Categoria** (despesas) | `PieChart` | 280px | Categoria, valor |
| **Gasto por Veículo** (despesas) | `BarChart` | 280px | Veículo, valor |
| **Consumo histórico** (veículo detail) | `LineChart` | 250px | X: data, Y: km/L |
| **Preço combustível** (relatórios) | `LineChart` | 250px | X: data, Y: R$/L |

### 8.5 Exemplo: Gasto x Tempo

```tsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
    <XAxis
      dataKey="semana"
      className="text-xs text-muted-foreground"
      tickLine={false}
      axisLine={false}
    />
    <YAxis
      className="text-xs text-muted-foreground font-mono"
      tickLine={false}
      axisLine={false}
      tickFormatter={(v) => `R$${(v/1000).toFixed(1)}k`}
    />
    <Tooltip
      contentStyle={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
      }}
      formatter={(v: number) => [`R$${v.toLocaleString('pt-BR')}`, 'Gasto']}
    />
    <Area
      type="monotone"
      dataKey="gasto"
      stroke="#2563eb"
      strokeWidth={2}
      fill="url(#colorGasto)"
    />
  </AreaChart>
</ResponsiveContainer>
```

### 8.6 Responsividade

```tsx
// Hook customizado para altura responsiva
const CHART_HEIGHT = {
  sm: 200,     // mobile
  md: 250,     // tablet
  lg: 300,     // desktop
};

function useChartHeight() {
  const { width } = useWindowSize();
  if (width < 640) return CHART_HEIGHT.sm;
  if (width < 1024) return CHART_HEIGHT.md;
  return CHART_HEIGHT.lg;
}
```

---

## 9. Exemplo de Página Completa (Dashboard)

```tsx
// Layout real que integra todos os tokens
export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <Select defaultValue="junho">
          <SelectTrigger className="w-[180px]" />
          <SelectContent>
            <SelectItem value="junho">Junho 2026</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <CardKPI icon="dollar" label="Gasto Total" value="R$ 47.250" trend="up" percent={12} />
        <CardKPI icon="fuel" label="Consumo Médio" value="7,8 km/L" trend="down" percent={5} />
        <CardKPI icon="beaker" label="Total Litros" value="6.230 L" trend="up" percent={8} />
        <CardKPI icon="map" label="KM Rodados" value="48.594 km" trend="up" percent={10} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartGastoXPeriodo />
        <ChartConsumoPorVeiculo />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertasRecentes />
        <CardMapaAbastecimentos />
      </div>

      {/* Ranking */}
      <RankingMotoristas />
    </div>
  );
}
```

---

## 10. Resumo de Tokens

| Token | Light | Dark |
|---|---|---|
| `--background` | `210 40% 98%` | `222 84% 5%` |
| `--foreground` | `222 84% 5%` | `210 40% 98%` |
| `--primary` | `221 83% 53%` | `217 91% 60%` |
| `--secondary` | `160 84% 39%` | `161 94% 30%` |
| `--accent` | `38 92% 50%` | `38 92% 50%` |
| `--radius` | `0.5rem` | `0.5rem` |
| Font sans | Inter | Inter |
| Font mono | JetBrains Mono | JetBrains Mono |

---

**Arquivos gerados**:
- `DESIGN_SYSTEM.md` (este documento)
- `apps/web/tailwind.config.ts` (config completa)
- `apps/web/src/styles/globals.css` (CSS variables + camadas Tailwind)
- `apps/web/src/components/ui/` (componentes shadcn/ui customizados)

**Próximo passo**: Iniciar setup do projeto Next.js + Tailwind + shadcn/ui via CLI.
