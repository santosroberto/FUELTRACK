-- ============================================================
-- FuelTrack — Schema Completo do Banco de Dados
-- PostgreSQL 15+ (Supabase)
-- ============================================================
-- Este arquivo contém toda a estrutura do banco:
--   1. Extensions
--   2. Domínios personalizados (enums)
--   3. Tabelas com constraints
--   4. Relacionamentos (FKs)
--   5. Índices
--   6. Funções auxiliares (RLS helpers)
--   7. Triggers automáticos
--   8. RLS Policies
-- ============================================================

-- ################################################################
-- 1. EXTENSIONS
-- ################################################################
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";        -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "postgis";         -- geolocalização
CREATE EXTENSION IF NOT EXISTS "moddatetime";     -- updated_at automático

-- ################################################################
-- 2. DOMÍNIOS (ENUMS)
-- ################################################################
-- Decisão: Usar enums do PostgreSQL em vez de tabelas de domínio.
-- Motivo: Valores fixos e bem conhecidos; CHECK com enum evita
-- joins desnecessários para validação e garante integridade.

CREATE TYPE user_role AS ENUM ('admin', 'gestor', 'motorista');
COMMENT ON TYPE user_role IS 'Papéis do sistema: admin (dono da conta), gestor (gerencia frota), motorista (registra abastecimentos)';

CREATE TYPE tipo_combustivel AS ENUM (
  'diesel_s10', 'diesel_s500', 'gasolina_comum', 'gasolina_aditivada',
  'etanol', 'gnv', 'eletrico'
);
COMMENT ON TYPE tipo_combustivel IS 'Tipos de combustível suportados';

CREATE TYPE status_abastecimento AS ENUM ('pendente', 'confirmado', 'suspeito', 'rejeitado');
COMMENT ON TYPE status_abastecimento IS 'Status de cada abastecimento. Suspeito = anomalia detectada';

CREATE TYPE forma_pagamento AS ENUM ('dinheiro', 'credito', 'debito', 'pix', 'boleto', 'vale_combustivel', 'cheque');
COMMENT ON TYPE forma_pagamento IS 'Formas de pagamento aceitas';

CREATE TYPE tipo_alerta AS ENUM (
  'fora_perimetro', 'fora_horario', 'consumo_anomalo',
  'limite_excedido', 'km_inconsistente', 'abastecimento_duplicado'
);
COMMENT ON TYPE tipo_alerta IS 'Categorias de anomalia detectada automaticamente';

CREATE TYPE severidade_alerta AS ENUM ('baixa', 'media', 'alta', 'critica');
COMMENT ON TYPE severidade_alerta IS 'Nível de severidade do alerta';

-- ################################################################
-- 3. TABELAS
-- ################################################################

-- ---------------------------------------------------------------
-- 3.1 tenants
-- ---------------------------------------------------------------
-- Decisão: Tenant é a entidade raiz. Cada conta = um tenant.
-- Usamos slug para identificar o tenant em URLs amigáveis.
-- plano define limites de uso (veículos, motoristas, storage).
CREATE TABLE tenants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  plano       TEXT NOT NULL DEFAULT 'starter'
              CHECK (plano IN ('starter', 'growth', 'enterprise')),
  logo_url    TEXT,
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON tenants (slug);

COMMENT ON TABLE tenants IS 'Organizações/contas. Cada tenant é isolado dos demais.';
COMMENT ON COLUMN tenants.plano IS 'Plano de assinatura: starter (10 veículos), growth (50), enterprise (ilimitado)';

-- ---------------------------------------------------------------
-- 3.2 app_perfis
-- ---------------------------------------------------------------
-- Decisão: Não estendemos auth.users diretamente porque o schema
-- auth é gerenciado pelo Supabase e não devemos alterá-lo.
-- Criamos uma tabela paralela com FK para auth.users.
-- A trigger on signup cria o perfil automaticamente.
-- user_id pode ser NULL para motoristas sem usuário de sistema
-- (ex: motorista registrado pelo gestor que ainda não fez login).
CREATE TABLE app_perfis (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE ON UPDATE CASCADE,
  role        user_role NOT NULL DEFAULT 'motorista',
  nome        TEXT NOT NULL,
  email       TEXT,
  telefone    TEXT,
  avatar_url  TEXT,
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Um usuário só pode ter um perfil ativo por tenant
  UNIQUE (user_id, tenant_id)
);

