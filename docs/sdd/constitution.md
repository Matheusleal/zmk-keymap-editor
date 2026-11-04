# Constitution — ZMK Keymap Editor Modernization

Princípios inegociáveis. Toda especificação, decisão arquitetural, tarefa e linha de código é validada contra este documento. Alterações exigem aprovação explícita e registro com justificativa.

## 1. Arquitetura
- **Separação Frontend/Backend**: O frontend React (`app/`) consome a API REST (`api/`) e metadados estáticos de comportamentos e keycodes do ZMK.
- **Isolamento de Domínio Devicetree**: O motor de Devicetree (DTS) deve operar como módulo agnóstico à camada de apresentação, permitindo transição futura para execução puramente client-side via Web File System Access API.
- **Preservação de Conteúdo (Non-Destructive AST)**: Nenhuma operação de serialização pode apagar nós desconhecidos, macros manuais, comentários (`/* ... */`, `// ...`) ou diretivas de pré-processador (`#include`, `#define`) existentes no `.keymap` do usuário.

## 2. Stack Fixa
- **Backend**: Node.js (>= 18), Express 4.x.
- **Frontend**: React 17+ (Create React App / CSS Modules / FontAwesome).
- **Formatos de Dados**: Devicetree (`.keymap`), JSON estruturado para layout/info (`info.json`, `keymap.json`).
- **Gerenciador de Pacotes**: npm.

## 3. Política de Testes
- **Testes Unitários Obrigatórios**:
  - Parsers léxicos e AST do Devicetree (`api/services/zmk/keymap.js` e serializers).
  - Transformadores de dados e geradores de nós ZMK (combos, macros, conditional layers, custom hold-taps).
- **Testes de Regressão**: Garantir compatibilidade com mapas de teclados legados gerados nas versões anteriores do editor.
- **Framework de Testes**: Jest para testes unitários de backend e frontend.

## 4. Segurança e Conformidade
- **Acesso ao GitHub**: Tokens pessoais de acesso (PAT) do GitHub ou OAuth devem permanecer estritamente em memória do navegador/local storage do cliente, nunca persistidos em logs de servidor.
- **Sanitização de Entradas**: Nomes de nós, identificadores e labels gerados para Devicetree devem obedecer à regex de identificadores C/Devicetree (`^[a-zA-Z_][a-zA-Z0-9_]*$`) para prevenir injeção de código ou macros malformadas.

## 5. Processo e Governança (SDD)
- **Spec-Driven**: Nenhuma implementação de código é permitida sem tarefa correspondente em estado `In Progress` no ledger (`docs/sdd/07-tasks.md`), rastreada a requisitos (GEARS) e decisões de design (DES).
- **Delta Specs**: Novas mudanças após a baseline inicial passam pelo ciclo `docs/sdd/changes/` antes de consolidação.
- **Zero PR Automatizado**: Trabalhar exclusivamente em feature branches locais até aprovação explícita do usuário.
- **Dependências**: Qualquer adição de biblioteca npm externa deve ser comunicada e aprovada pelo usuário antes da instalação.

## 6. Roteamento de Modelos
- Documentação e Especificação: Flash / Flash Lite (SDD Specs, Memory, Tasks).
- Codificação e Testes Unitários: Pro.
- Arquitetura, AST Devicetree e Orquestração: Pro.

