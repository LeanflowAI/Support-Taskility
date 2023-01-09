import React, { useReducer, useState } from 'react'
import {
  Typography,
  Button,
  Select,
  Input,
  Form,
  Divider,
} from 'antd'
import { i18n } from '../../../services/i18n'
import { post } from '../../../services/fetch'
import { rfcValido } from '../../../services/sat/rfcValidator'
// eslint-disable-next-line
import { ISO_3166CountryCodes } from '../../../services/api/geocoding/ISO3166CountryCodes'

const { Title } = Typography
const { Option } = Select


export const NewCompany = ({
  quickCreate = false,
  initialCompany,
  setNewCompanyDrawerVisible,
  parentDispatch,
  setSelection,
  setSearchAddressDisabled,
}) => {
  const [RFCvalid, setRFCValid] = useState()
  const [RFCValidateStatus, setRFCValidateStatus] = useState()
  const [RFCMessage, setRFCMessage] = useState()
  const [internationalRFC, setInternationalRFC] = useState()

  const newCompanyInitialState = initialCompany || {}
  const newCompanyReducer = (state, action) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      case 'RFC Update':
        // eslint-disable-next-line no-case-declarations
        const trimmedRfc = action.payload.replace(/-|\s/g, '').toUpperCase()
        // eslint-disable-next-line no-case-declarations
        const { valid, validateStatus, message } = rfcValido(trimmedRfc)
        setRFCValid(valid)
        setRFCValidateStatus(validateStatus)
        setRFCMessage(message)
        // eslint-disable-next-line no-unused-expressions
        if (trimmedRfc === 'XEXX010101000') {
          setInternationalRFC(true)
        } else {
          setInternationalRFC(false)
          // eslint-disable-next-line no-param-reassign
          delete state.foreignFiscalId
          // eslint-disable-next-line no-param-reassign
        }
        return { ...state, rfc: trimmedRfc }
      case 'Name Update':
        return { ...state, comercialName: action.payload, name: action.payload }
      case 'Foreign TaxID Update':
        return { ...state, foreignFiscalId: action.payload }
      case 'Foreign Fiscal Residence Update':
        return { ...state, country: action.payload }
      default: 
        return { ...state}
    }
  }
  const [newCompanyState, newCompanyDispatch] = useReducer(newCompanyReducer, newCompanyInitialState)

  const createNewCompanyInDB = company => {
    // console.log('company: ', company)
    post('/api/companies/create-new-company', { body: company }).then(({ error, details }) => {
      // if (!error) setFinished('signed')
      // setApiError(error, details?.message || '')
    })
    // .catch(setApiError)
    // .finally(() => setCreatingCfdi(false))
  }
  // eslint-disable-next-line
  const createCountryOptions = ISO_3166CountryCodes.map(country => {
    // console.log(country.name, country.alpha3)
    return <Option key={country.alpha3} value={country.alpha3}>{country.name}</Option>
  })

  const passDataToPartentComponent = state => {
    parentDispatch({ type: 'New Company Update', payload: state })
    setSelection(newCompanyState)
    setSearchAddressDisabled(true)
  }

  const closeDrawer = () => {
    setNewCompanyDrawerVisible(false)
  }

  const saveCompany = () => {
    // console.log('newCompanyState:', newCompanyState)
    createNewCompanyInDB(newCompanyState)
    passDataToPartentComponent(newCompanyState)
    closeDrawer()
  }

  return (
    <div>
      <Form layout="vertical">
        <Title level={3}>{i18n(`newBillOfLadingHub.newCompany.title`)}</Title>
        <span className="text-blue">{i18n('newBillOfLadingHub.newCompany.description')}</span>
        <Divider plain />
        <Form.Item label={i18n(`newBillOfLadingHub.newLocation.rfc`)} validateStatus={RFCValidateStatus} help={RFCMessage} required>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newLocation.rfc`)}
            onKeyUp={e => newCompanyDispatch({ type: 'RFC Update', payload: e.target.value })}
            defaultValue={newCompanyState.RFCRemitenteDestinatario?.sat ?? null}
          />
        </Form.Item>
        <Form.Item label={i18n(`newBillOfLadingHub.newLocation.name`)}>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newLocation.name`)}
            onKeyUp={e => newCompanyDispatch({ type: 'Name Update', payload: e.target.value })}
            defaultValue={newCompanyState.NombreRFC ? newCompanyState.NombreRFC.sat : null}
          />
        </Form.Item>
        {internationalRFC || newCompanyState.RFCRemitenteDestinatario === 'XEXX010101000' ? (
          <div>
            <Form.Item label={i18n(`newBillOfLadingHub.newLocation.fiscalResidence`)} required>
              <Select
                placeholder={i18n(`newBillOfLadingHub.newLocation.fiscalResidence`)}
                onChange={value => newCompanyDispatch({ type: 'Foreign Fiscal Residence Update', payload: value })}
                defaultValue={newCompanyState.ResidenciaFiscal ? newCompanyState.ResidenciaFiscal.sat : null}
                showSearch
              >
                {createCountryOptions}
              </Select>
            </Form.Item>
            <Form.Item label={i18n(`newBillOfLadingHub.newLocation.freignTaxId`)} required>
              <Input
                placeholder={i18n(`newBillOfLadingHub.newLocation.freignTaxId`)}
                onKeyUp={e => newCompanyDispatch({ type: 'Foreign TaxID Update', payload: e.target.value })}
                defaultValue={newCompanyState.NumRegIdTrib ? newCompanyState.NumRegIdTrib.sat : null}
              />
            </Form.Item>
          </div>
        ) : null}
        <Button onClick={saveCompany} type="primary" className="float-right">
          {i18n('buttons.save')}
        </Button>
      </Form>
    </div>
  )
}
