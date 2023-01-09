import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Flex } from 'rebass'

const getTransition = ({ visible }) =>
  (visible ? '0.18, 0.89, 0.32, 1.28' : '0.63,-0.33, 0.93, 0.35')

const StyledFlex = styled(Flex)`
  position: absolute;
  width: 300px;
  top: 60px;
  right: ${({ side }) => (side === 'right' ? 0 : 'initial')};
  left: ${({ side }) => (side === 'left' ? 0 : 'initial')};
  transform: scaleX(${({ visible }) => (visible ? 1 : 0)});
  transform-origin: ${({ side }) => (side === 'left' ? 'left' : 'right')};
  background: ${({ theme }) => `${theme.colors.dark2}E9`}; /* Add opacity 0.9 */
  z-index: 9999;
  transition: transform 300ms cubic-bezier(${getTransition});
  padding: 4px;
  border-radius: 0 0 4px 4px;
`

export const SlideMenu = ({ side, children, visible }) => (
  <StyledFlex flexDirection="column" visible={visible} side={side}>
    {children}
  </StyledFlex>
)

SlideMenu.propTypes = {
  children: PropTypes.node.isRequired,
  visible: PropTypes.bool.isRequired,
}

SlideMenu.propTypes = {
  children: PropTypes.node.isRequired,
  visible: PropTypes.bool,
  side: PropTypes.oneOf(['right', 'left']),
}

SlideMenu.defaultProps = {
  visible: 'false',
  side: 'right',
}
