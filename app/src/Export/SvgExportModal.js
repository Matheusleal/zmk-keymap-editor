import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { generateKeymapSvg } from './svgDrawer'
import styles from './SvgExportModal.module.css'

export default function SvgExportModal({ layout, keymap, isOpen, onClose }) {
  const [copied, setCopied] = useState(false)

  const svgContent = useMemo(() => {
    if (!isOpen || !layout || !keymap) return ''
    try {
      return generateKeymapSvg(layout, keymap)
    } catch (err) {
      console.error('Error generating SVG:', err)
      return ''
    }
  }, [layout, keymap, isOpen])

  if (!isOpen) return null

  const handleDownload = () => {
    if (!svgContent) return
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${keymap.name || 'keymap'}-diagram.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    if (!svgContent) return
    try {
      await navigator.clipboard.writeText(svgContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard', err)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Export Keymap SVG Diagram</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className={styles.body}>
          <div
            className={styles.previewContainer}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>

        <div className={styles.footer}>
          {copied && <span className={styles.copiedToast}>SVG copied to clipboard!</span>}
          <button className={styles.secondaryButton} onClick={handleCopy}>
            Copy SVG
          </button>
          <button className={styles.primaryButton} onClick={handleDownload}>
            Download SVG
          </button>
        </div>
      </div>
    </div>
  )
}

SvgExportModal.propTypes = {
  layout: PropTypes.array,
  keymap: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}
