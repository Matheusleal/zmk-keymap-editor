/**
 * Keymap SVG Drawer (Keymap Drawer Style)
 * Renders complete multi-layer keymap layouts into clean standalone SVGs.
 */

const KEY_SIZE = 60
const KEY_GAP = 6
const LAYER_MARGIN_Y = 60
const PADDING = 40

function formatBindingLabel(binding) {
  if (!binding) return ''
  let str = ''
  if (typeof binding === 'string') {
    str = binding.trim()
  } else if (typeof binding === 'object') {
    const val = binding.value || ''
    const params = (binding.params || []).map(p => typeof p === 'string' ? p : (p.value || '')).join(' ')
    str = `${val} ${params}`.trim()
  }

  if (!str || str === '&none') return ''
  if (str === '&trans') return '▽'
  if (str.startsWith('&kp ')) return str.replace('&kp ', '')
  if (str.startsWith('&mo ')) return `MO(${str.replace('&mo ', '')})`
  if (str.startsWith('&to ')) return `TO(${str.replace('&to ', '')})`
  if (str.startsWith('&tog ')) return `TOG(${str.replace('&tog ', '')})`
  if (str.startsWith('&sl ')) return `SL(${str.replace('&sl ', '')})`
  if (str.startsWith('&mkp ')) return str.replace('&mkp ', '')
  if (str.startsWith('&mmv ')) return `MMV(${str.replace('&mmv ', '').replace('MOVE_', '')})`
  if (str.startsWith('&msc ')) return `MSC(${str.replace('&msc ', '').replace('SCRL_', '')})`

  return str.replace('&', '')
}

