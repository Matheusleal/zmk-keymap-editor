const fs = require('fs')
const path = require('path')
const filter = require('lodash/filter')
const flatten = require('lodash/flatten')
const get = require('lodash/get')
const keyBy = require('lodash/keyBy')
const map = require('lodash/map')
const uniq = require('lodash/uniq')

const { renderTable } = require('./layout')
const defaults = require('./defaults')

class KeymapValidationError extends Error {
  constructor (errors) {
    super(Array.isArray(errors) ? errors.join('; ') : String(errors))
    this.name = 'KeymapValidationError'
    this.errors = errors
  }
}

const behaviours = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/zmk-behaviors.json')))
const behavioursByBind = keyBy(behaviours, 'code')

function encodeBindValue(parsed) {
  const params = (parsed.params || []).map(encodeBindValue)
  const paramString = params.length > 0 ? `(${params.join(',')})` : ''
  return parsed.value + paramString
}

function encodeKeyBinding(parsed) {
  const { value, params } = parsed

  return `${value} ${params.map(encodeBindValue).join(' ')}`.trim()
}

function encodeKeymap(parsedKeymap) {
  const encoded = Object.assign({}, parsedKeymap, {
    layers: parsedKeymap.layers.map(layer => layer.map(encodeKeyBinding))
  })

  if (Array.isArray(parsedKeymap.combos)) {
    encoded.combos = parsedKeymap.combos.map(combo => {
      const binding = typeof combo.bindings === 'string'
        ? combo.bindings
        : (combo.bindings ? encodeKeyBinding(combo.bindings) : '&none')
      return Object.assign({}, combo, { bindings: binding })
    })
  }

  return encoded
}

function getBehavioursUsed(keymap) {
  const layerBinds = map(flatten(keymap.layers), 'value')
  const comboBinds = (keymap.combos || []).map(c => {
    if (typeof c.bindings === 'string') {
      const match = c.bindings.match(/^(&.+?)\b/)
      return match ? match[1] : null
    }
    return c.bindings ? c.bindings.value : null
  }).filter(Boolean)

  return uniq([...layerBinds, ...comboBinds])
}

/**
 * Parse a bind string into a tree of values and parameters
 * @param {String} binding
 * @returns {Object}
 */
function parseKeyBinding(binding) {
  const paramsPattern = /\((.+)\)/

  function parse(code) {
    const value = code.replace(paramsPattern, '')
    const params = get(code.match(paramsPattern), '[1]', '').split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(parse)

    return { value, params }
  }

  const value = binding.match(/^(&.+?)\b/)[1]
  const params = filter(binding.replace(/^&.+?\b\s*/, '')
    .split(' '))
    .map(parse)

  return { value, params }
}

function parseKeymap (keymap) {
  const parsed = Object.assign({}, keymap, {
    layers: keymap.layers.map(layer =>  {
      return layer.map(parseKeyBinding)
    })
  })

  if (Array.isArray(keymap.combos)) {
    parsed.combos = keymap.combos.map(combo => {
      const bindings = typeof combo.bindings === 'string'
        ? parseKeyBinding(combo.bindings)
        : combo.bindings
      return Object.assign({}, combo, { bindings })
    })
  }

  return parsed
}

function sanitizeDtsIdentifier(name) {
  const sanitized = (name || '').replace(/[^a-zA-Z0-9_]/g, '_')
  return /^[0-9]/.test(sanitized) ? `_${sanitized}` : sanitized
}

function renderCombos(combos) {
  if (!combos || !Array.isArray(combos) || combos.length === 0) {
    return ''
  }

  const renderedNodes = combos.map((combo, idx) => {
    const rawName = combo.name || `combo_${idx}`
    const nodeName = sanitizeDtsIdentifier(rawName)
    const timeout = combo.timeout_ms || combo['timeout-ms'] || 50
    const positions = (combo.key_positions || combo['key-positions'] || []).join(' ')
    const binding = typeof combo.bindings === 'string'
      ? combo.bindings
      : (combo.bindings ? encodeKeyBinding(combo.bindings) : '&none')
    const layers = combo.layers && combo.layers.length > 0
      ? `\n            layers = <${combo.layers.join(' ')}>;`
      : ''
    const slowRelease = (combo.slow_release || combo['slow-release'])
      ? '\n            slow-release;'
      : ''

    return `        ${nodeName} {
            timeout-ms = <${timeout}>;
            key-positions = <${positions}>;
            bindings = <${binding}>;${layers}${slowRelease}
        };`
  }).join('\n\n')

  return `    combos {
        compatible = "zmk,combos";
${renderedNodes}
    };\n\n`
}

