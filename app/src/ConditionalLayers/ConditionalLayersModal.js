import PropTypes from 'prop-types';
import { useState } from 'react';
import styles from './styles.module.css';

export default function ConditionalLayersModal({ keymap, onUpdate, onClose }) {
  const rules = keymap.conditional_layers || keymap.conditionalLayers || [];
  const layerNames = keymap.layer_names || (keymap.layers || []).map((_, i) => `Layer ${i}`);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: 'tri_layer',
    if_layers: [],
    then_layer: 0
  });

  function handleStartCreate() {
    setIsCreating(true);
    setFormData({
      name: `tri_layer_${rules.length + 1}`,
      if_layers: layerNames.length >= 2 ? [0, 1] : [0],
      then_layer: layerNames.length >= 3 ? 2 : 0
    });
  }

  function handleToggleIfLayer(layerIndex) {
    const exists = formData.if_layers.includes(layerIndex);
    const updated = exists
      ? formData.if_layers.filter(i => i !== layerIndex)
      : [...formData.if_layers, layerIndex].sort((a, b) => a - b);
    setFormData({ ...formData, if_layers: updated });
  }

  function handleDelete(index) {
    const updated = rules.filter((_, i) => i !== index);
    onUpdate({ ...keymap, conditional_layers: updated });
  }

  function handleSave(e) {
    e.preventDefault();
    if (formData.if_layers.length < 2) {
      alert('Please select at least 2 IF-layers to trigger the conditional rule.');
      return;
    }

    const newRule = {
      name: formData.name.trim() || `tri_layer_${Date.now()}`,
      if_layers: formData.if_layers,
      then_layer: parseInt(formData.then_layer, 10)
    };

    onUpdate({
      ...keymap,
      conditional_layers: [...rules, newRule]
    });
    setIsCreating(false);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Conditional Layers (Tri-Layer)</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className={styles.content}>
          {!isCreating ? (
            <>
              <div className={styles.ruleList}>
                {rules.length === 0 ? (
                  <div className={styles.emptyState}>No conditional rules configured.</div>
                ) : (
                  rules.map((rule, idx) => {
                    const ifNames = (rule.if_layers || rule['if-layers'] || [])
                      .map(id => layerNames[id] || `Layer #${id}`)
                      .join(' + ');
                    const thenName = layerNames[rule.then_layer !== undefined ? rule.then_layer : rule['then-layer']] || `Layer #${rule.then_layer}`;

                    return (
                      <div key={idx} className={styles.ruleItem}>
                        <div className={styles.ruleInfo}>
                          <span className={styles.ruleName}>{rule.name || `rule_${idx}`}</span>
                          <span className={styles.ruleDetails}>
                            IF active [{ifNames}] &rarr; THEN activate <strong>[{thenName}]</strong>
                          </span>
                        </div>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(idx)}>
                          Delete
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              <button className={styles.primaryBtn} onClick={handleStartCreate}>
                + Add Conditional Rule
              </button>
            </>
          ) : (
            <form className={styles.form} onSubmit={handleSave}>
              <h3>New Conditional Rule</h3>

              <div className={styles.formGroup}>
                <label>Rule Identifier Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label>When ALL of these layers are active (Select 2 or more):</label>
                <div className={styles.layerCheckboxList}>
                  {layerNames.map((name, idx) => (
                    <label key={idx} className={styles.layerCheckboxItem}>
                      <input
                        type="checkbox"
                        checked={formData.if_layers.includes(idx)}
                        onChange={() => handleToggleIfLayer(idx)}
                      />
                      {name || `Layer ${idx}`}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Then activate this target layer:</label>
                <select
                  value={formData.then_layer}
                  onChange={e => setFormData({ ...formData, then_layer: e.target.value })}
                >
                  {layerNames.map((name, idx) => (
                    <option key={idx} value={idx}>
                      {name || `Layer ${idx}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn}>
                  Save Rule
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

ConditionalLayersModal.propTypes = {
  keymap: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};
