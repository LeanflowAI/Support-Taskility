import styled from 'styled-components'
import { Text as Base } from 'rebass'

const fontSizes = {
  320: {
    1: '14px',
    2: '13px',
    9: '12px',
  },
  480: {
    1: '18px',
    2: '16px',
    9: '14px',
  },
  768: {
    1: '24px',
    2: '18px',
    9: '14px',
  },
}

const textColors = theme => ({
  1: theme.colors.empty,
  2: theme.colors.dark2,
  9: theme.colors.secondary,
})

export const Title = styled(Base)`
  /* font-family: 'Open Sans'; */
  color: ${({ theme, level = 9 }) => textColors(theme)[level]};
  @media (min-width: 320px) {
    font-size: ${({ level = 9 }) => fontSizes[320][level]};
  }
  @media (min-width: 480px) {
    font-size: ${({ level = 9 }) => fontSizes[480][level]};
  }
  @media (min-width: 768px) {
    font-size: ${({ level = 9 }) => fontSizes[768][level]};
  }
`
