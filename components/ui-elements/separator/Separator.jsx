import styled from 'styled-components'
import PropTypes from 'prop-types'
import { Box } from 'rebass'

export const Separator = styled(Box)`
  border-bottom: ${({ theme, direction }) => direction === 'horizontal' && `1px solid ${theme.colors.empty}`};
  border-right: ${({ theme, direction }) => direction === 'vertical' && `2px solid ${theme.colors.empty}`};
  height: ${({ direction }) => direction === 'vertical' && '40px'};
  margin-top: ${({ direction }) => direction === 'horizontal' && '20px'};
  margin-bottom: ${({ direction }) => direction === 'horizontal' && '20px'};
  margin-left: ${({ direction }) => direction === 'vertical' && '0px'};
  margin-right: ${({ direction }) => direction === 'vertical' && '0px'};
`

Separator.propTypes = {
  direction: PropTypes.oneOf(['horizontal', 'vertical']).isRequired,
}

Separator.defaultProps = {
  direction: 'horizontal',
}
