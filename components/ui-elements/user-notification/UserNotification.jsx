import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Icon } from '../icon'

export const UserNotificationsContainer = styled.div`
  box-sizing: border-box;
  width: 100vw;
  left: 0;
  position: fixed;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10vw;
  /* font-family: 'Open Sans'; */
  font-size: 14px;
`

const backgroundColor = ({ theme, type }) => `${theme.colors[type]}f2` // Opacity 95%

const NotificationContainer = styled.div`
  position: relative;
  background: ${backgroundColor};
  color: ${({ theme }) => theme.colors.empty};
  border-radius: 40px;
  min-height: 60px;
  padding: 20px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  max-width: 425px;
  @media (min-width: 720px) {
    max-width: 600px;
    width: 100%;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0px 52px 0px 40px;
  }
`

const StyledCloseButton = styled.button`
  position: absolute;
  background: ${({ theme }) => theme.colors.secondary};
  width: 42px;
  height: 42px;
  top: -20px;
  right: 10px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.empty};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 18px;
  /* Center X icon inside the button */
  display: flex;
  justify-content: center;
  padding-top: 4px;
  transition: background-color 100ms;
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    transition: background-color 100ms;
  }
  &:focus {
    outline: none;
    background-color: ${({ theme }) => theme.colors.primary};
    transition: background-color 100ms;
  }
`

const CloseButton = ({ onClick }) => {
  const [isHover, setHover] = useState(false)
  return (
    <StyledCloseButton
      onClick={onClick}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      // TODO: onBlur not working on mobile
    >
      <Icon icon="close" altIcon="close" color={!isHover ? 'default' : 'inverse'} visibleIcon={!isHover ? 'main' : 'alt'} />
    </StyledCloseButton>
  )
}

const Logo = styled.div`
  display: block;
  box-sizing: border-box;
  height: 40px;
  background: url('/taskility-logo-no-text.svg') no-repeat;
  width: 42px;
`

const messageColor = ({ theme, type }) => (type === 'warning' ? theme.colors.dark2 : theme.colors.empty)
const Message = styled.div`
  flex: 1 0;
  text-align: center;
  margin-top: 20px;
  color: ${messageColor};
  @media (min-width: 720px) {
    margin-top: 0;
    padding: 0 40px;
  }
`

export const UserNotification = props => {
  const [isHidden, setHidden] = useState(false)
  const { children, type } = props
  const onClose = event => {
    event.preventDefault()
    setHidden(true)
  }
  const styles = isHidden ? { display: 'none' } : {}
  return (
    <NotificationContainer type={type} style={styles}>
      <CloseButton onClick={onClose} />
      <Logo />
      <Message type={type}>{children}</Message>
    </NotificationContainer>
  )
}

UserNotification.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
}

UserNotification.defaultProps = {
  type: 'info',
}

// TODO: Update user notifications to trigger notifications programatically
//  Also, is required to keep notifications history and create a notifications API using the following parámeter
/*
title: 'Notification title',
text: 'Are you sure?',
icon: 'warning', 'info', <custom image>
  show close button optionally (i.e.: dont show on info notifications)
timer: 5000, // Auto hide after ms
buttons: ['Cancelar', 'Aceptar'],
         'Aceptar', === ['Aceptar']
         null // dont show any button (default?)
dangerous: true, // Autofocus on close button instead on confirm
 --- a way of make some notifications ('info') dissapear when the next arrives
      i.e: info: "Loading" -> dissapears when 'error' or 'success' notification arrives.
*/
