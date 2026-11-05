# 11 — Project Memory (Memória Viva)

Estado atual: Todos os 5 Milestones (M1 a M5) e 19 tarefas concluídos com sucesso.
Branch: `feature/planejamento-melhorias-zmk`
Última Atualização: 2026-11-05

## 1. Contexto e Decisões Ativas
- Governança SDD concluída integralmente (19 de 19 tarefas finalizadas).
- Commits atômicos por task com testes unitários e de integração verificados em cada etapa.
- Todos os Gates (M1, M2, M3, M4, M5) validados e aprovados.
- 54 testes unitários e de integração passando em `npm test`.
- Build de produção React (`npm --prefix app run build`) 100% íntegro.
- `TASK-019`: Concluída (Gerador e exportador de diagramas SVG estilo Keymap Drawer).
- Nenhum PR aberto, respeitando a instrução explícita do usuário.

## 2. Entregáveis do Projeto
- M1: Metadados ZMK atualizados (&out, &bt BT_CLR_ALL/BT_DISC, &sys_reset, &soft_off, &kt, RGB_COLOR_HSB, keycodes modernos).
- M2: Funcionalidades centrais ZMK (Combos, Macros timeline, Conditional Layers, Custom Behaviors para Home Row Mods).
- M3: Motor AST Devicetree não-destrutivo e Web File System Access API para manipulação local direta.
- M4: Periféricos e Pointing (Rotary Encoders sensor-bindings e mouse keys &mkp, &mmv, &msc).
- M5: Pipeline de firmware e exportação (GitHub Actions run polling + download .uf2, gerador de diagramas SVG).
