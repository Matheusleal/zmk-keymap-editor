# 11 — Project Memory (Memória Viva)

Estado atual: TASK-020 Concluída (correção de inicialização do servidor estático em npm start e fidelidade visual com upstream nickcoutsos.github.io/keymap-editor).
Branch: `feature/planejamento-melhorias-zmk`
Última Atualização: 2026-11-05

## 1. Contexto e Decisões Ativas
- Governança SDD concluída: TASK-020 finalizada com sucesso.
- `npm start` testado e validado: Express serve static files de `app/build` na porta 8080 (código 200, HTML com tema carregado).
- Interface visual fidelizada à versão canônica de produção (`nickcoutsos.github.io/keymap-editor`):
  - Sistema de temas completo (Dark / Light / System) com suporte a `prefers-color-scheme` e variáveis CSS canônicas.
  - Barra de configurações (`#settings-bar`) com botão de alternância de tema no canto superior direito e persistência em `localStorage`.
  - Abas superiores limpas para troca entre `Layers`, `Combos`, `Macros`, `Conditional Layers`, `Custom Behaviors`.
  - Estilização das teclas (keycaps) com background `--key-bg-base`, cor `--key-color-base`, bordas arredondadas e sombras suaves idênticas ao original.
  - Barra de ações superior organizada (Save, Export SVG, Firmware Build) sem poluição visual.
- 57 testes unitários e de integração passando integralmente.
- Restrição estrita mantida: NENHUM arquivo de `zmk-sofle` foi alterado.

## 2. Entregáveis do Projeto
- M1 a M5 concluídos (19 tarefas).
- TASK-020: Estabilização de npm start e fidelidade visual com nickcoutsos.github.io/keymap-editor concluída.
