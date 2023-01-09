import styled from 'styled-components'
import { ToolBar } from './ToolBar.tsx'

export const ActionsToolbar = styled(ToolBar)`
  background: ${({ theme }) => theme.colors.empty};
  @media (max-width: 719px) {
    order: 99; /* Use flexbox from PageContent and push bar to bottom on small devices */
  }
`
