import PropTypes from 'prop-types';
import { useState } from 'react';
import styles from './styles.module.css';

export default function MacroEditor({ keymap, onUpdate, onClose }) {
  const macros = keymap.macros || [];
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    wait_ms: 30,
    tap_ms: 40,
    bindings: []
  });

  function parseBindingToStep(b) {
    if (typeof b === 'object' && b !== null) {
      return {
        action: b.action || 'tap',
        binding: b.binding || b.value || '&kp A'
      };
    }
    const str = String(b || '').trim();
    if (str.startsWith('&macro_press')) {
      return { action: 'press', binding: str.replace('&macro_press', '').trim() };
    }
    if (str.startsWith('&macro_release')) {
      return { action: 'release', binding: str.replace('&macro_release', '').trim() };
    }
    if (str.startsWith('&macro_wait_time')) {
      return { action: 'wait_time', binding: str.replace('&macro_wait_time', '').trim() };
    }
    return { action: 'tap', binding: str.replace('&macro_tap', '').trim() };
  }

  function handleStartCreate() {
    setEditingIndex(-1);
    setFormData({
      name: `macro_${macros.length + 1}`,
      wait_ms: 30,
      tap_ms: 40,
      bindings: [
        { action: 'press', binding: '&kp LSHFT' },
        { action: 'tap', binding: '&kp Z' },
        { action: 'release', binding: '&kp LSHFT' }
      ]
    });
  }

  function handleStartEdit(index) {
    const item = macros[index];
    setEditingIndex(index);
    setFormData({
      name: item.name || `macro_${index}`,
      wait_ms: item.wait_ms !== undefined ? item.wait_ms : 30,
      tap_ms: item.tap_ms !== undefined ? item.tap_ms : 40,
      bindings: (item.bindings || []).map(parseBindingToStep)
    });
  }

  function handleDelete(index) {
    const updated = macros.filter((_, i) => i !== index);
    onUpdate({ ...keymap, macros: updated });
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  }

  function handleAddStep() {
    setFormData({
      ...formData,
      bindings: [...formData.bindings, { action: 'tap', binding: '&kp SPACE' }]
    });
  }

  function handleUpdateStep(stepIndex, field, value) {
    const updatedSteps = formData.bindings.map((step, i) =>
      i === stepIndex ? { ...step, [field]: value } : step
    );
    setFormData({ ...formData, bindings: updatedSteps });
  }

  function handleRemoveStep(stepIndex) {
    setFormData({
      ...formData,
      bindings: formData.bindings.filter((_, i) => i !== stepIndex)
    });
  }

  function handleMoveStep(stepIndex, delta) {
    const newIndex = stepIndex + delta;
    if (newIndex < 0 || newIndex >= formData.bindings.length) return;
    const steps = [...formData.bindings];
    const temp = steps[stepIndex];
    steps[stepIndex] = steps[newIndex];
    steps[newIndex] = temp;
    setFormData({ ...formData, bindings: steps });
  }

  function handleSaveForm(e) {
    e.preventDefault();
    const formattedBindings = formData.bindings.map(step => {
      if (step.action === 'wait_time') {
        const val = parseInt(step.binding, 10) || 50;
        return { action: 'wait_time', value: val };
      }
      return {
        action: step.action,
        binding: step.binding.startsWith('&') ? step.binding : `&kp ${step.binding}`
      };
    });

    const newMacro = {
      name: formData.name.trim() || `macro_${Date.now()}`,
      wait_ms: parseInt(formData.wait_ms, 10) || 30,
      tap_ms: parseInt(formData.tap_ms, 10) || 40,
      bindings: formattedBindings
    };

    let updatedMacros;
    if (editingIndex === -1) {
      updatedMacros = [...macros, newMacro];
    } else {
      updatedMacros = macros.map((m, i) => (i === editingIndex ? newMacro : m));
    }

    onUpdate({ ...keymap, macros: updatedMacros });
    setEditingIndex(null);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>ZMK Macro Sequencer</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className={styles.content}>
          {editingIndex === null ? (
            <>
              <div className={styles.macroList}>
                {macros.length === 0 ? (
                  <div className={styles.emptyState}>No macros defined yet.</div>
                ) : (
                  macros.map((macro, idx) => (
                    <div key={idx} className={styles.macroItem}>
                      <div className={styles.macroInfo}>
                        <span className={styles.macroName}>{macro.name || `macro_${idx}`}</span>
                        <span className={styles.macroDetails}>
                          Steps: {(macro.bindings || []).length} | wait: {macro.wait_ms || 30}ms | tap: {macro.tap_ms || 40}ms
                        </span>
                      </div>
                      <div className={styles.macroActions}>
                        <button className={styles.actionBtn} onClick={() => handleStartEdit(idx)}>
                          Edit
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          onClick={() => handleDelete(idx)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button className={styles.primaryBtn} onClick={handleStartCreate}>
                + Add Macro
              </button>
            </>
          ) : (
            <form className={styles.form} onSubmit={handleSaveForm}>
              <h3>{editingIndex === -1 ? 'New Macro' : 'Edit Macro'}</h3>

              <div className={styles.formGroup}>
                <label>Macro Name (Devicetree Identifier)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Wait Duration (wait-ms)</label>
                  <input
                    type="number"
                    value={formData.wait_ms}
                    onChange={e => setFormData({ ...formData, wait_ms: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Tap Duration (tap-ms)</label>
                  <input
                    type="number"
                    value={formData.tap_ms}
                    onChange={e => setFormData({ ...formData, tap_ms: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.stepsSection}>
                <h4>Timeline Steps</h4>
                {formData.bindings.map((step, sIdx) => (
                  <div key={sIdx} className={styles.stepItem}>
                    <select
                      className={styles.stepActionSelect}
                      value={step.action}
                      onChange={e => handleUpdateStep(sIdx, 'action', e.target.value)}
                    >
                      <option value="tap">Tap (&macro_tap)</option>
                      <option value="press">Press (&macro_press)</option>
                      <option value="release">Release (&macro_release)</option>
                      <option value="wait_time">Delay (&macro_wait_time)</option>
                    </select>

                    <input
                      className={styles.stepInput}
                      type="text"
                      placeholder={step.action === 'wait_time' ? 'Delay in ms (e.g. 50)' : 'Key Binding (e.g. &kp A)'}
                      value={step.binding}
                      onChange={e => handleUpdateStep(sIdx, 'binding', e.target.value)}
                    />

                    <button
                      type="button"
                      className={styles.miniBtn}
                      disabled={sIdx === 0}
                      onClick={() => handleMoveStep(sIdx, -1)}
                    >
                      &uarr;
                    </button>
                    <button
                      type="button"
                      className={styles.miniBtn}
                      disabled={sIdx === formData.bindings.length - 1}
                      onClick={() => handleMoveStep(sIdx, 1)}
                    >
                      &darr;
                    </button>
                    <button
                      type="button"
                      className={`${styles.miniBtn} ${styles.deleteBtn}`}
                      onClick={() => handleRemoveStep(sIdx)}
                    >
                      &times;
                    </button>
                  </div>
                ))}

                <button type="button" className={styles.actionBtn} onClick={handleAddStep}>
                  + Add Step
                </button>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => setEditingIndex(null)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn}>
                  Save Macro
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

MacroEditor.propTypes = {
  keymap: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};
