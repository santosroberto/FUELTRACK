# FuelTrack — Arquitetura de Software

---

## 1. Arquitetura Completa

### 1.1 Visão Geral

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENTES                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  Web App     │  │  PWA Mobile  │  │  API Pública        │  │
│  │  (React)     │  │  (React)     │  │  (3rd parties)      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬──────────┘  │
└─────────┼──────────────────┼─────────────────────┼─────────────┘
          │                  │                     │
          ▼                  ▼                     ▼
┌──────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                     │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Next.js (App Router) + TailwindCSS + shadcn/ui          │ │
│  │  • SSR para páginas públicas (landing, login)            │ │
│  │  • CSR para páginas autenticadas (dashboard, app)        │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────┐
│                      SUPABASE (BaaS)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Auth     │  │  DB      │  │ Storage  │  │  Realtime    │  │
│  │(GoTrue)  │  │(Postgres)│  │ (Images) │  │ (Subscrições)│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Edge Functions (Deno) — Webhooks, notificações,         │ │
│  │  processamento de OCR, detecção de anomalias             │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────┐
│                    SERVIÇOS EXTERNOS                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Postmark │  │ OpenCage │  │ Google   │  │ APIs         │  │
│  │ (E-mail) │  │ (Geocode)│  │ Maps     │  │ Cartões      │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  OCR.space / Tesseract — Leitura automática de cupons    │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Frontend** | Next.js 14+ (App Router) | SSR + CSR, bom para SEO em landing page e performance no dashboard |
| **UI** | TailwindCSS + shadcn/ui | Componentes acessíveis, customizeis, bundle pequeno |
| **Mobile** | PWA + React (mesmo Next.js) | Código compartilhado, instalação sem app store, MVP rápido |
| **BaaS** | Supabase | Auth, PostgreSQL, Storage, Realtime, Edge Functions — tudo integrado |
| **Banco** | PostgreSQL (Supabase) | Relacional, maduro, suporta GIS (PostGIS), ótimo para dados estruturados |
| **Storage** | Supabase Storage (S3) | Imagens dos cupons fiscais |
| **Auth** | Supabase Auth (GoTrue) | Magic links, OAuth (Google), JWT, Row Level Security |
| **Serverless** | Supabase Edge Functions (Deno) | Webhooks, OCR processing, anomalias |
| **Email** | Postmark / Resend | Transacionais (boas-vindas, alertas) |
| **Geolocalização** | OpenCage (forward/reverse geocode) | Converter coordenadas em endereço do posto |
| **Mapas** | Google Maps ou Leaflet (OSM) | Exibir rotas e postos no dashboard |
| **CI/CD** | GitHub Actions | Testes, build, deploy automático |
| **Hospedagem** | Vercel (web) + Supabase (backend) | Sem servidor para gerenciar, bom para SaaS MVP |

### 1.3 Princípios Arquiteturais

- **Serverless-first**: Máximo de serviços gerenciados, mínimo de servidores próprios
- **Row Level Security (RLS)**: Segurança no banco — motorista só vê seus abastecimentos, gestor vê a frota
- **Offline-first (Mobile)**: PWA com Service Worker + IndexedDB para registrar abastecimento sem internet
- **API como contrato**: A camada Supabase é a única fonte de verdade; frontend consome via SDK
- **Multi-tenancy por tenant_id**: Toda tabela tem coluna `tenant_id`; RLS filtra por ela

---

## 2. Estrutura de Pastas

