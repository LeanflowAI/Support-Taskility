import React, { useState, ReactNode } from 'react'
import styled from 'styled-components'
import { ToolBar } from '../tool-bar'
import { ToolBarSection } from '../tool-bar-section/index'

export type TabStyle = 'default' | 'inverse' | 'small'

const StyledTabsContainer = styled.div`
  width: 100%;
`

interface TabChildrenProps {
  tabStyle: TabStyle
  isSelected: boolean
  onClick: Function
}

interface TabPanelChildrenProps {
  tabStyle: TabStyle
  isSelected: boolean
}

interface TabsProps {
  defaultTab?: string
  tabStyle?: TabStyle
  tabs: (getProps: (panelName: string) => TabChildrenProps) => ReactNode
  panels: (getProps: (panelName: string) => TabPanelChildrenProps) => ReactNode
}

export const Tabs = ({ defaultTab = '', tabStyle = 'default', tabs, panels }: TabsProps) => {
  const [selectedPanel, setSelectedPanel]: [string, Function] = useState(defaultTab)
  const showPanel = (panelId: string) => setSelectedPanel(panelId)

  // TODO: Update to set a "tabName" property on tabs and panels, then compute and pass
  //   tabsStyle, selected and onClick properties directly to Tab and TabPanel children
  const getProps = (panelName: string) => ({
    tabStyle,
    isSelected: selectedPanel === panelName,
    onClick: () => showPanel(panelName),
  })

  return (
    <StyledTabsContainer>
      <ToolBar>
        <ToolBarSection textAlign="left">{tabs(getProps)}</ToolBarSection>
      </ToolBar>
      {panels(getProps)}
    </StyledTabsContainer>
  )
}
