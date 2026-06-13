export type StatusAbastecimento = 'confirmado' | 'pendente' | 'suspeito' | 'rejeitado'
export type TipoCombustivel = 'Diesel S10' | 'Diesel S500' | 'Gasolina Comum' | 'Etanol' | 'GNV' | 'Elétrico'
export type FormaPagamento = 'Vale Combustível' | 'Cartão Crédito' | 'Cartão Débito' | 'Dinheiro' | 'Pix'
export type StatusManutencao = 'agendada' | 'em_andamento' | 'concluida' | 'cancelada'
export type TipoManutencao = 'Revisão' | 'Troca de Óleo' | 'Pneus' | 'Freios' | 'Suspensão' | 'Motor' | 'Elétrica' | 'Outro'
export type VinculoMotorista = 'ativo' | 'afastado' | 'desligado'

export interface Abastecimento {
  id: string
  data_hora: string
  veiculo_placa: string
  veiculo_nome: string
  motorista: string
  litros: number
  valor_total: number
  preco_litro: number
  tipo_combustivel: string
  km_atual: number
  km_l: number
  posto_nome: string
  posto_endereco: string
  forma_pagamento: string
  status: StatusAbastecimento
  foto_url: string | null
  observacao: string | null
  registrado_por: string
}

export interface Veiculo {
  id: string
  placa: string
  modelo: string
  marca: string
  ano: number
  cor: string
  tipo_combustivel: string
  capacidade_tanque: number
  km_atual: number
  km_medio: number
  status: 'ativo' | 'inativo' | 'manutencao'
  foto_url: string | null
}

export interface Manutencao {
  id: string
  veiculo_placa: string
  veiculo_nome: string
  tipo: string
  descricao: string
  data_agendada: string
  data_realizacao: string | null
  km_atual: number
  km_proxima: number | null
  valor: number
  oficina: string
  status: StatusManutencao
}

export interface Despesa {
  id: string
  data: string
  descricao: string
  categoria: string
  veiculo_placa: string
  valor: number
  tipo: string
}