```
fuel-track/
├── .github/
│   └── workflows/
│       ├── deploy-production.yml
│       ├── lint-and-test.yml
│       └── supabase-staging.yml
│
├── apps/
│   └── web/                          # Next.js (web + PWA)
│       ├── public/
│       │   ├── manifest.json         # PWA manifest
│       │   └── sw.js                 # Service Worker (offline)
│       │
│       ├── src/
│       │   ├── app/
│       │   │   ├── (public)/         # Landing, preços, login
│       │   │   │   ├── login/
│       │   │   │   ├── cadastro/
│       │   │   │   ├── landing/
│       │   │   │   └── layout.tsx
│       │   │   │
│       │   │   ├── (dashboard)/      # Autenticado
│       │   │   │   ├── dashboard/
│       │   │   │   ├── abastecimentos/
│       │   │   │   ├── veiculos/
│       │   │   │   ├── motoristas/
│       │   │   │   ├── postos/
│       │   │   │   ├── relatorios/
│       │   │   │   ├── alertas/
│       │   │   │   ├── configuracoes/
│       │   │   │   └── layout.tsx    # Sidebar + header
│       │   │   │
│       │   │   ├── api/              # Next.js API routes (se necessário)
│       │   │   │   └── webhooks/
│       │   │   │
│       │   │   ├── error.tsx
│       │   │   ├── loading.tsx
│       │   │   └── layout.tsx        # Root layout
│       │   │
│       │   ├── components/
│       │   │   ├── ui/               # shadcn/ui primitives
│       │   │   │   ├── button.tsx
│       │   │   │   ├── card.tsx
│       │   │   │   ├── dialog.tsx
│       │   │   │   ├── table.tsx
│       │   │   │   ├── toast.tsx
│       │   │   │   └── ...
│       │   │   │
│       │   │   ├── layout/           # Dashboard layout components
│       │   │   │   ├── sidebar.tsx
│       │   │   │   ├── header.tsx
│       │   │   │   └── mobile-nav.tsx
│       │   │   │
│       │   │   ├── shared/           # Shared domain components
│       │   │   │   ├── empty-state.tsx
│       │   │   │   ├── loading-skeleton.tsx
│       │   │   │   ├── pagination.tsx
│       │   │   │   ├── confirm-dialog.tsx
│       │   │   │   └── data-table.tsx
│       │   │   │
│       │   │   └── domain/           # Domain-specific components
│       │   │       ├── abastecimento/
│       │   │       │   ├── abastecimento-form.tsx
│       │   │       │   ├── abastecimento-list.tsx
│       │   │       │   ├── abastecimento-card.tsx
│       │   │       │   ├── foto-cupom-upload.tsx
│       │   │       │   └── abastecimento-detalhes.tsx
│       │   │       │
│       │   │       ├── veiculo/
│       │   │       │   ├── veiculo-form.tsx
│       │   │       │   ├── veiculo-card.tsx
│       │   │       │   └── veiculo-select.tsx
│       │   │       │
│       │   │       ├── motorista/
│       │   │       │   ├── motorista-form.tsx
│       │   │       │   ├── motorista-list.tsx
│       │   │       │   └── ranking-motoristas.tsx
│       │   │       │
│       │   │       ├── dashboard/
│       │   │       │   ├── metricas-gerais.tsx
│       │   │       │   ├── grafico-consumo.tsx
│       │   │       │   ├── grafico-gastos.tsx
│       │   │       │   ├── alertas-recentes.tsx
│       │   │       │   └── mapa-ultimos-abastecimentos.tsx
│       │   │       │
│       │   │       ├── relatorio/
│       │   │       │   ├── relatorio-filtros.tsx
│       │   │       │   └── relatorio-preview.tsx
│       │   │       │
│       │   │       └── alerta/
│       │   │           ├── alerta-list.tsx
│       │   │           └── alerta-card.tsx
│       │   │
│       │   ├── hooks/
│       │   │   ├── use-abastecimentos.ts
│       │   │   ├── use-veiculos.ts
│       │   │   ├── use-motoristas.ts
│       │   │   ├── use-postos.ts
│       │   │   ├── use-dashboard.ts
│       │   │   ├── use-alertas.ts
│       │   │   ├── use-online-status.ts     # PWA offline detection
│       │   │   ├── use-geolocation.ts
│       │   │   └── use-debounce.ts
│       │   │
│       │   ├── lib/
│       │   │   ├── supabase/
│       │   │   │   ├── client.ts            # Supabase browser client
│       │   │   │   ├── server.ts            # Supabase server client
│       │   │   │   ├── admin.ts             # Supabase service role (admin)
│       │   │   │   └── middleware.ts         # Next.js middleware (auth)
│       │   │   │
│       │   │   ├── utils/
│       │   │   │   ├── formatters.ts        # Moeda, data, km
│       │   │   │   ├── validators.ts        # Zod schemas
│       │   │   │   ├── constants.ts
│       │   │   │   └── geolocation.ts       # Coord → endereço
│       │   │   │
│       │   │   └── db/
│       │   │       ├── queries/
│       │   │       │   ├── abastecimentos.ts
│       │   │       │   ├── veiculos.ts
│       │   │       │   ├── motoristas.ts
│       │   │       │   ├── dashboard.ts
│       │   │       │   └── alertas.ts
│       │   │       └── types.ts              # TypeScript types (inferidos do DB)
│       │   │
│       │   ├── stores/                      # Zustand stores
│       │   │   ├── auth-store.ts
│       │   │   ├── ui-store.ts
│       │   │   └── offline-store.ts         # PWA offline queue
│       │   │
│       │   ├── providers/
│       │   │   ├── auth-provider.tsx
│       │   │   ├── query-provider.tsx       # TanStack Query
│       │   │   └── theme-provider.tsx
│       │   │
│       │   └── middleware.ts                # Next.js middleware (auth redirect)
│       │
│       ├── .env.local
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/                              # Shared types and utils
│       ├── src/
│       │   ├── types/
│       │   │   ├── abastecimento.ts
│       │   │   ├── veiculo.ts
│       │   │   ├── motorista.ts
│       │   │   ├── posto.ts
│       │   │   ├── tenant.ts
│       │   │   └── usuario.ts
│       │   ├── validators/
│       │   │   ├── abastecimento-schema.ts
│       │   │   ├── veiculo-schema.ts
│       │   │   └── motorista-schema.ts
│       │   └── constants.ts
│       ├── tsconfig.json
│       └── package.json
│
├── supabase/
│   ├── migrations/                          # SQL migrations versionadas
│   │   ├── 00001_create_tenants.sql
│   │   ├── 00002_create_profiles.sql
│   │   ├── 00003_create_veiculos.sql
│   │   ├── 00004_create_motoristas.sql
│   │   ├── 00005_create_abastecimentos.sql
│   │   ├── 00006_create_postos.sql
│   │   ├── 00007_create_alertas.sql
│   │   └── 00008_rls_policies.sql
│   │
│   ├── seed.sql                             # Dados de desenvolvimento
│   │
│   ├── functions/                           # Edge Functions (Deno)
│   │   ├── detectar-anomalia/
│   │   │   ├── index.ts
│   │   │   └── test.ts
│   │   ├── notificar-alerta/
│   │   │   ├── index.ts
│   │   │   └── email-template.ts
│   │   ├── processar-ocr/
│   │   │   ├── index.ts
│   │   │   └── ocr-service.ts
│   │   └── gerar-relatorio/
│   │       ├── index.ts
│   │       └── pdf-generator.ts
│   │
│   ├── config.toml                          # Supabase CLI config
│   └── seed.sh
│
├── tests/
│   ├── unit/
│   │   ├── validators.test.ts
│   │   └── formatters.test.ts
│   ├── integration/
│   │   ├── abastecimento.test.ts
│   │   └── auth.test.ts
│   └── e2e/
│       ├── abastecimento.spec.ts
│       └── login.spec.ts
│
├── docker-compose.yml                       # Supabase local dev
├── .env.example
├── .gitignore
├── README.md
├── ANALISE.md
├── ARQUITETURA.md
├── package.json                             # Monorepo root (pnpm workspaces)
├── turbo.json                               # Turborepo config
└── vercel.json
```

