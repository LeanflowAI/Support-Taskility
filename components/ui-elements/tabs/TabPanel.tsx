import styled from 'styled-components'
import { TabStyle } from './Tabs'

interface TabPanelProps {
  isSelected?: boolean
  tabStyle: TabStyle
}

export const TabPanel = styled.div`
  display: ${({ isSelected }: TabPanelProps) => (isSelected ? 'block' : 'none')};
  padding: 10px;
`
