# 11 — Project Memory (Memória Viva)

Estado atual: TASK-024 Concluída (Correção de clique no texto das teclas e centralização dos modais).
Branch: `feature/planejamento-melhorias-zmk`
Última Atualização: 2026-11-05

## 1. Contexto e Decisões Ativas
- TASK-024 concluída:
  1. Clique em teclas: `Key.js` agora verifica existência do método `stopPropagation` antes de invocar e os elementos de texto internos (`.params`, `.param`, `.code`, `.behaviour-binding`) receberam `pointer-events: none` em `styles.module.css`. Clicar em qualquer ponto da keycap (seja no centro do texto ou nas bordas) dispara diretamente o handler e abre o popup de edição com 100% de confiabilidade.
  2. Centralização de modais: corrigida a propriedade CSS `justifyContent` (inválida em arquivos `.module.css`) para a sintaxe padrão `justify-content: center` em `Combos`, `Macros`, `ConditionalLayers` e `CustomBehaviors`. Todos os modais passam a abrir rigorosamente centralizados na tela em qualquer resolução.
  3. 59 testes unitários e de integração passando e build de produção gerado limpo.

## 2. Entregáveis do Projeto
- M1 a M5 concluídos (19 tarefas).
- TASK-020 a TASK-024 concluídas.
- 59 testes unitários e de integração passando.
