import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Small = styled.div`
  display: block;
  @media (min-width: ${({ breakpoint }) => breakpoint}) {
    display: none;
  }
`

const Large = styled.div`
  display: none;
  @media (min-width: ${({ breakpoint }) => breakpoint}) {
    display: block;
  }
`

export const ResponsiveVisibilityToogle = ({ children, cssBreakpoint }) => [
  <Small key="small" breakpoint={cssBreakpoint}>
    {children[0]}
  </Small>,
  <Large key="large" breakpoint={cssBreakpoint}>
    {children[1]}
  </Large>,
]

const ArrayOfLengthTwo = (props, propName) => {
  // eslint-disable-next-line react/destructuring-assignment
  if (!Array.isArray(props[propName]) || props[propName].length !== 2) {
    return new Error(`${propName} needs to be an array of two items`)
  }
  return null
}

ResponsiveVisibilityToogle.propTypes = {
  children: ArrayOfLengthTwo,
  cssBreakpoint: PropTypes.string.isRequired,
}

ResponsiveVisibilityToogle.defaultProps = {
  children: null,
}