---

## 3. Estratégia de Componentes

### 3.1 Hierarquia de Componentes (Árvore)

```
RootLayout
├── Providers
│   ├── AuthProvider (contexto de autenticação)
│   ├── QueryProvider (TanStack Query)
│   └── ThemeProvider (claro/escuro)
│
├── (public) Layout
│   ├── LandingPage
│   │   ├── Hero
│   │   ├── Features
│   │   ├── Pricing
│   │   └── CTA
│   ├── LoginPage
│   │   ├── LoginForm (e-mail + senha)
│   │   ├── OAuthButtons (Google)
│   │   └── MagicLinkForm
│   └── CadastroPage
│       └── CadastroForm
│
├── (dashboard) Layout
│   ├── Sidebar
│   │   ├── Logo
│   │   ├── NavItem (Dashboard, Abastecimentos, Veículos, etc.)
│   │   └── UserMenu
│   ├── Header
│   │   ├── SearchInput
│   │   ├── NotificationsBell
│   │   └── UserAvatar
│   │
│   ├── DashboardPage
│   │   ├── MetricasGerais (cartões: gasto total, consumo médio, km rodados)
│   │   ├── GraficoConsumo (Recharts/Chart.js)
│   │   ├── GraficoGastos
│   │   ├── AlertasRecentes
│   │   │   └── AlertaCard (para cada alerta)
│   │   └── MapaAbastecimentos (Leaflet/Google Maps)
│   │
│   ├── AbastecimentosPage
│   │   ├── AbastecimentoFilters (data, veículo, motorista, posto)
│   │   ├── AbastecimentoTable (data-table com sort/paginate)
│   │   │   └── AbastecimentoRow → AbastecimentoDetalhes (modal)
│   │   └── NovoAbastecimentoButton → AbastecimentoForm (modal/drawer)
│   │       ├── VeiculoSelect
│   │       ├── MotoristaSelect
│   │       ├── FotoCupomUpload (dropzone + preview + camera)
│   │       └── GeolocationInput (captura coordenadas automáticas)
│   │
│   ├── VeiculosPage
│   │   ├── VeiculoList
│   │   │   └── VeiculoCard
│   │   └── VeiculoForm (modal)
│   │
│   ├── MotoristasPage
│   │   ├── MotoristaList
│   │   ├── MotoristaForm
│   │   └── RankingMotoristas (gamificação)
│   │
│   ├── PostosPage
│   │   ├── PostoTable
│   │   └── PostoForm
│   │
│   ├── RelatoriosPage
│   │   ├── RelatorioFiltros (período, veículos, motoristas)
│   │   └── RelatorioPreview (tabela + gráficos + botão exportar)
│   │
│   ├── AlertasPage
│   │   ├── AlertaList
│   │   │   └── AlertaCard (tipo, severidade, ações: aprovar/ignorar)
│   │   └── AlertaDetalhes
│   │
│   └── ConfiguracoesPage
│       ├── ProfileForm
│       ├── TenantSettings
│       └── UserManagement
│
└── (mobile/app) Layout (PWA)
    ├── BottomNav (Dashboard, Abastecer, Histórico, Perfil)
    ├── NovoAbastecimentoPage
    │   ├── StepIndicator (1. Veículo → 2. Dados → 3. Foto → 4. Confirmar)
    │   ├── VeiculoSelect
    │   ├── AbastecimentoForm
    │   ├── FotoCupomUpload (câmera nativa)
    │   └── ConfirmacaoPage
    ├── HistoricoPage
    │   └── AbastecimentoCard (versão mobile)
    └── PerfilPage
```

