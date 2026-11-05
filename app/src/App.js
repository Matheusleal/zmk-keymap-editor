import '@fortawesome/fontawesome-free/css/all.css'
import keyBy from 'lodash/keyBy'
import { useEffect, useMemo, useState } from 'react'

import * as config from './config'
import './App.css';
import { DefinitionsContext } from './providers'
import { loadKeycodes } from './keycodes'
import { loadBehaviours } from './api'
import KeyboardPicker from './Pickers/KeyboardPicker';
import Spinner from './Common/Spinner';
import Keyboard from './Keyboard/Keyboard'
import GitHubLink from './GitHubLink'
import Loader from './Common/Loader'
import github from './Pickers/Github/api'
import ComboManager from './Combos/ComboManager'
import MacroEditor from './Macros/MacroEditor'
import ConditionalLayersModal from './ConditionalLayers/ConditionalLayersModal'
import CustomBehaviorModal from './CustomBehaviors/CustomBehaviorModal'
import ActionsPoller from './Pickers/Github/ActionsPoller'
import SvgExportModal from './Export/SvgExportModal'

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system')
  const [activeTab, setActiveTab] = useState('layers')
  const [definitions, setDefinitions] = useState(null)
  const [source, setSource] = useState(null)
  const [sourceOther, setSourceOther] = useState(null)
  const [layout, setLayout] = useState(null)
  const [keymap, setKeymap] = useState(null)
  const [editingKeymap, setEditingKeymap] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showCombos, setShowCombos] = useState(false)
  const [showMacros, setShowMacros] = useState(false)
  const [showConditionalLayers, setShowConditionalLayers] = useState(false)
  const [showBehaviors, setShowBehaviors] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [showExportSvg, setShowExportSvg] = useState(false)

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  function cycleTheme() {
    const next = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system'
    setTheme(next)
  }

  function getThemeIcon() {
    if (theme === 'light') return 'fa-sun'
    if (theme === 'dark') return 'fa-moon'
    return 'fa-circle-half-stroke'
  }

  function handleCompile() {
    fetch(`${config.apiBaseUrl}/keymap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editingKeymap || keymap)
    })
  }

  async function handleSaveWebFs() {
    if (!keymap || !keymap._dirHandle) return;
    try {
      setSaving(true);
      const fileName = (sourceOther && sourceOther.fileName) || `${keymap.name || 'keymap'}.keymap`;
      const fileHandle = await keymap._dirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      const content = JSON.stringify(editingKeymap || keymap, null, 2);
      await writable.write(content);
      await writable.close();
      setKeymap(editingKeymap);
      setEditingKeymap(null);
    } catch (err) {
      alert('Error saving to folder: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  const handleCommitChanges = useMemo(() => function() {
    const { repository, branch } = sourceOther.github

    ;(async function () {
      setSaving(true)
      await github.commitChanges(repository, branch, layout, editingKeymap)
      setSaving(false)

      setKeymap(editingKeymap)
      setEditingKeymap(null)
      setShowActions(true)
    })()
  }, [
    layout,
    editingKeymap,
    sourceOther,
    setSaving,
    setKeymap,
    setEditingKeymap,
    setShowActions
  ])

  const handleKeyboardSelected = useMemo(() => function(event) {
    const { source, layout, keymap, ...other } = event

    setSource(source)
    setSourceOther(other)
    setLayout(layout)
    setKeymap(keymap)
    setEditingKeymap(null)
  }, [
    setSource,
    setSourceOther,
    setLayout,
    setKeymap,
    setEditingKeymap
  ])

  const initialize = useMemo(() => {
    return async function () {
      const [keycodes, behaviours] = await Promise.all([
        loadKeycodes(),
        loadBehaviours()
      ])

      keycodes.indexed = keyBy(keycodes, 'code')
      behaviours.indexed = keyBy(behaviours, 'code')

      setDefinitions({ keycodes, behaviours })
    }
  }, [setDefinitions])

  const handleUpdateKeymap = useMemo(() => function(keymap) {
    setEditingKeymap(keymap)
  }, [setEditingKeymap])

  const tabs = [
    { id: 'layers', label: 'Layers', icon: 'fa-layer-group' },
    { id: 'combos', label: 'Combos', icon: 'fa-object-group' },
    { id: 'macros', label: 'Macros', icon: 'fa-bolt' },
    { id: 'conditional', label: 'Conditional Layers', icon: 'fa-code-branch' },
    { id: 'behaviors', label: 'Custom Behaviors', icon: 'fa-sliders' }
  ]

  return (
    <>
      <div id="settings-bar">
        <button
          id="theme-toggle"
          title={`Current theme: ${theme}. Click to toggle.`}
          onClick={cycleTheme}
        >
          <i className={`fa-solid ${getThemeIcon()}`} />
        </button>
      </div>

      <Loader load={initialize}>
        <div id="app-header">
          <KeyboardPicker onSelect={handleKeyboardSelected} />

          {keymap && (
            <ul className="editor-tabs">
              {tabs.map(tab => (
                <li
                  key={tab.id}
                  className={activeTab === tab.id ? 'active' : ''}
                  onClick={() => {
                    setActiveTab(tab.id)
                    if (tab.id === 'combos') setShowCombos(true)
                    else if (tab.id === 'macros') setShowMacros(true)
                    else if (tab.id === 'conditional') setShowConditionalLayers(true)
                    else if (tab.id === 'behaviors') setShowBehaviors(true)
                  }}
                >
                  <i className={`fa-solid ${tab.icon}`} style={{ marginRight: '6px' }} />
                  {tab.label}
                </li>
              ))}
            </ul>
          )}

          <div className="header-actions">
            {keymap && (
              <button
                title="Export visual SVG diagram of all layers and combos"
                onClick={() => setShowExportSvg(true)}
              >
                <i className="fa-solid fa-file-image" />
                Export SVG
              </button>
            )}

            {source === 'local' && (
              <button
                className="primary"
                disabled={!editingKeymap}
                onClick={handleCompile}
              >
                <i className="fa-solid fa-floppy-disk" />
                Save Local
              </button>
            )}

            {source === 'webfs' && (
              <button
                className="primary"
                disabled={!editingKeymap}
                onClick={handleSaveWebFs}
              >
                <i className="fa-solid fa-floppy-disk" />
                {saving ? 'Saving...' : 'Save to Folder'}
              </button>
            )}

            {source === 'github' && (
              <>
                <button
                  className="primary"
                  title="Commit keymap changes to GitHub repository"
                  disabled={!editingKeymap}
                  onClick={handleCommitChanges}
                >
                  <i className="fa-solid fa-cloud-arrow-up" />
                  {saving ? 'Saving' : 'Commit Changes'}
                  {saving && <Spinner />}
                </button>
                <button
                  title="Monitor firmware compilation on GitHub Actions and download .uf2"
                  onClick={() => setShowActions(true)}
                >
                  <i className="fa-solid fa-microchip" />
                  Firmware Build
                </button>
              </>
            )}
          </div>
        </div>

        <DefinitionsContext.Provider value={definitions}>
          {layout && keymap && (
            <Keyboard
              layout={layout}
              keymap={editingKeymap || keymap}
              onUpdate={handleUpdateKeymap}
            />
          )}
        </DefinitionsContext.Provider>

        {showCombos && (
          <ComboManager
            keymap={editingKeymap || keymap}
            onUpdate={handleUpdateKeymap}
            onClose={() => {
              setShowCombos(false)
              setActiveTab('layers')
            }}
          />
        )}
        {showMacros && (
          <MacroEditor
            keymap={editingKeymap || keymap}
            onUpdate={handleUpdateKeymap}
            onClose={() => {
              setShowMacros(false)
              setActiveTab('layers')
            }}
          />
        )}
        {showConditionalLayers && (
          <ConditionalLayersModal
            keymap={editingKeymap || keymap}
            onUpdate={handleUpdateKeymap}
            onClose={() => {
              setShowConditionalLayers(false)
              setActiveTab('layers')
            }}
          />
        )}
        {showBehaviors && (
          <CustomBehaviorModal
            keymap={editingKeymap || keymap}
            onUpdate={handleUpdateKeymap}
            onClose={() => {
              setShowBehaviors(false)
              setActiveTab('layers')
            }}
          />
        )}
        {showActions && sourceOther?.github && (
          <ActionsPoller
            repository={sourceOther.github.repository}
            branch={sourceOther.github.branch}
            isOpen={showActions}
            onClose={() => setShowActions(false)}
          />
        )}
        {showExportSvg && layout && (
          <SvgExportModal
            layout={layout}
            keymap={editingKeymap || keymap}
            isOpen={showExportSvg}
            onClose={() => setShowExportSvg(false)}
          />
        )}
      </Loader>
      <GitHubLink className="github-link" />
    </>
  );
}

export default App;
