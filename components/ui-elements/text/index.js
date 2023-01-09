import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Text as Base } from 'rebass'

const fontSize = ({ size = 'default' }) => {
  const paddings = {
    default: '12px',
    big: '14px',
  }
  return paddings[size]
}

const textColor = ({ theme, color = 'normal' }) => {
  const textColors = {
    normal: theme.colors.dark2,
    inverse: theme.colors.empty,
  }
  return textColors[color]
}

export const Text = styled(Base)`
  font-size: ${fontSize};
  /* font-family: 'Open Sans'; */
  color: ${textColor};
  padding-left: 4px;
  padding-right: 4px;
`

Text.propTypes = {
  color: PropTypes.oneOf(['normal', 'inverse']),
  size: PropTypes.oneOf(['default', 'big']),
}

Text.defaultProps = {
  color: 'normal',
  size: 'default',
}
