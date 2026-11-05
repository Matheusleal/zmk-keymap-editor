# 07 — Tasks (Ledger de Execução)

Regra: nenhum código sem task In Progress. Cada tarefa transita entre os estados de pendente, em andamento, bloqueada ou concluída.

---

## Bloco Milestone 1 (M1) — Quick Wins & Correções de Metadados

TASK-001
Title: Correção semântica e expansão de comandos Bluetooth e Saída
Goal: Corrigir as descrições invertidas de OUT_USB e OUT_BLE, e adicionar comandos BT_DISC e BT_CLR_ALL ao arquivo de comportamentos.
Inputs: api/services/zmk/data/zmk-behaviors.json
Related Requirements: FR-002, FR-003, DES-001
Done When: As descrições de OUT_USB e OUT_BLE estão corretas no JSON e BT_DISC (com parâmetros 0 a 4) e BT_CLR_ALL estão disponíveis no catálogo.
Recommended Agent: self
Dependencies: Nenhuma
Status: Done

TASK-002
Title: Adição de novos comportamentos modernos do sistema (&sys_reset, &soft_off, &kt, RGB_COLOR_HSB)
Goal: Adicionar novos nós e comportamentos de sistema no catálogo ZMK, mantendo compatibilidade com &reset legado.
Inputs: api/services/zmk/data/zmk-behaviors.json
Related Requirements: FR-001, FR-004, DES-001
Done When: &sys_reset, &soft_off, &kt e RGB_COLOR_HSB aparecem com seus respectivos metadados no zmk-behaviors.json e passam na validação de esquema.
Recommended Agent: self
Dependencies: TASK-001
Status: Done

TASK-003
Title: Atualização e sincronização da tabela de keycodes com ZMK moderno
Goal: Sincronizar zmk-keycodes.json com os keycodes mais recentes de mídia, consumo, desktop e caracteres internacionais da documentação oficial do ZMK.
Inputs: api/services/zmk/data/zmk-keycodes.json
Related Requirements: FR-005, DES-001
Done When: Novos keycodes de mídia e navegação estão pesquisáveis no ValuePicker do frontend.
Recommended Agent: self
Dependencies: TASK-002
Status: Done

TASK-004
Title: Adaptação do seletor e validação no frontend para novos metadados da Fase 1
Goal: Ajustar a renderização no componente ValuePicker e Key.js para suportar adequadamente os novos comandos e parâmetros do M1.
Inputs: app/src/ValuePicker/, app/src/Keyboard/Keys/
Related Requirements: FR-001, FR-002, FR-003, FR-004, FR-005
Done When: O usuário consegue selecionar &sys_reset, &soft_off, &kt, BT_DISC com seletor de perfil e os novos keycodes no navegador sem erros de renderização.
Recommended Agent: self
Dependencies: TASK-003
Status: Done

### Registro do Gate M1 (2026-11-04) — Veredito: Aprovado
- **Escopo**: TASK-001 a TASK-004 (FR-001, FR-002, FR-003, FR-004, FR-005, DES-001).
- **Evidências**: 15 testes unitários passando em `api/tests/` (zmk-behaviors, zmk-keycodes, frontend-integration).
- **Dívidas**: Nenhuma dívida aberta.
- **Veredito**: APROVADO.

---

## Bloco Milestone 2 (M2) — Recursos Centrais de Keymap

TASK-005
Title: Modelo de dados e serializador Devicetree para Combos
Goal: Implementar estrutura de dados de combos e serialização do bloco / { combos { ... }; }; no gerador de keymap.
Inputs: api/services/zmk/keymap.js
Related Requirements: FR-006, DES-002
Done When: Teste unitário valida a serialização correta de múltiplos combos com timeout-ms, key-positions, bindings e layers.
Recommended Agent: self
Dependencies: TASK-004
Status: Done

