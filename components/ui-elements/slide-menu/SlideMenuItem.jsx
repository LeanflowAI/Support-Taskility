import styled from 'styled-components'
import { Box } from 'rebass'

export const SlideMenuItem = styled(Box)`
  height: 40px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark3};
  &:hover {
    background: ${({ theme }) => theme.colors.dark2};
    opacity: 1;
  }
  text-decoration: none;
`
