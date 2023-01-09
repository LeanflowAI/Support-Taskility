import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

export const ClickOut = props => {
  const { children, onClickOut } = props
  const ref = useRef(null)
  useEffect(() => {
    const handleClickOutside = event => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClickOut()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  })

  return <div ref={ref}>{children}</div>
}

ClickOut.propTypes = {
  children: PropTypes.node.isRequired,
  onClickOut: PropTypes.func.isRequired,
}
