import PropTypes from 'prop-types'
import styled, { StyledComponentInnerOtherProps } from 'styled-components'
import { Flex as Base } from 'rebass'

const bgColor = ({ color, theme }: { color: string; theme: any }) => {
  const bgColors = {
    normal: theme.colors.empty,
    inverse: theme.colors.dark2,
    none: 'transparent',
  }
  // @ts-ignore
  return bgColors[color]
}

// TODO: Fix any type
export const ToolBar: any = styled(Base)`
  color: ${({ theme }) => theme.colors.empty};
  background-color: ${bgColor};
  padding: 0px;
  align-items: center;
  justify-content: space-between;
  overflow-y: visible;
  /* TODO: Fix any type */
  overflow-x: ${({ scrollX }: any) => (scrollX ? 'scroll' : 'visible')};
  height: ${({ height }) => (height === 'auto' ? 'auto' : '60px')};
  flex-shrink: 0; /* Toolbars are intended to be contained on PageContent or AppBody components */
  @media (min-width: 320px) {
    padding-left: 0px;
    padding-right: 0px;
  }
  @media (min-width: 480px) {
    padding-left: 6px;
    padding-right: 6px;
  }
  @media (min-width: 768px) {
    padding-left: 10px;
    padding-right: 10px;
  }
`

// ToolBar.propTypes = {
//   color: PropTypes.oneOf(['normal', 'inverse', 'none']),
//   height: PropTypes.oneOf(['fixed', 'auto']),
//   scrollX: PropTypes.bool,
// }

// ToolBar.defaultProps = {
//   color: 'normal',
//   height: 'fixed',
//   scrollX: false,
// }