CREATE INDEX idx_app_perfis_user_id ON app_perfis (user_id);
CREATE INDEX idx_app_perfis_tenant_id ON app_perfis (tenant_id);
CREATE INDEX idx_app_perfis_role ON app_perfis (tenant_id, role);

COMMENT ON TABLE app_perfis IS 'Perfis de usuário vinculados a auth.users e tenants.';
COMMENT ON COLUMN app_perfis.role IS 'Papel do usuário neste tenant';

-- ---------------------------------------------------------------
-- 3.3 veiculos
-- ---------------------------------------------------------------
-- Decisão: Placa é única por tenant (uma empresa não pode ter
-- dois veículos com a mesma placa, mas empresas diferentes podem).
-- km_atual é o odômetro mais recente, atualizado a cada abastecimento.
-- capacidade_tanque ajuda a detectar abastecimentos inconsistentes.
CREATE TABLE veiculos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE ON UPDATE CASCADE,
  placa               TEXT NOT NULL,
  marca               TEXT NOT NULL,
  modelo              TEXT NOT NULL,
  ano                 SMALLINT NOT NULL CHECK (ano >= 1990 AND ano <= EXTRACT(YEAR FROM NOW()) + 1),
  tipo_combustivel    tipo_combustivel NOT NULL,
  capacidade_tanque   NUMERIC(6,1) NOT NULL CHECK (capacidade_tanque > 0),  -- litros
  km_atual            INTEGER NOT NULL DEFAULT 0 CHECK (km_atual >= 0),
  consumo_esperado    NUMERIC(5,2),  -- km/L esperado (referência do fabricante)
  ativo               BOOLEAN NOT NULL DEFAULT TRUE,
  observacoes         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (tenant_id, placa)
);

CREATE INDEX idx_veiculos_tenant ON veiculos (tenant_id);
CREATE INDEX idx_veiculos_placa ON veiculos (tenant_id, placa);
CREATE INDEX idx_veiculos_ativo ON veiculos (tenant_id, ativo);

COMMENT ON TABLE veiculos IS 'Veículos da frota.';
COMMENT ON COLUMN veiculos.km_atual IS 'Última leitura do odômetro/horímetro';
COMMENT ON COLUMN veiculos.consumo_esperado IS 'KM/L esperado do fabricante, usado como referência para alertas';

-- ---------------------------------------------------------------
-- 3.4 motoristas
-- ---------------------------------------------------------------
-- Decisão: Motorista pode ou não ter um user_id (usuário do sistema).
-- Se tiver, pode acessar o app e registrar próprios abastecimentos.
-- Se não tiver, o gestor registra abastecimentos em nome dele.
-- CPF é único por tenant por questões fiscais.
CREATE TABLE motoristas (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  nome                TEXT NOT NULL,
  cpf                 TEXT,
  cnh                 TEXT,
  categoria_cnh       CHAR(2),
  telefone            TEXT,
  limite_litros_mes   NUMERIC(8,1) CHECK (limite_litros_mes IS NULL OR limite_litros_mes > 0),
  limite_valor_mes    NUMERIC(10,2) CHECK (limite_valor_mes IS NULL OR limite_valor_mes > 0),
  ativo               BOOLEAN NOT NULL DEFAULT TRUE,
  observacoes         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (tenant_id, cpf)
);

CREATE INDEX idx_motoristas_tenant ON motoristas (tenant_id);
CREATE INDEX idx_motoristas_user_id ON motoristas (user_id);
CREATE INDEX idx_motoristas_ativo ON motoristas (tenant_id, ativo);

COMMENT ON TABLE motoristas IS 'Motoristas cadastrados na frota.';
COMMENT ON COLUMN motoristas.limite_litros_mes IS 'Limite mensal de litros para controle de abastecimento';
COMMENT ON COLUMN motoristas.limite_valor_mes IS 'Limite mensal de valor monetário';

