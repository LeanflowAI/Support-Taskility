import PropTypes from 'prop-types'
import styled from 'styled-components'

const labelColor = ({ theme, color }) => {
  const colors = {
    default: theme.colors.primary,
    inverse: theme.colors.secondary,
  }
  return colors[color]
}

// TODO: Can the fonts be placed on the theme to allow an update globally on the application?
export const Label = styled.label`
  font-family: 'Open Sans';
  font-size: 14px;
  color: ${labelColor};
  margin: 0 4px;
`

Label.propTypes = {
  color: PropTypes.oneOf(['default', 'inverse']).isRequired,
}

Label.defaultProps = {
  color: 'default',
}
