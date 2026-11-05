# 11 — Project Memory (Memória Viva)

Estado atual: TASK-021 Concluída (redesenho da Welcome Page com cards e informações contextuais do teclado ativo).
Branch: `feature/planejamento-melhorias-zmk`
Última Atualização: 2026-11-05

## 1. Contexto e Decisões Ativas
- TASK-021 finalizada com sucesso:
  1. Tela inicial reformulada com cards ilustrados para cada fonte de teclado (Local Folder, Local Server, GitHub) e descrições claras.
  2. Barra superior com metadados do teclado: nome do teclado/layout, badge de fonte, indicador de alterações não salvas e botão para retornar às fontes.
  3. Informações completas nas keycaps: binding behavior (&kp, &mo, etc.) e keycode sempre exibidos sem ocultar texto ou exibir símbolos nulos indevidos.
  4. 57 testes passando em `npm test`. Build de produção gerado.
  5. Restrição estrita mantida: NENHUM arquivo de `zmk-sofle` foi alterado.

## 2. Entregáveis do Projeto
- M1 a M5 concluídos (19 tarefas).
- TASK-020 concluída (Express static serving e temas canônicos).
- TASK-021 concluída (Welcome Page e metadados contextuais do teclado ativo).


