import React, { useState } from 'react'
import styled from 'styled-components'

const ModalOverlay = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`

const StyledModal = styled.div`
  margin: 10vw 10vh;
  padding: 20px;
  min-width: 320px;
  min-height: 200px;
  background: ${({ theme }) => theme.colors.empty};
`

interface ModalContentProps {
  children: React.ReactNode
}

export const ModalContent = ({ children }: ModalContentProps) => {
  return (
    <ModalOverlay>
      <StyledModal>{children}</StyledModal>
    </ModalOverlay>
  )
}

interface ModalProps {
  toggle: Function
  content: Function
}

// TODO: Close with ESC key
// TODO: Refactor using hooks instead of render props.
export const Modal = ({ toggle, content }: ModalProps) => {
  const [isShown, setIsShown] = useState(false)
  const hide = () => setIsShown(false)
  const show = () => setIsShown(true)

  return (
    <>
      {toggle(show)}
      {isShown && content(hide)}
    </>
  )
}
