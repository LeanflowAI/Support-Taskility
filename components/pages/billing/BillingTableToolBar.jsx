// import React from 'react'
// import { useSelector } from 'react-redux'
// import { Button } from 'antd'
// import { Input, MultiSelect } from '../../ui-elements/forms'
// import { ToolBar } from '../../ui-elements/tool-bar'
// import { ToolBarSection } from '../../ui-elements/tool-bar-section/index.ts'
// import { Text } from '../../ui-elements/text'
// import { Icon } from '../../ui-elements/icon'
// import { DownloadCsvLink } from '../../ui-elements/link'
// import { selectInvoicesCount, selectInvoicesFullCount } from '../../../state/reducers/index.ts'
// import { useUserSettings } from '../../hooks'

// const iconsByRowSize = {
//   S: 'table-row-small',
//   L: 'table-row-big',
//   M: 'table-row-medium',
// }

// const renderSizeButton = (size, selectedRowSize, setRowSize) => (
//   <Button color="subtle" onClick={() => setRowSize(size)} pushed={size === selectedRowSize}>
//     <Icon icon={iconsByRowSize[size]} color="inverse" />
//   </Button>
// )

// export const BillingTableToolBar = props => {
//   const invoicesCount = useSelector(selectInvoicesCount)
//   const { setSelectedColumns, labelValueColumns, csvData, searchText, setSearchText } = props

//   const { setSetting, settings } = useUserSettings('billingPage')
//   const { rowSize, fontStretch, selectedColumns: savedColumns = [] } = settings

//   const toggleFont = () => setSetting('fontStretch', fontStretch === 'condensed' ? 'normal' : 'condensed')
//   const setRowSize = size => setSetting('rowSize', size)

//   const fullCount = useSelector(selectInvoicesFullCount())

//   return (
//     <ToolBar color="inverse">
//       <ToolBarSection>
//         <Input
//           color="subtle"
//           placeholder="Buscar..."
//           value={searchText}
//           onChange={event => setSearchText(event.target.value)}
//         />
//         {/* i18n "Total" */}
//         <Text color="inverse">{`Total: ${invoicesCount} de ${fullCount}`}</Text>
//       </ToolBarSection>
//       {/* <ToolBarDivider /> */}

//       {/* TODO: Toggle button group component: reduce margin between buttons in the group */}
//       <ToolBarSection>
//         <DownloadCsvLink csvData={csvData} filename="invoices">
//           {/* i18n "Exportar" */}
//           <Button color="subtle">Exportar</Button>
//         </DownloadCsvLink>
//         <Button color="subtle" onClick={toggleFont} pushed={fontStretch === 'condensed'}>
//           <Icon icon="text-size" color="inverse" />
//         </Button>
//         {renderSizeButton('S', rowSize, setRowSize)}
//         {renderSizeButton('M', rowSize, setRowSize)}
//         {renderSizeButton('L', rowSize, setRowSize)}

//         {/* TODO: placeholderButtonLabel and button label i18n */}
//         {/* TODO: load previously selected  */}
//         {/* TODO: Fix styles!!!  */}
//         <MultiSelect
//           placeholderButtonLabel="Columnas"
//           getDropdownButtonLabel={() => 'Columnas'}
//           rightAligned
//           options={labelValueColumns}
//           onChange={selected => setSelectedColumns(selected.map(({ value }) => value))}
//           color="inverse"
//         />
//       </ToolBarSection>
//     </ToolBar>
//   )
// }