function generateKeymap (layout, keymap, template) {
  const encoded = encodeKeymap(keymap)
  return {
    code: generateKeymapCode(layout, keymap, encoded, template || defaults.keymapTemplate),
    json: generateKeymapJSON(layout, keymap, encoded)
  }
}

function renderTemplate(template, params) {
  const includesPattern = /\{\{\s*behaviour_includes\s*\}\}/
  const layersPattern = /\{\{\s*rendered_layers\s*\}\}/
  const combosPattern = /\{\{\s*combos\s*\}\}/
  const macrosPattern = /\{\{\s*macros\s*\}\}/
  const conditionalLayersPattern = /\{\{\s*conditional_layers\s*\}\}/
  const behaviorsPattern = /\{\{\s*behaviors\s*\}\}/

  const renderedLayers = params.layers.map((layer, i) => {
    const name = i === 0 ? 'default_layer' : `layer_${params.layerNames[i] || i}`
    const rendered = renderTable(params.layout, layer, {
      linePrefix: '',
      columnSeparator: ' '
    })

    return `
        ${name.replace(/[^a-zA-Z0-9_]/g, '_')} {
            bindings = <
${rendered}
            >;
        };
`
  })

  const renderedCombos = renderCombos(params.combos)

  let rendered = template
    .replace(includesPattern, params.behaviourHeaders.join('\n'))
    .replace(layersPattern, renderedLayers.join(''))

  if (combosPattern.test(rendered)) {
    rendered = rendered.replace(combosPattern, renderedCombos)
  } else if (renderedCombos) {
    rendered = rendered.replace(/(keymap\s*\{)/, `${renderedCombos}$1`)
  }

  rendered = rendered
    .replace(macrosPattern, '')
    .replace(conditionalLayersPattern, '')
    .replace(behaviorsPattern, '')

  return rendered
}

function generateKeymapCode (layout, keymap, encoded, template) {
  const { layer_names: names = [] } = keymap
  const behaviourHeaders = flatten(getBehavioursUsed(keymap).map(
    bind => get(behavioursByBind, [bind, 'includes'], [])
  ))

  return renderTemplate(template, {
    layout,
    behaviourHeaders,
    layers: encoded.layers,
    combos: encoded.combos || keymap.combos,
    layerNames: names
  })
}

function generateKeymapJSON (layout, keymap, encoded) {
  const base = JSON.stringify(Object.assign({}, encoded, { layers: null }), null, 2)
  const layers = encoded.layers.map(layer => {
    const rendered = renderTable(layout, layer, {
      useQuotes: true,
      linePrefix: '      '
    })

    return `[\n${rendered}\n    ]`
  })

  return base.replace('"layers": null', `"layers": [\n    ${layers.join(', ')}\n  ]`)
}

function validateKeymapJson(keymap) {
  const errors = []

  if (typeof keymap !== 'object' || keymap === null) {
    errors.push('keymap.json root must be an object')
  } else if (!Array.isArray(keymap.layers)) {
    errors.push('keymap must include "layers" array')
  } else {
    for (let i in keymap.layers) {
      const layer = keymap.layers[i]

      if (!Array.isArray(layer)) {
        errors.push(`Layer at layers[${i}] must be an array`)
      } else {
        for (let j in layer) {
          const key = layer[j]
          const keyPath = `layers[${i}][${j}]`

          if (typeof key !== 'string') {
            errors.push(`Value at "${keyPath}" must be a string`)
          } else {
            const bind = key.match(/^&.+?\b/)
            if (!(bind && bind[0] in behavioursByBind)) {
              errors.push(`Key bind at "${keyPath}" has invalid behaviour`)
            }
          }

          // TODO: validate remaining bind parameters
        }
      }
    }

    if (keymap.combos !== undefined) {
      if (!Array.isArray(keymap.combos)) {
        errors.push('"combos" must be an array')
      } else {
        keymap.combos.forEach((c, idx) => {
          if (!c || typeof c !== 'object') {
            errors.push(`Combo at combos[${idx}] must be an object`)
          } else {
            const positions = c.key_positions || c['key-positions']
            if (!Array.isArray(positions) || positions.length < 2) {
              errors.push(`Combo at combos[${idx}] must have a "key_positions" array with at least 2 positions`)
            }
            if (!c.bindings) {
              errors.push(`Combo at combos[${idx}] must specify "bindings"`)
            }
          }
        })
      }
    }
  }

  if (errors.length) {
    throw new KeymapValidationError(errors)
  }
}

module.exports = {
  KeymapValidationError,
  encodeKeymap,
  parseKeymap,
  generateKeymap,
  validateKeymapJson
}
