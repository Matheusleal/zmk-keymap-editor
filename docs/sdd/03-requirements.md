# 03 — Requirements

Status: Approved

Sintaxe canônica: **GEARS** (Generalized EARS). Keywords obrigatórias em inglês: `Where` / `While` / `When` / `the <subject> shall <behavior>`.

---

## 1. Functional Requirements — Fase 1: Metadados e Quick Wins

### FR-001 — Atualização de Comportamentos Modernos do Sistema
- **Source**: IB-001
- **Priority**: Must
- **GEARS**:
  When the user queries the behavior catalog,
  the behavior service shall include `&sys_reset`, `&soft_off`, `&kt` and backward-compatible alias `&reset`.
- **Status**: Draft

### FR-002 — Correção das Descrições de Comportamentos de Saída
- **Source**: IB-001
- **Priority**: Must
- **GEARS**:
  When displaying the `&out` behavior in the UI,
  the behavior picker shall display `OUT_USB` as "Prefer sending key events to USB" and `OUT_BLE` as "Prefer sending key events to the current Bluetooth profile".
- **Status**: Draft

### FR-003 — Comandos Avançados de Bluetooth e Iluminação
- **Source**: IB-001
- **Priority**: Must
- **GEARS**:
  When configuring the `&bt` behavior,
  the behavior picker shall provide options for `BT_CLR_ALL` and `BT_DISC` with profile index parameters (0 through 4).
- **Status**: Draft

### FR-004 — Parâmetros de Cor HSB para RGB Underglow
- **Source**: IB-001
- **Priority**: Should
- **GEARS**:
  When configuring the `&rgb_ug` behavior with command `RGB_COLOR_HSB`,
  the parameter input shall accept Hue (0-360), Saturation (0-100) and Brightness (0-100) parameters.
- **Status**: Draft

### FR-005 — Sincronização de Keycodes Modernos
- **Source**: IB-001
- **Priority**: Must
- **GEARS**:
  When the user searches for keycodes in the keycode picker,
  the keycode service shall provide consumer, multimedia, desktop navigation and international keycodes updated to the latest ZMK specification.
- **Status**: Draft

---

## 2. Functional Requirements — Fase 2: Recursos Centrais de Keymap

### FR-006 — Criação e Edição de Combos ZMK
- **Source**: IB-002
- **Priority**: Must
- **GEARS**:
  When the user defines a combo in the combo editor,
  the keymap engine shall serialize the combo into the `combos` node containing `timeout-ms`, `key-positions`, `bindings` and optionally `layers`.
- **Status**: Draft

### FR-007 — Sequenciador e Editor de Macros
- **Source**: IB-002
- **Priority**: Must
- **GEARS**:
  When the user creates a macro in the macro editor,
  the keymap engine shall serialize the macro node with `bindings`, `wait-ms`, `tap-ms` and support for `&macro_press`, `&macro_release`, `&macro_tap` and `&macro_wait_time`.
- **Status**: Draft

### FR-008 — Gestão de Camadas Condicionais (Tri-Layer)
- **Source**: IB-002
- **Priority**: Must
- **GEARS**:
  When two input layers are selected to trigger a target layer,
  the keymap engine shall generate a `conditional_layers` node mapping `then-layer` to the activation of all configured `if-layers`.
- **Status**: Draft

### FR-009 — Custom Hold-Tap com Positional Triggers
- **Source**: IB-002
- **Priority**: Must
- **GEARS**:
  When the user configures a custom hold-tap behavior,
  the behavior engine shall generate a `zmk,behavior-hold-tap` node containing `flavor` (`hold-preferred`, `balanced`, `tap-preferred`, `tap-unless-interrupted`), `tapping-term-ms`, `quick-tap-ms` and optional `hold-trigger-key-positions`.
- **Status**: Draft

---

## 3. Functional Requirements — Fase 3: Devicetree AST Engine

### FR-010 — Parsing Estruturado Não-Destrutivo (DTS AST)
- **Source**: IB-003
- **Priority**: Must
- **GEARS**:
  When loading an existing `.keymap` file containing custom nodes, `#include`, `#define` directives or comments,
  the Devicetree parser shall build a lossless abstract syntax tree without discarding unmodeled nodes or formatting comments.
