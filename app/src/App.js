import '@fortawesome/fontawesome-free/css/all.css'
import keyBy from 'lodash/keyBy'
import { useMemo, useState } from 'react'

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

function App() {
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

  return (
    <>
      <Loader load={initialize}>
        <KeyboardPicker onSelect={handleKeyboardSelected} />
        <div id="actions">
          {keymap && (
            <>
              <button
                title="Manage ZMK Combos"
                onClick={() => setShowCombos(true)}
              >
                Combos
              </button>
              <button
                title="Manage ZMK Macros"
                onClick={() => setShowMacros(true)}
              >
                Macros
              </button>
              <button
                title="Manage Conditional Layers (Tri-Layer)"
                onClick={() => setShowConditionalLayers(true)}
              >
                Conditional Layers
              </button>
              <button
                title="Manage Custom Behaviors (Hold-Tap)"
                onClick={() => setShowBehaviors(true)}
              >
                Custom Behaviors
              </button>
            </>
          )}
          {source === 'local' && (
            <button disabled={!editingKeymap} onClick={handleCompile}>
              Save Local
            </button>
          )}
          {source === 'webfs' && (
            <button disabled={!editingKeymap} onClick={handleSaveWebFs}>
              {saving ? 'Saving...' : 'Save to Folder'}
            </button>
          )}
          {source === 'github' && (
            <>
              <button
                title="Commit keymap changes to GitHub repository"
                disabled={!editingKeymap}
                onClick={handleCommitChanges}
              >
                {saving ? 'Saving' : 'Commit Changes'}
                {saving && <Spinner />}
              </button>
              <button
                title="Monitor firmware compilation on GitHub Actions and download .uf2"
                onClick={() => setShowActions(true)}
              >
                Firmware Build
              </button>
            </>
          )}
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
            onClose={() => setShowCombos(false)}
          />
        )}
        {showMacros && (
          <MacroEditor
            keymap={editingKeymap || keymap}
            onUpdate={handleUpdateKeymap}
            onClose={() => setShowMacros(false)}
          />
        )}
        {showConditionalLayers && (
          <ConditionalLayersModal
            keymap={editingKeymap || keymap}
            onUpdate={handleUpdateKeymap}
            onClose={() => setShowConditionalLayers(false)}
          />
        )}
        {showBehaviors && (
          <CustomBehaviorModal
            keymap={editingKeymap || keymap}
            onUpdate={handleUpdateKeymap}
            onClose={() => setShowBehaviors(false)}
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
      </Loader>
      <GitHubLink className="github-link" />
    </>
  );
}

export default App;
