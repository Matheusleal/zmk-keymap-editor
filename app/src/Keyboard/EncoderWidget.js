import PropTypes from 'prop-types';
import { useState } from 'react';

export default function EncoderWidget({ activeLayer, keymap, onUpdate }) {
  const sensorBindings = keymap.sensor_bindings || [];
  const currentLayerSensors = sensorBindings[activeLayer] || [];
  const [editing, setEditing] = useState(false);

  // Parse first sensor binding (e.g. "&inc_dec_kp C_VOL_UP C_VOL_DN")
  const currentRaw = currentLayerSensors[0] || '&inc_dec_kp C_VOL_UP C_VOL_DN';
  const parts = currentRaw.replace('&inc_dec_kp', '').trim().split(/\s+/);
  const defaultCw = parts[0] || 'C_VOL_UP';
  const defaultCcw = parts[1] || 'C_VOL_DN';

  const [cw, setCw] = useState(defaultCw);
  const [ccw, setCcw] = useState(defaultCcw);

  function handleSave(e) {
    e.preventDefault();
    const newSensorStr = `&inc_dec_kp ${cw.trim().replace(/^&kp\s*/, '')} ${ccw.trim().replace(/^&kp\s*/, '')}`;
    const updated = [...sensorBindings];
    while (updated.length <= activeLayer) {
      updated.push([]);
    }
    updated[activeLayer] = [newSensorStr];

    onUpdate({
      ...keymap,
      sensor_bindings: updated
    });
    setEditing(false);
  }

  function handleRemove() {
    const updated = [...sensorBindings];
    if (updated[activeLayer]) {
      updated[activeLayer] = [];
    }
    onUpdate({
      ...keymap,
      sensor_bindings: updated
    });
  }

  return (
    <div style={{
      margin: '12px auto',
      maxWidth: '600px',
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '0.9rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#1e293b',
          border: '2px solid #38bdf8',
          color: '#38bdf8'
        }}>
          &#x21bb;
        </span>
        <div>
          <strong style={{ color: '#38bdf8' }}>Rotary Encoder:</strong>{' '}
          {currentLayerSensors.length > 0 ? (
            <span>CW: <code>{defaultCw}</code> | CCW: <code>{defaultCcw}</code></span>
          ) : (
            <span style={{ color: '#64748b' }}>None configured for this layer</span>
          )}
        </div>
      </div>

      {!editing ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setEditing(true)}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {currentLayerSensors.length > 0 ? 'Edit' : '+ Configure'}
          </button>
          {currentLayerSensors.length > 0 && (
            <button
              type="button"
              onClick={handleRemove}
              style={{
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSave} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="CW (e.g. C_VOL_UP)"
            value={cw}
            onChange={e => setCw(e.target.value)}
            style={{
              background: '#1e293b',
              border: '1px solid #475569',
              color: '#f8fafc',
              padding: '4px 8px',
              borderRadius: '4px',
              width: '120px'
            }}
          />
          <input
            type="text"
            placeholder="CCW (e.g. C_VOL_DN)"
            value={ccw}
            onChange={e => setCcw(e.target.value)}
            style={{
              background: '#1e293b',
              border: '1px solid #475569',
              color: '#f8fafc',
              padding: '4px 8px',
              borderRadius: '4px',
              width: '120px'
            }}
          />
          <button
            type="submit"
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            style={{
              background: '#334155',
              color: '#cbd5e1',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

EncoderWidget.propTypes = {
  activeLayer: PropTypes.number.isRequired,
  keymap: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
};