### 3.2 Padrão de Componentes

Cada componente de domínio segue a mesma estrutura:

```
components/domain/entidade/
├── entidade-form.tsx      # Formulário (criação/edição)
├── entidade-list.tsx       # Lista com filtros
├── entidade-card.tsx       # Card para visualização resumida
├── entidade-table.tsx      # Tabela para visualização completa
└── entidade-detalhes.tsx   # Modal/página de detalhes
```

**Contrato de Props**:
- Componentes de UI (shadcn): 1 props, sem lógica de negócio
- Componentes de domínio: recebem dados prontos (data) + callbacks (onSubmit, onDelete)
- Páginas: fazem fetch dos dados e passam para os componentes

---

## 4. Gerenciamento de Estado

| Camada | Ferramenta | O que gerencia |
|---|---|---|
| **Server State** | TanStack Query (React Query) | Dados do Supabase (abastecimentos, veículos, etc.). Cache, refetch, mutações, optimistic updates |
| **Client State (global)** | Zustand | Estado da UI (sidebar aberta/fechada, tema), fila offline do PWA |
| **Client State (local)** | useState/useReducer | Estado local de formulários, modais, steps |
| **Auth State** | Supabase Auth + React Context | Sessão do usuário, permissões, tenant atual |
| **URL State** | Next.js (searchParams) | Filtros, paginação, abas |
| **Offline State** | Zustand persist (localStorage) + Service Worker | Fila de abastecimentos pendentes (registrados sem internet) |

