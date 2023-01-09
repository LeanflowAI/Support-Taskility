import React from 'react'
import styled from 'styled-components'
import { TabStyle } from './Tabs'

interface StyledTabProps {
  theme: any
  isSelected?: boolean
  tabStyle: TabStyle
}

const backgroundColor = ({ theme, isSelected, tabStyle }: StyledTabProps) => {
  if (isSelected) {
    return tabStyle === 'small' ? theme.colors.empty : 'transparent'
  }
  return tabStyle === 'small' ? theme.colors.primary : 'transparent'
}

const textColor = ({ theme, isSelected, tabStyle }: StyledTabProps) => {
  const colors: { [key in TabStyle]: string } = {
    default: theme.colors.dark2,
    inverse: theme.colors.empty,
    small: isSelected ? theme.colors.primary : theme.colors.empty,
  }
  return colors[tabStyle]
}

const borderColor = ({ theme, isSelected, tabStyle }: StyledTabProps) => {
  const colors: { [key in TabStyle]: string } = {
    default: isSelected ? theme.colors.dark2 : 'transparent',
    inverse: isSelected ? theme.colors.empty : 'transparent',
    small: theme.colors.primary,
  }
  return colors[tabStyle]
}

const borderWidth = ({ tabStyle }: StyledTabProps) => (tabStyle === 'small' ? '1px' : '4px')

const border = ({ theme, isSelected, tabStyle }: StyledTabProps) => (tabStyle === 'small' ? `1px solid ${theme.colors.primary}` : 'none')

const borderBottom = (params: StyledTabProps) => {
  const { tabStyle } = params
  return tabStyle === 'small' ? 'none' : `${borderWidth(params)} solid ${borderColor(params)}`
}

const fontSize = ({ tabStyle }: StyledTabProps) => (tabStyle === 'small' ? '12px' : '14px')

const StyledTab = styled.button`
  margin: 0 8px;
  padding: 6px 4px;
  /* font: normal normal ${fontSize} / 16px 'Open Sans'; */
  white-space: nowrap;
  color: ${textColor};
  background-color: ${backgroundColor};
  border: ${border};
  border-bottom: ${borderBottom};
  border-radius: 4px 4px 0 0;
  /* font-family: 'Open Sans'; */
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  min-width: 90px;
  &:hover {
    color: ${textColor}88;
  }
  &:focus {
    outline: none;
  }
  &:first-child {
    margin-left: 0px;
    padding-left: 0px;
  }
  &:last-child {
    margin-right: 0px;
    padding-right: 0px;
  }
`

interface TabProps {
  children: React.ReactNode
  onClick: Function
  isSelected?: boolean
  tabStyle: TabStyle
}

// @ts-ignore
export const Tab = (props: TabProps) => <StyledTab {...props} />
