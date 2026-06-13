# FuelTrack — Análise de Produto

## 1. Objetivo do Produto

FuelTrack é um SaaS de gerenciamento de abastecimento e consumo de combustível para frotas. Seu objetivo central é fornecer visibilidade completa sobre gastos com combustível, controlar abastecimentos em tempo real, detectar anomalias e otimizar o custo operacional da frota.

## 2. Problema que Resolve

- **Descontrole financeiro**: Empresas com frota perdem milhões por não saberem exatamente quanto, onde e quando cada veículo abastece.
- **Fraude e roubo de combustível**: Abastecimentos não autorizados, desvio de combustível e diferenças entre litros pagos e litros efetivamente utilizados.
- **Planilhas manuais**: Muitas empresas ainda usam Excel ou papel, sujeito a erro humano e sem dados em tempo real.
- **Falta de indicadores**: Sem métricas de consumo (km/L, custo por km, etc.) é impossível tomar decisões baseadas em dados.
- **Dificuldade na prestação de contas**: Gestores perdem tempo consolidando informações de múltiplas fontes (postos, cartões, motoristas).

## 3. Público-alvo

| Segmento | Exemplos |
|---|---|
| Transportadoras e logística | Frotas de caminhões, entregas urbanas |
| Empresas com frota leve | Vendas externas, equipe de campo |
| Agronegócio | Frotas de tratores, colheitadeiras, caminhões |
| Construção civil | Frotas de máquinas pesadas, caminhões basculantes |
| Mobilidade urbana | Táxis, aplicativos de transporte, frotas municipais |
| Oficinas e gestoras de frota | Terceirizadas que gerenciam frotas de clientes |

**Persona primária**: João, 42 anos, gestor de frota de uma transportadora com 50 veículos. Precisa controlar custos, evitar fraudes e gerar relatórios para a diretoria.

## 4. Requisitos Funcionais

### Módulo de Abastecimento
- RF01 — Registrar abastecimento (data, horário, veículo, motorista, posto, tipo de combustível, litros, valor total, km/horímetro, forma de pagamento)
- RF02 — Permitir abastecimento por motorista via app mobile
- RF03 — Foto do cupom fiscal como comprovante
- RF04 — Georreferenciamento do posto no momento do abastecimento
- RF05 — Alertar abastecimento fora do horário/perímetro autorizado
- RF06 — Integração com bombas de posto (via API)

### Módulo de Veículos
- RF07 — Cadastro de veículos (placa, marca, modelo, ano, tipo de combustível, capacidade do tanque)
- RF08 — Histórico completo de abastecimentos por veículo
- RF09 — Metas de consumo (km/L esperado por veículo)

### Módulo de Motoristas
- RF10 — Cadastro de motoristas (nome, CPF, CNH, telefone)
- RF11 — Limite de abastecimento por motorista (valor/litros por período)
- RF12 — Ranking de eficiência de motoristas

### Módulo de Relatórios e Dashboard
- RF13 — Dashboard com indicadores-chave (gasto total, consumo médio, custo por km)
- RF14 — Relatórios exportáveis (PDF, CSV, Excel)
- RF15 — Comparativo de postos (menor preço por região)
- RF16 — Detecção de anomalias (consumo muito acima da média)

### Módulo Administrativo
- RF17 — Cadastro de postos de confiança com preços negociados
- RF18 — Gestão de usuários e permissões (admin, gestor, motorista)
- RF19 — Múltiplas frotas (uma conta pode ter várias subfrotas)
- RF20 — Notificações por e-mail/WhatsApp (alertas de fraude, abastecimento fora do comum)

## 5. Requisitos Não Funcionais

| Categoria | Requisito |
|---|---|
| **Segurança** | Autenticação via JWT/OAuth 2.0, dados criptografados em repouso (AES-256) e em trânsito (TLS 1.3) |
| **Disponibilidade** | 99.5% de uptime (exceto manutenção programada) |
| **Performance** | Dashboard deve carregar em < 2s para frotas de até 500 veículos |
| **Escalabilidade** | Arquitetura em nuvem (AWS/Azure) com auto-scaling horizontal |
| **Mobile** | App responsivo para Android e iOS (PWA ou nativo), funcionando offline para registro de abastecimento |
| **Integração** | API RESTful documentada (OpenAPI/Swagger) para integração com ERPs, TMS e sistemas contábeis |
| **Conformidade** | LGPD (Lei Geral de Proteção de Dados) — consentimento, anonimização, direito de exclusão |
| **Backup** | Backup diário automático com retenção de 90 dias |
| **Multi-tenancy** | Isolamento lógico entre contas (database por tenant ou schema separado) |
| **Responsividade** | Interface adaptável a desktop, tablet e mobile |

## 6. Casos de Uso

### CDU-01: Registrar Abastecimento
- **Ator**: Motorista
- **Pré-condição**: Motorista logado no app, veículo vinculado
- **Fluxo principal**:
  1. Motorista abre o app e seleciona "Novo Abastecimento"
  2. Sistema identifica automaticamente o veículo e motorista
  3. Motorista informa: km atual, litros, valor total, tipo de combustível
  4. Motorista fotografa o cupom fiscal
  5. Sistema captura geolocalização do posto
  6. Sistema valida os dados e registra o abastecimento
  7. Sistema verifica regras (limite, horário, perímetro)
  8. Abastecimento é confirmado
- **Pós-condição**: Abastecimento registrado e disponível no dashboard

