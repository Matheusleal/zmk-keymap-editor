# 11 — Project Memory (Memória Viva)

Estado atual: Milestone 1 em andamento — TASK-002 Concluída.
Branch: `feature/planejamento-melhorias-zmk`
Última Atualização: 2026-11-04

## 1. Contexto e Decisões Ativas
- Governança SDD ativa (00 a 10). Mapeadas 19 tarefas em 5 Milestones (M1 a M5).
- Commits atômicos por task com testes verificados.
- `TASK-001`: Concluída e comitada.
- `TASK-002`: Concluída com sucesso (&sys_reset, &soft_off, &kt, RGB_COLOR_HSB adicionados e validados em `api/tests/zmk-behaviors.test.js`).

## 2. Próximos Passos
- Comitar `TASK-002`.
- Iniciar `TASK-003` (sincronização de keycodes em `zmk-keycodes.json`).

## 3. Riscos e Alertas
- Sem PR automático. Manter compatibilidade com `&reset` legado.