TASK-006
Title: Interface visual do Gerenciador de Combos no Frontend
Goal: Criar o modal de listagem, criação e edição de combos com modo de seleção de teclas diretamente no layout do teclado.
Inputs: app/src/Combos/ComboManager.js
Related Requirements: FR-006, DES-002
Done When: O usuário pode clicar em teclas no layout para selecioná-las como posições do combo, definir timeout e ação resultante, e salvar o combo.
Recommended Agent: self
Dependencies: TASK-005
Status: Done

TASK-007
Title: Modelo de dados e serializador Devicetree para Macros
Goal: Implementar a estrutura de dados de macros e serialização do bloco / { macros { ... }; }; com comandos &macro_press, &macro_release, &macro_tap e &macro_wait_time.
Inputs: api/services/zmk/keymap.js
Related Requirements: FR-007, DES-003
Done When: Teste unitário valida a geração de nós Devicetree válidos para macros de múltiplos passos e delays.
Recommended Agent: self
Dependencies: TASK-005
Status: Done

TASK-008
Title: Sequenciador visual de Macros no Frontend
Goal: Criar o editor em timeline para encadear passos de macros, ajustar tempos de atraso e associar keycodes.
Inputs: app/src/Macros/MacroEditor.js
Related Requirements: FR-007, DES-003
Done When: Usuário adiciona passos à macro via UI, altera a ordem dos passos e atribui a macro a qualquer tecla no layout.
Recommended Agent: self
Dependencies: TASK-007
Status: Done

TASK-009
Title: Suporte a Camadas Condicionais (Tri-Layer / Conditional Layers)
Goal: Implementar modelo, serialização / { conditional_layers { ... }; }; e modal visual para regras de ativação automática de camadas.
Inputs: api/services/zmk/keymap.js, app/src/ConditionalLayersModal.js
Related Requirements: FR-008, DES-004
Done When: O usuário configura visualmente Se Camada 1 E Camada 2, então Camada 3 e o bloco conditional_layers é gerado no .keymap.
Recommended Agent: self
Dependencies: TASK-006
Status: Done

TASK-010
Title: Editor de Custom Behaviors (Hold-Tap para Home Row Mods)
Goal: Criar interface e gerador de nós zmk,behavior-hold-tap com ajuste de flavor, tapping-term-ms, quick-tap-ms e seleção visual de hold-trigger-key-positions.
Inputs: api/services/zmk/keymap.js, app/src/CustomBehaviorModal.js
Related Requirements: FR-009, DES-005
Done When: Usuário define um hold-tap posicional para home-row mods, clica nas teclas da mão oposta para definir os gatilhos e aplica o novo comportamento nas teclas de repouso.
Recommended Agent: self
Dependencies: TASK-006
Status: Done

### Registro do Gate M2 (2026-11-05) — Veredito: Aprovado
- **Escopo**: TASK-005 a TASK-010 (FR-006, FR-007, FR-008, FR-009, DES-002, DES-003, DES-004, DES-005).
- **Evidências**: 28 testes unitários passando em `api/tests/` (combos, macros, conditional-layers, custom-behaviors, etc.) e build de produção do React sem erros.
- **Dívidas**: Nenhuma dívida aberta.
- **Veredito**: APROVADO.

---

## Bloco Milestone 3 (M3) — Devicetree AST Engine & Web File System

TASK-011
Title: Desenvolvimento do Parser Léxico e AST de Devicetree
Goal: Criar parser de Devicetree que constrói uma árvore sintática com preservação total de nós opacos, propriedades desconhecidas e comentários.
Inputs: api/services/zmk/dts/
Related Requirements: FR-010, NFR-001, DES-006
Done When: Suíte de testes unitários com keymaps complexos contendo comentários e nós desconhecidos preserva 100% da integridade estrutural.
Recommended Agent: self
Dependencies: TASK-010
Status: Done

TASK-012
Title: Serializer de AST de Devicetree com Edição Não-Destrutiva
Goal: Implementar o serializador que atualiza exclusivamente os nós gerenciados (keymap, combos, macros, conditional_layers) e reescreve o arquivo sem tocar nos nós opacos.
Inputs: api/services/zmk/dts/
Related Requirements: FR-011, NFR-001, DES-006
Done When: Teste de round-trip resulta em saída idêntica sem perda de formatação ou comentários.
Recommended Agent: self
Dependencies: TASK-011
Status: Done

