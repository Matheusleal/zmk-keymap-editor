/**
 * Client-side ZMK Keymap & Devicetree Parser
 */

function parseKeyBinding(binding) {
  if (!binding) return { value: '&none', params: [] }
  const paramsPattern = /\((.+)\)/

  function parse(code) {
    const value = code.replace(paramsPattern, '')
    const match = code.match(paramsPattern)
    const params = match
      ? match[1].split(',').map(s => s.trim()).filter(Boolean).map(parse)
      : []

    return { value, params }
  }

  const match = binding.match(/^(&[a-zA-Z0-9_]+)\b/)
  if (!match) {
    return { value: binding.trim(), params: [] }
  }

  const value = match[1]
  const remainder = binding.substring(value.length).trim()
  const tokens = remainder ? remainder.split(/\s+/).filter(Boolean) : []
  const params = tokens.map(parse)

  return { value, params }
}

export function parseKeymapBindings(keymap) {
  if (!keymap || !Array.isArray(keymap.layers)) {
    return keymap
  }

  return {
    ...keymap,
    layers: keymap.layers.map(layer => {
      return (layer || []).map(b => {
        if (typeof b === 'string') {
          return parseKeyBinding(b)
        }
        return b || { value: '&none', params: [] }
      })
    })
  }
}

export function parseDtsToKeymap(dtsContent) {
  const layer_names = []
  const layers = []
  const sensor_bindings = []

  // Extract keymap node body using brace counting
  let keymapBody = dtsContent
  const kmMatch = dtsContent.match(/(?:^|\s)keymap\s*\{/)
  if (kmMatch) {
    const start = kmMatch.index + kmMatch[0].length
    let depth = 1
    let pos = start
    while (pos < dtsContent.length && depth > 0) {
      if (dtsContent[pos] === '{') depth++
      else if (dtsContent[pos] === '}') depth--
      pos++
    }
    keymapBody = dtsContent.substring(start, pos - 1)
  }

  // Find each layer inside keymapBody using brace counting
  const nodeHeaderRegex = /(?:^|\s)([a-zA-Z0-9_]+)\s*\{/g
  let headerMatch
  while ((headerMatch = nodeHeaderRegex.exec(keymapBody)) !== null) {
    const nodeName = headerMatch[1]
    if (nodeName === 'compatible') continue
    const start = headerMatch.index + headerMatch[0].length
    let depth = 1
    let pos = start
    while (pos < keymapBody.length && depth > 0) {
      if (keymapBody[pos] === '{') depth++
      else if (keymapBody[pos] === '}') depth--
      pos++
    }
    const layerBody = keymapBody.substring(start, pos - 1)
    nodeHeaderRegex.lastIndex = pos

    // Extract display-name or label
    const nameMatch = layerBody.match(/(?:display-name|label)\s*=\s*"([^"]+)"/)
    const layerName = nameMatch ? nameMatch[1] : nodeName
    layer_names.push(layerName)

    // Extract bindings = < ... >;
    const bindingsMatch = layerBody.match(/bindings\s*=\s*<([\s\S]*?)>;/)
    const bindingsText = bindingsMatch ? bindingsMatch[1] : ''

    const tokens = bindingsText.trim().split(/\s+/).filter(Boolean)
    const layerBindings = []
    let current = null

    for (const token of tokens) {
      if (token.startsWith('&')) {
        if (current) layerBindings.push(current.join(' '))
        current = [token]
      } else if (current) {
        current.push(token)
      }
    }
    if (current) layerBindings.push(current.join(' '))
    layers.push(layerBindings)

    // Extract sensor-bindings = < ... >;
    const sensorMatch = layerBody.match(/sensor-bindings\s*=\s*<([\s\S]*?)>;/)
    if (sensorMatch) {
      sensor_bindings.push([sensorMatch[1].trim()])
    } else {
      sensor_bindings.push([])
    }
  }

  const rawKeymap = {
    layer_names: layer_names.length > 0 ? layer_names : ['Base'],
    layers: layers.length > 0 ? layers : [[]],
    sensor_bindings
  }

  return parseKeymapBindings(rawKeymap)
}

