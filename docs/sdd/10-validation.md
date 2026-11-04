# 10 — Validation

Gate: nenhum milestone avança com achados Critical/High abertos — salvo dívida Critical/High explicitamente aceita pelo usuário (sempre confirmada antes) e registrada aqui como ativa.

## Dívidas Ativas e Itens Pendentes de Definição

VAL-001
Severity: Medium
Issue: Protocolo ZMK Studio RPC (WebHID) ainda não está estabilizado em todas as versões upstream do ZMK.
Impact: A implementação de edição em tempo real via WebHID na Fase 5 depende da versão do firmware gravado na controladora do usuário.
Recommendation: Manter a funcionalidade na Fase 5 com flag experimental e priorizar o fluxo via GitHub Actions e Devicetree AST.
Status: PENDENTE DE DEFINIÇÃO

VAL-002
Severity: Low
Issue: Suporte a navegadores legados (Firefox e Safari) para a Web File System Access API.
Impact: Nestes navegadores, o diálogo de abertura direta de pastas nativas não está disponível.
Recommendation: Manter o fallback automático para a API Node/Express local caso `window.showDirectoryPicker` seja indefinido.
Status: PENDENTE DE DEFINIÇÃO
