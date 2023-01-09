import React, { useState } from 'react'
import styled from 'styled-components'
import { Icon } from '../icon'

const ChipCloseStyled = styled.div`
  background: ${({ theme }) => theme.colors.empty};
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  margin-left: 15px;
  border-radius: 50%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  transition: background-color 100ms;
  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.empty};
    background-color: ${({ theme }) => theme.colors.primary};
    transition: background-color 100ms;
  }
  &:focus {
    outline: none;
    border: 1px solid ${({ theme }) => theme.colors.empty};
    background-color: ${({ theme }) => theme.colors.primary};
    transition: background-color 100ms;
  }

  /* This styles prevent Icons to get stucked when the Toolbar that wraps the Chip scrolls left/right  */
  & * {
    position: relative;
    left: 0px;
    top: 0px;
  }
`

export const ChipClose = ({ onClick }: { onClick: any }) => {
  const [isHover, setHover] = useState(false)
  return (
    <ChipCloseStyled onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)}>
      {/* //
      //@ts-ignore */}
      <Icon icon="close" size={12} color={!isHover ? 'default' : 'inverse'} onClick={onClick} />
    </ChipCloseStyled>
  )
}

export const Chip = styled.div`
  background: ${({ theme }) => theme.colors.primary};
  box-sizing: border-box;
  height: 24px;
  margin: 4px 8px;
  padding: 0 8px;
  border-radius: 12px;
  /* font-family: 'Open Sans'; */
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  & * {
    white-space: nowrap;
  }
`
