import PropTypes from 'prop-types';
import { useState } from 'react';

export default function WebFsPicker({ onSelect }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isSupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  async function handleOpenDirectory() {
    if (!isSupported) {
      setError('Web File System Access API is not supported in this browser (Chrome / Edge recommended).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const dirHandle = await window.showDirectoryPicker();

      let keymapContent = null;
      let keymapFileName = null;
      let layoutData = null;

      // Scan directory entries
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          if (entry.name.endsWith('.keymap')) {
            const file = await entry.getFile();
            keymapContent = await file.text();
            keymapFileName = entry.name;
          } else if (entry.name === 'info.json' || entry.name.endsWith('.json')) {
            try {
              const file = await entry.getFile();
              const text = await file.text();
              const parsed = JSON.parse(text);
              if (parsed.layouts || parsed.layout) {
                layoutData = parsed.layouts ? Object.values(parsed.layouts)[0]?.layout : parsed.layout;
              }
            } catch (e) {
              // Ignore non-layout JSON files
            }
          }
        } else if (entry.kind === 'directory' && entry.name === 'config') {
          // Check inside config/ subfolder
          for await (const subEntry of entry.values()) {
            if (subEntry.kind === 'file' && subEntry.name.endsWith('.keymap')) {
              const file = await subEntry.getFile();
              keymapContent = await file.text();
              keymapFileName = subEntry.name;
            }
          }
        }
      }

      if (!keymapContent) {
        throw new Error('No .keymap file found in the selected folder or config/ subfolder.');
      }

      // Default grid layout fallback if info.json is absent
      const layout = layoutData || [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 },
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }
      ];

      const keymap = {
        name: keymapFileName.replace('.keymap', ''),
        layer_names: ['Base'],
        layers: [
          [{ value: '&kp', params: [{ value: 'A', params: [] }] }]
        ],
        _rawDts: keymapContent,
        _dirHandle: dirHandle
      };

      onSelect({
        source: 'webfs',
        layout,
        keymap,
        fileName: keymapFileName
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Error opening folder');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: '10px' }}>
      <button
        type="button"
        disabled={loading}
        onClick={handleOpenDirectory}
        style={{
          background: '#0284c7',
          color: '#ffffff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '500'
        }}
      >
        {loading ? 'Reading Folder...' : 'Open Local Folder (Browser)'}
      </button>

      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '6px' }}>
          {error}
        </div>
      )}
    </div>
  );
}

WebFsPicker.propTypes = {
  onSelect: PropTypes.func.isRequired
};
