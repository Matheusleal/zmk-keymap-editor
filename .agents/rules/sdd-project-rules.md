# SDD Project Rules — ZMK Keymap Editor

1. **Spec-Driven First**: Nenhuma implementação no código sem task `In Progress` no ledger `docs/sdd/07-tasks.md`.
2. **Governança**: A fonte da verdade reside estritamente em `docs/sdd/`. Mudanças futuras devem ser planejadas via Delta Specs em `docs/sdd/changes/`.
3. **Branch e PR**: Todo o trabalho permanece em branches locais (`feature/planejamento-melhorias-zmk`). Não crie Pull Requests sem autorização expressa.
4. **AST e Fidelidade**: Qualquer refatoração do motor de Devicetree deve preservar nós desconhecidos, comentários e diretivas pré-processadas.
5. **Memória de Sessão**: Mantenha `docs/sdd/11-project-memory.md` sempre sincronizado a cada transição de estado.
