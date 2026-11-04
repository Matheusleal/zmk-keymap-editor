# 01 — Discovery

Status: Approved

## Problema
Usuários de teclados mecânicos ergonômicos (especialmente layouts reduzidos como Corne 36/42, Ferris Sweep 34, Lily58, Sofle, Glove80) não conseguem utilizar a aplicação para configurar seus teclados porque as técnicas fundamentais de uso (Home Row Mods, Combos para pontuação/escape, Macros e Camadas Condicionais) não são suportadas. Além disso, ao tentar abrir repositórios existentes com arquivos `.keymap` customizados, a ferramenta corrompe ou remove nós Devicetree adicionados manualmente.

## Usuários (Personas)
1. **Entusiasta de Teclado Ergonômico Split (Lucas, 29 anos)**:
   - Utiliza um teclado Corne de 36 teclas com Home Row Mods (`&hml`, `&hmr`), combos para teclas essenciais (`Esc`, `Enter`, `Tab`) e camadas condicionais ("Raise" + "Lower" = "Adjust").
   - *Dor principal*: Não pode abrir seu keymap no editor porque o parser destrói seus combos e seus custom hold-taps não aparecem nas opções.
2. **Maker / Usuário Iniciante de ZMK (Mariana, 34 anos)**:
   - Montou seu primeiro teclado ZMK sem fio e quer alterar keycodes sem precisar lidar diretamente com sintaxe C/Devicetree pelo terminal.
   - *Dor principal*: Quer configurar volume no encoder rotativo e funções multimídia modernas, mas o editor não reconhece encoders nem keycodes recentes de mídia e bluetooth.
3. **Power User / Designer de Layouts (Rafael, 41 anos)**:
   - Mantém dezenas de repositórios no GitHub e precisa exportar documentação visual do keymap para o `README.md` do repositório e baixar o binário compilado `.uf2` rapidamente.
   - *Dor principal*: Precisa alternar para o GitHub Actions web para caçar o arquivo `.uf2` e usar ferramentas externas de terminal para desenhar o layout.

## Objetivos e Métricas de Sucesso (KPIs)
- **KPI-1**: Cobertura de comportamentos nativos ZMK elevada de 35% para >85% ao término da Fase 2.
- **KPI-2**: Zero perda de nós Devicetree desconhecidos ou comentários em testes de round-trip (`.keymap` -> parse -> serialize -> `.keymap`).
- **KPI-3**: Suporte a 100% dos parâmetros de Home Row Mods (`tapping-term-ms`, `quick-tap-ms`, `flavor`, `hold-trigger-key-positions`).
- **KPI-4**: Suporte total aos 3 principais tipos de nós avançados: `zmk,combos`, `zmk,behavior-macro` e `zmk,conditional-layers`.

## Escopo por Fases
- **Fase 1 (M1)**:
  - Atualização do catálogo de metadados (`zmk-behaviors.json` e `zmk-keycodes.json`).
  - Correção de descrições invertidas (`OUT_USB` vs `OUT_BLE`).
  - Novos comandos Bluetooth (`BT_DISC`, `BT_CLR_ALL`), iluminação HSB e compatibilidade retroativa `&sys_reset` / `&reset`.
- **Fase 2 (M2)**:
  - Gerenciador visual de Combos (seleção de múltiplas teclas, timeout, camadas e binding).
  - Sequenciador visual de Macros (eventos press/release/tap/wait com múltiplos bindings).
  - Gestor de Camadas Condicionais (Tri-Layer: Camada A + Camada B -> Camada C).
  - Configurador de Custom Behaviors (Hold-Tap flavours, tempos e posições restritas).
- **Fase 3 (M3)**:
  - Motor de Devicetree AST com preservação de estrutura e comentários.
  - Suporte opcional a Web File System Access API para manipulação local de pastas sem backend obrigatório.
- **Fase 4 (M4)**:
  - Suporte a Encoders rotativos (knobs visuais e mapeamento de rotação horária/anti-horária por camada).
  - Suporte ao subsistema de mouse keys (`&mmv`, `&msc`, `&mkp`).
- **Fase 5 (M5)**:
  - Integração de download de firmware `.uf2` via GitHub Actions Workflow Runs API.
  - Exportação de diagramas SVG para documentação de keymap.
  - Exploração do protocolo ZMK Studio WebHID.

## Fora de Escopo Inicial
- Compilador Zephyr/GCC embarcado localmente (o ZMK depende do GitHub Actions ou container Docker externo para compilação).
- Suporte a firmwares concorrentes (QMK, KMK, Vial) — foco estrito em ZMK.
