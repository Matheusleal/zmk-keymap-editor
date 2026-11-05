# 11 — Project Memory (Memória Viva)

Estado atual: TASK-023 Concluída (Fidelidade canônica integral da UI com nickcoutsos.github.io/keymap-editor e parser local robusto).
Branch: `feature/planejamento-melhorias-zmk`
Última Atualização: 2026-11-05

## 1. Contexto e Decisões Ativas
- TASK-023 concluída:
  1. Parser client-side (`app/src/parsers/keymapParser.js`) refatorado com contagem de chaves e extração de nós. Validado contra `eyelash_sofle.keymap` (3 camadas completas, 64 teclas cada, bindings e sensor-bindings preservados).
  2. Modal de edição de teclas (`KeyEditModal.js` e `KeyEditModal.module.css`) alinhado com o design canônico do `BindingEditor`:
     - Mini-matriz proporcional com a tecla ativa em `#3cb371`.
     - Seta e preview da keycap com tipografia oficial.
     - Slots de `Behavior` e `Parameters` pontilhados clicáveis com efeito hover suave.
     - Painel lateral acoplado com `border-left`, aba vertical `Close`, campo `Search...` com navegação por teclado (Enter, Escape, ArrowUp, ArrowDown) e lista estilizada com scrollbar escura.
     - Botões `Apply` e `Cancel` com cores oficiais.
  3. Estilo e fidelidade visual unificados (59 testes passando, build de produção gerado com sucesso).
  4. Nenhuma alteração salva em `D:\Projects\github\mine\Matheusleal\zmk-sofle`.

## 2. Entregáveis do Projeto
- M1 a M5 concluídos (19 tarefas).
- TASK-020 a TASK-023 concluídas.
- 59 testes unitários e de integração passando.