-- ---------------------------------------------------------------
-- 3.5 postos
-- ---------------------------------------------------------------
-- Decisão: Tabela opcional para postos pré-cadastrados pelo gestor.
-- Útil para ter preços negociados e endereços conhecidos.
-- Quando o motorista registra abastecimento, pode selecionar um
-- posto da lista ou informar manualmente.
CREATE TABLE postos (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE ON UPDATE CASCADE,
  nome              TEXT NOT NULL,
  endereco          TEXT,
  latitude          NUMERIC(10,7) CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
  longitude         NUMERIC(10,7) CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
  geom              GEOGRAPHY(POINT, 4326)
                    GENERATED ALWAYS AS (
                      CASE
                        WHEN latitude IS NOT NULL AND longitude IS NOT NULL
                        THEN ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::GEOGRAPHY
                        ELSE NULL
                      END
                    ) STORED,
  preco_diesel_s10     NUMERIC(6,3),
  preco_diesel_s500    NUMERIC(6,3),
  preco_gasolina       NUMERIC(6,3),
  preco_etanol         NUMERIC(6,3),
  preco_gnv            NUMERIC(6,3),
  ativo             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (tenant_id, nome)
);

CREATE INDEX idx_postos_tenant ON postos (tenant_id);
CREATE INDEX idx_postos_geom ON postos USING GIST (geom);

COMMENT ON TABLE postos IS 'Postos de combustível cadastrados. Preços negociados por tenant.';
COMMENT ON COLUMN postos.geom IS 'Coluna gerada automaticamente a partir de latitude/longitude para queries PostGIS';

-- ---------------------------------------------------------------
-- 3.6 abastecimentos
-- ---------------------------------------------------------------
-- Decisão: Tabela central do sistema. Cada registro é um evento
-- de abastecimento. Armazenamos dados completos para auditoria.
-- posto_nome/text armazena o nome do posto mesmo sem FK, porque
-- o motorista pode abastecer em posto não cadastrado.
-- preco_litro é calculado e armazenado para evitar inconsistências
-- em relatórios futuros (divisão por zero, etc.).
CREATE TABLE abastecimentos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE ON UPDATE CASCADE,
  veiculo_id          UUID NOT NULL REFERENCES veiculos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  motorista_id        UUID NOT NULL REFERENCES motoristas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  data_hora           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  km_atual            INTEGER NOT NULL CHECK (km_atual >= 0),
  litros              NUMERIC(8,3) NOT NULL CHECK (litros > 0),
  valor_total         NUMERIC(10,2) NOT NULL CHECK (valor_total > 0),
  preco_litro         NUMERIC(8,4) NOT NULL CHECK (preco_litro > 0),
  tipo_combustivel    tipo_combustivel NOT NULL,
  posto_nome          TEXT,
  posto_latitude      NUMERIC(10,7) CHECK (posto_latitude IS NULL OR (posto_latitude >= -90 AND posto_latitude <= 90)),
  posto_longitude     NUMERIC(10,7) CHECK (posto_longitude IS NULL OR (posto_longitude >= -180 AND posto_longitude <= 180)),
  posto_geom          GEOGRAPHY(POINT, 4326)
                      GENERATED ALWAYS AS (
                        CASE
                          WHEN posto_latitude IS NOT NULL AND posto_longitude IS NOT NULL
                          THEN ST_SetSRID(ST_MakePoint(posto_longitude, posto_latitude), 4326)::GEOGRAPHY
                          ELSE NULL
                        END
                      ) STORED,
  forma_pagamento     forma_pagamento NOT NULL,
  foto_cupom_url      TEXT,
  status              status_abastecimento NOT NULL DEFAULT 'pendente',
  motorista_app       BOOLEAN NOT NULL DEFAULT FALSE,  -- TRUE se registrado pelo motorista no app
  observacao          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_abast_tenant_data ON abastecimentos (tenant_id, data_hora DESC);
CREATE INDEX idx_abast_veiculo ON abastecimentos (tenant_id, veiculo_id, data_hora DESC);
CREATE INDEX idx_abast_motorista ON abastecimentos (tenant_id, motorista_id, data_hora DESC);
CREATE INDEX idx_abast_status ON abastecimentos (tenant_id, status);
CREATE INDEX idx_abast_posto_geom ON abastecimentos USING GIST (posto_geom);
CREATE INDEX idx_abast_created_at ON abastecimentos (tenant_id, created_at DESC);
-- Índice parcial para consultas rápidas de abastecimentos suspeitos
CREATE INDEX idx_abast_suspeitos ON abastecimentos (tenant_id, created_at DESC) WHERE status = 'suspeito';
-- Índice para consulta do último abastecimento de cada veículo
CREATE INDEX idx_abast_ultimo_km ON abastecimentos (tenant_id, veiculo_id, km_atual DESC);

