import PropTypes from 'prop-types';
import { useState } from 'react';
import styles from './styles.module.css';

export default function ComboManager({ keymap, onUpdate, onClose }) {
  const combos = keymap.combos || [];
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    key_positions: '',
    bindings: '&kp ESC',
    timeout_ms: 50,
    layers: '',
    slow_release: false
  });

  function handleStartCreate() {
    setEditingIndex(-1);
    setFormData({
      name: `combo_${combos.length + 1}`,
      key_positions: '0 1',
      bindings: '&kp ESC',
      timeout_ms: 50,
      layers: '',
      slow_release: false
    });
  }

  function handleStartEdit(index) {
    const item = combos[index];
    setEditingIndex(index);
    setFormData({
      name: item.name || `combo_${index}`,
      key_positions: (item.key_positions || item['key-positions'] || []).join(' '),
      bindings: item.bindings || '&kp ESC',
      timeout_ms: item.timeout_ms || item['timeout-ms'] || 50,
      layers: (item.layers || []).join(' '),
      slow_release: Boolean(item.slow_release || item['slow-release'])
    });
  }

  function handleDelete(index) {
    const updated = combos.filter((_, i) => i !== index);
    onUpdate({ ...keymap, combos: updated });
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  }

  function handleSaveForm(e) {
    e.preventDefault();
    const positions = formData.key_positions
      .split(/[\s,]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));

    const layersArr = formData.layers
      ? formData.layers.split(/[\s,]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
      : undefined;

    const newCombo = {
      name: formData.name.trim() || `combo_${Date.now()}`,
      key_positions: positions,
      bindings: formData.bindings.trim(),
      timeout_ms: parseInt(formData.timeout_ms, 10) || 50,
      slow_release: formData.slow_release
    };

    if (layersArr && layersArr.length > 0) {
      newCombo.layers = layersArr;
    }

    let updatedCombos;
    if (editingIndex === -1) {
      updatedCombos = [...combos, newCombo];
    } else {
      updatedCombos = combos.map((c, i) => (i === editingIndex ? newCombo : c));
    }

    onUpdate({ ...keymap, combos: updatedCombos });
    setEditingIndex(null);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>ZMK Combos Manager</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className={styles.content}>
          {editingIndex === null ? (
            <>
              <div className={styles.comboList}>
                {combos.length === 0 ? (
                  <div className={styles.emptyState}>No combos defined yet.</div>
                ) : (
                  combos.map((combo, idx) => (
                    <div key={idx} className={styles.comboItem}>
                      <div className={styles.comboInfo}>
                        <span className={styles.comboName}>{combo.name || `combo_${idx}`}</span>
                        <span className={styles.comboDetails}>
                          Positions: [{(combo.key_positions || []).join(', ')}] &rarr;{' '}
                          {combo.bindings} (timeout: {combo.timeout_ms || 50}ms)
                        </span>
                      </div>
                      <div className={styles.comboActions}>
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
                + Add Combo
              </button>
            </>
          ) : (
            <form className={styles.form} onSubmit={handleSaveForm}>
              <h3>{editingIndex === -1 ? 'New Combo' : 'Edit Combo'}</h3>

              <div className={styles.formGroup}>
                <label>Combo Identifier Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Key Positions (e.g. 0 1 or 14 15)</label>
                <input
                  type="text"
                  required
                  value={formData.key_positions}
                  onChange={e => setFormData({ ...formData, key_positions: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Resulting Binding (e.g. &kp ESC)</label>
                <input
                  type="text"
                  required
                  value={formData.bindings}
                  onChange={e => setFormData({ ...formData, bindings: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Timeout (ms)</label>
                <input
                  type="number"
                  value={formData.timeout_ms}
                  onChange={e => setFormData({ ...formData, timeout_ms: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Layers (optional, e.g. 0 1)</label>
                <input
                  type="text"
                  value={formData.layers}
                  onChange={e => setFormData({ ...formData, layers: e.target.value })}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
                <input
                  type="checkbox"
                  id="slow_release_cb"
                  checked={formData.slow_release}
                  onChange={e => setFormData({ ...formData, slow_release: e.target.checked })}
                />
                <label htmlFor="slow_release_cb">Slow Release</label>
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
                  Save Combo
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

ComboManager.propTypes = {
  keymap: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};