TASK-013
Title: Integração do novo AST Engine no serviço keymap.js
Goal: Substituir o parser antigo baseado em regex pelo novo motor de AST em api/services/zmk/keymap.js.
Inputs: api/services/zmk/keymap.js
Related Requirements: FR-010, FR-011, DES-006
Done When: As rotas existentes de leitura e gravação de keymap passam a utilizar o AST Engine com sucesso em todos os testes de integração.
Recommended Agent: self
Dependencies: TASK-012
Status: Done

TASK-014
Title: Provedor Web File System Access API para Frontend
Goal: Implementar o provedor de arquivos baseado na API nativa do navegador para permitir carregar pastas locais de keymap diretamente pelo browser.
Inputs: app/src/providers/
Related Requirements: FR-012, DES-007
Done When: No Google Chrome/Edge, o usuário clica em Abrir Pasta Local, seleciona a pasta de configuração do ZMK e edita o keymap sem necessidade do backend Express ativo.
Recommended Agent: self
Dependencies: TASK-013
Status: Done

### Registro do Gate M3 (2026-11-05) — Veredito: Aprovado
- **Escopo**: TASK-011 a TASK-014 (FR-010, FR-011, FR-012, NFR-001, DES-006, DES-007).
- **Evidências**: 38 testes unitários passando em `api/tests/` (dts-parser, dts-serializer, ast-integration, combos, macros, etc.) e build limpo do React com WebFsPicker.
- **Dívidas**: Nenhuma dívida aberta.
- **Veredito**: APROVADO.

---

## Bloco Milestone 4 (M4) — Periféricos & Pointing Keys

TASK-015
Title: Mapeamento e serialização de Encoders Rotativos (sensor-bindings)
Goal: Implementar leitura e gravação da propriedade sensor-bindings = <&inc_dec_kp ...> por camada no motor Devicetree.
Inputs: api/services/zmk/keymap.js, api/services/zmk/dts/
Related Requirements: FR-013, DES-008
Done When: O serializador gera e lê corretamente sensor-bindings para todas as camadas configuradas.
Recommended Agent: self
Dependencies: TASK-013
Status: Done

TASK-016
Title: Renderização e interação com Encoders no Layout do Teclado
Goal: Exibir controles gráficos de encoders no layout quando definidos no teclado, permitindo configurar ações de rotação horária e anti-horária por camada.
Inputs: app/src/Keyboard/KeyboardLayout.js, app/src/Keyboard/
Related Requirements: FR-013, DES-008
Done When: O componente de layout renderiza os botões rotativos e o usuário consegue atribuir keycodes de incremento/decremento em cada camada.
Recommended Agent: self
Dependencies: TASK-015
Status: Done

TASK-017
Title: Suporte a Comandos do Subsistema de Mouse Keys (CONFIG_ZMK_POINTING)
Goal: Adicionar comandos de movimento (&mmv), rolagem (&msc) e cliques (&mkp) no catálogo e no ValuePicker.
Inputs: api/services/zmk/data/zmk-behaviors.json, app/src/ValuePicker/
Related Requirements: FR-014, DES-009
Done When: O usuário encontra a categoria Mouse / Pointing no ValuePicker e consegue configurar botões de mouse e movimento de cursor nas teclas do layout.
Recommended Agent: self
Dependencies: TASK-004
Status: Done

<!-- Registro do gate M4 (2026-11-05) — veredito: APROVADO. 45 testes unitários passando, build de produção validado sem erros, encoders e mouse keys integrados com sucesso. -->

---

## Bloco Milestone 5 (M5) — Firmware Pipeline & Visual Export

TASK-018
Title: Integração com GitHub Actions API para monitoramento de build e download de .uf2
Goal: Criar serviço no cliente para consultar a API de workflows do GitHub (/repos/{owner}/{repo}/actions/runs) e disponibilizar o download do firmware compilado.
Inputs: app/src/Pickers/Github/api.js, app/src/App.js
Related Requirements: FR-015, NFR-003, DES-010
Done When: Após salvar alterações no repositório GitHub, a interface exibe o status da compilação e um botão direto de download do arquivo .uf2 gerado.
Recommended Agent: self
Dependencies: TASK-014
Status: Done

