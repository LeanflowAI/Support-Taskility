import React from 'react'
import PropTypes from 'prop-types'
import { Box } from 'rebass'

export const VerticalExpandable = props => {
  // TODO: Collapse/Expand animation
  // expandedHeight variable from props removed because never used.
  const { expandedHeight, collapseState, children } = props
  return collapseState === 'expanded' ? <Box {...props}>{children}</Box> : null
}

VerticalExpandable.propTypes = {
  expandedHeight: PropTypes.number.isRequired,
  collapseState: PropTypes.oneOf(['initial', 'collapsed', 'expanded']),
  children: PropTypes.node.isRequired,
}

VerticalExpandable.defaultProps = {
  collapseState: 'initial',
}
