-- ============================================================
-- FuelTrack — Tabela de Manutenções
-- PostgreSQL 15+ (Supabase)
-- ============================================================

CREATE TABLE IF NOT EXISTS manutencoes (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  veiculo_id        UUID REFERENCES veiculos(id) ON DELETE SET NULL,
  tipo              TEXT NOT NULL CHECK (tipo IN ('preventiva', 'corretiva')),
  descricao         TEXT,
  data_agendada     DATE,
  data_realizacao   DATE,
  km_atual          INT CHECK (km_atual >= 0),
  km_proxima        INT CHECK (km_proxima IS NULL OR km_proxima >= 0),
  valor             NUMERIC(12,2) CHECK (valor IS NULL OR valor >= 0),
  oficina           TEXT,
  status            TEXT NOT NULL DEFAULT 'agendado'
                    CHECK (status IN ('agendado', 'em_andamento', 'concluido', 'cancelado'))
);

COMMENT ON TABLE manutencoes IS 'Manutenções dos veículos da frota';
COMMENT ON COLUMN manutencoes.tipo IS 'preventiva = revisão programada, corretiva = reparo não planejado';
COMMENT ON COLUMN manutencoes.status IS 'agendado, em_andamento, concluido, cancelado';
COMMENT ON COLUMN manutencoes.km_proxima IS 'KM para próxima manutenção preventiva';

-- Índices
CREATE INDEX idx_manutencoes_user ON manutencoes (user_id);
CREATE INDEX idx_manutencoes_veiculo ON manutencoes (veiculo_id);
CREATE INDEX idx_manutencoes_status ON manutencoes (user_id, status);
CREATE INDEX idx_manutencoes_data ON manutencoes (user_id, data_agendada DESC);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_manutencoes_updated_at
  BEFORE UPDATE ON manutencoes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE manutencoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê suas manutenções"
  ON manutencoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário insere suas manutenções"
  ON manutencoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza suas manutenções"
  ON manutencoes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário deleta suas manutenções"
  ON manutencoes FOR DELETE
  USING (auth.uid() = user_id);
