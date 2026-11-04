# 11 — Project Memory (Memória Viva)

Estado atual: Milestone 1 em andamento — TASK-001 Concluída.
Branch: `feature/planejamento-melhorias-zmk`
Última Atualização: 2026-11-04

## 1. Contexto e Decisões Ativas
- O repositório foi analisado com base no relatório de auditoria `docs/melhorias-zmk.md`.
- Governança SDD ativa (00 a 10). Mapeadas 19 tarefas em 5 Milestones (M1 a M5).
- Autorizado pelo usuário: commits atômicos por task, testes garantidos, sem PR ao final.
- `TASK-001`: Concluída com sucesso (correções de OUT_USB/OUT_BLE e adição de BT_DISC/BT_CLR_ALL com testes unitários em `api/tests/zmk-behaviors.test.js`).

## 2. Próximos Passos
- Comitar `TASK-001`.
- Iniciar `TASK-002` (&sys_reset, &soft_off, &kt, RGB_COLOR_HSB).

## 3. Riscos e Alertas
- Sem PR automático.
- Manter compatibilidade com formatos legados.
