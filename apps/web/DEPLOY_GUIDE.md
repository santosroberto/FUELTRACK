# Guia de Deploy — FuelTrack

## Stack

| Camada   | Tecnologia     |
| -------- | -------------- |
| Frontend | Vite + React   |
| Backend  | Supabase       |
| Hospedagem | Vercel       |
| Domínio  | (opcional)     |

---

## 1. Pré-requisitos

- [Node.js](https://nodejs.org) >= 18
- [Git](https://git-scm.com)
- Conta no [GitHub](https://github.com)
- Conta no [Vercel](https://vercel.com) (plataforma gratuita)
- Conta no [Supabase](https://supabase.com) (plataforma gratuita)

---

## 2. Supabase — Configuração do Backend

### 2.1. Criar projeto

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em **New project**
3. Preencha:
   - **Name**: `fueltrack`
   - **Database Password**: anote em local seguro
   - **Region**: escolha a mais próxima (ex: `South America (São Paulo)` para latência mínima no Brasil)
   - **Pricing Plan**: **Free** (500 MB de banco, 50.000 linhas, 2 GB de largura de banda)
4. Aguarde ~2 minutos enquanto o projeto é provisionado

### 2.2. Obter credenciais

1. No painel do projeto, vá em **Project Settings** ⚙️ > **API**
2. Anote dois valores:

   ```
   Project URL         → VITE_SUPABASE_URL
   anon public key     → VITE_SUPABASE_ANON_KEY
   ```

3. **Importante**: o `anon key` é público e seguro — a proteção dos dados vem das **RLS policies** do Supabase

### 2.3. Criar tabelas

Acesse **SQL Editor** e execute os scripts abaixo na ordem.

#### 2.3.1. Tabela `veiculos`

```sql
CREATE TABLE veiculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  placa TEXT NOT NULL,
  modelo TEXT NOT NULL,
  marca TEXT NOT NULL,
  ano INT NOT NULL,
  cor TEXT NOT NULL,
  tipo_combustivel TEXT NOT NULL,
  capacidade_tanque NUMERIC(10,2),
  km_atual INT DEFAULT 0,
  km_medio NUMERIC(8,2) DEFAULT 0,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'manutencao')),
  foto_url TEXT,

  UNIQUE(placa, user_id)
);

ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário pode ver apenas seus veículos"
  ON veiculos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode inserir seus veículos"
  ON veiculos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário pode atualizar seus veículos"
  ON veiculos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode deletar seus veículos"
  ON veiculos FOR DELETE
  USING (auth.uid() = user_id);
```

#### 2.3.2. Tabela `motoristas`

```sql
CREATE TABLE motoristas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cpf TEXT,
  vinculo TEXT DEFAULT 'ativo' CHECK (vinculo IN ('ativo', 'afastado', 'desligado')),
  data_contratacao DATE,

  UNIQUE(cpf, user_id)
);

ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário pode ver seus motoristas"
  ON motoristas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode inserir seus motoristas"
  ON motoristas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário pode atualizar seus motoristas"
  ON motoristas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode deletar seus motoristas"
  ON motoristas FOR DELETE
  USING (auth.uid() = user_id);
```

#### 2.3.3. Tabela `postos`

```sql
CREATE TABLE postos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  contato TEXT,

  UNIQUE(nome, user_id)
);

ALTER TABLE postos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário pode ver seus postos"
  ON postos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode inserir seus postos"
  ON postos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário pode atualizar seus postos"
  ON postos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode deletar seus postos"
  ON postos FOR DELETE
  USING (auth.uid() = user_id);
```

#### 2.3.4. Tabela `abastecimentos`

```sql
CREATE TABLE abastecimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  veiculo_id UUID REFERENCES veiculos(id) ON DELETE SET NULL,
  motorista_id UUID REFERENCES motoristas(id) ON DELETE SET NULL,
  posto_id UUID REFERENCES postos(id) ON DELETE SET NULL,
  data_hora TIMESTAMPTZ DEFAULT now() NOT NULL,
  litros NUMERIC(10,2) NOT NULL,
  valor_total NUMERIC(12,2) NOT NULL,
  preco_litro NUMERIC(8,4) NOT NULL,
  tipo_combustivel TEXT NOT NULL,
  km_atual INT NOT NULL,
  km_l NUMERIC(8,2),
  forma_pagamento TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('confirmado', 'pendente', 'suspeito', 'rejeitado')),
  foto_url TEXT,
  observacao TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  registrado_por TEXT DEFAULT 'motorista'
);

ALTER TABLE abastecimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário pode ver seus abastecimentos"
  ON abastecimentos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode inserir seus abastecimentos"
  ON abastecimentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário pode atualizar seus abastecimentos"
  ON abastecimentos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode deletar seus abastecimentos"
  ON abastecimentos FOR DELETE
  USING (auth.uid() = user_id);
```

#### 2.3.5. Tabela `manutencoes`

```sql
CREATE TABLE manutencoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  veiculo_id UUID REFERENCES veiculos(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  descricao TEXT,
  data_agendada DATE,
  data_realizacao DATE,
  km_atual INT,
  km_proxima INT,
  valor NUMERIC(12,2),
  oficina TEXT,
  status TEXT DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada'))
);

ALTER TABLE manutencoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário pode ver suas manutenções"
  ON manutencoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode inserir suas manutenções"
  ON manutencoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário pode atualizar suas manutenções"
  ON manutencoes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode deletar suas manutenções"
  ON manutencoes FOR DELETE
  USING (auth.uid() = user_id);
```

#### 2.3.6. Tabela `alertas`

```sql
CREATE TABLE alertas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  severidade TEXT DEFAULT 'media' CHECK (severidade IN ('baixa', 'media', 'alta', 'critica')),
  lido BOOLEAN DEFAULT false,
  tipo TEXT,
  referencia_id UUID
);

ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário pode ver seus alertas"
  ON alertas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode atualizar seus alertas"
  ON alertas FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 2.3.7. Bucket Storage para fotos

1. Vá em **Storage** no painel do Supabase
2. Clique **New bucket**
   - **Name**: `frota-fotos`
   - **Public**: desmarcado (fotos privadas por usuário)
3. Após criar, vá na aba **Policies** do bucket
4. Adicione a política:

```sql
-- Usuário pode ver fotos de abastecimentos que ele criou
CREATE POLICY "Usuário vê suas fotos"
  ON storage.objects FOR SELECT
  USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Usuário pode fazer upload
CREATE POLICY "Usuário pode enviar fotos"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
```

### 2.4. Autenticação — provedores

1. Vá em **Authentication** > **Providers**
2. Mantenha **Email** habilitado — é o padrão para login/senha
3. (Opcional) Habilite **Google**:
   - Crie credenciais OAuth no [Google Cloud Console](https://console.cloud.google.com)
   - Cole o **Client ID** e **Client Secret** no Supabase
   - Adicione a URL de callback: `https://[seu-projeto].supabase.co/auth/v1/callback`

### 2.5. Configurar redirect URLs (importante para Vercel)

Em **Authentication** > **URL Configuration**:

- **Site URL**: `https://[seu-app].vercel.app` (adicione após o deploy)
- **Redirect URLs**:
  - `https://[seu-app].vercel.app/**`
  - `http://localhost:5173/**` (para desenvolvimento local)

---

## 3. Vercel — Configuração do Frontend

### 3.1. Preparar o repositório

No terminal, na raiz do projeto:

```bash
git init
git add -A
git commit -m "Initial commit"
```

Crie um repositório no GitHub e envie:

```bash
git remote add origin https://github.com/suaconta/fueltrack.git
git branch -M main
git push -u origin main
```

**Atenção**: verifique se `.gitignore` inclui `node_modules/`, `dist/`, e `.env.local`. O arquivo `.env.local` **nunca** deve ser versionado.

### 3.2. Deploy via Vercel

#### Opção A — CLI da Vercel (recomendado)

```bash
# Instalar o CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy a partir da pasta do app
cd apps/web
vercel --prod
```

Na primeira execução, a CLI pergunta:

| Pergunta | Resposta |
|----------|----------|
| Set up and deploy? | `Y` |
| Which scope? | selecione sua conta |
| Link to existing project? | `N` |
| Project name? | `fueltrack` |
| Directory? | `./` (já está em `apps/web`) |
| Override settings? | `N` |

#### Opção B — Dashboard Vercel (via browser)

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório do GitHub
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/web` (importante — o projeto está em monorepo)
   - **Build Command**: `npm run build` (ou `vite build`)
   - **Output Directory**: `dist`
4. Avance para configuração das variáveis

### 3.3. Variáveis de Ambiente

No Vercel (via CLI ou Dashboard), adicione:

| Variável                   | Valor                                                |
| -------------------------- | ---------------------------------------------------- |
| `VITE_SUPABASE_URL`        | `https://xxxxxxxxxxxx.supabase.co`                   |
| `VITE_SUPABASE_ANON_KEY`   | `eyJhbGciOiJIUzI1NiIsInR5cCI6Ik9...` (anon key)     |

> **Segurança**: o `anon key` é público e seguro para uso no frontend. A proteção real vem das **RLS policies** configuradas nas tabelas.

Após adicionar, clique em **Deploy**.

### 3.4. Pós-deploy — Verificar

1. Acesse a URL gerada (`https://fueltrack.vercel.app`)
2. Teste o fluxo completo:
   - Criar conta (Cadastro)
   - Login
   - Navegação entre páginas
   - Logout
3. Verifique se o redirect de autenticação funciona (após login via Supabase)

---

## 4. Domínio Personalizado (opcional)

### 4.1. Comprar ou usar domínio próprio

1. No dashboard Vercel, vá no projeto > **Settings** > **Domains**
2. Digite o domínio (ex: `fueltrack.com.br`)
3. Siga as instruções para adicionar os registros DNS no seu provedor de domínio:
   - **Opção A**: apontar o `CNAME` para `cname.vercel-dns.com`
   - **Opção B**: usar nameservers da Vercel (se desejar gerenciamento completo)

### 4.2. Atualizar redirect no Supabase

Após configurar o domínio:

1. No Supabase > **Authentication** > **URL Configuration**
2. Atualize **Site URL** para `https://www.seudominio.com.br`
3. Adicione `https://www.seudominio.com.br/**` em **Redirect URLs**

---

## 5. Variáveis de Ambiente — Local vs Produção

| Ambiente | Arquivo                        | Como criar                    |
| -------- | ------------------------------ | ----------------------------- |
| Local    | `apps/web/.env.local`          | Copiar de `.env.example`     |
| Vercel   | Dashboard > Settings > Env Vars | Adicionar manualmente        |

`.env.local` (nunca commitar):

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6Ik9...
```

---

## 6. Manutenção

### 6.1. Migrações do banco (Supabase)

Use o **SQL Editor** do Supabase para executar novos scripts. Para controle de versão, exporte o schema:

```bash
# Via CLI do Supabase
supabase db dump -f supabase/migrations/002_add_campo.sql
```

### 6.2. Atualizar o frontend

Cada push no branch `main` do GitHub dispara automaticamente um novo deploy no Vercel.

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push
```

### 6.3. Logs e monitoramento

- **Vercel**: Dashboard > Projeto > **Logs** (console do navegador + servidor)
- **Supabase**: Dashboard > **Logs** (queries lentas, erros de autenticação)

---

## 7. Troubleshooting

### 7.1. "Failed to load resource" (404 nas rotas)

**Causa**: Vite SPA precisa de redirecionamento para `index.html` em rotas desconhecidas.

**Solução**: No Vercel, crie `apps/web/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 7.2. Erro de CORS no Supabase

**Solução**: Em Supabase > **Authentication** > **Providers** > **Email**, adicione a URL do Vercel em **Redirect URLs**.

### 7.3. "User already registered" ao tentar cadastro

O Supabase bloqueia e-mails duplicados por padrão. Use **Authentication > Settings** para configurar a política de duplicates ou faça login direto.

### 7.4. Chunk size > 500 kB

Aviso esperado para SPA com Recharts. Para otimizar:

```tsx
// App.tsx — lazy loading das páginas
const Dashboard = React.lazy(() => import('@/pages/Dashboard'))
const Abastecimentos = React.lazy(() => import('@/pages/Abastecimentos'))
// ...
```

---

## Checklist Final

- [ ] Supabase: tabelas criadas com RLS policies
- [ ] Supabase: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` geradas
- [ ] Supabase: redirect URLs configurados
- [ ] Supabase: bucket storage criado
- [ ] Vercel: projeto conectado ao repositório GitHub
- [ ] Vercel: variáveis de ambiente configuradas
- [ ] Vercel: `vercel.json` com rewrites (se necessário)
- [ ] Teste: cadastro de usuário funciona
- [ ] Teste: login funciona
- [ ] Teste: rotas protegidas redirecionam para login
- [ ] Teste: logout funciona
- [ ] (Opcional) Domínio configurado e SSL ativo (Vercel fornece automaticamente)
