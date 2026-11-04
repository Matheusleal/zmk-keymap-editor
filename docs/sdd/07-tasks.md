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
Status: Pending

TASK-003
Title: Atualização e sincronização da tabela de keycodes com ZMK moderno
Goal: Sincronizar zmk-keycodes.json com os keycodes mais recentes de mídia, consumo, desktop e caracteres internacionais da documentação oficial do ZMK.
Inputs: api/services/zmk/data/zmk-keycodes.json
Related Requirements: FR-005, DES-001
Done When: Novos keycodes de mídia e navegação estão pesquisáveis no ValuePicker do frontend.
Recommended Agent: self
Dependencies: TASK-002
Status: Pending

TASK-004
Title: Adaptação do seletor e validação no frontend para novos metadados da Fase 1
Goal: Ajustar a renderização no componente ValuePicker e Key.js para suportar adequadamente os novos comandos e parâmetros do M1.
Inputs: app/src/ValuePicker/, app/src/Keyboard/Keys/
Related Requirements: FR-001, FR-002, FR-003, FR-004, FR-005
Done When: O usuário consegue selecionar &sys_reset, &soft_off, &kt, BT_DISC com seletor de perfil e os novos keycodes no navegador sem erros de renderização.
Recommended Agent: self
Dependencies: TASK-003
Status: Pending

<!-- Registro do gate M1 (data) — veredito do sdd-validator -->

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
Status: Pending

TASK-006
Title: Interface visual do Gerenciador de Combos no Frontend
Goal: Criar o modal de listagem, criação e edição de combos com modo de seleção de teclas diretamente no layout do teclado.
Inputs: app/src/Combos/ComboManager.js
Related Requirements: FR-006, DES-002
Done When: O usuário pode clicar em teclas no layout para selecioná-las como posições do combo, definir timeout e ação resultante, e salvar o combo.
Recommended Agent: self
Dependencies: TASK-005
Status: Pending

TASK-007
Title: Modelo de dados e serializador Devicetree para Macros
Goal: Implementar a estrutura de dados de macros e serialização do bloco / { macros { ... }; }; com comandos &macro_press, &macro_release, &macro_tap e &macro_wait_time.
Inputs: api/services/zmk/keymap.js
Related Requirements: FR-007, DES-003
Done When: Teste unitário valida a geração de nós Devicetree válidos para macros de múltiplos passos e delays.
Recommended Agent: self
Dependencies: TASK-005
Status: Pending

TASK-008
Title: Sequenciador visual de Macros no Frontend
Goal: Criar o editor em timeline para encadear passos de macros, ajustar tempos de atraso e associar keycodes.
Inputs: app/src/Macros/MacroEditor.js
Related Requirements: FR-007, DES-003
Done When: Usuário adiciona passos à macro via UI, altera a ordem dos passos e atribui a macro a qualquer tecla no layout.
Recommended Agent: self
Dependencies: TASK-007
Status: Pending

TASK-009
Title: Suporte a Camadas Condicionais (Tri-Layer / Conditional Layers)
Goal: Implementar modelo, serialização / { conditional_layers { ... }; }; e modal visual para regras de ativação automática de camadas.
Inputs: api/services/zmk/keymap.js, app/src/ConditionalLayersModal.js
Related Requirements: FR-008, DES-004
Done When: O usuário configura visualmente Se Camada 1 E Camada 2, então Camada 3 e o bloco conditional_layers é gerado no .keymap.
Recommended Agent: self
Dependencies: TASK-006
Status: Pending

TASK-010
Title: Editor de Custom Behaviors (Hold-Tap para Home Row Mods)
Goal: Criar interface e gerador de nós zmk,behavior-hold-tap com ajuste de flavor, tapping-term-ms, quick-tap-ms e seleção visual de hold-trigger-key-positions.
Inputs: api/services/zmk/keymap.js, app/src/CustomBehaviorModal.js
Related Requirements: FR-009, DES-005
Done When: Usuário define um hold-tap posicional para home-row mods, clica nas teclas da mão oposta para definir os gatilhos e aplica o novo comportamento nas teclas de repouso.
Recommended Agent: self
Dependencies: TASK-006
Status: Pending

