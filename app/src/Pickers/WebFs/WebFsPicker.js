import PropTypes from 'prop-types';
import { useState } from 'react';
import * as config from '../../config';
import { parseDtsToKeymap } from '../../parsers/keymapParser';

export default function WebFsPicker({ onSelect }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isSupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  async function scanDirectoryEntries(dirHandle) {
    let keymapContent = null;
    let keymapFileName = null;
    let layoutData = null;

    async function checkFile(fileHandle) {
      if (fileHandle.name.endsWith('.keymap') && !keymapContent) {
        const file = await fileHandle.getFile();
        keymapContent = await file.text();
        keymapFileName = fileHandle.name;
      } else if (fileHandle.name.endsWith('.json') && !layoutData) {
        try {
          const file = await fileHandle.getFile();
          const text = await file.text();
          const parsed = JSON.parse(text);
          if (parsed.layouts || parsed.layout) {
            const l = parsed.layouts
              ? (
                parsed.layouts.default_layout?.layout ||
                parsed.layouts.LAYOUT?.layout ||
                parsed.layouts.default?.layout ||
                Object.values(parsed.layouts)[0]?.layout
              )
              : parsed.layout;
            if (Array.isArray(l) && l.length > 0) {
              layoutData = l;
            }
          }
        } catch (e) {
          // ignore non-layout json
        }
      }
    }

    // 1. Scan root
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        await checkFile(entry);
      }
    }

    // 2. Scan config/ folder
    try {
      const configDir = await dirHandle.getDirectoryHandle('config');
      for await (const entry of configDir.values()) {
        if (entry.kind === 'file') {
          await checkFile(entry);
        }
      }
    } catch (e) {
      // config/ directory not present
    }

    // 3. Scan boards/ folder if layoutData still not found
    if (!layoutData) {
      try {
        const boardsDir = await dirHandle.getDirectoryHandle('boards');
        async function scanSubDir(subHandle) {
          for await (const entry of subHandle.values()) {
            if (entry.kind === 'file') {
              await checkFile(entry);
            } else if (entry.kind === 'directory' && !layoutData) {
              await scanSubDir(entry);
            }
          }
        }
        await scanSubDir(boardsDir);
      } catch (e) {
        // boards/ directory not present
      }
    }

    return { keymapContent, keymapFileName, layoutData };
  }

  async function handleOpenDirectory() {
    if (!isSupported) {
      setError('Web File System Access API is not supported in this browser (Chrome / Edge recommended).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const dirHandle = await window.showDirectoryPicker();

      const { keymapContent, keymapFileName, layoutData } = await scanDirectoryEntries(dirHandle);

      if (!keymapContent) {
        throw new Error('No .keymap file found in the selected folder or config/ subfolder.');
      }

      // Try server parse-keymap API first, fallback to client-side parser
      let parsedKeymap = null;
      try {
        const res = await fetch(`${config.apiBaseUrl}/parse-keymap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dts: keymapContent })
        });
        if (res.ok) {
          parsedKeymap = await res.json();
        }
      } catch (err) {
        console.warn('Backend parse-keymap unavailable, using client-side parser', err);
      }

      if (!parsedKeymap) {
        parsedKeymap = parseDtsToKeymap(keymapContent);
      }

      // Fallback layout if no layout json exists
      const keyCount = (parsedKeymap.layers?.[0] || []).length || 64;
      const layout = layoutData || Array.from({ length: keyCount }, (_, i) => ({
        x: i % 12,
        y: Math.floor(i / 12)
      }));

      const keymap = {
        name: keymapFileName.replace('.keymap', ''),
        ...parsedKeymap,
        _rawDts: keymapContent,
        _dirHandle: dirHandle,
        _keymapFileName: keymapFileName
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
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 500,
          fontSize: '0.9rem'
        }}
      >
        {loading ? 'Opening Folder...' : 'Open Local Folder'}
      </button>

      {error && (
        <div style={{
          marginTop: '8px',
          color: '#ef4444',
          fontSize: '0.85rem'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

WebFsPicker.propTypes = {
  onSelect: PropTypes.func.isRequired
};
