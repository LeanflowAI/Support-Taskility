import React from "react";
// // @ts-ignore
// import BaseMultiSelect from 'react-multiselect-checkboxes'
// import styled from 'styled-components'
// import { colorStyles } from './Select'
// import { defaultTheme } from '../../themes'


// const multiColorStyles = (props: any, theme: any) => {
//   const baseStyles = colorStyles(props, theme)
//   const { container, input, singleValue, indicatorSeparator, ...commonBaseStyles } = baseStyles
//   return {
//     ...commonBaseStyles,
//     input: (defaults: any) => ({
//       ...defaults,
//       color: props.color === 'normal' ? theme.colors.primary : theme.colors.dark3,
//     }),
//     dropdownButton: (defaults: any, state: any) => {
//       const { menuIsOpen } = state
//       return {
//         ...defaults,
//         height: '40px',
//         backgroundColor: props.color === 'normal' ? theme.colors.empty : 'transparent',
//         border: `1px solid ${props.color === 'normal' ? theme.colors.primary : theme.colors.empty}`,
//         color: theme.colors.dark3,
//         boxSizing: 'border-box',
//         // fontFamily: 'Open Sans',
//         fontSize: '14px',
//         borderRadius: menuIsOpen ? '4px 4px 0 0' : '4px',
//         boxShadow: 'none',
//         ':hover': {
//           borderColor: props.color === 'normal' ? theme.colors.primary : theme.colors.empty,
//         },
//       }
//     },
//   }
// }

// const WrapperButtonColorFix = styled.div`
//   & button {
//     background: transparent;
//   }
// `

// // eslint-disable-next-line react/jsx-filename-extension
// export const MultiSelect = (props: any) => (
//   <WrapperButtonColorFix>
//     <BaseMultiSelect styles={multiColorStyles(props, defaultTheme)} {...props} />
//   </WrapperButtonColorFix>
// )

// // MultiSelect.propTypes = {
// //   color: PropTypes.oneOf(['normal', 'inverse']),
// //   minWidth: PropTypes.string,
// //   width: PropTypes.string,
// // }

// // MultiSelect.defaultProps = {
// //   color: 'normal',
// //   minWidth: '140px',
// //   width: '100%',
// // }
