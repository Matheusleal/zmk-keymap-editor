# 08 — Acceptance (Critérios de Aceite Globais)

Status: Approved

## Cenários de Teste por Requisito

AC-001 — FR-001, FR-002: Metadados Básicos e Saída
Scenario: Seleção de comandos modernos e visualização correta de saídas
Given: O usuário abriu o ValuePicker para uma tecla qualquer.
When: O usuário pesquisa por sys_reset ou out.
Then: O sistema deve exibir &sys_reset como ação válida do sistema, e ao selecionar &out, as descrições de OUT_USB (enviar para USB) e OUT_BLE (enviar para BLE) devem corresponder estritamente ao comportamento real do firmware ZMK.

AC-002 — FR-003: Comandos de Bluetooth
Scenario: Desconectar perfil específico e limpar todos os perfis
Given: O usuário selecionou o comportamento &bt.
When: O usuário abre a lista de comandos.
Then: O sistema deve listar BT_DISC com seletor de índice de perfil (0 a 4) e BT_CLR_ALL como comando sem parâmetros adicionais.

AC-003 — FR-006: Criação de Combos
Scenario: Criação visual de combo de escape com duas teclas adjacentes
Given: O usuário abriu o Gerenciador de Combos e iniciou um novo combo.
When: O usuário clica nas posições 19 e 20 no layout, define o binding como &kp ESC e salva.
Then: O arquivo .keymap deve conter um nó com key-positions = <19 20>; bindings = <&kp ESC>; sob o bloco / { combos { ... }; };.

AC-004 — FR-007: Sequência de Macro
Scenario: Configuração de macro de texto ou atalho
Given: O usuário abriu o Sequenciador de Macros.
When: O usuário cria uma macro chamada zed_alt com passos &macro_press &kp LALT, &macro_tap &kp Z e &macro_release &kp LALT.
Then: O arquivo Devicetree deve conter o nó de macro com os bindings e tempos correspondentes válidos para compilação no ZMK.

AC-005 — FR-008: Camadas Condicionais
Scenario: Ativação automática da Camada 3 (Adjust)
Given: O usuário possui as camadas 0 (Base), 1 (Lower), 2 (Raise) e 3 (Adjust).
When: O usuário adiciona a regra condicional associando Camadas 1 e 2 como gatilhos da Camada 3.
Then: O Devicetree deve gerar o nó conditional_layers contendo tri_layer { if-layers = <1 2>; then-layer = <3>; };.

AC-006 — FR-009: Home Row Mod Posicional
Scenario: Hold-tap com gatilhos na mão oposta
Given: O usuário está configurando um comportamento customizado &hml para a mão esquerda.
When: O usuário seleciona o flavor balanced, tapping-term-ms = 200 e marca os índices das teclas da mão direita como hold-trigger-key-positions.
Then: O arquivo .keymap deve serializar o nó hml: left_hand_positional_hold_tap com as propriedades especificadas.

AC-007 — FR-010, FR-011, NFR-001: Round-Trip Não-Destrutivo
Scenario: Preservação de comentários e nós desconhecidos
Given: Um arquivo .keymap contendo nós customizados de display OLED e comentários extensos.
When: O arquivo é carregado pelo editor, uma tecla é modificada e o arquivo é salvo.
Then: Todos os nós do display e comentários devem ser preservados exatamente em suas posições originais no arquivo final.

AC-008 — FR-013: Rotary Encoders
Scenario: Configuração de volume em knob rotativo
Given: Um teclado com encoder rotativo carregado na interface.
When: O usuário acessa a Camada 0 e define CW como C_VOL_UP e CCW como C_VOL_DN.
Then: O arquivo .keymap deve serializar sensor-bindings = <&inc_dec_kp C_VOL_UP C_VOL_DN>; na definição da Camada 0.

AC-009 — FR-014: Mouse Keys
Scenario: Atribuição de clique esquerdo e movimento do mouse
Given: O usuário está configurando teclas de navegação.
When: O usuário seleciona &mkp LCLK e &mmv MOVE_UP.
Then: A tecla deve exibir o ícone/label de clique e movimento e serializar a sintaxe Devicetree oficial do subsistema pointing.

AC-010 — FR-015: Download de Firmware .uf2
Scenario: Polling de compilação pós-salvamento
Given: O usuário salvou uma alteração em um repositório configurado no GitHub.
When: O workflow de GitHub Actions conclui com status success.
Then: A aplicação deve exibir uma notificação com o botão de download direto do arquivo .uf2 gerado pelo build.
