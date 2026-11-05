const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const { parseKeymap, loadKeymapFromDts } = require('./keymap')

function getZmkPath() {
  if (process.env.ZMK_PATH && fs.existsSync(process.env.ZMK_PATH)) {
    return process.env.ZMK_PATH
  }
  const defaultSofle = 'D:/Projects/github/mine/Matheusleal/zmk-sofle'
  if (fs.existsSync(defaultSofle)) {
    return defaultSofle
  }
  return path.join(__dirname, '..', '..', '..', 'zmk-config')
}

const EMPTY_KEYMAP = {
  keyboard: 'unknown',
  keymap: 'unknown',
  layout: 'unknown',
  layer_names: ['default'],
  layers: [[]]
}

function loadBehaviors() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'zmk-behaviors.json')))
}

function loadKeycodes() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'zmk-keycodes.json')))
}

function findConfigFile(basePath, extensions, validator) {
  const candidateDirs = [path.join(basePath, 'config'), basePath]
  for (const dir of candidateDirs) {
    if (!fs.existsSync(dir)) continue
    const files = fs.readdirSync(dir)
    for (const f of files) {
      if (extensions.some(ext => f.endsWith(ext))) {
        const fullPath = path.join(dir, f)
        if (!validator || validator(fullPath)) {
          return fullPath
        }
      }
    }
  }
  return null
}

function loadLayout (layoutName = 'LAYOUT') {
  const zmkPath = getZmkPath()
  const layoutFile = findConfigFile(zmkPath, ['.json'], file => {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'))
      return Boolean(data.layouts || data.layout)
    } catch (e) {
      return false
    }
  })

  if (!layoutFile) {
    console.warn(`No layout JSON file found in ${zmkPath}. Using fallback grid.`)
    return [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 },
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }
    ]
  }

  const data = JSON.parse(fs.readFileSync(layoutFile, 'utf8'))
  if (data.layouts) {
    return (
      data.layouts[layoutName]?.layout ||
      data.layouts.default_layout?.layout ||
      data.layouts.LAYOUT?.layout ||
      data.layouts.default?.layout ||
      Object.values(data.layouts)[0]?.layout ||
      []
    )
  }
  return data.layout || []
}

function loadKeymap () {
  const zmkPath = getZmkPath()
  const keymapFile = findConfigFile(zmkPath, ['.keymap'])
  if (keymapFile) {
    const dtsContent = fs.readFileSync(keymapFile, 'utf8')
    const loaded = loadKeymapFromDts(dtsContent)
    return parseKeymap(loaded)
  }

  const jsonKeymapFile = findConfigFile(zmkPath, ['keymap.json'])
  if (jsonKeymapFile) {
    const jsonContent = JSON.parse(fs.readFileSync(jsonKeymapFile, 'utf8'))
    return parseKeymap(jsonContent)
  }

  return parseKeymap(EMPTY_KEYMAP)
}

function findKeymapFile () {
  const zmkPath = getZmkPath()
  return findConfigFile(zmkPath, ['.keymap'])
}

function exportKeymap (generatedKeymap, flash, callback) {
  const zmkPath = getZmkPath()
  const keymapPath = path.join(zmkPath, 'config')
  const keymapFile = findKeymapFile()

  fs.existsSync(keymapPath) || fs.mkdirSync(keymapPath, { recursive: true })
  fs.writeFileSync(path.join(keymapPath, 'keymap.json'), generatedKeymap.json)
  if (keymapFile) {
    fs.writeFileSync(keymapFile, generatedKeymap.code)
  }

  return childProcess.execFile('git', ['status'], { cwd: zmkPath }, callback)
}

module.exports = {
  loadBehaviors,
  loadKeycodes,
  loadLayout,
  loadKeymap,
  exportKeymap
}
