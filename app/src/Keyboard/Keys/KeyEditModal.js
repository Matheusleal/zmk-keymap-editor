import get from 'lodash/get'
import PropTypes from 'prop-types'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { getBehaviourParams } from '../../keymap'
import ValuePicker from '../../ValuePicker'
import styles from './KeyEditModal.module.css'

export default function KeyEditModal(props) {
  const {
    isOpen,
    keyIndex,
    layout,
    value,
    params,
    sources,
    getSearchTargets,
    onApply,
    onClose
  } = props

  const [pendingValue, setPendingValue] = useState(value || '&kp')
  const [pendingParams, setPendingParams] = useState(params || [])
  const [editingSlot, setEditingSlot] = useState(null)

  useEffect(() => {
    setPendingValue(value || '&kp')
    setPendingParams(params || [])
    setEditingSlot(null)
  }, [value, params, isOpen])

  const currentBehavior = useMemo(() => {
    return get(sources.behaviours, pendingValue) || {
      code: pendingValue,
      description: pendingValue.replace(/^&/, '')
    }
  }, [sources.behaviours, pendingValue])

  const expectedParams = useMemo(() => {
    return getBehaviourParams(pendingParams, currentBehavior)
  }, [pendingParams, currentBehavior])

  // Mini-matrix layout bounding box and scale
  const matrixInfo = useMemo(() => {
    if (!layout || layout.length === 0) return { width: 140, height: 60, scale: 9 }
    const bounds = layout.reduce(
      (acc, k) => ({
        maxX: Math.max(acc.maxX, (k.x || 0) + (k.w || 1)),
        maxY: Math.max(acc.maxY, (k.y || 0) + (k.h || 1))
      }),
      { maxX: 0, maxY: 0 }
    )
    const scale = Math.min(10, 160 / (bounds.maxX || 1))
    return {
      width: Math.ceil((bounds.maxX || 1) * scale) + 8,
      height: Math.ceil((bounds.maxY || 1) * scale) + 8,
      scale
    }
  }, [layout])

  // Keycap preview text
  const previewKeycode = useMemo(() => {
    if (!pendingParams || pendingParams.length === 0) {
      return pendingValue === '&none' ? '·' : ''
    }
    const first = pendingParams[0]?.value || ''
    const keyInfo = get(sources.keycodes, first) || get(sources.code, first)
    return keyInfo?.symbol || keyInfo?.code || String(first)
  }, [pendingParams, pendingValue, sources])

  // Param description helper
  const getParamInfo = useCallback(
    (paramDef, paramVal) => {
      if (!paramVal) return { code: 'NONE', description: 'None' }
      const strVal = typeof paramVal === 'object' ? paramVal.value : String(paramVal)
      const targetSource =
        get(sources.keycodes, strVal) ||
        get(sources.code, strVal) ||
        get(sources.layer, strVal) ||
        get(sources.mod, strVal)
      return {
        code: targetSource?.code || strVal,
        description: targetSource?.description || targetSource?.symbol || strVal
      }
    },
    [sources]
  )

  const handleApply = useCallback(() => {
    onApply({
      value: pendingValue,
      params: pendingParams
    })
    onClose()
  }, [onApply, onClose, pendingValue, pendingParams])

  const handleSelectBehavior = (selectedItem) => {
    const newBehaviorCode = selectedItem.code || selectedItem
    setPendingValue(newBehaviorCode)
    const newBehaviorObj = get(sources.behaviours, newBehaviorCode)
    const newExpected = getBehaviourParams([], newBehaviorObj)
    // Initialize empty parameters if expected
    const initialParams = newExpected.map(p => ({
      value: p === 'code' ? 'SPACE' : p === 'layer' ? '0' : '0',
      params: []
    }))
    setPendingParams(initialParams)
    setEditingSlot(null)
  }

  const handleSelectParamValue = (selectedItem) => {
    if (!editingSlot || editingSlot.paramIndex === undefined) return
    const chosenCode = selectedItem.code || selectedItem
    const updated = [...pendingParams]
    updated[editingSlot.paramIndex] = {
      value: chosenCode,
      params: []
    }
    setPendingParams(updated)
    setEditingSlot(null)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        if (editingSlot) {
          setEditingSlot(null)
        } else {
          onClose()
        }
      } else if (e.key === 'Enter' && !editingSlot) {
        handleApply()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, editingSlot, onClose, handleApply])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.mainPanel}>
          {/* Top Preview Row */}
          <div className={styles.headerRow}>
            {/* Mini Keyboard Matrix with active key in green */}
            <div
              className={styles.matrixWrapper}
              style={{
                width: `${matrixInfo.width}px`,
                height: `${matrixInfo.height}px`
              }}
            >
              {layout.map((k, idx) => (
                <div
                  key={idx}
                  className={`${styles.miniKey} ${idx === keyIndex ? styles.miniKeyActive : ''}`}
                  style={{
                    left: `${(k.x || 0) * matrixInfo.scale + 4}px`,
                    top: `${(k.y || 0) * matrixInfo.scale + 4}px`,
                    width: `${Math.max(3, (k.w || k.u || 1) * matrixInfo.scale - 1.5)}px`,
                    height: `${Math.max(3, (k.h || 1) * matrixInfo.scale - 1.5)}px`
                  }}
                />
              ))}
            </div>

            <div className={styles.arrow}>→</div>

            {/* Preview Keycap */}
            <div className={styles.previewKeycap}>
              <span className={styles.previewBehavior}>
                {pendingValue.replace(/^&/, '')}
              </span>
              <span className={styles.previewKeycode}>{previewKeycode}</span>
            </div>
          </div>

          <div className={styles.divider} />

          {/* Behavior Line */}
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Behavior</span>
            <span
              className={`${styles.editableSlot} ${editingSlot?.type === 'behavior' ? styles.editableSlotActive : ''}`}
              title="Click to change behavior"
              onClick={() => {
                setEditingSlot({
                  type: 'behavior',
                  title: 'Select Behavior',
                  targets: getSearchTargets('behaviour', pendingValue),
                  value: pendingValue
                })
              }}
            >
              <span className={styles.slotCode}>{currentBehavior.code || pendingValue}</span>
              <span className={styles.slotDivider}>|</span>
              <span className={styles.slotDesc}>
                {currentBehavior.description || currentBehavior.code}
              </span>
            </span>
          </div>

          {/* Parameters Section */}
          <div className={styles.parametersSection}>
            <h4 className={styles.sectionTitle}>Parameters</h4>
            {expectedParams.length === 0 ? (
              <div style={{ fontSize: '13px', opacity: 0.5, fontStyle: 'italic', marginLeft: '20px' }}>
                No parameters for this behavior
              </div>
            ) : (
              expectedParams.map((paramDef, pIdx) => {
                const paramVal = pendingParams[pIdx]?.value
                const info = getParamInfo(paramDef, paramVal)
                const paramName =
                  typeof paramDef === 'string'
                    ? paramDef === 'code'
                      ? 'Key Code'
                      : paramDef.charAt(0).toUpperCase() + paramDef.slice(1)
                    : paramDef.name || `Param ${pIdx + 1}`

                return (
                  <div key={pIdx} className={styles.paramRow}>
                    <span className={styles.paramLabel}>{paramName}</span>
                    <span
                      className={`${styles.editableSlot} ${
                        editingSlot?.type === 'param' && editingSlot?.paramIndex === pIdx
                          ? styles.editableSlotActive
                          : ''
                      }`}
                      title="Click to change parameter"
                      onClick={() => {
                        setEditingSlot({
                          type: 'param',
                          paramIndex: pIdx,
                          title: `Select ${paramName}`,
                          param: paramDef,
                          targets: getSearchTargets(paramDef, pendingValue),
                          value: paramVal
                        })
                      }}
                    >
                      <span className={styles.slotCode}>{info.code}</span>
                      <span className={styles.slotDivider}>|</span>
                      <span className={styles.slotDesc}>{info.description}</span>
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* Actions */}
          <div className={styles.actionsRow}>
            <button className={styles.applyBtn} onClick={handleApply}>
              Apply
            </button>
            <button className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>

        {/* Side Picker Panel when user clicks a slot */}
        {editingSlot && (
          <div className={styles.sidePanel}>
            <div className={styles.sidePanelHeader}>
              <span className={styles.sidePanelTitle}>{editingSlot.title}</span>
              <button
                className={styles.sidePanelClose}
                onClick={() => setEditingSlot(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.sidePanelBody}>
              <ValuePicker
                value={editingSlot.value}
                param={editingSlot.param || 'code'}
                choices={editingSlot.targets || []}
                prompt="Search or select value..."
                searchKey="code"
                onSelect={
                  editingSlot.type === 'behavior'
                    ? handleSelectBehavior
                    : handleSelectParamValue
                }
                onCancel={() => setEditingSlot(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

KeyEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  keyIndex: PropTypes.number,
  layout: PropTypes.array.isRequired,
  value: PropTypes.string,
  params: PropTypes.array,
  sources: PropTypes.object.isRequired,
  getSearchTargets: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}
