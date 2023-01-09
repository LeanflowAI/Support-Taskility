import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Input } from '../../ui-elements/forms'
import { SlideMenu } from '../../ui-elements/slide-menu'
import { Text } from '../../ui-elements/text'

// TODO: This a provisional placeholder component. Waiting for design review.
const StyledText = styled(Text)`
  border-bottom: 4px solid ${({ from, theme }) => (from === 'user' ? theme.colors.primary : theme.colors.empty)};
  text-align: ${({ from }) => (from === 'user' ? 'right' : 'left')};
  padding: 20px;
`

const AgentChatTextItem = ({ text, href = '/', from }) => (
  <StyledText type="inverse" size="big" from={from}>
    {text}
  </StyledText>
)

const messages = [
  { id: '1', text: 'Hola Germán, soy Taskility', from: 'agent' },
  { id: '2', text: 'Dime cuál es el estado del embarque A1A191826?', from: 'user' },
  { id: '3', text: 'El embarque está en Nuevo Laredo, Texas. Ya fue entregado.', from: 'agent' },
  { id: '4', text: '¿Cuánto hemos facturado en este mes?', from: 'user' },
]

export const AgentChatMenu = ({ visible }) => {
  return (
    <SlideMenu visible={visible} side="left">
      {messages.map(message => (
        <AgentChatTextItem key={message.id} href="/" {...message} />
      ))}
      <Input />
    </SlideMenu>
  )
}

AgentChatMenu.propTypes = {
  visible: PropTypes.bool,
}

AgentChatMenu.defaultProps = {
  visible: false,
}
