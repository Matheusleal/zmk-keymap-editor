import React, { useState, useEffect, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import github from './api'
import styles from './ActionsPoller.module.css'

export default function ActionsPoller({ repository, branch, isOpen, onClose }) {
  const [selectedRun, setSelectedRun] = useState(null)
  const [artifacts, setArtifacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const pollTimerRef = useRef(null)

  const loadData = useCallback(async () => {
    if (!repository) return
    setLoading(true)
    setError(null)
    try {
      const runsData = await github.fetchWorkflowRuns(repository, branch)
      const latest = runsData[0] || null
      setSelectedRun(latest)

      if (latest && (latest.conclusion === 'success' || latest.status === 'completed')) {
        const artifactsData = await github.fetchRunArtifacts(repository, latest.id)
        setArtifacts(artifactsData)
      } else {
        setArtifacts([])
      }
    } catch (err) {
      console.error('Failed to fetch workflow runs or artifacts', err)
      setError('Failed to fetch GitHub Actions build status.')
    } finally {
      setLoading(false)
    }
  }, [repository, branch])

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
      }
    }
  }, [isOpen, loadData])

  useEffect(() => {
    if (isOpen && selectedRun && (selectedRun.status === 'queued' || selectedRun.status === 'in_progress')) {
      pollTimerRef.current = setInterval(() => {
        loadData()
      }, 5000)
    } else {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
      }
    }
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
      }
    }
  }, [isOpen, selectedRun, loadData])

  if (!isOpen) return null

  const getStatusBadge = (run) => {
    if (!run) return null
    if (run.status === 'queued') {
      return <span className={`${styles.badge} ${styles.badgeQueued}`}>Queued</span>
    }
    if (run.status === 'in_progress') {
      return <span className={`${styles.badge} ${styles.badgeProgress}`}>Building...</span>
    }
    if (run.conclusion === 'success') {
      return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Success</span>
    }
    if (run.conclusion === 'failure') {
      return <span className={`${styles.badge} ${styles.badgeFailure}`}>Failed</span>
    }
    return <span className={styles.badge}>{run.status}</span>
  }

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Firmware Build & Artifacts</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.repoInfo}>
            Repository: <strong>{repository}</strong> {branch && `(${branch})`}
          </div>

          {error && <div className={styles.metaText} style={{ color: '#f87171' }}>{error}</div>}

          {loading && !selectedRun && (
            <div className={styles.emptyState}>Checking GitHub Actions workflows...</div>
          )}

          {selectedRun ? (
            <div className={styles.statusCard}>
              <div className={styles.statusHeader}>
                <span className={styles.runName}>{selectedRun.name || 'Build Firmware'}</span>
                {getStatusBadge(selectedRun)}
              </div>
              <div className={styles.metaText}>
                Commit: {selectedRun.head_sha ? selectedRun.head_sha.substring(0, 7) : 'latest'} &bull;{' '}
                Updated: {selectedRun.updated_at ? new Date(selectedRun.updated_at).toLocaleTimeString() : 'N/A'}
              </div>

              {selectedRun.status === 'in_progress' && (
                <div className={styles.metaText} style={{ color: '#60a5fa' }}>
                  Workflow is currently compiling ZMK firmware. Auto-refreshing every 5 seconds...
                </div>
              )}

              <div className={styles.artifactsSection}>
                <h4>Generated Artifacts (.uf2 / .zip)</h4>
                {artifacts.length === 0 ? (
                  <div className={styles.metaText}>
                    {selectedRun.conclusion === 'success'
                      ? 'No artifact found or artifact expired.'
                      : 'Artifacts will be available once the build successfully completes.'}
                  </div>
                ) : (
                  <div className={styles.artifactList}>
                    {artifacts.map(art => (
                      <div key={art.id} className={styles.artifactItem}>
                        <div>
                          <div className={styles.artifactName}>{art.name}</div>
                          <div className={styles.metaText}>{formatBytes(art.size_in_bytes)}</div>
                        </div>
                        <a
                          href={art.archive_download_url || selectedRun.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.downloadLink}
                        >
                          Download Firmware
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            !loading && <div className={styles.emptyState}>No recent workflow runs found for this repository.</div>
          )}

          <div className={styles.actions}>
            {selectedRun && (
              <a
                href={selectedRun.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.refreshButton}
                style={{ textDecoration: 'none' }}
              >
                View on GitHub
              </a>
            )}
            <button className={styles.refreshButton} onClick={loadData} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

ActionsPoller.propTypes = {
  repository: PropTypes.string,
  branch: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}
