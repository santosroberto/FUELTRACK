import { supabase } from './client'

export interface VeiculoDB {
  id: string
  user_id: string
  placa: string
  marca: string
  modelo: string
  ano: number
  tipo_combustivel: string
  capacidade_tanque: number | null
  km_atual: number
  ativo: boolean
  observacoes: string | null
  created_at: string
  updated_at: string
}

export interface MotoristaDB {
  id: string
  user_id: string
  nome: string
  email: string | null
  telefone: string | null
  cpf: string | null
  vinculo: string
  data_contratacao: string | null
  created_at: string
  updated_at: string
}

export interface PostoDB {
  id: string
  user_id: string
  nome: string
  endereco: string | null
  cidade: string | null
  estado: string | null
  latitude: number | null
  longitude: number | null
  contato: string | null
  created_at: string
  updated_at: string
}

export interface AbastecimentoDB {
  id: string
  user_id: string
  veiculo_id: string
  motorista_id: string
  posto_id: string | null
  data_hora: string
  km_atual: number
  litros: number
  valor_total: number
  preco_litro: number
  tipo_combustivel: string
  forma_pagamento: string
  km_l: number | null
  status: string
  foto_url: string | null
  observacao: string | null
  posto_nome: string | null
  latitude: number | null
  longitude: number | null
  registrado_por: string
  created_at: string
  updated_at: string
}

export interface ManutencaoDB {
  id: string
  user_id: string
  veiculo_id: string
  tipo: string
  descricao: string | null
  data_agendada: string | null
  data_realizacao: string | null
  km_atual: number | null
  km_proxima: number | null
  valor: number | null
  oficina: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface AlertaDB {
  id: string
  user_id: string
  titulo: string
  mensagem: string
  severidade: string
  lido: boolean
  tipo: string | null
  referencia_id: string | null
  created_at: string
}

// ---- Veículos ----

export async function fetchVeiculos(userId: string) {
  const { data, error } = await supabase
    .from('veiculos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as VeiculoDB[]
}

export async function createVeiculo(userId: string, fields: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('veiculos')
    .insert({ ...fields, user_id: userId } as never)
    .select()
    .single()
  if (error) throw error
  return data as unknown as VeiculoDB
}

export async function updateVeiculo(id: string, fields: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('veiculos')
    .update(fields as never)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as unknown as VeiculoDB
}

// ---- Motoristas ----

export async function fetchMotoristas(userId: string) {
  const { data, error } = await supabase
    .from('motoristas')
    .select('*')
    .eq('user_id', userId)
    .order('nome')
  if (error) throw error
  return (data ?? []) as unknown as MotoristaDB[]
}

export async function createMotorista(userId: string, fields: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('motoristas')
    .insert({ ...fields, user_id: userId } as never)
    .select()
    .single()
  if (error) throw error
  return data as unknown as MotoristaDB
}

export async function updateMotorista(id: string, fields: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('motoristas')
    .update(fields as never)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as unknown as MotoristaDB
}

export async function deleteMotorista(id: string) {
  const { error } = await supabase.from('motoristas').delete().eq('id', id)
  if (error) throw error
}

// ---- Postos ----

export async function fetchPostos(userId: string) {
  const { data, error } = await supabase
    .from('postos')
    .select('*')
    .eq('user_id', userId)
    .order('nome')
  if (error) throw error
  return (data ?? []) as unknown as PostoDB[]
}

export async function createPosto(userId: string, fields: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('postos')
    .insert({ ...fields, user_id: userId } as never)
    .select()
    .single()
  if (error) throw error
  return data as unknown as PostoDB
}

export async function updatePosto(id: string, fields: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('postos')
    .update(fields as never)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as unknown as PostoDB
}

// ---- Abastecimentos ----

export async function fetchAbastecimentos(userId: string) {
  const { data, error } = await supabase
    .from('abastecimentos')
    .select('*, veiculos(placa, modelo), motoristas(nome), postos(nome, endereco)')
    .eq('user_id', userId)
    .order('data_hora', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as (AbastecimentoDB & {
    veiculos: { placa: string; modelo: string } | null
    motoristas: { nome: string } | null
    postos: { nome: string; endereco: string } | null
  })[]
}

export async function createAbastecimento(userId: string, fields: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('abastecimentos')
    .insert({
      ...fields,
      user_id: userId,
      registrado_por: 'gestor',
      status: 'pendente',
    } as never)
    .select()
    .single()
  if (error) throw error
  return data as unknown as AbastecimentoDB
}

// ---- Manutenções ----

export async function fetchManutencoes(userId: string) {
  const { data, error } = await supabase
    .from('manutencoes')
    .select('*, veiculos(placa, modelo)')
    .eq('user_id', userId)
    .order('data_agendada', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as (ManutencaoDB & {
    veiculos: { placa: string; modelo: string } | null
  })[]
}

export async function createManutencao(userId: string, fields: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('manutencoes')
    .insert({ ...fields, user_id: userId } as never)
    .select()
    .single()
  if (error) throw error
  return data as unknown as ManutencaoDB
}

export async function updateManutencao(id: string, fields: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('manutencoes')
    .update(fields as never)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as unknown as ManutencaoDB
}

export async function deleteManutencao(id: string) {
  const { error } = await supabase.from('manutencoes').delete().eq('id', id)
  if (error) throw error
}

// ---- Alertas ----

export async function fetchAlertas(userId: string) {
  const { data, error } = await supabase
    .from('alertas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as AlertaDB[]
}

export async function marcarAlertaLido(id: string, lido: boolean) {
  const { error } = await supabase
    .from('alertas')
    .update({ lido } as never)
    .eq('id', id)
  if (error) throw error
}

export async function deleteAlerta(id: string) {
  const { error } = await supabase.from('alertas').delete().eq('id', id)
  if (error) throw error
}