### 4.1 Fluxo de TanStack Query

```
Componente
  ↓
useQuery('abastecimentos', fetchAbastecimentos)
  ↓
TanStack Query verifica cache
  ├── Cache válido → retorna dados do cache (stale-while-revalidate)
  └── Cache inválido → chama Supabase SDK → atualiza cache → renderiza

Mutações:
useMutation → onMutate (optimistic) → onSuccess (invalidateQueries) → onError (rollback)
```

### 4.2 Estratégia de Cache

- `staleTime: 30s` para dashboards (dados semi-frescos)
- `staleTime: 2min` para listas (abastecimentos, veículos)
- `gcTime: 10min` para dados históricos
- `refetchOnWindowFocus: true` (apenas em páginas críticas)
- Optimistic updates para criação de abastecimento (feedback instantâneo)

---

## 5. Autenticação

### 5.1 Fluxo de Autenticação

```
Usuário → Login (email+senha / Google OAuth / Magic Link)
  ↓
Supabase Auth → GoTrue Server
  ↓
Gera JWT (access_token + refresh_token)
  ↓
Armazena no cookie HTTP-only (Next.js middleware) + localStorage (cliente)
  ↓
Middleware Next.js (supabase/middleware.ts):
  ├── Se não tem sessão e rota protegida → redirect /login
  └── Se tem sessão → injeta user no request

Cliente:
  ├── AuthProvider escuta onAuthStateChange (Supabase)
  ├── Atualiza sessão no Zustand (auth-store)
  └── TanStack Query usa token para queries autenticadas
```

### 5.2 Modelo de Permissões

| Papel | Acesso |
|---|---|
| **admin** | Tudo — gerencia usuários, configurações da conta, exclusão de dados |
| **gestor** | CRUD da frota, relatórios, alertas, aprova abastecimentos suspeitos |
| **motorista** | Registra próprio abastecimento, vê histórico próprio, não vê custos de outros |

**Implementação**: RLS (Row Level Security) no PostgreSQL + helper `auth.uid()` + tabela `app_perfis` com `tenant_id` e `role`.

### 5.3 Row Level Security (RLS)

```sql
-- Abastecimentos: motorista vê só os seus; gestor vê todos do tenant
ALTER TABLE abastecimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY motorista_select ON abastecimentos
  FOR SELECT
  USING (
    auth.uid() = motorista_id
    OR EXISTS (
      SELECT 1 FROM app_perfis
      WHERE user_id = auth.uid()
      AND tenant_id = abastecimentos.tenant_id
      AND role IN ('gestor', 'admin')
    )
  );
```

---

## 6. Integração com Supabase

### 6.1 Diagrama de Integração

