/* eslint-disable */
import React from 'react'
import BaseSelect from 'react-select'
import BaseCreatableSelect from 'react-select/creatable'
import { ValueType, ActionMeta } from 'react-select/src/types'
import { defaultTheme } from '../../themes'

// TODO: Fix all any types!!!
// See https://react-select.com/styles#style-object for stylable keys
export const colorStyles = (props: any, theme: any) => ({
  container: (defaults: any, state: any) => {
    const commonStyles = {
      ...defaults,
      margin: '0 4px',
      minWidth: props.minWidth,
      width: props.width,
      transition: 'box-shadow 100ms',
    }
    const focusStyles = {
      outline: 'none',
      borderRadius: '4px',
      boxShadow: `
        ${props.color === 'normal' ? '0 0 0 2px' : '1px 1px 4px'} 
        ${props.color === 'normal' ? theme.colors.empty : 'rgba(0,0,0,0.4)'}, 
        ${props.color === 'normal' ? '0 0 0 3px' : 'inset 1px 1px 4px'}
        ${props.color === 'normal' ? theme.colors.primary : 'rgba(0,0,0,0.4)'}`,
      transition: 'box-shadow 100ms',
    }
    return state.isFocused ? { ...commonStyles, ...focusStyles } : commonStyles
  },
  control: (defaults: any, state: any) => {
    const { menuIsOpen } = state.selectProps
    return {
      ...defaults,
      height: '40px',
      backgroundColor: props.color === 'normal' ? theme.colors.empty : 'transparent',
      borderColor: props.color === 'normal' ? theme.colors.primary : theme.colors.empty,
      boxSizing: 'border-box',
      // fontFamily: 'Open Sans',
      fontSize: '14px',
      borderRadius: menuIsOpen ? '4px 4px 0 0' : '4px',
      boxShadow: 'none',
      ':hover': {
        borderColor: props.color === 'normal' ? theme.colors.primary : theme.colors.empty,
      },
    }
  },
  input: (deafults: any) => ({
    ...deafults,
    color: props.color === 'normal' ? theme.colors.primary : theme.colors.empty,
  }),
  option: (defaults: any, state: any) => {
    const color = () => (state.isSelected ? theme.colors.empty : theme.colors.primary)
    const backgroundColor = () => {
      if (state.isSelected) {
        return theme.colors.primary
      }
      if (state.isFocused) {
        return `${theme.colors.primary}33` /* 0.2 opacity */
      }
      return theme.colors.empty
    }
    return {
      ...defaults,
      // fontFamily: 'Open Sans',
      fontSize: '14px',
      color: color(),
      backgroundColor: backgroundColor(),
      borderBottom: `1px solid ${theme.colors.dark3}`,
      ':last-child': { borderBottom: 'none' },
    }
  },
  singleValue: (defaults: any) => ({
    ...defaults,
    // fontFamily: 'Open Sans',
    fontSize: '14px',
    color: props.color === 'normal' ? theme.colors.primary : theme.colors.empty,
  }),
  placeholder: (defaults: any) => ({
    ...defaults,
    color: props.color === 'normal' ? theme.colors.dark3 : theme.colors.secondary,
    whiteSpace: 'nowrap',
  }),
  dropdownIndicator: (defaults: any) => ({
    ...defaults,
    color: props.color === 'normal' ? theme.colors.primary : theme.colors.empty,
    ':hover': { color: theme.colors.primary },
  }),
  indicatorSeparator: (defaults: any) => ({ ...defaults, backgroundColor: 'none' }),
  menu: (defaults: any) => ({ ...defaults, margin: 0, borderRadius: '0 0 4px 4px', zIndex: 9999 }),
  menuList: (defaults: any) => ({ ...defaults, padding: '0 3px' }),
  // noOptionsMessage: (defaults: any) => ({ ...defaults, fontFamily: 'Open Sans' }),
})

interface SelectProps {
  options: any
  color: 'normal' | 'inverse'
  minWidth: string
  width: string
  // TODO: Find a simpler way of extend react-select
  // @ts-ignore
  onChange?: ((value: ValueType<{ label: string; value: string }>, actionMeta: ActionMeta) => void) &
    // @ts-ignore
    ((value: ValueType<{ label: string; value: string }>, action: ActionMeta) => void)
  isCreatable?: boolean
}

// eslint-disable-next-line react/jsx-filename-extension
export const Select = (props: SelectProps): any => {
  const BaseComponent = props.isCreatable ? BaseCreatableSelect : BaseSelect
  // @ts-ignore
  return <BaseComponent styles={colorStyles(props, defaultTheme)} {...props} />
}

Select.defaultProps = { color: 'normal', minWidth: '140px', width: '100%', onChange: () => {} }
