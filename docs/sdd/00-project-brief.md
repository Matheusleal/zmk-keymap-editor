# 00 — Project Brief

Status: Baseline / Active

## Nome do Projeto
ZMK Keymap Editor Modernization (Atualização do Ecossistema ZMK Firmware)

## Descrição Curta
Modernização integral da aplicação Keymap Editor para cobrir o ecossistema moderno do ZMK Firmware, eliminando a defasagem de recursos (combos, macros, conditional layers, custom hold-tap/home row mods, encoders, mouse keys e parser devicetree não-destrutivo).

## Problema Percebido
A aplicação atual é baseada em um snapshot de 2020 do Keymap Editor original, cobrindo menos de 35% dos recursos do ZMK atual. Seu parser de Devicetree utiliza expressões regulares simplificadas e templates rígidos que sobrescrevem o `.keymap`, destruindo customizações manuais. Além disso, os recursos essenciais para teclados ergonômicos split contemporâneos (Home Row Mods com Positional Hold-Tap, Combos, Macros, Encoders e Tri-Layers) estão completamente ausentes.

## Solicitante / Origem
Auditoria técnica detalhada realizada e documentada em `docs/melhorias-zmk.md`.

## Objetivo Inicial
Transformar o editor em uma ferramenta de referência para o ecossistema ZMK moderno, elevando a cobertura funcional para >80% nas duas primeiras fases e atingindo compatibilidade total com Devicetree AST não-destrutivo na fase 3.

## Contexto Conhecido
- O projeto possui arquitetura híbrida: API Express (`api/`) para leitura e gravação local/remota de arquivos e aplicação React (`app/`) com canvas 2D de posicionamento de teclas e `ValuePicker` fuzzy.
- O ZMK padronizou novos comportamentos (`&sys_reset`, `&soft_off`, `&kt`, `&mmv`, `&msc`, `&mkp`, `&inc_dec_kp`) e novos nós (`/ { combos { ... }; macros { ... }; conditional_layers { ... }; };`).

## Fases de Execução
- **Fase 1 (M1)**: Quick Wins & Metadados (Atualização de dicionários, keycodes e correções semânticas).
- **Fase 2 (M2)**: Recursos Centrais de Keymap (Combos, Macros, Tri-Layer, Custom Hold-Tap).
- **Fase 3 (M3)**: Devicetree AST Engine & Web File System Access (Parser robusto e não-destrutivo).
- **Fase 4 (M4)**: Periféricos & Hardware (Rotary Encoders e Mouse Keys `CONFIG_ZMK_POINTING`).
- **Fase 5 (M5)**: Integração com Ecossistema Moderno (GitHub Actions UF2 download, Keymap Drawer SVG e ZMK Studio WebHID).