```
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE (Projeto)                       │
│                                                             │
│  ┌────────── Auth ──────────┐                               │
│  │ • E-mail + senha         │                               │
│  │ • Google OAuth           │  ←── Next.js Middleware       │
│  │ • Magic Link             │  ←── AuthProvider (cliente)   │
│  │ • JWT + Refresh Token    │                               │
│  └──────────────────────────┘                               │
│                                                             │
│  ┌────────── Database ──────┐                               │
│  │ • tenants                │  ←── Admin CRUD               │
│  │ • app_perfis (users)     │  ←── Auth trigger (on signup) │
│  │ • veiculos               │  ←── Gestor CRUD              │
│  │ • motoristas             │  ←── Gestor CRUD              │
│  │ • abastecimentos         │  ←── Motorista INSERT         │
│  │ • postos                 │  ←── Gestor CRUD              │
│  │ • alertas                │  ←── Edge Function INSERT     │
│  │ • RLS Policies           │  ←── Segurança por row        │
│  │ • PostGIS (coordenadas)  │  ←── Consultas geoespaciais   │
│  └──────────────────────────┘                               │
│                                                             │
│  ┌────────── Storage ───────┐                               │
│  │ • cupons-fiscais/        │  ←── Upload por motorista     │
│  │   {tenant_id}/{uuid}.jpg │  ←── RLS por tenant           │
│  │ • 10MB limit per file    │                               │
│  └──────────────────────────┘                               │
│                                                             │
│  ┌────────── Edge Functions ────┐                            │
│  │ • detectar-anomalia         │  ←── DB trigger (after     │
│  │   (processa novo abast.)    │      INSERT abastecimento) │
│  │ • notificar-alerta          │  ←── via Supabase Realtime │
│  │   (envia e-mail/notif.)     │                             │
│  │ • processar-ocr             │  ←── on Storage upload     │
│  │   (lê cupom fiscal)         │                             │
│  │ • gerar-relatorio           │  ←── chamada manual        │
│  │   (PDF com gráficos)        │                             │
│  └──────────────────────────────┘                            │
│                                                             │
│  ┌────────── Realtime ────────┐                              │
│  │ • abastecimentos channel   │  ←── Dashboard atualiza     │
│  │ • alertas channel          │      em tempo real          │
│  │ • Postgres Changes         │                              │
│  └────────────────────────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Configuração de Clientes

```typescript
// lib/supabase/client.ts — Browser (cliente)
// - Usa anon key (pública)
// - Apenas acessa dados via RLS
// - Auth helpers (login, signup, logout)
// - Real-time subscriptions

// lib/supabase/server.ts — Server (Next.js SSR)
// - Usa anon key + cookie de sessão
// - fetch dados do servidor (SSR)
// - Middleware de autenticação

// lib/supabase/admin.ts — Admin (service_role)
// - Usa service_role key (secreta)
// - Apenas Edge Functions e scripts internos
// - Bypass RLS — nunca expor ao cliente
```

### 6.3 Tabelas do Banco

```sql
-- tenants
-- (id, nome, slug, plano, created_at, updated_at)

-- app_perfis
-- (id, user_id [auth.users], tenant_id, role, nome, telefone, avatar_url, created_at)

-- veiculos
-- (id, tenant_id, placa, marca, modelo, ano, tipo_combustivel, capacidade_tanque, km_atual, ativo, created_at)

-- motoristas
-- (id, tenant_id, user_id [nullable], nome, cpf, cnh, telefone, limite_litros_mes, ativo, created_at)

-- abastecimentos
-- (id, tenant_id, veiculo_id, motorista_id, data_hora, km_atual, litros, valor_total, preco_litro,
--  tipo_combustivel, posto_nome, posto_lat, posto_lng, foto_cupom_url, forma_pagamento,
--  status [pendente, confirmado, suspeito], motorista_app, created_at)

-- postos
-- (id, tenant_id, nome, endereco, lat, lng, preco_diesel, preco_gasolina, preco_etanol, ativo, created_at)

