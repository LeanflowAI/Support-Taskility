import React, { useReducer } from 'react'
import { Typography, Button, Select, Input, Form, Divider } from 'antd'
import { i18n } from '../../../services/i18n'
import { post } from '../../../services/fetch'
// eslint-disable-next-line
import { ISO_3166CountryCodes } from '../../../services/api/geocoding/ISO3166CountryCodes'
// eslint-disable-next-line import/named
import { currencies, unitCodes } from '../../../services/catalogs'
import { SearchSatProductAndServicesCodes } from '../billOfLading/searchSatProductCode'
import { SearchSatTariffCodes } from '../billOfLading/searchSatTariffCode'
import { SearchSatDangerousMaterialCodes } from '../billOfLading/searchSatDangerousMaterialCode'

const { Title } = Typography
const { Option } = Select

export const NewProduct = ({ parentDispatch, setDrawerVisible, setSelection, setSearchDisabled, companyId, initialProduct }) => {
  const newProductInitialState = initialProduct || { companyId: companyId }
  const newProductReducer = (state, action) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      case 'Product Code Update':
        return { ...state, productCode: action.payload }
      case 'Product Description Update':
        return { ...state, description: action.payload }
      case 'Select Currency':
        return { ...state, currency: action.payload }
      case 'Value Update': {
        return { ...state, unitPrice: parseFloat(action.payload) }
      }
      case 'SAT Product Code Update': {
        if (action.payload.dangerousMaterial === '0')
          return {
            ...state,
            satProductCode: action.payload.key,
            satProductCodeDescription: action.payload.satDescription,
            satProductCodeIsDangerousMaterial: action.payload.dangerousMaterial,
            dangerousMaterial: 'No',
          }
        if (action.payload.dangerousMaterial === '1')
          return {
            ...state,
            satProductCode: action.payload.key,
            satProductCodeDescription: action.payload.satDescription,
            satProductCodeIsDangerousMaterial: action.payload.dangerousMaterial,
            dangerousMaterial: 'Sí',
          }
        return {
          ...state,
          satProductCode: action.payload.key,
          satProductCodeDescription: action.payload.satDescription,
          satProductCodeIsDangerousMaterial: action.payload.dangerousMaterial,
        }
      }
      case 'SAT Unit Key Update':
        return { ...state, satUnitKey: action.payload }
      case 'Select Is Dangerous Material': {
        if (action.payload === 'No') {
          // eslint-disable-next-line no-param-reassign
          delete state.dangerousMaterialCode
          return { ...state, dangerousMaterial: action.payload }
        }
        return { ...state, dangerousMaterial: action.payload }
      }
      case 'SAT Dangerous Material Code Update':
        return { ...state, dangerousMaterialCode: action.payload.key, dangerousMaterialCodeDescription: action.payload.description }
      case 'Tariff Code Update':
        return { ...state, tariffCode: action.payload.key, tariffCodeDescription: action.payload.satDescription }
      default:
        return { ...state }
    }
  }
  const [newProductState, newProductDispatch] = useReducer(newProductReducer, newProductInitialState)

  const currenciesOptions = currencies.map(currency => <Option value={currency.code}>{currency.code}</Option>)

  const unitKeyOptions = unitCodes.map(unit => (
    <Option value={unit.code}>
      {unit.code} - {unit.name}
    </Option>
  ))
  // eslint-disable-next-line
  const createCountryOptions = ISO_3166CountryCodes.map(country => {
    // console.log(country.name, country.alpha3)
    return <Option value={country.alpha3}>{country.name}</Option>
  })

  const createNewProductInDB = vehicle => {
    // console.log('vehicle: ', vehicle)
    post('/api/products/create-new-product', { body: vehicle }).then(({ error, details }) => {
      // if (!error) setFinished('signed')
      // setApiError(error, details?.message || '')
    })
    // .catch(setApiError)
    // .finally(() => setCreatingCfdi(false))
  }

  const passDataToPartentComponent = state => {
    parentDispatch({ type: 'New Product Update', payload: state })
    setSelection(newProductState)
    setSearchDisabled(true)
  }

  const closeDrawer = () => {
    setDrawerVisible(false)
  }

  const saveProduct = () => {
    // console.log('newProductState:', newProductState)
    createNewProductInDB(newProductState)
    passDataToPartentComponent(newProductState)
    closeDrawer()
  }

  return (
    <div>
      <Form layout="vertical">
        <Title level={3}>{i18n(`newBillOfLadingHub.newProduct.title`)}</Title>
        <span className="text-blue">{i18n('newBillOfLadingHub.newProduct.description')}</span>
        <br />
        <Button
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log(newProductState)
          }}
        >
          Console State
        </Button>
        <Divider plain />

        {/* Details */}
        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.newProduct.productDescription`)}
        </Title>
        <Form.Item label={i18n(`newBillOfLadingHub.newProduct.productCode`)} required>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newProduct.productCode`)}
            onKeyUp={e => newProductDispatch({ type: 'Product Code Update', payload: e.target.value })}
            defaultValue={newProductState.productCode ? newProductState.productCode : null}
          />
        </Form.Item>
        <Form.Item label={i18n(`newBillOfLadingHub.newProduct.productDescription`)} required>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newProduct.productDescription`)}
            onKeyUp={e => newProductDispatch({ type: 'Product Description Update', payload: e.target.value })}
            defaultValue={newProductState.description ? newProductState.description : null}
          />
        </Form.Item>
        {/* <Form.Item label={i18n(`newBillOfLadingHub.newProduct.unitaryPrice`)} required>
          <Select
            style={{ width: 75 }}
            placeholder={i18n(`newBillOfLadingHub.newProduct.currency`)}
            onChange={value => newProductDispatch({ type: 'Select Currency', payload: value })}
            defaultValue={newProductState.currency ? newProductState.currency : null}
          >
            {currenciesOptions}
          </Select>
          <InputNumber
            className="ml-4"
            stringMode
            style={{ width: 150 }}
            min={0}
            defaultValue={newProductState.unitPrice ? newProductState.unitPrice : null}
            onChange={value => newProductDispatch({ type: 'Value Update', payload: value })}
            step="0.01"
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        </Form.Item> */}

        {/* SAT Codes */}
        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.newProduct.satCodes`)}
        </Title>
        <Form.Item label={i18n(`newBillOfLadingHub.newProduct.satProductCode`)} required>
          <SearchSatProductAndServicesCodes dispatch={newProductDispatch} />
          {/* <Input
            placeholder={i18n(`newBillOfLadingHub.newProduct.satProductCode`)}
            onKeyUp={e => newProductDispatch({ type: 'SAT Product Code Update', payload: e.target.value })}
            defaultValue={newProductState.satProductCode ? newProductState.satProductCode : null}
          /> */}
        </Form.Item>
        <Form.Item label={i18n(`newBillOfLadingHub.newProduct.satUnitKey`)} required>
          <Select
            style={{ width: '100%' }}
            placeholder={i18n(`newBillOfLadingHub.newProduct.satUnitKey`)}
            onChange={value => newProductDispatch({ type: 'SAT Unit Key Update', payload: value })}
            defaultValue={newProductState.unitKey ? newProductState.unitKey : null}
          >
            {unitKeyOptions}
          </Select>
        </Form.Item>

        {/* Specific Data */}
        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.newProduct.specificData`)}
        </Title>
        <Form.Item
          label={i18n(`newBillOfLadingHub.newProduct.dangerousMaterial`)}
          required={
            newProductState.satProductCodeIsDangerousMaterial === '1' || newProductState.satProductCodeIsDangerousMaterial === '0,1'
          }
          // validateStatus={newProductState.satProductCodeIsDangerousMaterial === '1' || newProductState.satProductCodeIsDangerousMaterial === '0,1' ? 'warning' : null}
          // help={newProductState.satProductCodeIsDangerousMaterial === '1' || newProductState.satProductCodeIsDangerousMaterial === '0,1' ? i18n('newBillOfLadingHub.newProduct.productCodeRequiresDangerousMaterial') : null}
        >
          {newProductState.satProductCodeIsDangerousMaterial === '1' || newProductState.satProductCodeIsDangerousMaterial === '0,1' ? (
            <div
              className={`${newProductState.satProductCodeIsDangerousMaterial === '0' ? 'text-tkyGreen' : ''} ${
                newProductState.satProductCodeIsDangerousMaterial === '0,1' ? 'text-tkyYellow' : ''
              } ${newProductState.satProductCodeIsDangerousMaterial === '1' ? 'text-tkyRed' : ''} pb-4`}
            >
              {newProductState.satProductCodeIsDangerousMaterial === '0,1'
                ? i18n('newBillOfLadingHub.satCodes.productCodePossibleDangerousMaterial')
                : null}
              {newProductState.satProductCodeIsDangerousMaterial === '1'
                ? i18n('newBillOfLadingHub.satCodes.productCodeIsDangerousMaterial')
                : null}
            </div>
          ) : null}
          <Select
            className=""
            style={{ width: 100 }}
            placeholder={i18n(`newBillOfLadingHub.newProduct.dangerousMaterial`)}
            onChange={value => newProductDispatch({ type: 'Select Is Dangerous Material', payload: value })}
            defaultValue={newProductState.dangerousMaterial ? newProductState.dangerousMaterial : null}
            value={newProductState.dangerousMaterial ? newProductState.dangerousMaterial : null}
            disabled={newProductState.satProductCodeIsDangerousMaterial === '1'}
          >
            <Option value="Sí">{i18n(`newBillOfLadingHub.newProduct.yes`)}</Option>
            <Option value="No">{i18n(`newBillOfLadingHub.newProduct.no`)}</Option>
          </Select>
        </Form.Item>
        {newProductState.dangerousMaterial === 'Sí' ? (
          <Form.Item label={i18n(`newBillOfLadingHub.newProduct.dangerousMaterialCode`)} required>
            <SearchSatDangerousMaterialCodes dispatch={newProductDispatch} />
            {/* <Input
              placeholder={i18n(`newBillOfLadingHub.newProduct.dangerousMaterialCode`)}
              onKeyUp={e => newProductDispatch({ type: 'SAT Dangerous Material Code Update', payload: e.target.value })}
              defaultValue={newProductState.dangerousMaterialCode ? newProductState.dangerousMaterialCode : null}
            /> */}
          </Form.Item>
        ) : null}
        <Form.Item label={i18n(`newBillOfLadingHub.newProduct.fraccionArancelaria`)} required>
          <SearchSatTariffCodes dispatch={newProductDispatch} />
          {/* <Input
            placeholder={i18n(`newBillOfLadingHub.newProduct.fraccionArancelaria`)}
            onKeyUp={e => newProductDispatch({ type: 'Tariff Code Update', payload: e.target.value })}
            defaultValue={newProductState.tariffCode ? newProductState.tariffCode : null}
          /> */}
        </Form.Item>

        <Button onClick={saveProduct} type="primary" className="float-right">
          {i18n('buttons.save')}
        </Button>
      </Form>
    </div>
  )
}
