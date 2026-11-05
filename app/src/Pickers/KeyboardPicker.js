import compact from 'lodash/compact'
import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'

import * as config from '../config'
import { loadLayout } from '../layout.js'
import { loadKeymap } from '../keymap.js'
import GithubPicker from './Github/Picker'
import WebFsPicker from './WebFs/WebFsPicker'
import Spinner from '../Common/Spinner'

const isWebFsSupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window

const sourceChoices = compact([
  isWebFsSupported ? {
    id: 'webfs',
    name: 'Local Folder',
    icon: 'fa-folder-open',
    shortDescription: 'Direct browser folder access',
    description: 'Read and write keymap and layout files directly on your computer using the Web File System API.'
  } : null,
  config.enableLocal ? {
    id: 'local',
    name: 'Local Server',
    icon: 'fa-server',
    shortDescription: 'Local Node.js backend',
    description: 'Read and compile keymaps managed directly by the local Express server directory.'
  } : null,
  config.enableGitHub ? {
    id: 'github',
    name: 'GitHub',
    icon: 'fa-brands fa-github',
    shortDescription: 'zmk-config repository',
    description: 'Connect to your GitHub repository to edit keymaps, commit changes, and monitor firmware compilation.'
  } : null
])

function KeyboardPicker(props) {
  const { onSelect, isLoaded, onReset } = props
  const [source, setSource] = useState(null)
  const [loadingLocal, setLoadingLocal] = useState(false)
  const [localError, setLocalError] = useState(null)

  const handleKeyboardSelected = useMemo(() => function (event) {
    const { layout, keymap, ...rest } = event

    const layerNames = keymap.layer_names || keymap.layers.map((_, i) => `Layer ${i}`)
    Object.assign(keymap, {
      layer_names: layerNames
    })

    onSelect({ source, layout, keymap, ...rest })
  }, [onSelect, source])

  const fetchLocalKeyboard = useMemo(() => async function() {
    try {
      setLoadingLocal(true)
      setLocalError(null)
      const [layout, keymap] = await Promise.all([
        loadLayout(),
        loadKeymap()
      ])

      handleKeyboardSelected({ source: 'local', layout, keymap })
    } catch (err) {
      console.warn('Failed to load local keyboard automatically from server:', err)
      setLocalError(err.message || 'Error loading keyboard from local server')
    } finally {
      setLoadingLocal(false)
    }
  }, [handleKeyboardSelected])

  useEffect(() => {
    if (source === 'local') {
      fetchLocalKeyboard()
    }
  }, [source, fetchLocalKeyboard])

  // If already loaded, we don't render the big welcome picker
  if (isLoaded) {
    return null
  }

  // Welcome Screen: No source selected yet
  if (!source) {
    return (
      <div className="welcome-page">
        <div className="welcome-heading">
          <div className="welcome-badge">ZMK Keymap Editor</div>
          <h1>Welcome!</h1>
          <p>
            This application allows you to load ZMK keymap code and manage it with a rich graphical presentation of your keyboard.
            To begin, select a source from which to load your keyboard data.
          </p>
        </div>

        <div className="source-cards">
          {sourceChoices.map(choice => (
            <div
              key={choice.id}
              className="source-card"
              onClick={() => setSource(choice.id)}
            >
              <div className="source-icon-wrapper">
                <i className={`${choice.icon.includes('fa-brands') ? choice.icon : `fa-solid ${choice.icon}`} source-icon`} />
              </div>
              <h2>{choice.name}</h2>
              <div className="source-short-badge">{choice.shortDescription}</div>
              <p className="source-description">{choice.description}</p>
              <button className="select-source-btn">
                Select {choice.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // A source is selected, display its configuration view with a back link
  return (
    <div className="source-container">
      <div className="source-panel-header">
        <button
          className="back-btn"
          onClick={() => {
            setSource(null)
            if (onReset) onReset()
          }}
        >
          <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }} />
          Back to Sources
        </button>
        <span className="source-active-title">
          Selected Source: <strong>{sourceChoices.find(c => c.id === source)?.name || source}</strong>
        </span>
      </div>

      <div className="source-panel-body">
        {source === 'webfs' && (
          <div className="webfs-container">
            <WebFsPicker onSelect={handleKeyboardSelected} />
          </div>
        )}

        {source === 'local' && (
          <div className="local-server-status">
            {loadingLocal ? (
              <div className="status-loading">
                <Spinner />
                <p>Fetching layout and keymap from local server...</p>
              </div>
            ) : localError ? (
              <div className="status-error">
                <i className="fa-solid fa-triangle-exclamation" />
                <p>{localError}</p>
                <button onClick={fetchLocalKeyboard} className="retry-btn">
                  Try Again
                </button>
              </div>
            ) : (
              <p>Ready to load local server keymap.</p>
            )}
          </div>
        )}

        {source === 'github' && (
          <div className="github-container">
            <GithubPicker onSelect={handleKeyboardSelected} />
          </div>
        )}
      </div>
    </div>
  )
}

KeyboardPicker.propTypes = {
  onSelect: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool,
  onReset: PropTypes.func
}

export default KeyboardPicker
