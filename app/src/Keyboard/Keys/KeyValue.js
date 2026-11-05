import { useMemo } from 'react'
import PropTypes from 'prop-types'

import * as keyPropTypes from './keyPropTypes'
import styles from './styles.module.css'
import Icon from '../../Common/Icon'

function NullKey() {
  return <span style={{ opacity: 0.35 }}>·</span>
}

function KeyValue(props) {
  const { param, index, value, source, onSelect } = props
  const isNone = value === '&none' || value === 'none' || value === undefined || value === null
  const title = source ? `(${source.code}) ${source.description || source.code}` : String(value || '')
  const text = source?.symbol || source?.code || (!isNone ? String(value) : null)
  const icon = source?.faIcon && <Icon name={source.faIcon} />

  const handleClick = useMemo(() => function (event) {
    event.stopPropagation()
    onSelect({
      target: event.target,
      codeIndex: index,
      code: value,
      param
    })
  }, [param, value, index, onSelect])

  return (
    <span
      className={styles.code}
      title={title}
      onClick={handleClick}
    >
      {icon || text || <NullKey />}
    </span>
  )
}

KeyValue.propTypes = {
  index: PropTypes.number.isRequired,
  param: keyPropTypes.param.isRequired,
  value: keyPropTypes.value.isRequired,
  source: keyPropTypes.source,
  onSelect: PropTypes.func.isRequired
}

export default KeyValue
