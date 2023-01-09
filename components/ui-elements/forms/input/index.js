import styled from 'styled-components'
import PropTypes from 'prop-types'

const backgroundColor = ({ theme, color }) => {
  const bgColors = {
    default: theme.colors.empty,
    inverse: theme.colors.empty,
    subtle: 'transparent',
  }
  return bgColors[color]
}

const heights = {
  default: '40px',
  big: '56px',
}

const paddings = {
  default: '0 10px',
  big: '0 20px',
}

const fontSizes = {
  default: '14px',
  big: '18px',
}

const BaseInput = styled.input`
  background-color: ${backgroundColor};
  color: ${({ theme }) => theme.colors.primary};
  /* font: normal normal ${({ size }) => fontSizes[size]} / 24px 'Open Sans'; */
  white-space: nowrap;
  transition: all 300ms;
  margin: 0 4px;
  height: ${({ size }) => heights[size]};
  padding: ${({ size }) => paddings[size]};
  &:focus {
    outline: none;
    transition: all 300ms;
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.dark3};
  }
`

BaseInput.propTypes = {
  size: PropTypes.oneOf(['default', 'big']).isRequired,
  color: PropTypes.oneOf(['default', 'inverse', 'subtle']),
}

BaseInput.defaultProps = {
  size: 'default',
  color: 'default',
}

const inputColor = ({ theme, color }) => {
  const colors = {
    default: theme.colors.primary,
    inverse: theme.colors.primary,
    subtle: theme.colors.empty,
  }
  return colors[color]
}

const inputFocusColor1 = ({ theme, color }) => {
  const colors = {
    default: theme.colors.empty,
    inverse: theme.colors.empty,
    subtle: 'rgba(0,0,0,0.4)',
  }
  return colors[color]
}

const inputFocusColor2 = ({ theme, color }) => {
  const colors = {
    default: theme.colors.primary,
    inverse: theme.colors.primary,
    subtle: 'rgba(0,0,0,0.4)',
  }
  return colors[color]
}

export const Input = styled(BaseInput)`
  color: ${inputColor};
  border: solid 1px ${inputColor};
  border-radius: 4px;
  transition: box-shadow 1000ms;
  &:focus {
    box-shadow: ${({ color }) => (color === 'subtle' ? '1px 1px 4px' : '0 0 0 2px')} ${inputFocusColor1},
      ${({ color }) => (color === 'subtle' ? 'inset 1px 1px 4px' : '0 0 0 3px')} ${inputFocusColor2};
    transition: box-shadow 1000ms;
  }
`

const underlinedColor = ({ theme, color }) => {
  const colors = {
    default: theme.colors.primary,
    inverse: theme.colors.empty,
  }
  return colors[color]
}

export const UnderlinedInput = styled(BaseInput)`
  background-color: transparent;
  color: ${underlinedColor};
  border: none;
  border-radius: 0;
  border-bottom: solid 1px ${({ theme }) => theme.colors.empty};
  &::placeholder {
    /* TODO: Disabled placeholders. Update to make it behave as it is defined in material design */
    color: transparent;
  }
`