-- alertas
-- (id, tenant_id, abastecimento_id, tipo [fora_perimetro, fora_horario, consumo_anomalo, limite_excedido],
--  severidade [baixa, media, alta], descricao, lido, resolvido, created_at)
```

---

## 7. Fluxo de Dados

### 7.1 Fluxo: Motorista registra abastecimento (Online)

```
[Motorista] → App PWA (React)
  │
  1. Preenche formulário (km, litros, valor, combustível)
  2. Tira foto do cupom (câmera → File)
  3. App captura geolocalização (navigator.geolocation)
  4. Clica em "Confirmar"
  │
  ▼
[TanStack Query] → useMutation
  │
  ▼
[Paralelo Upload]
  ├── 1. Storage: upload foto → supabase.storage.from('cupons').upload()
  │     → retorna URL pública
  │
  └── 2. DB: INSERT abastecimento (com URL da foto + coordenadas)
        → Validação via RLS (motorista só insere no próprio tenant)
  │
  ▼
[Supabase DB Trigger]
  → Edge Function "detectar-anomalia" (async)
      ├── Calcula km/L do último abastecimento
      ├── Compara com média histórica do veículo
      ├── Se anômalo → INSERT em alertas
      │     → Realtime envia notificação ao dashboard do gestor
      └── Se normal → status = 'confirmado'
  │
  ▼
[Motorista vê confirmação]
  → TanStack Query onSuccess → invalida query de histórico
  → Toast: "Abastecimento registrado com sucesso"
  → Abastecimento aparece no histórico imediatamente (optimistic update)
```

### 7.2 Fluxo: Motorista registra abastecimento (Offline)

```
[Motorista] → App PWA (React)
  │
  1. Preenche formulário
  2. Tira foto (salva em IndexedDB via Service Worker)
  3. Clica em "Confirmar"
  │
  ▼
[Zustand offline-store] → Adiciona à fila offline
  │  {
  │    id: uuid_local,
  │    data: { veiculo_id, km, litros, valor, ... },
  │    foto: blob_url,
  │    coords: { lat, lng },
  │    status: 'pending_sync',
  │    created_at: Date.now()
  │  }
  │
▼
[Service Worker] → Escuta evento 'online'
  │
  Quando conexão restaurar:
  ├── 1. Lê fila do IndexedDB
  ├── 2. Replay: upload foto + INSERT no Supabase
  ├── 3. Sucesso → remove da fila
  └── 4. Falha → mantém na fila + notifica usuário
```

### 7.3 Fluxo: Gestor visualiza Dashboard

```
[Gestor] → Web App (Next.js)
  │
  ▼
[Dashboard Page] → SSR (se first load) ou CSR (se navegação)
  │
  ▼
[Várias queries paralelas] (TanStack Query)
  ├── useDashboardMetricas(tenant_id, mes_atual)
  │     → SELECT SUM(valor_total), AVG(preco_litro), SUM(litros), etc.
  │     → Executa no PostgreSQL (agregações rápidas)
  │
  ├── useAbastecimentosRecentes(tenant_id, limite=10)
  │     → SELECT * FROM abastecimentos WHERE tenant_id = ? ORDER BY data DESC LIMIT 10
  │
  ├── useAlertasNaoLidos(tenant_id)
  │     → SELECT * FROM alertas WHERE tenant_id = ? AND lido = false
  │
  └── useConsumoMensal(tenant_id, mes_atual)
        → SELECT date_trunc('week', data_hora), SUM(litros), AVG(km_atual - lag)
        → Agrupado por semana para gráfico
  │
  ▼
[Realtime Subscription]
  → supabase.channel('dashboard-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'abastecimentos',
           filter: `tenant_id=eq.${tenant_id}` },
        (payload) => {
          // Invalida queries específicas para atualizar dashboard em tempo real
          queryClient.invalidateQueries({ queryKey: ['dashboardMetricas'] })
          queryClient.invalidateQueries({ queryKey: ['abastecimentosRecentes'] })
        }
      )
      .subscribe()
  │
  ▼
