import styled from 'styled-components'
import { ToolBar } from './ToolBar.tsx'

export const MainBar = styled(ToolBar)`
  background: radial-gradient(
    954.17px at 57.25% 271.25%,
    ${({ theme }) => theme.colors.primary} 0%,
    ${({ theme }) => theme.colors.shade} 100%
  );
  height: 60px;
  padding: 0;
`
