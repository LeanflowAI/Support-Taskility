import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import BaseTable from 'react-table'

export const defaultTextsProps = {
  previousText: 'Anterior',
  nextText: 'Siguiente',
  loadingText: 'Cargando...',
  noDataText: 'No hay datos para mostrar',
  pageText: 'Página',
  ofText: 'de',
  rowsText: 'filas',
  showPagination: false,
  minRows: 0,
  defaultPageSize: 50,
}

const rowHeight = ({ rowSize }) =>
  (rowSize === 'S' && '28px') || (rowSize === 'M' && '32px') || (rowSize === 'L' && '40px')

const fontFamily = ({ fontStretch }) => (fontStretch === 'condensed' ? 'Open Sans Condensed' : 'Open Sans')

const fontSize = ({ rowSize }) =>
  (rowSize === 'S' && '10px') || (rowSize === 'M' && '12px') || (rowSize === 'L' && '14px')

const ReactTable = styled(BaseTable)`
  & {
    position: relative;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    min-height: 1px; /* This will force the table body to overflow and scroll when there's no enough room */
    * {
      box-sizing: border-box;
    }
    .rt-table {
      -webkit-box-flex: 1;
      -ms-flex: auto 1;
      flex: auto 1;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -ms-flex-direction: column;
      flex-direction: column;
      -webkit-box-align: stretch;
      -ms-flex-align: stretch;
      align-items: stretch;
      width: 100%;
      border-collapse: collapse;
      overflow: auto;
    }
    .rt-thead {
      -webkit-box-flex: 1;
      -ms-flex: 1 0 auto;
      flex: 1 0 auto;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -ms-flex-direction: column;
      flex-direction: column;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    .rt-thead.-headerGroups {
      background: rgba(0, 0, 0, 0.03);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
    .rt-thead.-filters {
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
    .rt-thead.-filters input,
    .rt-thead.-filters select {
      border: 1px solid rgba(0, 0, 0, 0.1);
      background: #fff;
      padding: 5px 7px;
      font-size: inherit;
      border-radius: 3px;
      font-weight: normal;
      outline: none;
    }
    .rt-thead.-filters .rt-th {
      border-right: 1px solid rgba(0, 0, 0, 0.05);
    }
    .rt-thead.-header {
      box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.15);
    }
    .rt-thead .rt-tr {
      text-align: center;
    }
    .rt-thead .rt-th,
    .rt-thead .rt-td {
      padding: 5px 5px;
      line-height: normal;
      position: relative;
      border-right: 1px solid rgba(0, 0, 0, 0.05);
      transition: box-shadow 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: inset 0 0 0 0 transparent;
    }
    .rt-thead .rt-th.-sort-asc,
    .rt-thead .rt-td.-sort-asc {
      box-shadow: inset 0 3px 0 0 ${({ theme }) => theme.colors.gradient};
    }
    .rt-thead .rt-th.-sort-desc,
    .rt-thead .rt-td.-sort-desc {
      box-shadow: inset 0 -3px 0 0 ${({ theme }) => theme.colors.gradient};
    }
    .rt-thead .rt-th.-cursor-pointer,
    .rt-thead .rt-td.-cursor-pointer {
      cursor: pointer;
    }
    .rt-thead .rt-th:last-child,
    .rt-thead .rt-td:last-child {
      border-right: 0;
    }
    .rt-thead .rt-th:focus {
      outline: none;
    }
    .rt-thead .rt-resizable-header {
      overflow: visible;
    }
    .rt-thead .rt-resizable-header:last-child {
      overflow: hidden;
    }
    .rt-thead .rt-resizable-header-content {
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%; /* Center column title */
    }
    .rt-thead .rt-header-pivot {
      border-right-color: #f7f7f7;
    }
    .rt-thead .rt-header-pivot:after,
    .rt-thead .rt-header-pivot:before {
      left: 100%;
      top: 50%;
      border: solid transparent;
      content: ' ';
      height: 0;
      width: 0;
      position: absolute;
      pointer-events: none;
    }
    .rt-thead .rt-header-pivot:after {
      border-color: rgba(255, 255, 255, 0);
      border-left-color: #fff;
      border-width: 8px;
      margin-top: -8px;
    }
    .rt-thead .rt-header-pivot:before {
      border-color: rgba(102, 102, 102, 0);
      border-left-color: #f7f7f7;
      border-width: 10px;
      margin-top: -10px;
    }
    .rt-tbody {
      -webkit-box-flex: 99999;
      -ms-flex: 99999 1 auto;
      flex: 99999 1 auto;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -ms-flex-direction: column;
      flex-direction: column;
      overflow: auto;
    }
    .rt-tbody .rt-tr-group {
      border-bottom: solid 1px rgba(0, 0, 0, 0.05);
    }
    .rt-tbody .rt-tr-group:last-child {
      border-bottom: 0;
    }
    .rt-tbody .rt-td {
      border-right: 1px solid rgba(0, 0, 0, 0.05);
    }
    .rt-tbody .rt-td:last-child {
      border-right: 0;
    }
    .rt-tbody .rt-expandable {
      cursor: pointer;
      text-overflow: clip;
    }
    .rt-tr-group {
      -webkit-box-flex: 1;
      -ms-flex: 1 0 auto;
      flex: 1 0 auto;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -ms-flex-direction: column;
      flex-direction: column;
      -webkit-box-align: stretch;
      -ms-flex-align: stretch;
      align-items: stretch;
    }
    .rt-tr {
      -webkit-box-flex: 1;
      -ms-flex: 1 0 auto;
      flex: 1 0 auto;
      display: -webkit-inline-box;
      display: -ms-inline-flexbox;
      display: inline-flex;
    }
    .rt-th,
    .rt-td {
      -webkit-box-flex: 1;
      -ms-flex: 1 0 0px;
      flex: 1 0 0;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding: 7px 5px;
      overflow: hidden;
      transition: 0.3s ease;
      transition-property: width, min-width, padding, opacity;
    }
    .rt-th.-hidden,
    .rt-td.-hidden {
      width: 0 !important;
      min-width: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      opacity: 0 !important;
    }
    .rt-expander {
      display: inline-block;
      position: relative;
      margin: 0;
      color: transparent;
      margin: 0 10px;
    }
    .rt-expander:after {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      top: 50%;
      left: 50%;
      -webkit-transform: translate(-50%, -50%) rotate(-90deg);
      transform: translate(-50%, -50%) rotate(-90deg);
      border-left: 5.04px solid transparent;
      border-right: 5.04px solid transparent;
      border-top: 7px solid rgba(0, 0, 0, 0.8);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
    }
    .rt-expander.-open:after {
      -webkit-transform: translate(-50%, -50%) rotate(0);
      transform: translate(-50%, -50%) rotate(0);
    }
    .rt-resizer {
      display: inline-block;
      position: absolute;
      width: 36px;
      top: 0;
      bottom: 0;
      right: -18px;
      cursor: col-resize;
      z-index: 10;
    }
    .rt-tfoot {
      -webkit-box-flex: 1;
      -ms-flex: 1 0 auto;
      flex: 1 0 auto;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -ms-flex-direction: column;
      flex-direction: column;
      box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.15);
    }
    .rt-tfoot .rt-td {
      border-right: 1px solid rgba(0, 0, 0, 0.05);
    }
    .rt-tfoot .rt-td:last-child {
      border-right: 0;
    }
    .-striped .rt-tr.-odd {
      background: rgba(0, 0, 0, 0.03);
    }
    .-highlight .rt-tbody .rt-tr:not(.-padRow):hover {
      background: rgba(0, 0, 0, 0.05);
    }
    .-pagination {
      z-index: 1;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-pack: justify;
      -ms-flex-pack: justify;
      justify-content: space-between;
      -webkit-box-align: stretch;
      -ms-flex-align: stretch;
      align-items: stretch;
      -ms-flex-wrap: wrap;
      flex-wrap: wrap;
      padding: 3px;
      box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
      border-top: 2px solid rgba(0, 0, 0, 0.1);
    }
    .-pagination input,
    .-pagination select {
      border: 1px solid rgba(0, 0, 0, 0.1);
      background: #fff;
      padding: 5px 7px;
      font-size: inherit;
      border-radius: 3px;
      font-weight: normal;
      outline: none;
    }
    .-pagination .-btn {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
      border-radius: 3px;
      padding: 6px;
      font-size: 1em;
      color: rgba(0, 0, 0, 0.6);
      background: rgba(0, 0, 0, 0.1);
      transition: all 0.1s ease;
      cursor: pointer;
      outline: none;
    }
    .-pagination .-btn[disabled] {
      opacity: 0.5;
      cursor: default;
    }
    .-pagination .-btn:not([disabled]):hover {
      background: rgba(0, 0, 0, 0.3);
      color: #fff;
    }
    .-pagination .-previous,
    .-pagination .-next {
      -webkit-box-flex: 1;
      -ms-flex: 1;
      flex: 1;
      text-align: center;
    }
    .-pagination .-center {
      -webkit-box-flex: 1.5;
      -ms-flex: 1.5;
      flex: 1.5;
      text-align: center;
      margin-bottom: 0;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: horizontal;
      -webkit-box-direction: normal;
      -ms-flex-direction: row;
      flex-direction: row;
      -ms-flex-wrap: wrap;
      flex-wrap: wrap;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      -ms-flex-pack: distribute;
      justify-content: space-around;
    }
    .-pagination .-pageInfo {
      display: inline-block;
      margin: 3px 10px;
      white-space: nowrap;
    }
    .-pagination .-pageJump {
      display: inline-block;
    }
    .-pagination .-pageJump input {
      width: 70px;
      text-align: center;
    }
    .-pagination .-pageSizeOptions {
      margin: 3px 10px;
    }
    .rt-noData {
      display: block;
      position: absolute;
      left: 50%;
      top: 50%;
      -webkit-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;
      z-index: 1;
      pointer-events: none;
      padding: 20px;
      color: rgba(0, 0, 0, 0.5);
    }
    .-loading {
      display: block;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;
      z-index: -1;
      opacity: 0;
      pointer-events: none;
    }
    .-loading > div {
      position: absolute;
      display: block;
      text-align: center;
      width: 100%;
      top: 50%;
      left: 0;
      font-size: 15px;
      color: rgba(0, 0, 0, 0.6);
      -webkit-transform: translateY(-52%);
      transform: translateY(-52%);
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .-loading.-active {
      opacity: 1;
      z-index: 2;
      pointer-events: all;
    }
    .-loading.-active > div {
      -webkit-transform: translateY(50%);
      transform: translateY(50%);
    }
    .rt-resizing .rt-th,
    .rt-resizing .rt-td {
      transition: none !important;
      cursor: col-resize;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    /* font-family: ${fontFamily}; */
    font-size: ${fontSize};
    .rt-thead {
      &.-header {
        background-color: ${({ theme }) => theme.colors.primary};
        color: white;
        height: 32px;
      }
      &.-filters {
        color: ${({ theme }) => theme.colors.dark};
        .rt-th {
          background: ${({ theme }) => theme.colors.empty};
          select,
          input {
            /* TODO: Placeholder: #B8B9BA */
            height: 100%;
            border: none;
            &::placeholder {
              color: #b8b9ba;
            }
          }
        }
      }
      .rt-tr {
        .rt-th {
          display: flex;
          align-items: center;
        }
      }
    }
    .rt-tbody {
      .rt-tr {
        min-height: ${rowHeight};
        color: ${({ theme }) => theme.colors.dark2};
        transition: all 0.3s;
        &.-odd {
          background-color: ${({ theme }) => theme.colors.secondary};
        }
        &.-even {
          background-color: ${({ theme }) => theme.colors.empty};
        }
        .rt-td {
          display: flex;
          align-items: center;
        }
      }
    }
  }
`

export const DataTable = ({ onScrollBottomReached, ...props }) => (
  <ReactTable
    {...defaultTextsProps}
    {...props}
    getTableProps={
      // @ts-ignore
      (state, rowInfo, column, instance) => {
        return {
          // @ts-ignore
          onScroll: (event, handleOriginal) => {
            const { target } = event
            if (target.offsetHeight + target.scrollTop >= target.scrollHeight) {
              onScrollBottomReached()
            }

            if (handleOriginal) {
              handleOriginal()
            }
          },
        }
      }
    }
  />
)

DataTable.propTypes = {
  rowSize: PropTypes.string,
  fontStretch: PropTypes.oneOf(['condensed', 'normal']),
  onScrollBottomReached: PropTypes.func,
}

DataTable.defaultProps = {
  rowSize: 'S',
  fontStretch: 'normal',
  onScrollBottomReached: () => {},
}
