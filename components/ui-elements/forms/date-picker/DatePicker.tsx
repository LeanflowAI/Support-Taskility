 import React from 'react'
// // @ts-ignore
// import DayPicker from 'react-day-picker/DayPicker'
// import DayPickerInput from 'react-day-picker/DayPickerInput'
// import styled from 'styled-components'
// import { localeUtils } from './locale-utils'

// const StyledDatePicker = styled(DayPicker)`
//   /* DayPicker styles from 'react-day-picker/lib/style.css'*/

//   /* font-family: 'Open Sans'; */
//   font-style: normal;
//   font-weight: normal;
//   /* font-size: 12px; */
//   display: inline-block;
//   font-size: 1rem;
//   color: ${({ theme }) => theme.colors.primary};

//   & .DayPicker-wrapper {
//     position: relative;
//     flex-direction: row;
//     padding-bottom: 1em;
//     user-select: none;
//   }

//   & .DayPicker-Months {
//     display: flex;
//     flex-wrap: wrap;
//     justify-content: center;
//   }

//   & .DayPicker-Month {
//     display: table;
//     margin: 0 1em;
//     margin-top: 1em;
//     border-spacing: 0;
//     border-collapse: collapse;

//     user-select: none;
//   }

//   & .DayPicker-NavBar {
//   }

//   & .DayPicker-NavButton {
//     position: absolute;
//     top: 1em;
//     right: 1.5em;
//     left: auto;

//     display: inline-block;
//     margin-top: 2px;
//     width: 1.25em;
//     height: 1.25em;
//     background-position: center;
//     background-size: 50%;
//     background-repeat: no-repeat;
//     color: #8b9898;
//     cursor: pointer;
//   }

//   & .DayPicker-NavButton:hover {
//     opacity: 0.8;
//   }

//   & .DayPicker-NavButton--prev {
//     margin-right: 1.5em;
//     background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAwCAYAAAB5R9gVAAAABGdBTUEAALGPC/xhBQAAAVVJREFUWAnN2G0KgjAYwPHpGfRkaZeqvgQaK+hY3SUHrk1YzNLay/OiEFp92I+/Mp2F2Mh2lLISWnflFjzH263RQjzMZ19wgs73ez0o1WmtW+dgA01VxrE3p6l2GLsnBy1VYQOtVSEH/atCCgqpQgKKqYIOiq2CBkqtggLKqQIKgqgCBjpJ2Y5CdJ+zrT9A7HHSTA1dxUdHgzCqJIEwq0SDsKsEg6iqBIEoq/wEcVRZBXFV+QJxV5mBtlDFB5VjYTaGZ2sf4R9PM7U9ZU+lLuaetPP/5Die3ToO1+u+MKtHs06qODB2zBnI/jBd4MPQm1VkY79Tb18gB+C62FdBFsZR6yeIo1YQiLJWMIiqVjQIu1YSCLNWFgijVjYIuhYYCKoWKAiiFgoopxYaKLUWOii2FgkophYp6F3r42W5A9s9OcgNvva8xQaysKXlFytoqdYmQH6tF3toSUo0INq9AAAAAElFTkSuQmCC');
//   }

//   & .DayPicker-NavButton--next {
//     background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAwCAYAAAB5R9gVAAAABGdBTUEAALGPC/xhBQAAAXRJREFUWAnN119ugjAcwPHWzJ1gnmxzB/BBE0n24m4xfNkTaOL7wOtsl3AXMMb+Vjaa1BG00N8fSEibPpAP3xAKKs2yjzTPH9RAjhEo9WzPr/Vm8zgE0+gXATAxxuxtqeJ9t5tIwv5AtQAApsfT6TPdbp+kUBcgVwvO51KqVhMkXKsVJFXrOkigVhCIs1Y4iKlWZxB1rX4gwlpRIIpa8SDkWmggrFq4IIRaJKCYWnSgnrXIQV1r8YD+1Vrn+bReagysIFfLABRt31v8oBu1xEBttfRbltmfjgEcWh9snUS2kNdBK6WN1vrOWxObWsz+fjxevsxmB1GQDfINWiev83nhaoiB/CoOU438oPrhXS0WpQ9xc1ZQWxWHqUYe0I0qrKCQKjygDlXIQV2r0IF6ViEBxVTBBSFUQQNhVYkHIVeJAtkNsbQ7c1LtzP6FsObhb2rCKv7NBIGoq4SDmKoEgTirXAcJVGkFSVVpgoSrXICGUMUH/QBZNSUy5XWUhwAAAABJRU5ErkJggg==');
//   }

