# ZMK Keymap Editor Modernization — Contexto do Projeto

Modernização da aplicação Keymap Editor para suporte integral ao ecossistema do ZMK Firmware (Combos, Macros, Conditional Layers, Home Row Mods, Encoders, Pointing e Devicetree AST não-destrutivo).

Stack: Node.js (>= 18), Express 4.x, React 17+, Devicetree (.keymap)

## Metodologia: Spec-Driven Development (plugin sdd-workflow)

A fonte da verdade é `docs/sdd/`. O código expressa a especificação, nunca a substitui.
Padrão Canônico: https://github.com/sdd-standard/spec-driven-development

- `docs/sdd/constitution.md` — princípios inegociáveis do projeto. Valide TUDO contra ela.
- `docs/sdd/` — estado atual consolidado (artefatos 00–10).
- `docs/sdd/changes/` — mudanças ativas (proposal + delta-spec + tasks).
- `docs/sdd/11-project-memory.md` — estado de salvamento entre sessões.

### Princípios Canônicos (P1 a P11)
- **P1**: A especificação é a fonte da verdade (mudança começa na spec).
- **P2**: Constitution precede a especificação (governa todas as fases).
- **P3**: A especificação deve ser viva (evolui com o software).
- **P4**: Rastreabilidade obrigatória (Intent → GEARS → DES → TASK → AC → Teste → Código).
- **P5**: Requisitos verificáveis (proibido termos vagos; use métricas observáveis).
- **P6**: Ambiguidade tratada cedo (lacunas viram `PENDENTE DE DEFINIÇÃO` + `10-validation.md`).
- **P7**: Design vem antes da execução (arquitetura e decisões antes de código).
- **P8**: Tarefas derivam dos artefatos (nenhuma task no ledger sem vínculo).
- **P9**: Validação contínua em gates (auditoria no código real antes de fechar milestone).
- **P10**: SDD não é Waterfall (especificação incremental, feedback contínuo).
- **P11**: Estado fora do chat (memória viva persistida em disco e injetada na sessão).

## Protocolo de início de sessão (OBRIGATÓRIO)

Leia nesta ordem antes de trabalhar: constitution → 11-project-memory → 10-validation → tasks Pending/In Progress. Confirme estado e próximo passo em até 5 linhas.

## Regras de execução

- Nunca implemente código sem task com Status `In Progress` rastreável a um FR/NFR.
- Atualize Status da task ao iniciar (`In Progress`) e concluir (`Done`), no mesmo turno.
- Atualize `11-project-memory.md` a cada evento (artefato aprovado, decisão travada, task mudou de status). Máx. 150 linhas, sobrescreva.
- Requisitos em GEARS: `[Where <estático>] [While <dinâmico>] [When <gatilho>] the <subject> shall <behavior>`. Keywords sempre em inglês.
- Ambiguidade → `PENDENTE DE DEFINIÇÃO` + `10-validation.md`. Nunca invente requisito crítico.
- Mudanças pós-baseline via `sdd-change`, nunca edição direta das specs.
- SEMPRE confirme com o usuário antes de instalar dependências.
- Ao fechar um milestone: execute a auditoria do gate com `sdd-validate` antes de avançar.
- Achado mecanicamente verificável e reincidente vira task de automação, nunca "verificar manualmente". Critical/High bloqueiam, salvo dívida aceita explicitamente pelo usuário.
- Achado que fica ABERTO em qualquer gate (qualquer severidade) vai para `10-validation.md` como dívida ativa. Ao resolver, mova para `archive/validation-log.md`.