### CDU-02: Detectar Abastecimento Anômalo
- **Ator**: Sistema (automático)
- **Pré-condição**: Abastecimento registrado
- **Fluxo principal**:
  1. Sistema calcula consumo (km/L) do último abastecimento
  2. Compara com a média histórica do veículo
  3. Se consumo for 30% acima da média, gera alerta
  4. Notifica gestor por e-mail/notificação push
  5. Marca abastecimento como "suspeito" para revisão
- **Pós-condição**: Gestor notificado para investigar

### CDU-03: Gerar Relatório de Gasto Mensal
- **Ator**: Gestor
- **Pré-condição**: Gestor logado, dados de abastecimento do período existentes
- **Fluxo principal**:
  1. Gestor acessa "Relatórios"
  2. Seleciona período (mês corrente)
  3. Filtra por veículo, motorista ou posto (opcional)
  4. Sistema processa e exibe tabela com gasto total, litros, média de preço, km/L
  5. Gestor clica em "Exportar PDF"
  6. Sistema gera PDF com gráficos e tabela
- **Pós-condição**: Relatório salvo/disponível para download

### CDU-04: Cadastrar Veículo
- **Ator**: Gestor/Admin
- **Pré-condição**: Usuário com permissão de administrador
- **Fluxo principal**:
  1. Acessa "Veículos > Novo Veículo"
  2. Preenche placa, marca, modelo, ano, tipo de combustível, capacidade do tanque
  3. Sistema valida placa (formato Mercosul ou brasileiro)
  4. Veículo é cadastrado
- **Pós-condição**: Veículo disponível para associação a motoristas e registro de abastecimentos

## 7. Fluxo do Usuário

### Jornada do Motorista (App Mobile)
```
Login → Dashboard do Motorista → Novo Abastecimento
                                    ↓
                              Informa km + litros + valor
                                    ↓
                              Foto do cupom fiscal
                                    ↓
                              Geolocalização automática
                                    ↓
                              Confirma → Abastecimento Registrado
                                    ↓
                              Histórico de abastecimentos
```

### Jornada do Gestor (Web)
```
Login → Dashboard Geral
         ├── Visão Geral (gasto total, consumo médio, economia)
         ├── Frotas → seleciona frota → detalhamento por veículo
         ├── Abastecimentos → lista com filtros (data, veículo, motorista)
         │     └── Clica em um → detalhes + foto do cupom
         ├── Alertas → lista de abastecimentos suspeitos
         │     └── Aprovar / Rejeitar / Investigar
         └── Relatórios → seleciona período → exporta PDF/Excel
```

### Jornada de Onboarding
```
Cadastro da conta (e-mail, senha, empresa)
  → Configuração inicial (criar frota, adicionar veículos, cadastrar motoristas)
  → Convite para motoristas (link de acesso ao app)
  → Primeiro abastecimento registrado
  → Dashboard populado com dados
```

## 8. Funcionalidades MVP

1. **Cadastro e autenticação** (multi-tenancy básico)
2. **Registro de abastecimento** (manual com foto do cupom)
3. **Cadastro de veículos e motoristas**
4. **Dashboard básico** (gasto total por período, consumo por veículo)
5. **Geolocalização do posto** no momento do abastecimento
6. **Alertas de fraude** (abastecimento fora do perímetro ou horário)
7. **Relatório exportável** em CSV
8. **App mobile (PWA)** para motoristas registrarem abastecimento
9. **Gestão de usuários** com papéis (admin, gestor, motorista)

## 9. Funcionalidades Futuras

| Prioridade | Funcionalidade |
|---|---|
| P1 | Integração com cartões de combustível (ValeCard, Ticket Log, Sodexo) |
| P1 | Integração com telemetria (Sascar, Onixsat, Maxtrack) — km automático |
| P1 | App nativo Android/iOS com suporte offline |
| P2 | Módulo de manutenção (controle de revisões, pneus, peças) |
| P2 | OCR da nota fiscal (leitura automática dos dados do cupom) |
| P2 | Relatórios avançados (comparativo posto a posto, tendências) |
| P2 | Ranking de eficiência de motoristas com gamificação |
| P3 | Integração com ERPs (Oracle, SAP, Totvs, Conta Azul) |
| P3 | Precificação inteligente (sugestão do posto mais barato na rota) |
| P3 | Dashboard white-label para revenda do sistema |
| P3 | Suporte a múltiplos combustíveis (diesel S10/S500, gasolina, etanol, GNV, elétrico) |

## 10. Roadmap do Projeto

### Fase 1 — MVP (2–3 meses)
- Setup da arquitetura (frontend web + API + banco + identidade)
- Cadastro e autenticação
- CRUD de veículos, motoristas, abastecimentos
- Dashboard básico com indicadores
- App PWA para motoristas
- Geolocalização e alertas de fraude
- Relatório CSV
- **Entrega**: Versão beta para 5 clientes piloto

### Fase 2 — Validação e Ajustes (1 mês)
- Feedback dos clientes piloto
- Correção de bugs
- Melhorias de UX
- Otimização de performance
- **Marco**: 10 clientes pagantes

### Fase 3 — Integrações (2 meses)
- Integração com cartões de combustível (API dos principais fornecedores)
- Integração com telemetria (Sascar, Onixsat)
- App nativo Android/iOS
- **Marco**: 50 clientes pagantes

### Fase 4 — Expansão (2 meses)
- Módulo de manutenção
- OCR de notas fiscais
- Relatórios avançados
- Ranking de motoristas
- **Marco**: 100 clientes pagantes

### Fase 5 — Enterprise (contínuo)
- Integração com ERPs
- White-label
- Precificação inteligente
- Suporte a múltiplos combustíveis/elétricos
- **Marco**: 500+ clientes pagantes

---

**Documento gerado em:** Junho/2026
**Autor:** Análise gerada por IA assistida — revisar antes de implementar.
