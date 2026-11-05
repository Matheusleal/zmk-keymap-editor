# 11 — Project Memory (Memória Viva)

Estado atual: Milestone 2 Concluído com Sucesso — Iniciando Milestone 3.
Branch: `feature/planejamento-melhorias-zmk`
Última Atualização: 2026-11-05

## 1. Contexto e Decisões Ativas
- Governança SDD ativa (00 a 10). Mapeadas 19 tarefas em 5 Milestones (M1 a M5).
- Commits atômicos por task com testes verificados.
- Milestones M1 e M2 concluídos: 10 tarefas concluídas (TASK-001 a TASK-010).
- 28 testes unitários passando em `api/tests/`. Build de frontend validado.

## 2. Próximos Passos
- Comitar `TASK-010`.
- Iniciar Milestone 3 (Devicetree AST Engine & Web File System): `TASK-011` (Parser Léxico e AST de Devicetree).

## 3. Riscos e Alertas
- Preservação estrita de nós desconhecidos, comentários e pré-processador (#include, #define) via DTS AST (Constitution §1 e §3).
- Sem PR automático.