- **Status**: Draft

### FR-011 — Serialização Preservativa de Devicetree
- **Source**: IB-003
- **Priority**: Must
- **GEARS**:
  When saving modifications to a `.keymap` file,
  the Devicetree serializer shall update only modified layer bindings, combos and custom behaviors while retaining existing comments, preprocessor macros and custom child nodes intact.
- **Status**: Draft

### FR-012 — Suporte a Edição Local via Web File System Access API
- **Source**: IB-003
- **Priority**: Should
- **GEARS**:
  Where the user browser supports the File System Access API,
  when the user opens a local keyboard directory,
  the application shall read and write files directly from the browser filesystem without requiring a running Express backend server.
- **Status**: Draft

---

## 4. Functional Requirements — Fase 4: Encoders & Pointing Keys

### FR-013 — Suporte a Encoders Rotativos no Layout e Camadas
- **Source**: IB-004
- **Priority**: Must
- **GEARS**:
  Where a keyboard layout defines rotary encoders in `info.json`,
  when viewing or editing a layer,
  the keyboard interface shall display encoder widgets and bind clockwise and counter-clockwise actions via `sensor-bindings = <&inc_dec_kp ...>`.
- **Status**: Draft

### FR-014 — Suporte ao Subsistema de Mouse Keys (`CONFIG_ZMK_POINTING`)
- **Source**: IB-004
- **Priority**: Must
- **GEARS**:
  When selecting mouse emulation actions in the picker,
  the behavior service shall provide `&mmv` (mouse move), `&msc` (mouse scroll) and `&mkp` (mouse click with buttons `LCLK`, `RCLK`, `MCLK`, `MB4`, `MB5`).
- **Status**: Draft

---

## 5. Functional Requirements — Fase 5: Firmware Pipeline & Exportação

### FR-015 — Download Direto de Artefatos Compilados (.uf2)
- **Source**: IB-005
- **Priority**: Should
- **GEARS**:
  Where GitHub repository access is authorized,
  when a commit triggers a GitHub Actions workflow run that produces a firmware artifact,
  the application shall display the build status and provide a direct download link for the `.uf2` file.
- **Status**: Draft

### FR-016 — Exportação de Layout em SVG (Keymap Drawer Style)
- **Source**: IB-005
- **Priority**: Could
- **GEARS**:
  When the user requests visual layout export,
  the layout visualizer shall generate a standalone SVG graphic illustrating all defined layers, combos and rotary encoders for documentation.
- **Status**: Draft

---

## 6. Non-Functional Requirements (NFR)

### NFR-001 — Integridade de Round-Trip de Arquivos
- **Category**: Maintainability / Reliability
- **Source**: IB-003
- **Priority**: Must
- **GEARS**:
  When an existing `.keymap` is parsed and re-serialized without edits,
  the keymap engine shall produce an identical Devicetree file (differing only in normalized whitespace).
- **Metric**: 100% round-trip match on a suite of 20 real-world public ZMK keymaps.
- **Validation Method**: Automated regression test suite.
- **Status**: Draft

### NFR-002 — Tempo de Resposta da Interface
- **Category**: Performance
- **Source**: IB-002
- **Priority**: Should
- **GEARS**:
  When switching layers or filtering keycodes in the `ValuePicker`,
  the UI rendering engine shall update the view within 50 milliseconds.
- **Metric**: Latência de UI <= 50ms para layouts com até 12 camadas e 100 teclas.
- **Validation Method**: Lighthouse & React Profiler benchmark.
- **Status**: Draft

### NFR-003 — Segurança e Privacidade de Credenciais
- **Category**: Security
- **Source**: IB-005
- **Priority**: Must
- **GEARS**:
  While communicating with GitHub API,
  the application shall store access tokens exclusively in client-side secure storage and never transmit them to or log them in backend servers.
- **Metric**: Zero ocorrências de tokens em logs, requisições de backend ou artefatos.
- **Validation Method**: Code audit and network traffic inspection.
- **Status**: Draft
