# 11 — Project Memory (Memória Viva)

Estado atual: TASK-022 Concluída (Modal Canônico de Edição de Tecla com Mini-Matrix, Behavior, Parameters, Apply e Cancel).
Branch: `feature/planejamento-melhorias-zmk`
Última Atualização: 2026-11-05

## 1. Contexto e Decisões Ativas
- TASK-022 finalizada com sucesso:
  1. Componente `KeyEditModal` implementado de forma 100% fiel à imagem enviada pelo usuário:
     - Topo com mini-matriz do teclado (tecla ativa destacada em verde `#3cb371`), seta `→` e preview da keycap estilizada (`&kp ESC`).
     - Linha `Behavior` com chip `&kp | Key Press` sublinhado pontilhado clicável.
     - Seção `Parameters` com parâmetros do behavior (ex: `Key Code ESC | Escape`) sublinhados pontilhados clicáveis.
     - Botões `Apply` (verde) e `Cancel` (secundário).
     - Painel lateral integrado para seleção com busca de behaviors e keycodes via `ValuePicker`.
  2. Integrado no `KeyboardLayout.js` para ser acionado com clique em qualquer tecla do layout.
  3. 57 testes unitários e de integração passando integralmente.
  4. Build de produção React (`npm --prefix app run build`) atualizado com sucesso.
  5. Nenhuma alteração realizada em `zmk-sofle`.

## 2. Entregáveis do Projeto
- M1 a M5 concluídos (19 tarefas).
- TASK-020, TASK-021 e TASK-022 concluídas.




