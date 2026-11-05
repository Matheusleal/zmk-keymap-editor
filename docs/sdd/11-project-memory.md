# 11 — Project Memory (Memória Viva)

Estado atual: Milestone 3 em andamento — TASK-013 Concluída.
Branch: `feature/planejamento-melhorias-zmk`
Última Atualização: 2026-11-05

## 1. Contexto e Decisões Ativas
- Governança SDD ativa (00 a 10). Mapeadas 19 tarefas em 5 Milestones (M1 a M5).
- Commits atômicos por task com testes verificados.
- Milestones M1 e M2 concluídos.
- `TASK-013`: Concluída com sucesso (AST Engine conectado a `loadKeymapFromDts` e `updateKeymapDts` em `api/services/zmk/keymap.js`, validado em `api/tests/ast-integration.test.js`).
- 38 testes passando.

## 2. Próximos Passos
- Comitar `TASK-013`.
- Iniciar `TASK-014` (Provedor Web File System Access API para Frontend).

## 3. Riscos e Alertas
- Sem PR automático. Fallback para Express mantido caso `showDirectoryPicker` seja indefinido.