TASK-019
Title: Gerador e Exportador de Diagramas SVG de Keymap (Keymap Drawer Style)
Goal: Implementar módulo para renderizar o layout de todas as camadas e combos em formato vetorial SVG para documentação de repositório.
Inputs: app/src/Export/
Related Requirements: FR-016
Done When: O usuário clica em Exportar SVG e obtém um arquivo gráfico vetorial contendo todas as camadas desenhadas com legendas nítidas.
Recommended Agent: self
Dependencies: TASK-016
Status: Done

<!-- Registro do gate M5 (2026-11-05) — veredito: APROVADO. 54 testes unitários passando, build de produção validado sem erros, integração com GitHub Actions e gerador SVG Keymap Drawer concluídos. -->

---

## Bloco Estabilização e Fidelidade Visual (UX/DX)

TASK-020
Title: Correção de inicialização em npm start e harmonização de fidelidade visual com nickcoutsos.github.io/keymap-editor
Goal: Corrigir o servidor Express para servir os estáticos de app/build em npm start e alinhar a interface visual com a versão canônica (sistema de temas light/dark/system, #settings-bar, navegação por abas para novos recursos e estilo das keycaps).
Inputs: api/index.js, app/src/App.js, app/src/App.css, app/public/index.html, app/src/Keyboard/Keys/styles.module.css, app/src/Keyboard/styles.module.css
Related Requirements: NFR-001, NFR-004, DES-001
Done When: npm start carrega a aplicação na porta 8080 sem erros; npm run dev apresenta layout, cores, temas light/dark e keycaps idênticos à versão canônica do editor com abas superiores limpas.
Recommended Agent: self
Dependencies: TASK-019
Status: Done

TASK-021
Title: Redesenho da experiência de seleção inicial (Welcome Page) e uniformização das informações do teclado ativo
Goal: Substituir o dropdown cru de fontes por uma tela inicial acolhedora com cards (Welcome Page idêntica ao nickcoutsos.github.io/keymap-editor), adicionar breadcrumbs/cabeçalho de contexto com metadados do teclado (nome, repositório, layout e status de alteração) e uniformizar a apresentação visual das keycaps e widgets.
Inputs: app/src/App.js, app/src/App.css, app/src/Pickers/KeyboardPicker.js, app/src/Keyboard/Keyboard.js, app/src/Keyboard/LayerSelector.js
Related Requirements: NFR-004, DES-001
Done When: Tela inicial exibe cards visuais de boas-vindas com ícones grandes e descrições para cada fonte; teclado carregado exibe barra superior com nome do teclado/layout, indicador de alterações não salvas, botão de trocar fonte e keycaps com legendas primárias e secundárias nítidas.
Recommended Agent: self
Dependencies: TASK-020
Status: Done

TASK-022
Title: Modal Canônico de Edição de Tecla (Key Binding Editor com Mini-Matrix, Behavior, Parameters, Apply e Cancel)
Goal: Implementar o modal canônico de edição ao clicar em qualquer tecla do teclado: cabeçalho com mini-matriz do layout (tecla ativa em verde), seta e preview da keycap; seletores de Behavior e Parameters com sublinhado pontilhado; botões de ação Apply e Cancel; e painel de busca integrado.
Inputs: app/src/Keyboard/Keys/KeyEditModal.js, app/src/Keyboard/Keys/KeyEditModal.module.css, app/src/Keyboard/Keys/Key.js, app/src/Keyboard/KeyboardLayout.js
Related Requirements: NFR-004, DES-001
Done When: Clicar em qualquer tecla do teclado abre o popup idêntico à imagem de referência do usuário com mini-matriz, preview da tecla, Behavior, Parameters, botões Apply e Cancel funcionais e seletor de valores integrado.
Recommended Agent: self
Dependencies: TASK-021
Status: Done