COMMENT ON TABLE abastecimentos IS 'Registro central de abastecimentos. Toda transação de combustível passa por aqui.';
COMMENT ON COLUMN abastecimentos.preco_litro IS 'Preço por litro calculado (valor_total / litros). Armazenado para consistência em relatórios.';
COMMENT ON COLUMN abastecimentos.status IS 'pendente = aguardando validação, confirmado = OK, suspeito = anomalia detectada, rejeitado = gestor rejeitou';
COMMENT ON COLUMN abastecimentos.motorista_app IS 'TRUE quando o registro foi feito pelo próprio motorista no app (vs. gestor no web)';
COMMENT ON COLUMN abastecimentos.foto_cupom_url IS 'URL da foto do cupom fiscal no Supabase Storage';

-- ---------------------------------------------------------------
-- 3.7 abastecimento_fotos
-- ---------------------------------------------------------------
-- Decisão: Tabela separada para suportar múltiplas fotos por
-- abastecimento no futuro. No MVP usamos apenas a coluna
-- foto_cupom_url na tabela abastecimentos, mas já deixamos
-- a estrutura preparada.
CREATE TABLE abastecimento_fotos (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  abastecimento_id  UUID NOT NULL REFERENCES abastecimentos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  storage_path      TEXT NOT NULL,
  url               TEXT NOT NULL,
  tipo              TEXT NOT NULL DEFAULT 'cupom_fiscal'
                    CHECK (tipo IN ('cupom_fiscal', 'odometro', 'outro')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_abast_fotos_abastecimento ON abastecimento_fotos (abastecimento_id);

COMMENT ON TABLE abastecimento_fotos IS 'Fotos associadas a um abastecimento. Preparado para múltiplas fotos.';

-- ---------------------------------------------------------------
-- 3.8 alertas
-- ---------------------------------------------------------------
-- Decisão: Alertas são gerados por Edge Functions (triggers DB)
-- quando um abastecimento é inserido. O gestor pode marcar como
-- lido e resolvido. Nunca deletamos alertas — mantemos histórico.
CREATE TABLE alertas (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE ON UPDATE CASCADE,
  abastecimento_id  UUID NOT NULL REFERENCES abastecimentos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  tipo              tipo_alerta NOT NULL,
  severidade        severidade_alerta NOT NULL DEFAULT 'media',
  descricao         TEXT NOT NULL,
  valor_esperado    NUMERIC(12,2),  -- valor esperado (ex: consumo médio, limite)
  valor_encontrado  NUMERIC(12,2),  -- valor encontrado (ex: consumo registrado)
  lido              BOOLEAN NOT NULL DEFAULT FALSE,
  lido_em           TIMESTAMPTZ,
  lido_por          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolvido         BOOLEAN NOT NULL DEFAULT FALSE,
  resolvido_em      TIMESTAMPTZ,
  resolvido_por     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alertas_tenant ON alertas (tenant_id, created_at DESC);
CREATE INDEX idx_alertas_abastecimento ON alertas (abastecimento_id);
CREATE INDEX idx_alertas_nao_lidos ON alertas (tenant_id, lido, created_at DESC) WHERE lido = FALSE;
CREATE INDEX idx_alertas_severidade ON alertas (tenant_id, severidade);

COMMENT ON TABLE alertas IS 'Alertas de anomalia gerados automaticamente.';
COMMENT ON COLUMN alertas.valor_esperado IS 'Valor de referência esperado (ex: 8.5 km/L de média histórica)';
COMMENT ON COLUMN alertas.valor_encontrado IS 'Valor real que disparou o alerta (ex: 3.2 km/L)';

-- ---------------------------------------------------------------
-- 3.8 configuracoes
-- ---------------------------------------------------------------
-- Decisão: Configurações flexíveis por tenant usando chave-valor.
-- Evita criar colunas específicas para cada configuração.
-- Para configurações padrão (consultadas com frequência),
-- podemos materializar no cache da aplicação.
CREATE TABLE configuracoes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE ON UPDATE CASCADE,
  chave       TEXT NOT NULL,
  valor       JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (tenant_id, chave)
);

CREATE INDEX idx_configuracoes_tenant ON configuracoes (tenant_id);

COMMENT ON TABLE configuracoes IS 'Configurações flexíveis por tenant (chave-valor em JSONB).';

-- Inserir configurações padrão via seed ou trigger de novo tenant
-- Exemplos de chaves:
-- 'alertas.perimetro_km' → 50 (raio permitido em km)
-- 'alertas.horario_inicio' → "06:00"
-- 'alertas.horario_fim' → "22:00"
-- 'alertas.consumo_desvio_percentual' → 30 (percentual acima da média para alerta)
-- 'geral.moeda' → "BRL"
-- 'geral.unidade_distancia' → "km"

-- ---------------------------------------------------------------
-- 3.9 refresh_tokens_metadata (controle de sessão opcional)
-- ---------------------------------------------------------------
-- Decisão: Tabela auxiliar para rastrear sessões ativas por
-- dispositivo, útil para exibir "último acesso" e gerenciar
-- sessões no dashboard de segurança.
-- NOTA: Não substitui o refresh token do Supabase Auth.
CREATE TABLE sessoes_dispositivo (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  dispositivo   TEXT,       -- "Web - Chrome 125", "App Android 14"
  ip_address    INET,
  ultimo_acesso TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessoes_user ON sessoes_dispositivo (user_id, ultimo_acesso DESC);

COMMENT ON TABLE sessoes_dispositivo IS 'Controle de sessões por dispositivo para segurança.';

-- ################################################################
-- 4. RELACIONAMENTOS (Diagrama lógico)
-- ################################################################
--
-- tenants (1) ──→ (N) app_perfis
-- tenants (1) ──→ (N) veiculos
-- tenants (1) ──→ (N) motoristas
-- tenants (1) ──→ (N) postos
-- tenants (1) ──→ (N) abastecimentos
-- tenants (1) ──→ (N) alertas
-- tenants (1) ──→ (N) configuracoes
--
-- auth.users (1) ──→ (0..1) app_perfis
-- auth.users (1) ──→ (0..1) motoristas
--
-- veiculos (1) ──→ (N) abastecimentos
-- motoristas (1) ──→ (N) abastecimentos
--
-- abastecimentos (1) ──→ (N) alertas
-- abastecimentos (1) ──→ (N) abastecimento_fotos
--
-- Diagrama: https://dbdiagram.io/d/xxxxxxxx (gerar depois)

-- ################################################################
-- 5. FUNÇÕES AUXILIARES
-- ################################################################

-- ---------------------------------------------------------------
-- 5.1 current_user_profile()
-- Retorna o perfil do usuário logado (tenant_id + role).
-- Usado por todas as RLS policies para evitar repetir JOIN.
-- Decisão: Função SECURITY DEFINER para acessar auth.users
-- e app_perfis com privilégios elevados, mas retorna apenas
-- dados não sensíveis.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_profile()
RETURNS TABLE (
  user_id   UUID,
  tenant_id UUID,
  role      user_role,
  nome      TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    p.tenant_id,
    p.role,
    p.nome
  FROM app_perfis p
  WHERE p.user_id = auth.uid()
    AND p.ativo = TRUE
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION public.current_user_profile() IS 'Retorna o perfil do usuário autenticado. Usado nas RLS policies.';

-- ---------------------------------------------------------------
-- 5.2 is_admin() / is_gestor() / is_motorista()
-- Helpers para RLS policies, evitam repetir lógica.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM app_perfis
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND ativo = TRUE
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_gestor_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM app_perfis
    WHERE user_id = auth.uid()
      AND role IN ('gestor', 'admin')
      AND ativo = TRUE
  );
END;
$$;

-- ---------------------------------------------------------------
-- 5.3 current_tenant_id()
-- Retorna o tenant_id do usuário logado.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tid UUID;
BEGIN
  SELECT p.tenant_id INTO tid
  FROM app_perfis p
  WHERE p.user_id = auth.uid()
    AND p.ativo = TRUE
  LIMIT 1;
  RETURN tid;
END;
$$;

-- ################################################################
-- 6. TRIGGERS AUTOMÁTICOS
-- ################################################################

-- ---------------------------------------------------------------
-- 6.1 Atualizar updated_at automaticamente
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_app_perfis_updated_at
  BEFORE UPDATE ON app_perfis
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_veiculos_updated_at
  BEFORE UPDATE ON veiculos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_motoristas_updated_at
  BEFORE UPDATE ON motoristas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_postos_updated_at
  BEFORE UPDATE ON postos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_abastecimentos_updated_at
  BEFORE UPDATE ON abastecimentos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_configuracoes_updated_at
  BEFORE UPDATE ON configuracoes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------
-- 6.2 Criar perfil automaticamente no signup
-- Executa quando um novo usuário é criado em auth.users.
-- O trigger é no schema auth, que o Supabase gerencia.
-- Em vez disso, usamos uma Edge Function no evento
-- auth.users.on_confirmation ou criamos manualmente.
--
-- DECISÃO: Não criar trigger no schema auth (gerenciado pelo
-- Supabase, pode quebrar em updates). O fluxo será:
--   1. Usuário se cadastra (Supabase Auth)
--   2. Frontend redireciona para onboarding
--   3. Onboarding cria o tenant + app_perfil
-- Solução mais segura e controlável.
-- ---------------------------------------------------------------

-- ---------------------------------------------------------------
-- 6.3 Trigger: Validar km do abastecimento
-- Garante que o km_atual do abastecimento seja maior ou igual
-- ao último km registrado para o mesmo veículo.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validar_km_abastecimento()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  ultimo_km INTEGER;
BEGIN
  -- Busca o km do último abastecimento do mesmo veículo
  SELECT a.km_atual INTO ultimo_km
  FROM abastecimentos a
  WHERE a.veiculo_id = NEW.veiculo_id
    AND a.tenant_id = NEW.tenant_id
    AND a.id != NEW.id
  ORDER BY a.data_hora DESC
  LIMIT 1;

  -- Se encontrou um anterior, valida
  IF ultimo_km IS NOT NULL AND NEW.km_atual < ultimo_km THEN
    -- Permite salvar mas marca como suspeito
    NEW.status := 'suspeito';
    NEW.observacao := COALESCE(NEW.observacao || '; ', '') ||
      'KM inconsistente: último registro era ' || ultimo_km || ', informado ' || NEW.km_atual;
  END IF;

  -- Atualiza km_atual do veículo se for maior
  IF ultimo_km IS NULL OR NEW.km_atual > ultimo_km THEN
    UPDATE veiculos
    SET km_atual = NEW.km_atual
    WHERE id = NEW.veiculo_id
      AND tenant_id = NEW.tenant_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_km_abastecimento
  BEFORE INSERT OR UPDATE ON abastecimentos
  FOR EACH ROW EXECUTE FUNCTION public.validar_km_abastecimento();

-- ---------------------------------------------------------------
-- 6.4 Trigger: Calcular preco_litro automaticamente
-- Evita erro humano no cálculo.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calcular_preco_litro()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.preco_litro := ROUND((NEW.valor_total / NEW.litros)::NUMERIC, 4);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_calcular_preco_litro
  BEFORE INSERT OR UPDATE ON abastecimentos
  FOR EACH ROW EXECUTE FUNCTION public.calcular_preco_litro();

-- ################################################################
-- 7. RLS POLICIES
-- ################################################################
-- Decisão: RLS é a espinha dorsal da segurança. Cada policy
-- verifica tenant_id E papel do usuário. Nenhum dado cruza
-- sem essas verificações.
--
-- Regra geral:
--   Admin = acesso total no tenant
--   Gestor = CRUD nas entidades da frota
--   Motorista = INSERT próprio abastecimento, SELECT próprio histórico
-- ================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE postos ENABLE ROW LEVEL SECURITY;
ALTER TABLE abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE abastecimento_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_dispositivo ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- 7.1 tenants
-- Qualquer usuário autenticado pode ver seu próprio tenant.
-- Apenas admin pode atualizar.
-- ---------------------------------------------------------------
CREATE POLICY "Usuários veem seu próprio tenant"
  ON tenants FOR SELECT
  USING (id = current_tenant_id());

CREATE POLICY "Admin atualiza seu tenant"
  ON tenants FOR UPDATE
  USING (id = current_tenant_id() AND is_admin());

-- ---------------------------------------------------------------
-- 7.2 app_perfis
-- Usuário vê seu próprio perfil. Admin/gestor vê todos do tenant.
-- ---------------------------------------------------------------
CREATE POLICY "Usuário vê próprio perfil"
  ON app_perfis FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Gestor/admin vê perfis do tenant"
  ON app_perfis FOR SELECT
  USING (tenant_id = current_tenant_id() AND is_gestor_or_admin());

CREATE POLICY "Admin gerencia perfis do tenant"
  ON app_perfis FOR INSERT
  WITH CHECK (tenant_id = current_tenant_id() AND is_admin());

CREATE POLICY "Admin atualiza perfis do tenant"
  ON app_perfis FOR UPDATE
  USING (tenant_id = current_tenant_id() AND is_admin());

CREATE POLICY "Admin remove perfis do tenant"
  ON app_perfis FOR DELETE
  USING (tenant_id = current_tenant_id() AND is_admin());

-- ---------------------------------------------------------------
-- 7.3 veiculos
-- Gestor/admin faz CRUD. Motorista vê veículos ativos do tenant
-- (para selecionar no abastecimento).
-- ---------------------------------------------------------------
CREATE POLICY "Gestor/admin gerencia veículos"
  ON veiculos FOR ALL
  USING (tenant_id = current_tenant_id() AND is_gestor_or_admin())
  WITH CHECK (tenant_id = current_tenant_id() AND is_gestor_or_admin());

CREATE POLICY "Motorista vê veículos ativos"
  ON veiculos FOR SELECT
  USING (tenant_id = current_tenant_id() AND ativo = TRUE);

-- ---------------------------------------------------------------
-- 7.4 motoristas
-- Gestor/admin faz CRUD. Motorista vê apenas próprio perfil.
-- ---------------------------------------------------------------
CREATE POLICY "Gestor/admin gerencia motoristas"
  ON motoristas FOR ALL
  USING (tenant_id = current_tenant_id() AND is_gestor_or_admin())
  WITH CHECK (tenant_id = current_tenant_id() AND is_gestor_or_admin());

CREATE POLICY "Motorista vê próprio perfil"
  ON motoristas FOR SELECT
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------
-- 7.5 postos
-- Gestor/admin gerencia. Motorista consulta.
-- ---------------------------------------------------------------
CREATE POLICY "Gestor/admin gerencia postos"
  ON postos FOR ALL
  USING (tenant_id = current_tenant_id() AND is_gestor_or_admin())
  WITH CHECK (tenant_id = current_tenant_id() AND is_gestor_or_admin());

CREATE POLICY "Motorista consulta postos"
  ON postos FOR SELECT
  USING (tenant_id = current_tenant_id());

-- ---------------------------------------------------------------
-- 7.6 abastecimentos (tabela mais sensível)
-- Motorista: INSERT próprio, SELECT próprio
-- Gestor/admin: tudo no tenant
-- ---------------------------------------------------------------
CREATE POLICY "Motorista insere próprio abastecimento"
  ON abastecimentos FOR INSERT
  WITH CHECK (
    tenant_id = current_tenant_id()
    AND motorista_id IN (
      SELECT id FROM motoristas
      WHERE user_id = auth.uid()
        AND tenant_id = current_tenant_id()
        AND ativo = TRUE
    )
  );

CREATE POLICY "Motorista vê próprios abastecimentos"
  ON abastecimentos FOR SELECT
  USING (
    tenant_id = current_tenant_id()
    AND motorista_id IN (
      SELECT id FROM motoristas
      WHERE user_id = auth.uid()
        AND tenant_id = current_tenant_id()
    )
  );

CREATE POLICY "Gestor/admin gerencia abastecimentos"
  ON abastecimentos FOR ALL
  USING (tenant_id = current_tenant_id() AND is_gestor_or_admin())
  WITH CHECK (tenant_id = current_tenant_id() AND is_gestor_or_admin());

-- ---------------------------------------------------------------
-- 7.7 abastecimento_fotos
-- Mesma lógica de abastecimentos (herda tenant via FK indireta).
-- ---------------------------------------------------------------
CREATE POLICY "Motorista vê fotos dos próprios abastecimentos"
  ON abastecimento_fotos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM abastecimentos a
      JOIN motoristas m ON m.id = a.motorista_id
      WHERE a.id = abastecimento_fotos.abastecimento_id
        AND m.user_id = auth.uid()
        AND a.tenant_id = current_tenant_id()
    )
  );

CREATE POLICY "Gestor/admin gerencia fotos"
  ON abastecimento_fotos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM abastecimentos a
      WHERE a.id = abastecimento_fotos.abastecimento_id
        AND a.tenant_id = current_tenant_id()
        AND is_gestor_or_admin()
    )
  );

