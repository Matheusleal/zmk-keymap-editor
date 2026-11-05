# 11 — Project Memory (Memória Viva)

Estado atual: Milestone 2 em andamento — TASK-005 Concluída.
Branch: `feature/planejamento-melhorias-zmk`
Última Atualização: 2026-11-05

## 1. Contexto e Decisões Ativas
- Governança SDD ativa (00 a 10). Mapeadas 19 tarefas em 5 Milestones (M1 a M5).
- Commits atômicos por task com testes verificados.
- `TASK-005`: Concluída com sucesso (modelo de combos, serializador Devicetree `/ { combos { ... }; };` e validação testados em `api/tests/combos.test.js`).
- 19 testes passando no suite `npm test`.

## 2. Próximos Passos
- Comitar `TASK-005`.
- Iniciar `TASK-006` (Interface visual do Gerenciador de Combos no Frontend).

## 3. Riscos e Alertas
- Sem PR automático.
