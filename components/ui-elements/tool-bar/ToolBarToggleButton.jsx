import React from 'react'
import styled from 'styled-components'
import { Button as Base, Box } from 'rebass'

const ButtonContainer = styled(Box)`
  position: relative;
  height: 0;
  width: auto;
`

const Button = styled(Base)`
  position: absolute;
  top: -40px;
  left: -12px;
  z-index: 8888;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  padding: 6px;
  background-color: ${({ theme }) => theme.colors.dark2};
  box-shadow: 0 -2px 9px ${({ theme }) => theme.colors.shadow};
  &:focus {
    outline: none;
  }
`

const InnerCircle = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(100deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.gradient});
`

export const ToolBarToggleButton = props => (
  <ButtonContainer>
    <Button {...props}>
      <InnerCircle />
    </Button>
  </ButtonContainer>
)
