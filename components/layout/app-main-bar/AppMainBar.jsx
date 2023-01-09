import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'antd'
import { AppLogo, ResponsiveVisibilityToogle } from '..'
import { Icon } from '../../ui-elements/icon'
import { MainBar } from '../../ui-elements/tool-bar'
import { Title } from '../../ui-elements/title'
import { ToolBarSection } from '../../ui-elements/tool-bar-section/index.ts'
import { Select } from '../../ui-elements/forms/select'
import { Separator } from '../../ui-elements/separator'

const companyOptions = [
  { value: 'emp1', label: 'A1A Logistics' },
  { value: 'emp2', label: 'A1A Expedited' },
  { value: 'emp3', label: 'A1A Trucking' },
]

export const AppMainBar = ({ title, toggleMainMenu, menuVisible, toggleAgentChat }) => (
  <MainBar>
    <ToolBarSection>
      <AppLogo onClick={toggleAgentChat} />
    </ToolBarSection>
    <ToolBarSection>
      <Separator direction="vertical" />
    </ToolBarSection>
    <ToolBarSection width={1}>
      <Title level={1}>{title}</Title>
    </ToolBarSection>
    <ToolBarSection textAlign="right" width={1 / 2}>
      <ResponsiveVisibilityToogle cssBreakpoint="768px">
        <Button color="subtle">
          <Icon icon="down" color="inverse" />
        </Button>
        <Select placeholder="Empresa" options={companyOptions} color="inverse" />
      </ResponsiveVisibilityToogle>
    </ToolBarSection>
    <ToolBarSection textAlign="right">
      <Button color="subtle">
        <Icon icon="bell" color="inverse" />
      </Button>
    </ToolBarSection>
    <ToolBarSection textAlign="right">
      <Button color="subtle" onClick={toggleMainMenu}>
        <Icon icon="hamburguerMenu" color="inverse" altIcon="close" visibleIcon={menuVisible ? 'alt' : 'main'} />
      </Button>
    </ToolBarSection>
  </MainBar>
)

AppMainBar.propTypes = {
  title: PropTypes.string.isRequired,
  toggleMainMenu: PropTypes.func.isRequired,
  menuVisible: PropTypes.bool.isRequired,
  toggleAgentChat: PropTypes.func.isRequired,
}