<!-- Registro do gate M2 (data) — veredito do sdd-validator -->

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
Status: Pending

TASK-012
Title: Serializer de AST de Devicetree com Edição Não-Destrutiva
Goal: Implementar o serializador que atualiza exclusivamente os nós gerenciados (keymap, combos, macros, conditional_layers) e reescreve o arquivo sem tocar nos nós opacos.
Inputs: api/services/zmk/dts/
Related Requirements: FR-011, NFR-001, DES-006
Done When: Teste de round-trip resulta em saída idêntica sem perda de formatação ou comentários.
Recommended Agent: self
Dependencies: TASK-011
Status: Pending

TASK-013
Title: Integração do novo AST Engine no serviço keymap.js
Goal: Substituir o parser antigo baseado em regex pelo novo motor de AST em api/services/zmk/keymap.js.
Inputs: api/services/zmk/keymap.js
Related Requirements: FR-010, FR-011, DES-006
Done When: As rotas existentes de leitura e gravação de keymap passam a utilizar o AST Engine com sucesso em todos os testes de integração.
Recommended Agent: self
Dependencies: TASK-012
Status: Pending

TASK-014
Title: Provedor Web File System Access API para Frontend
Goal: Implementar o provedor de arquivos baseado na API nativa do navegador para permitir carregar pastas locais de keymap diretamente pelo browser.
Inputs: app/src/providers/
Related Requirements: FR-012, DES-007
Done When: No Google Chrome/Edge, o usuário clica em Abrir Pasta Local, seleciona a pasta de configuração do ZMK e edita o keymap sem necessidade do backend Express ativo.
Recommended Agent: self
Dependencies: TASK-013
Status: Pending

<!-- Registro do gate M3 (data) — veredito do sdd-validator -->

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
Status: Pending

TASK-016
Title: Renderização e interação com Encoders no Layout do Teclado
Goal: Exibir controles gráficos de encoders no layout quando definidos no teclado, permitindo configurar ações de rotação horária e anti-horária por camada.
Inputs: app/src/Keyboard/KeyboardLayout.js, app/src/Keyboard/
Related Requirements: FR-013, DES-008
Done When: O componente de layout renderiza os botões rotativos e o usuário consegue atribuir keycodes de incremento/decremento em cada camada.
Recommended Agent: self
Dependencies: TASK-015
Status: Pending

TASK-017
Title: Suporte a Comandos do Subsistema de Mouse Keys (CONFIG_ZMK_POINTING)
Goal: Adicionar comandos de movimento (&mmv), rolagem (&msc) e cliques (&mkp) no catálogo e no ValuePicker.
Inputs: api/services/zmk/data/zmk-behaviors.json, app/src/ValuePicker/
Related Requirements: FR-014, DES-009
Done When: O usuário encontra a categoria Mouse / Pointing no ValuePicker e consegue configurar botões de mouse e movimento de cursor nas teclas do layout.
Recommended Agent: self
Dependencies: TASK-004
Status: Pending

<!-- Registro do gate M4 (data) — veredito do sdd-validator -->

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
Status: Pending

TASK-019
Title: Gerador e Exportador de Diagramas SVG de Keymap (Keymap Drawer Style)
Goal: Implementar módulo para renderizar o layout de todas as camadas e combos em formato vetorial SVG para documentação de repositório.
Inputs: app/src/Export/
Related Requirements: FR-016
Done When: O usuário clica em Exportar SVG e obtém um arquivo gráfico vetorial contendo todas as camadas desenhadas com legendas nítidas.
Recommended Agent: self
Dependencies: TASK-016
Status: Pending

<!-- Registro do gate M5 (data) — veredito do sdd-validator -->
