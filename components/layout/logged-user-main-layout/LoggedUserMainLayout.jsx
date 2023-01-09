import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { AppMainBar, AppMainMenu, AgentChatMenu } from '..'
import { ClickOut } from '../../ui-elements/click-out'
import { AppHeadLayout } from '../app-head-layout'

const useToggleMenu = () => {
  const [state, setState] = useState({ menuVisible: false })
  const onClickOut = () => {
    setState({ hiddenByClickOut: false })
    if (state.menuVisible) {
      setState({ menuVisible: false, hiddenByClickOut: true })
    }
  }
  const toggleMainMenu = () => {
    if (!state.menuVisible && !state.hiddenByClickOut) {
      setState({ menuVisible: true })
    }
  }
  return [state.menuVisible || false, onClickOut, toggleMainMenu]
}

export const LoggedUserMainLayout = props => {
  const [menuVisible, onMenuClickOut, toggleMainMenu] = useToggleMenu()
  const [agentChatVisible, onAgentChatClickOut, toggleAgentChat] = useToggleMenu()
  const { children, title = 'Taskility', tabTitle = 'Taskility' } = props

  const hideMenus = () => {
    onAgentChatClickOut()
    onMenuClickOut()
  }

  return (
    <>
      <AppHeadLayout title={title} tabTitle={tabTitle} />
      <AppMainBar
        toggleMainMenu={toggleMainMenu}
        menuVisible={menuVisible}
        toggleAgentChat={toggleAgentChat}
        {...props}
      />
      <ClickOut onClickOut={hideMenus}>
        <AgentChatMenu visible={agentChatVisible} />
        <AppMainMenu visible={menuVisible} />
      </ClickOut>
      {children}
    </>
  )
}