-- ---------------------------------------------------------------
-- 7.8 alertas
-- Gestor/admin vê e gerencia. Motorista vê alertas relacionados
-- aos seus próprios abastecimentos.
-- ---------------------------------------------------------------
CREATE POLICY "Gestor/admin gerencia alertas"
  ON alertas FOR ALL
  USING (tenant_id = current_tenant_id() AND is_gestor_or_admin())
  WITH CHECK (tenant_id = current_tenant_id() AND is_gestor_or_admin());

CREATE POLICY "Motorista vê alertas dos próprios abastecimentos"
  ON alertas FOR SELECT
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM abastecimentos a
      JOIN motoristas m ON m.id = a.motorista_id
      WHERE a.id = alertas.abastecimento_id
        AND m.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------
-- 7.9 configuracoes
-- Admin lê e escreve. Gestor lê.
-- ---------------------------------------------------------------
CREATE POLICY "Admin gerencia configurações"
  ON configuracoes FOR ALL
  USING (tenant_id = current_tenant_id() AND is_admin())
  WITH CHECK (tenant_id = current_tenant_id() AND is_admin());

CREATE POLICY "Gestor lê configurações"
  ON configuracoes FOR SELECT
  USING (tenant_id = current_tenant_id() AND is_gestor_or_admin());

