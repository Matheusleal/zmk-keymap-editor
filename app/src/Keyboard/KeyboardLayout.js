import pick from 'lodash/pick'
import PropTypes from 'prop-types'
import { useContext, useMemo, useState } from 'react'

import Key from './Keys/Key'
import KeyEditModal from './Keys/KeyEditModal'
import { SearchContext } from '../providers'

const position = key => pick(key, ['x', 'y'])
const rotation = key => {
  const { rx, ry, r } = key
  return { x: rx, y: ry, a: r }
}
const size = key => {
  const { w = 1, u = w, h = 1 } = key
  return { u, h }
}

function KeyboardLayout(props) {
  const { layout, bindings, onUpdate } = props
  const { getSearchTargets, sources } = useContext(SearchContext)
  const [editingKeyIndex, setEditingKeyIndex] = useState(null)

  const safeBindings = Array.isArray(bindings) ? bindings : []
  const normalized = layout.map((_, i) => {
    const raw = safeBindings[i]
    if (typeof raw === 'string') {
      const match = raw.match(/^(&[a-zA-Z0-9_]+)\b/)
      const value = match ? match[1] : raw
      const paramStr = raw.substring(value.length).trim()
      const params = paramStr ? paramStr.split(/\s+/).map(p => ({ value: p, params: [] })) : []
      return { value, params }
    }
    return raw || {
      value: '&none',
      params: []
    }
  })

  const handleUpdateBind = useMemo(() => function(keyIndex, updateBinding) {
    onUpdate([
      ...normalized.slice(0, keyIndex),
      updateBinding,
      ...normalized.slice(keyIndex + 1)
    ])
  }, [normalized, onUpdate])

  return (
    <div style={{ position: 'relative' }}>
      {layout.map((key, i) => (
        <Key
          key={i}
          position={position(key)}
          rotation={rotation(key)}
          size={size(key)}
          label={key.label}
          value={normalized[i].value}
          params={normalized[i].params}
          onClick={() => setEditingKeyIndex(i)}
        />
      ))}

      {editingKeyIndex !== null && normalized[editingKeyIndex] && (
        <KeyEditModal
          isOpen={editingKeyIndex !== null}
          keyIndex={editingKeyIndex}
          layout={layout}
          value={normalized[editingKeyIndex].value}
          params={normalized[editingKeyIndex].params}
          sources={sources}
          getSearchTargets={getSearchTargets}
          onApply={updatedBinding => {
            handleUpdateBind(editingKeyIndex, updatedBinding)
            setEditingKeyIndex(null)
          }}
          onClose={() => setEditingKeyIndex(null)}
        />
      )}
    </div>
  )
}

KeyboardLayout.propTypes = {
  layout: PropTypes.array.isRequired,
  bindings: PropTypes.array.isRequired,
  onUpdate: PropTypes.func.isRequired
}

export default KeyboardLayout