//   & .DayPicker-NavButton--interactionDisabled {
//     display: none;
//   }

//   & .DayPicker-Caption {
//     display: table-caption;
//     margin-bottom: 0.5em;
//     padding: 0 0.5em;
//     text-align: left;
//     font-size: 0.8em;
//   }

//   & .DayPicker-Caption > div {
//     font-weight: 500;
//     font-size: 1.15em;
//   }

//   & .DayPicker-Weekdays {
//     display: table-header-group;
//     margin-top: 1em;
//   }

//   & .DayPicker-WeekdaysRow {
//     display: table-row;
//   }

//   & .DayPicker-Weekday {
//     display: table-cell;
//     padding: 0.2em;
//     color: ${({ theme }) => theme.colors.text2};
//     text-align: center;
//     font-size: 0.875em;
//   }

//   & .DayPicker-Weekday abbr[title] {
//     border-bottom: none;
//     text-decoration: none;
//   }

//   & .DayPicker-Body {
//     display: table-row-group;
//   }

//   & .DayPicker-Week {
//     display: table-row;
//   }

//   & .DayPicker-Day {
//     display: table-cell;
//     padding: 0.2em;
//     border-radius: 50%;
//     vertical-align: middle;
//     text-align: center;
//     cursor: pointer;
//   }

//   & .DayPicker-WeekNumber {
//     display: table-cell;
//     padding: 0.2em;
//     min-width: 1em;
//     border-right: 1px solid #eaecec;
//     color: #8b9898;
//     vertical-align: middle;
//     text-align: right;
//     font-size: 0.75em;
//     cursor: pointer;
//   }

//   & .DayPicker--interactionDisabled .DayPicker-Day {
//     cursor: default;
//   }

//   & .DayPicker-Footer {
//     padding-top: 0.5em;
//   }

//   & .DayPicker-TodayButton {
//     border: none;
//     background-color: transparent;
//     background-image: none;
//     box-shadow: none;
//     color: #4a90e2;
//     font-size: 0.875em;
//     cursor: pointer;
//   }

//   /* Default modifiers */

//   & .DayPicker-Day--today {
//     color: ${({ theme }) => theme.colors.gradient};
//     font-weight: 700;
//   }

//   & .DayPicker-Day--outside {
//     color: ${({ theme }) => theme.colors.text2};
//     cursor: default;
//   }

//   & .DayPicker-Day--disabled {
//     color: ${({ theme }) => theme.colors.primary}88;
//     cursor: default;
//     /* background-color: #eff1f1; */
//   }

//   /* Example modifiers */

//   & .DayPicker-Day--sunday {
//     background-color: #f7f8f8;
//   }

//   & .DayPicker-Day--sunday:not(.DayPicker-Day--today) {
//     color: #dce0e0;
//   }

//   & .DayPicker-Day--selected:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside) {
//     position: relative;
//     background-color: #4a90e2;
//     color: #f0f8ff;
//   }

//   & .DayPicker-Day--selected:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside):hover {
//     background-color: #51a0fa;
//   }

//   &
//     .DayPicker:not(.DayPicker--interactionDisabled)
//     .DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--selected):not(.DayPicker-Day--outside):hover {
//     background-color: #f0f8ff;
//   }

//   /* DayPickerInput */

//   & .DayPickerInput {
//     display: inline-block;
//   }

//   & .DayPickerInput-OverlayWrapper {
//     position: relative;
//   }

//   & .DayPickerInput-Overlay {
//     position: absolute;
//     left: 0;
//     z-index: 1;
//     background: white;
//     box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
//   }
// `

// export const DatePicker = (props: any) => <StyledDatePicker localeUtils={localeUtils} {...props} />
export const DatePicker = (props: any) => {}