function escapeXml(unsafe) {
  if (!unsafe) return ''
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function computeKeyParams(key) {
  const u = key.u || key.w || 1
  const h = key.h || 1
  const x = (key.x || 0) * (KEY_SIZE + KEY_GAP)
  const y = (key.y || 0) * (KEY_SIZE + KEY_GAP)
  const width = u * KEY_SIZE + KEY_GAP * (u - 1)
  const height = h * KEY_SIZE + KEY_GAP * (h - 1)
  const r = key.r || 0
  const rx = key.rx !== undefined ? key.rx * (KEY_SIZE + KEY_GAP) : x
  const ry = key.ry !== undefined ? key.ry * (KEY_SIZE + KEY_GAP) : y

  return { x, y, width, height, r, rx, ry }
}

function generateKeymapSvg(layout, keymap, options = {}) {
  if (!Array.isArray(layout) || layout.length === 0) {
    throw new Error('Layout must be a non-empty array of key positions')
  }

  const layers = Array.isArray(keymap.layers) && keymap.layers.length > 0
    ? keymap.layers
    : [layout.map(() => '&none')]
  const layerNames = keymap.layer_names || []

  // Compute bounding box for single layer
  let maxLayerX = 0
  let maxLayerY = 0

  for (const key of layout) {
    const { x, y, width, height } = computeKeyParams(key)
    if (x + width > maxLayerX) maxLayerX = x + width
    if (y + height > maxLayerY) maxLayerY = y + height
  }

  const layerWidth = maxLayerX
  const layerHeight = maxLayerY + 40 // space for layer title

  const totalWidth = layerWidth + PADDING * 2
  const totalLayersHeight = layers.length * (layerHeight + LAYER_MARGIN_Y)

  // Extra height for combos and encoders if present
  const hasCombos = Array.isArray(keymap.combos) && keymap.combos.length > 0
  const hasEncoders = Array.isArray(keymap.encoders) && keymap.encoders.length > 0
  const extraHeight = (hasCombos ? 120 : 0) + (hasEncoders ? 100 : 0)
  const totalHeight = totalLayersHeight + PADDING * 2 + extraHeight

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(totalWidth)} ${Math.ceil(totalHeight)}" width="${Math.ceil(totalWidth)}" height="${Math.ceil(totalHeight)}">
  <defs>
    <style>
      .bg { fill: #0f172a; }
      .layer-title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 18px; font-weight: 700; fill: #38bdf8; }
      .key-cap { fill: #1e293b; stroke: #475569; stroke-width: 1.5; rx: 6px; ry: 6px; }
      .key-cap:hover { fill: #334155; }
      .key-text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13px; font-weight: 600; fill: #f8fafc; text-anchor: middle; dominant-baseline: middle; }
      .combo-section-title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 16px; font-weight: 700; fill: #f59e0b; }
      .combo-badge { fill: #3b0764; stroke: #a855f7; stroke-width: 1.2; rx: 4px; ry: 4px; }
      .combo-text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; fill: #e9d5ff; }
      .encoder-text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12px; fill: #10b981; font-weight: 600; }
    </style>
  </defs>
  <rect width="100%" height="100%" class="bg" />
`

  // Render each layer
  layers.forEach((layerBindings, layerIdx) => {
    const layerName = layerNames[layerIdx] || `Layer ${layerIdx}`
    const layerOffsetY = PADDING + layerIdx * (layerHeight + LAYER_MARGIN_Y)

    svg += `  <g transform="translate(${PADDING}, ${layerOffsetY})">\n`
    svg += `    <text x="0" y="20" class="layer-title">${escapeXml(layerName)}</text>\n`
    svg += `    <g transform="translate(0, 35)">\n`

    layout.forEach((key, keyIdx) => {
      const { x, y, width, height, r, rx, ry } = computeKeyParams(key)
      const rawBinding = layerBindings[keyIdx]
      const label = formatBindingLabel(rawBinding)
      const centerX = x + width / 2
      const centerY = y + height / 2

      let transformAttr = ''
      if (r !== 0) {
        transformAttr = ` transform="rotate(${r}, ${rx}, ${ry})"`
      }

      svg += `      <g${transformAttr}>\n`
      svg += `        <rect x="${x}" y="${y}" width="${width}" height="${height}" class="key-cap" />\n`
      if (label) {
        svg += `        <text x="${centerX}" y="${centerY}" class="key-text">${escapeXml(label)}</text>\n`
      }
      svg += `      </g>\n`
    })

    // Layer-level sensor bindings (Encoders) if present
    if (Array.isArray(keymap.sensor_bindings) && keymap.sensor_bindings[layerIdx]) {
      const sb = keymap.sensor_bindings[layerIdx]
      svg += `      <g transform="translate(0, ${layerHeight - 10})">\n`
      svg += `        <text x="0" y="0" class="encoder-text">⟲⟳ Encoder: ${escapeXml(sb)}</text>\n`
      svg += `      </g>\n`
    }

    svg += `    </g>\n`
    svg += `  </g>\n`
  })

  // Render Combos section if available
  if (hasCombos) {
    const comboOffsetY = PADDING + layers.length * (layerHeight + LAYER_MARGIN_Y)
    svg += `  <g transform="translate(${PADDING}, ${comboOffsetY})">\n`
    svg += `    <text x="0" y="20" class="combo-section-title">Combos</text>\n`
    svg += `    <g transform="translate(0, 35)">\n`

    keymap.combos.forEach((combo, idx) => {
      const col = idx % 4
      const row = Math.floor(idx / 4)
      const cx = col * 200
      const cy = row * 30
      const bindingStr = formatBindingLabel(combo.bindings)
      const posStr = (combo.key_positions || []).join(', ')

      svg += `      <rect x="${cx}" y="${cy}" width="190" height="24" class="combo-badge" />\n`
      svg += `      <text x="${cx + 8}" y="${cy + 16}" class="combo-text">[${posStr}] ➔ ${escapeXml(bindingStr)}</text>\n`
    })

    svg += `    </g>\n`
    svg += `  </g>\n`
  }

  svg += `</svg>\n`
  return svg
}

module.exports = {
  generateKeymapSvg,
  formatBindingLabel
}
