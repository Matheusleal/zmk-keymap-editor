import PropTypes from 'prop-types';
import { useState } from 'react';
import styles from './styles.module.css';

export default function CustomBehaviorModal({ keymap, onUpdate, onClose }) {
  const behaviors = keymap.custom_behaviors || keymap.behaviors || [];
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: 'homerow_mods',
    code: '&hm',
    type: 'hold-tap',
    flavor: 'balanced',
    tapping_term_ms: 200,
    quick_tap_ms: 150,
    require_prior_idle_ms: 125,
    hold_trigger_key_positions: '',
    hold_trigger_on_release: false
  });

  function handleStartCreate() {
    setIsCreating(true);
    setFormData({
      name: `homerow_mods_${behaviors.length + 1}`,
      code: `&hm${behaviors.length + 1}`,
      type: 'hold-tap',
      flavor: 'balanced',
      tapping_term_ms: 200,
      quick_tap_ms: 150,
      require_prior_idle_ms: 125,
      hold_trigger_key_positions: '',
      hold_trigger_on_release: false
    });
  }

  function handleDelete(index) {
    const updated = behaviors.filter((_, i) => i !== index);
    onUpdate({ ...keymap, custom_behaviors: updated });
  }

  function handleSave(e) {
    e.preventDefault();
    const positions = formData.hold_trigger_key_positions
      ? formData.hold_trigger_key_positions.split(/[\s,]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
      : undefined;

    const newBehavior = {
      name: formData.name.trim() || `hm_${Date.now()}`,
      code: formData.code.trim().startsWith('&') ? formData.code.trim() : `&${formData.code.trim()}`,
      type: formData.type,
      flavor: formData.flavor,
      tapping_term_ms: parseInt(formData.tapping_term_ms, 10) || 200,
      quick_tap_ms: parseInt(formData.quick_tap_ms, 10) || 150,
      require_prior_idle_ms: parseInt(formData.require_prior_idle_ms, 10) || 125,
      bindings: ['&kp', '&kp'],
      hold_trigger_on_release: formData.hold_trigger_on_release
    };

    if (positions && positions.length > 0) {
      newBehavior.hold_trigger_key_positions = positions;
    }

    onUpdate({
      ...keymap,
      custom_behaviors: [...behaviors, newBehavior]
    });
    setIsCreating(false);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Custom Behaviors (Hold-Tap & Home Row Mods)</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className={styles.content}>
          {!isCreating ? (
            <>
              <div className={styles.behaviorList}>
                {behaviors.length === 0 ? (
                  <div className={styles.emptyState}>No custom behaviors defined yet.</div>
                ) : (
                  behaviors.map((b, idx) => (
                    <div key={idx} className={styles.behaviorItem}>
                      <div className={styles.behaviorInfo}>
                        <span className={styles.behaviorCode}>{b.code} ({b.name})</span>
                        <span className={styles.behaviorDetails}>
                          Type: {b.type || 'hold-tap'} | Flavor: {b.flavor} | Term: {b.tapping_term_ms || 200}ms
                          {b.hold_trigger_key_positions && ` | Positional: [${b.hold_trigger_key_positions.join(', ')}]`}
                        </span>
                      </div>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(idx)}>
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
              <button className={styles.primaryBtn} onClick={handleStartCreate}>
                + Add Custom Behavior
              </button>
            </>
          ) : (
            <form className={styles.form} onSubmit={handleSave}>
              <h3>New Custom Hold-Tap Behavior</h3>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Behavior Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Binding Code (e.g. &hm)</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Flavor</label>
                  <select
                    value={formData.flavor}
                    onChange={e => setFormData({ ...formData, flavor: e.target.value })}
                  >
                    <option value="balanced">balanced (Recommended for Home Row Mods)</option>
                    <option value="tap-preferred">tap-preferred</option>
                    <option value="hold-preferred">hold-preferred</option>
                    <option value="tap-unless-interrupted">tap-unless-interrupted</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Tapping Term (ms)</label>
                  <input
                    type="number"
                    value={formData.tapping_term_ms}
                    onChange={e => setFormData({ ...formData, tapping_term_ms: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Quick Tap (ms)</label>
                  <input
                    type="number"
                    value={formData.quick_tap_ms}
                    onChange={e => setFormData({ ...formData, quick_tap_ms: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Require Prior Idle (ms)</label>
                  <input
                    type="number"
                    value={formData.require_prior_idle_ms}
                    onChange={e => setFormData({ ...formData, require_prior_idle_ms: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Hold Trigger Key Positions (Opposite hand keys, e.g. 5 6 7 8):</label>
                <input
                  type="text"
                  placeholder="e.g. 5 6 7 8 15 16 17"
                  value={formData.hold_trigger_key_positions}
                  onChange={e => setFormData({ ...formData, hold_trigger_key_positions: e.target.value })}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
                <input
                  type="checkbox"
                  id="hold_trigger_on_release_cb"
                  checked={formData.hold_trigger_on_release}
                  onChange={e => setFormData({ ...formData, hold_trigger_on_release: e.target.checked })}
                />
                <label htmlFor="hold_trigger_on_release_cb">Hold Trigger on Release</label>
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
                  Save Behavior
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

CustomBehaviorModal.propTypes = {
  keymap: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};