[Renderização]
  → MetricasGerais (4 cartões com animação de contagem)
  → GraficoConsumo (linha — consumo ao longo do tempo)
  → GraficoGastos (barra — gasto por veículo)
  → AlertasRecentes (lista dos últimos 5 alertas)
  → MapaAbastecimentos (marcadores nos postes usados no mês)
```

### 7.4 Fluxo: Detecção de Anomalia (Background)

```
[INSERT abastecimento] → Supabase DB
  │
  ▼
[Database Trigger] → "after insert on abastecimentos"
  │
  ▼
[Edge Function] → detectar-anomalia
  │
  1. Busca último abastecimento do mesmo veículo
  2. Calcula km_rodados = km_atual - km_anterior
  3. Calcula consumo = km_rodados / litros
  4. Busca média histórica do veículo (últimos 30 abastecimentos)
  5. Regras:
     ├── consumo < 50% da média → "consumo_anomalo" (suspeito de roubo/vazamento)
     ├── km_rodados < 10 km e litros > 50 → "abastecimento_suspeito"
     ├── horário < 6h ou > 22h → "fora_horario"
     ├── coordenadas fora do raio de atuação → "fora_perimetro"
     └── litros > limite do motorista → "limite_excedido"
  │
  ▼
[Se anomalia detectada]
  ├── UPDATE abastecimento SET status = 'suspeito'
  └── INSERT INTO alertas (tipo, severidade, descricao)
       │
       ▼
  [Realtime] → Notifica dashboard do gestor
  [Edge Function] → notificar-alerta
       ├── Se severidade alta → e-mail + notificação push
       └── Se severidade média → apenas notificação no app
```

### 7.5 Fluxo: Geração de Relatório

```
[Gestor] → Página de Relatórios
  │
  1. Seleciona período (data inicial / data final)
  2. Opcional: filtra por veículo(s), motorista(s)
  3. Clica em "Gerar Relatório"
  │
  ▼
[RelatorioPage] → useQuery com filtros
  │
  ▼
[Supabase Query]
  → SELECT com agregações por veículo/motorista/semana
  → Joins: abastecimentos + veiculos + motoristas
  → Group by + Order + cálculo de km/L
  │
  ▼
[RelatorioPreview]
  → Tabela com linhas: veículo, km total, litros, gasto total, km/L médio, preço médio
  → Gráficos: gasto por semana, consumo por veículo
  → Botão "Exportar"
  │
  ▼
[Exportação]
  ├── PDF: Edge Function "gerar-relatorio"
  │     → Usa Deno + PDF lib (puppeteer ou pdfmake)
  │     → Renderiza tabela + gráfico (SVG → PDF)
  │     → Upload para Storage → retorna URL assinada
  │
  └── CSV: Gerado no frontend (blob → download)
        → Abastecimentos do período em formato tabular
```

---

## 8. Considerações Finais

### Performance
- Queries de dashboard usam views materializadas atualizadas a cada 15min (para frotas grandes)
- Imagens dos cupons são redimensionadas no upload (max 800px) para economizar storage e acelerar carregamento
- Páginas de listagem usam paginação cursor-based (não offset) para performance consistente

### Segurança
- RLS é a primeira barreira — nenhum dado cruza o banco sem filtro de tenant
- Service role key nunca sai do servidor (Edge Functions)
- Upload de imagens validado por tipo MIME e tamanho no client + servidor
- Rate limiting nas rotas de auth (Supabase já faz por padrão)

### Escalabilidade
- Supabase escala horizontalmente (PostgreSQL com PgBouncer para conexões)
- Edge Functions escalam automaticamente (Deno + isolation)
- Para frotas 500+ veículos, considerar cache Redis (Upstash) para dashboards
- Imagens: CDN do Supabase Storage (S3) → entrega global

---

**Documento gerado em:** Junho/2026
**Arquiteto:** Análise gerada por IA assistida — revisar antes de implementar.