-- ---------------------------------------------------------------
-- 7.10 sessoes_dispositivo
-- Usuário vê próprias sessões. Admin vê todas do tenant.
-- ---------------------------------------------------------------
CREATE POLICY "Usuário vê próprias sessões"
  ON sessoes_dispositivo FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admin vê sessões do tenant"
  ON sessoes_dispositivo FOR SELECT
  USING (tenant_id = current_tenant_id() AND is_admin());

-- ################################################################
-- 8. CONSIDERAÇÕES FINAIS
-- ################################################################
--
-- Por que UUID em vez de SERIAL?
--   - Evita enumeração de recursos (segurança)
--   - Facilita migrações e merge de dados
--   - Supabase/npm uuid suportam nativamente
--
-- Por que PostGIS em vez de colunas lat/lng separadas?
--   - Consultas geoespaciais eficientes (ST_DWithin, ST_Distance)
--   - Cálculo de distância para alertas de perímetro
--   - Encontrar postos próximos em raio de X km
--
-- Por que ON DELETE RESTRICT em abastecimentos?
--   - Abastecimento é um registro contábil/fiscal
--   - Não pode sumir se veículo ou motorista for deletado
--   - Gestor deve inativar (ativo=false) em vez de deletar
--
-- Por que GENERATED ALWAYS AS (STORED) para colunas geom?
--   - Evita inconsistência entre lat/lng e o ponto geográfico
--   - Não ocupa espaço extra significativo
--   - Consultas PostGIS funcionam sem triggers
--
-- Por que JSONB em configuracoes?
--   - Flexibilidade total sem ALTER TABLE para cada config
--   - Suporte a índices GIN se necessário no futuro
--   - Cada tenant pode ter configurações diferentes
--
-- E as migrations futuras?
--   - Nomear como 00002_*, 00003_* etc.
--   - Sempre ALTER TABLE, nunca DROP + CREATE em produção
--   - Usar Supabase CLI para gerenciar migrations

-- ################################################################
-- FIM DO SCHEMA
-- ################################################################
