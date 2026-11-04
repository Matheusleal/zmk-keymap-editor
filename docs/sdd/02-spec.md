# 02 — Specification

Status: Approved

## Visão do Produto
O ZMK Keymap Editor é uma plataforma web para design, customização visual e geração determinística de firmwares baseados em ZMK, permitindo que tanto iniciantes quanto usuários avançados de teclados ergonômicos configurem seus layouts com precisão e segurança de dados.

---

## Intent Blocks

### IB-001 — Modernização do Dicionário de Metadados e Comportamentos (Fase 1)
```text
Intent Block:
Goal:        Alinhar o catálogo estático de comportamentos e keycodes com a versão atual do ZMK Firmware.
Expectation: O usuário deve poder selecionar comportamentos modernos como &sys_reset, &soft_off, &kt, BT_DISC, BT_CLR_ALL e novas teclas HID sem incompatibilidades ou descrições invertidas.
Action:      Atualizar e higienizar os arquivos zmk-behaviors.json e zmk-keycodes.json no backend e sincronizá-los com o frontend.
Result:      Aumento imediato de cobertura de comandos básicos e eliminação de bugs conceituais (ex: OUT_USB vs OUT_BLE invertidos).
```

### IB-002 — Suporte aos Recursos Centrais de Keymap (Fase 2)
```text
Intent Block:
Goal:        Possibilitar a criação e edição visual de Combos, Macros, Camadas Condicionais e Comportamentos Customizados (Hold-Tap).
Expectation: O usuário de teclado com poucas teclas (34 a 42 teclas) deve conseguir configurar home-row mods com positional hold-tap, acionar teclas compostas via combos e definir macros sequenciais sem digitar código Devicetree manualmente.
Action:      Desenvolver painéis e modais dedicados na UI React e modelos de dados para combos, macros, tri-layers e custom hold-taps, serializando-os nos respectivos blocos do Devicetree.
Result:      Atendimento de mais de 80% dos requisitos de usuários de teclados ergonômicos split contemporâneos.
```

### IB-003 — Reformulação do Motor de Devicetree para AST Não-Destrutivo (Fase 3)
```text
Intent Block:
Goal:        Garantir parsing e serialização seguros e não-destrutivos de arquivos .keymap, preservando nós pré-existentes, diretivas e comentários.
Expectation: Usuários com configurações manuais complexas devem conseguir carregar e salvar seus keymaps sem perda de nós não reconhecidos ou comentários de documentação.
Action:      Substituir os templates e expressões regulares ingênuas por um parser estruturado baseado em AST (Árvore Sintática Abstrata) e viabilizar leitura direta via Web File System Access API.
Result:      Fidelidade de 100% no ciclo de round-trip de arquivos .keymap e desacoplamento do backend local para edição puramente no navegador.
```

### IB-004 — Suporte a Hardware de Encoders e Mouse Keys (Fase 4)
```text
Intent Block:
Goal:        Integrar hardware avançado de encoders rotativos e emulação de mouse/pointing device.
Expectation: Teclados equipados com knobs rotativos e navegação por mouse devem ter seus sensores mapeados camada por camada graficamente.
Action:      Implementar representação visual de encoders no layout, vinculação de sensor-bindings por camada e inclusão de comandos de ponteiro (&mmv, &msc, &mkp) no catálogo.
Result:      Suporte total a teclados ergonômicos com controles rotativos e integração de mouse sem fio.
```

### IB-005 — Pipeline de Firmware e Ecossistema Integrado (Fase 5)
```text
Intent Block:
Goal:        Conectar o editor ao pipeline de compilação do GitHub e ferramentas visuais de documentação.
Expectation: O usuário deve poder baixar o firmware .uf2 gerado pelo GitHub Actions diretamente pela interface e exportar diagramas SVG do seu keymap.
Action:      Integrar endpoints de consulta ao GitHub Actions Artifacts API e incorporar renderizador vetorial estilo Keymap Drawer.
Result:      Ciclo completo de ponta a ponta desde a edição até a gravação física no microcontrolador.
```

---

## Jornadas Principais do Usuário

1. **Jornada de Edição de Teclas Básicas e Modificadores**:
   - Usuário clica na tecla desejada no layout 2D.
   - O `ValuePicker` exibe comportamentos atualizados (`&kp`, `&mo`, `&kt`, `&soft_off`).
   - Ao selecionar modificadores ou ações, a visualização atualiza em tempo real.

2. **Jornada de Configuração de Home Row Mods (Hold-Tap)**:
   - Usuário abre a aba "Custom Behaviors".
   - Cria um novo comportamento `&hml` baseado em `zmk,behavior-hold-tap`.
   - Define o flavor como `balanced`, tempo de tap em `200ms`, `quick-tap-ms` em `175ms` e seleciona as teclas do lado oposto no layout para `hold-trigger-key-positions`.
   - O novo comportamento torna-se selecionável imediatamente no `ValuePicker` do teclado.

3. **Jornada de Configuração de Combos**:
   - Usuário clica na aba "Combos" e em "Novo Combo".
   - Seleciona no teclado as teclas `J` e `K` (posições 19 e 20).
   - Define o binding como `&kp ESC` e timeout como `50ms`.
   - O combo é salvo no bloco `combos` do Devicetree.

4. **Jornada de Camadas Condicionais (Tri-Layer)**:
   - Usuário acessa "Conditional Layers".
   - Define: "Quando Camada 1 (Lower) e Camada 2 (Raise) estiverem ativas, ativar Camada 3 (Adjust)".
   - Ao compilar, o nó `conditional_layers` é gerado automaticamente no Devicetree.
