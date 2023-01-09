import React, { useReducer, useState } from 'react'
import { Typography, Button, Select, Input, InputNumber, Form, Divider, Space, DatePicker, message } from 'antd'
import { i18n } from '../../../services/i18n'
import { SearchCompanies } from '../companies/searchCompanies'
import { SearchProducts } from './searchProducts'
import { isPedimentoValid } from '../../../services/sat/pedimentoValidator'
import { ladXMLFiles, extractGoodsFromXml } from '../billOfLading/xmlParser'

// eslint-disable-next-line import/named
import { packagingCodes, getPackagingCodeName, currencies, satPedimentos } from '../../../services/catalogs'

const { Title, Text } = Typography
const { Option } = Select

export const NewItem = ({
  dispatch,
  setIsItemVisible,
  goods,
  index,
  isEditingItem = false,
  authorizedUsers,
  isDisabledSearchPlaces,
  isDisabledSearchCompanies,
  isDisabledSearchVehicles,
  isDisabledSearchTrailers,
}) => {
  const [isTypeSelected, setIsTypeSelected] = useState(isEditingItem)
  const [RFCvalid, setRFCValid] = useState()
  const [RFCValidateStatus, setRFCValidateStatus] = useState()
  const [RFCMessage, setRFCMessage] = useState()
  const [internationalRFC, setInternationalRFC] = useState()
  const [isDisabledSearchProducts, setIsDisabledSearchProducts] = useState(false)
  const [selectedCustomNumber, setSelectedCustomNumber] = useState('')
  const [selectedPatentNumber, setSelectedPatentNumber] = useState('')
  const [selectedExcerciseYear, setSelectedExcerciseYear] = useState('')
  const [pedimentoValid, setPedimentoValid] = useState()
  const [pedimentoValidateStatus, setPedimentoValidateStatus] = useState()
  const [pedimentoMessage, setPedimentoMessage] = useState()

  const newItemInitialState =
    goods && index !== undefined
      ? goods[index]
      : {
          quantity: 1,
          currency: 'USD',
          value: 0,
          packagingCode: '4G',
          packagingDescription: 'Cajas de Cartón',
          dimensions: { unitMeasure: 'cm' },
          authorizedUsers: authorizedUsers ?? [],
        }
  const newItemReducer = (state, action) => {
    switch (action.type) {
      case 'Company Update':
        return { ...state, company: action.payload }
      case 'Product Update':
        return { ...state, ...action.payload }
      case 'Quantity Update':
        return { ...state, quantity: action.payload }
      case 'Select Currency':
        return { ...state, currency: action.payload }
      case 'Value Update': {
        return { ...state, value: parseFloat(action.payload) }
      }
      case 'Packaging Code Update':
        return { ...state, packagingCode: action.payload, packagingDescription: getPackagingCodeName(action.payload) }
      case 'Pedimento Update': {
        return { ...state, pedimento: action.payload }
      }
      case 'New Product Update':
        return { ...state, ...action.payload }
      case 'Width Update':
        return { ...state, dimensions: { ...state.dimensions, width: parseFloat(action.payload) } }
      case 'Height Update':
        return { ...state, dimensions: { ...state.dimensions, height: parseFloat(action.payload) } }
      case 'Depth Update':
        return { ...state, dimensions: { ...state.dimensions, depth: parseFloat(action.payload) } }
      case 'Select Unit Measure':
        return { ...state, dimensions: { ...state.dimensions, unitMeasure: action.payload } }
      case 'Weight In Kg Update':
        return { ...state, weightInKg: parseFloat(action.payload) }
      case 'Select Item Add Type':
        return { ...state, itemAddType: action.payload }
      case 'Add Goods Object Extracted From XML':
        return {
          ...state,
          xmlExtracted: true,
          goods: {
            totalWeight: action.payload.totalWeight + (state?.goods?.totalWeight || 0),
            weightUnit: action.payload.weightUnit,
            totalGoods: action.payload.totalGoods + (state?.goods?.totalGoods || 0),
            // eslint-disable-next-line no-unsafe-optional-chaining
            good: [...(state?.goods?.good !== undefined ? state?.goods?.good : []), ...action.payload.good],
          },
        }
      default:
        return state
    }
  }

  const [newItemState, newItemDispatch] = useReducer(newItemReducer, newItemInitialState)

  const currenciesOptions = currencies.map(currency => <Option value={currency.code}>{currency.code}</Option>)

  const packagingCodesOptions = packagingCodes.map(packagingCode => (
    <Option key={packagingCode.code} value={packagingCode.code}>
      {packagingCode.code} - {packagingCode.name}
    </Option>
  ))

  const customNumberOptions = satPedimentos.map(pedimento => (
    <Option key={pedimento.customNumber} value={pedimento.customNumber}>
      {pedimento.customNumber}
    </Option>
  ))

  const patentNumberOptions = satPedimentos.map(pedimento => {
    if (pedimento.customNumber === selectedCustomNumber) {
      return (
        <Option key={pedimento.patentNumber} value={pedimento.patentNumber}>
          {pedimento.patentNumber}
        </Option>
      )
    }
    return null
  })

  const excerciseYearOptions = satPedimentos.map(pedimento => {
    if (pedimento.customNumber === selectedCustomNumber && pedimento.patentNumber === selectedPatentNumber) {
      return (
        <Option key={pedimento.exerciseYear} value={pedimento.exerciseYear}>
          {pedimento.exerciseYear}
        </Option>
      )
    }
    return null
  })

  const onChange = value => {
    newItemDispatch({ type: 'Select Item Type', payload: value })
  }

  const saveItem = () => {
    dispatch({ type: 'Add an Item', payload: newItemState })
    setIsItemVisible(false)
  }

  const updateItem = () => {
    dispatch({ type: 'Update an Item', payload: { item: newItemState, index: index } })
    setIsItemVisible(false)
  }

  const saveGoodsObject = () => {
    dispatch({ type: 'Add Goods Object Extracted From XML', payload: newItemState.goods })
    setIsItemVisible(false)
  }
  const pedimentoValidation = value => {
    // eslint-disable-next-line no-case-declarations
    const trimmedPedimento = value.replace(/-|\s/g, '').toUpperCase()
    // eslint-disable-next-line no-case-declarations
    const { valid, validateStatus, message, formattedValue } = isPedimentoValid(trimmedPedimento)
    setPedimentoValid(valid)
    setPedimentoValidateStatus(validateStatus)
    setPedimentoMessage(message)
    newItemDispatch({ type: 'Pedimento Update', payload: formattedValue })
  }

  const onItemTypeChange = value => {
    newItemDispatch({ type: 'Select Item Add Type', payload: value })
  }

  const extractGoods = async () => {
    const fileHandleArray = await window.showOpenFilePicker({
      types: [{ description: 'XML File', accept: { 'application/xml': ['.xml'] } }],
      multiple: true,
    })
    fileHandleArray.map(fileHandle => {
      extractGoodsFromXml(fileHandle, newItemState.company, authorizedUsers).then(goodsData => {
        // console.log('invoiceData', invoiceData)
        newItemDispatch({ type: 'Add Goods Object Extracted From XML', payload: goodsData })
      })
      return null
    })
    // console.log('goodArray', newGoods)
    message.success(`${i18n('newBillOfLadingHub.newItem.goodsExtractedFromXML')}`)
  }

  return (
    <div className="w-full mt-10">
      <Form layout="vertical">
        <Title level={3}>{isEditingItem ? i18n(`newBillOfLadingHub.newItem.editTitle`) : i18n(`newBillOfLadingHub.newItem.title`)}</Title>
        <span className="text-blue">{i18n('newBillOfLadingHub.newItem.description')}</span>
        {/* <Button onClick={() => console.log(newItemState)}>Console State</Button> */}
        <Divider plain />
        {/* <Button onClick={showStateInConsole}>Console State</Button> */}

        {/* Company */}
        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.newTransport.company`)}
        </Title>
        <Text>{i18n(`newBillOfLadingHub.newItem.companyDescription`)}</Text>
        <Form.Item label={i18n(`newBillOfLadingHub.newTransport.company`)} required>
          <SearchCompanies
            dispatch={newItemDispatch}
            companyName={newItemState.company?.name}
            disabled={isEditingItem}
            isEditingLocation={isEditingItem}
          />
        </Form.Item>
        {isEditingItem ? null : (
          <Form.Item label={i18n(`newBillOfLadingHub.newItem.addType`)} required>
            <Select
              className="w-full"
              placeholder={i18n(`newBillOfLadingHub.newItem.addType`)}
              onChange={onItemTypeChange}
              // defaultValue={newItemstate.ItemType ? newItemstate.ItemType : null}
            >
              <Option value="addSingleItem" key="addSingleItem">
                {i18n(`newBillOfLadingHub.newItem.addSingleItem`)}
              </Option>
              <Option value="addMultipleItemsFromXML" key="addMultipleItemsFromXML">
                {i18n(`newBillOfLadingHub.newItem.addMultipleItemsFromXML`)}
              </Option>
              <Option value="addMultipleItemsFromExcel" key="addMultipleItemsFromExcel">
                {i18n(`newBillOfLadingHub.newItem.addMultipleItemsFromExcel`)}
              </Option>
            </Select>
          </Form.Item>
        )}
        {(newItemState.company !== undefined && newItemState.itemAddType === 'addSingleItem') ||
        (newItemState.company !== undefined && isEditingItem) ? (
          <div>
            {/* Item & Quantity */}
            <Title level={5} className="mt-8">
              {i18n(`newBillOfLadingHub.newItem.product`)}
            </Title>

            <Form.Item label={i18n(`newBillOfLadingHub.newItem.quantity`)} required>
              <InputNumber
                min={1}
                defaultValue={newItemState.quantity ? newItemState.quantity : 0}
                onChange={value => newItemDispatch({ type: 'Quantity Update', payload: value })}
              />
            </Form.Item>

            <Form.Item label={i18n(`newBillOfLadingHub.newItem.product`)} required>
              <SearchProducts
                dispatch={newItemDispatch}
                name={newItemState.description}
                disabled={isEditingItem}
                isEditing={isEditingItem}
                productCompanyId={newItemState.company?._id}
              />
            </Form.Item>

            <Form.Item label={i18n(`newBillOfLadingHub.newProduct.value`)} required>
              <Select
                style={{ width: 75 }}
                placeholder={i18n(`newBillOfLadingHub.newProduct.currency`)}
                onChange={value => newItemDispatch({ type: 'Select Currency', payload: value })}
                defaultValue={newItemState.currency ? newItemState.currency : 'USD'}
              >
                {currenciesOptions}
              </Select>
              <InputNumber
                className="ml-4"
                stringMode
                style={{ width: 150 }}
                min={0}
                defaultValue={newItemState.value ? newItemState.value : 0}
                onChange={value => newItemDispatch({ type: 'Value Update', payload: value })}
                step="0.01"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>

            {/* Dimensions */}
            <Title level={5} className="mt-8">
              {i18n(`newBillOfLadingHub.newItem.packaging`)}
            </Title>
            <Form.Item label={i18n(`newBillOfLadingHub.newProduct.dimensions`)} required>
              <Space direction="vertical" size={0}>
                <Text>{i18n(`newBillOfLadingHub.newProduct.width`)}</Text>
                <InputNumber
                  className=""
                  stringMode
                  style={{ width: 125 }}
                  min={0}
                  defaultValue={newItemState.dimensions?.width ? newItemState.dimensions?.width : null}
                  onChange={value => newItemDispatch({ type: 'Width Update', payload: value })}
                  step="0.01"
                />
              </Space>
              <Space direction="vertical" size={0}>
                <Text className="ml-4">{i18n(`newBillOfLadingHub.newProduct.height`)}</Text>
                <InputNumber
                  className="ml-4"
                  stringMode
                  style={{ width: 125 }}
                  min={0}
                  defaultValue={newItemState.dimensions?.height ? newItemState.dimensions?.height : null}
                  onChange={value => newItemDispatch({ type: 'Height Update', payload: value })}
                  step="0.01"
                />
              </Space>
              <Space direction="vertical" size={0}>
                <Text className="ml-4">{i18n(`newBillOfLadingHub.newProduct.depth`)}</Text>
                <InputNumber
                  className="ml-4"
                  stringMode
                  style={{ width: 125 }}
                  min={0}
                  defaultValue={newItemState.dimensions?.depth ? newItemState.dimensions?.depth : null}
                  onChange={value => newItemDispatch({ type: 'Depth Update', payload: value })}
                  step="0.01"
                />
              </Space>
              <Space direction="vertical" size={0}>
                <Text className="ml-4">{i18n(`newBillOfLadingHub.newProduct.unitMeasure`)}</Text>
                <Select
                  className="ml-4"
                  style={{ width: 100 }}
                  placeholder={i18n(`newBillOfLadingHub.newProduct.unit`)}
                  onChange={value => newItemDispatch({ type: 'Select Unit Measure', payload: value })}
                  defaultValue={newItemState.dimensions?.unitMeasure ? newItemState.dimensions?.unitMeasure : 'cm'}
                >
                  <Option value="cm">{i18n(`newBillOfLadingHub.newProduct.cm`)}</Option>
                  <Option value="plg">{i18n(`newBillOfLadingHub.newProduct.plg`)}</Option>
                </Select>
              </Space>
            </Form.Item>
            <Form.Item label={i18n(`newBillOfLadingHub.newProduct.weightInKg`)} required>
              <InputNumber
                className=""
                stringMode
                style={{ width: 150 }}
                min={0}
                defaultValue={newItemState.weightInKg ? newItemState.weightInKg : null}
                onChange={value => newItemDispatch({ type: 'Weight In Kg Update', payload: value })}
                step="0.01"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                addonAfter="KG"
              />
            </Form.Item>

            <Form.Item label={i18n(`newBillOfLadingHub.newItem.packagingCode`)} required>
              <Select
                style={{ width: '100%' }}
                placeholder={i18n(`newBillOfLadingHub.newItem.packagingCode`)}
                onChange={value => newItemDispatch({ type: 'Packaging Code Update', payload: value })}
                defaultValue={newItemState.packagingCode ? newItemState.packagingCode : '4G'}
              >
                {packagingCodesOptions}
              </Select>
            </Form.Item>

            <Form.Item
              label={i18n(`newBillOfLadingHub.newItem.pedimento`)}
              validateStatus={pedimentoValidateStatus}
              help={pedimentoMessage}
              required
            >
              <Input
                placeholder="XX  XX  XXXX  XXXXXXX"
                onKeyUp={e => pedimentoValidation(e.target.value)}
                defaultValue={newItemState.pedimento ? newItemState.pedimento : null}
              />
            </Form.Item>
            <Button type="primary" onClick={isEditingItem ? updateItem : saveItem} className="float-right">
              {i18n('buttons.save')}
            </Button>
          </div>
        ) : null}

        {newItemState.company !== undefined && newItemState.itemAddType === 'addMultipleItemsFromXML' ? (
          <div>
            <Title level={4}>{i18n(`newBillOfLadingHub.newItem.cfdiWithBol`)}</Title>
            <div>
              <Space className="float-right" size={12} onClick={extractGoods}>
                <Button>{i18n('buttons.extract')}</Button>
              </Space>
              <Space direction="vertical" size={0} className="w-2/3 mb-8">
                <Text ellipsis style={{ width: '100%' }} className="">
                  {i18n('newBillOfLadingHub.newItem.extractDetail')}
                </Text>
              </Space>
            </div>
            {newItemState.xmlExtracted ? (
              <div>
                {/* Extracted Data */}
                <Title level={5}>{i18n(`newBillOfLadingHub.newItem.extractedData`)}</Title>
                <Space direction="vertical" size={0} className="w-2/3">
                  <Space>
                    <Text type="secondary" className="text-xs">
                      {i18n('newBillOfLadingHub.newItem.totalWeight')}{' '}
                    </Text>
                    <Text>{`${newItemState.goods.totalWeight} ${newItemState.goods.weightUnit}`}</Text>
                  </Space>
                  <Space>
                    <Text type="secondary" className="text-xs">
                      {i18n('newBillOfLadingHub.newItem.totalGoods')}{' '}
                    </Text>
                    <Text>{newItemState.goods.totalGoods}</Text>
                  </Space>
                </Space>
              </div>
            ) : null}
            <Button type="primary" onClick={saveGoodsObject} className="float-right">
              {i18n('buttons.save')}
            </Button>
          </div>
        ) : null}

        {newItemState.company !== undefined && newItemState.itemAddType === 'addMultipleItemsFromExcel' ? (
          <div>
            <Form.Item label={i18n(`newBillOfLadingHub.newItem.packagingCode`)} required>
              <Select
                style={{ width: '100%' }}
                placeholder={i18n(`newBillOfLadingHub.newItem.packagingCode`)}
                onChange={value => newItemDispatch({ type: 'Packaging Code Update', payload: value })}
                defaultValue={newItemState.packagingCode ? newItemState.packagingCode : '4G'}
              >
                {packagingCodesOptions}
              </Select>
            </Form.Item>
            <Button type="primary" onClick={isEditingItem ? updateItem : saveItem} className="float-right">
              {i18n('buttons.save')}
            </Button>
          </div>
        ) : null}
      </Form>
    </div>
  )
}
