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
import { SearchPlaces } from '../billOfLading/searchPlaces'
// eslint-disable-next-line
import { ISO_3166CountryCodes } from '../../../services/api/geocoding/ISO3166CountryCodes'
// eslint-disable-next-line import/named
import {
  sctTypePermit,
} from '../../../services/catalogs'

const { Title } = Typography
const { Option } = Select

export const NewDriver = ({
  quickCreate = false,
  initialDriver,
  setDrawerVisible,
  parentDispatch,
  setSelection,
  setSearchDisabled,
  companyId,
  isEditing,
}) => {
  const [RFCvalid, setRFCValid] = useState()
  const [RFCValidateStatus, setRFCValidateStatus] = useState()
  const [RFCMessage, setRFCMessage] = useState()
  const [internationalRFC, setInternationalRFC] = useState()

  const newDriverInitialState = initialDriver || { companyId: companyId, TipoFigura: '01' }
  const newDriverReducer = (state, action) => {
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
      case 'Driver Name Update':
        return { ...state, name: action.payload }
      case 'Drivers License Update':
        return { ...state, document: action.payload }
      case 'Drivers Email Update':
        return { ...state, email: action.payload }
      case 'Drivers Phone Update':
        return { ...state, phoneNumber: action.payload }
      case 'Foreign Fiscal Residence Update':
        return { ...state, countryOfResidence: action.payload }
      case 'Foreign TaxID Update':
        return { ...state, foreignFiscalId: action.payload }
      case 'Address Update':
        return { ...state, address: action.payload }
      case 'New Place Update':
        return { ...state, address: action.payload }
      default: 
        return { ...state}
    }
  }
  const [newDriverState, newDriverDispatch] = useReducer(newDriverReducer, newDriverInitialState)

  const sctTypePermitOptions = sctTypePermit.map(permit => (
    <Option value={permit.code}>
      {permit.code} - {permit.name}
    </Option>
  ))

  const createNewDriverInDB = vehicle => {
    // console.log('vehicle: ', vehicle)
    post('/api/drivers/create-new-driver', { body: vehicle }).then(({ error, details }) => {
      // if (!error) setFinished('signed')
      // setApiError(error, details?.message || '')
    })
    // .catch(setApiError)
    // .finally(() => setCreatingCfdi(false))
  }

    // eslint-disable-next-line
  const createCountryOptions = ISO_3166CountryCodes.map(country => {
    // console.log(country.name, country.alpha3)
    return <Option value={country.alpha3}>{country.name}</Option>
  })

  const passDataToPartentComponent = state => {
    parentDispatch({ type: 'New Driver Update', payload: state })
    setSelection(newDriverState)
    setSearchDisabled(true)
  }

  const closeDrawer = () => {
    setDrawerVisible(false)
  }

  const saveDriver = () => {
    // console.log('newDriverState:', newDriverState)
    createNewDriverInDB(newDriverState)
    passDataToPartentComponent(newDriverState)
    closeDrawer()
  }

  return (
    <div>
      <Form layout="vertical">
        <Title level={3}>{i18n(`newBillOfLadingHub.newDriver.title`)}</Title>
        <span className="text-blue">{i18n('newBillOfLadingHub.newDriver.description')}</span>
        <br />
        {/* <Button onClick={() => console.log(newDriverState)}>Console State</Button> */}
        <Divider plain />
        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.newVehicle.identification`)}
        </Title>
        {/* Name */}
        <Form.Item label={i18n(`newBillOfLadingHub.newTransport.name`)} required>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newTransport.name`)}
            onKeyUp={e => newDriverDispatch({ type: 'Driver Name Update', payload: e.target.value })}
            defaultValue={newDriverState.name ? newDriverState.name : null}
          />
        </Form.Item>

        {/* RFC */}
        <Form.Item label={i18n(`newBillOfLadingHub.newLocation.rfc`)} validateStatus={RFCValidateStatus} help={RFCMessage} required>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newLocation.rfc`)}
            onKeyUp={e => newDriverDispatch({ type: 'RFC Update', payload: e.target.value })}
            defaultValue={newDriverState.RFCFigura ?? null}
          />
        </Form.Item>

        {internationalRFC || newDriverState.RFCRemitenteDestinatario === 'XEXX010101000' ? (
          <div>
            <Form.Item label={i18n(`newBillOfLadingHub.newLocation.fiscalResidence`)} required>
              <Select
                placeholder={i18n(`newBillOfLadingHub.newLocation.fiscalResidence`)}
                onChange={value => newDriverDispatch({ type: 'Foreign Fiscal Residence Update', payload: value })}
                defaultValue={newDriverState.ResidenciaFiscalFigura ? newDriverState.ResidenciaFiscalFigura : null}
                showSearch
              >
                {createCountryOptions}
              </Select>
            </Form.Item>
            <Form.Item label={i18n(`newBillOfLadingHub.newLocation.freignTaxId`)} required>
              <Input
                placeholder={i18n(`newBillOfLadingHub.newLocation.freignTaxId`)}
                onKeyUp={e => newDriverDispatch({ type: 'Foreign TaxID Update', payload: e.target.value })}
                defaultValue={newDriverState.NumRegIdTribFigura ? newDriverState.NumRegIdTribFigura : null}
              />
            </Form.Item>
          </div>
        ) : null}

        {/* License */}
        <Form.Item label={i18n(`newBillOfLadingHub.newTransport.license`)} required>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newTransport.license`)}
            onKeyUp={e => newDriverDispatch({ type: 'Drivers License Update', payload: e.target.value })}
            defaultValue={newDriverState.NumLicencia ? newDriverState.NumLicencia : null}
          />
        </Form.Item>

        {/* Contact Info */}
        <Form.Item label={i18n(`newBillOfLadingHub.newDriver.email`)} required>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newDriver.email`)}
            onKeyUp={e => newDriverDispatch({ type: 'Drivers Email Update', payload: e.target.value })}
            defaultValue={newDriverState.email ? newDriverState.email : null}
          />
        </Form.Item>

        <Form.Item label={i18n(`newBillOfLadingHub.newDriver.phoneNumber`)} required>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newDriver.phoneNumber`)}
            onKeyUp={e => newDriverDispatch({ type: 'Drivers Phone Update', payload: e.target.value })}
            defaultValue={newDriverState.phoneNumber ? newDriverState.phoneNumber : null}
          />
        </Form.Item>

        {/* Address */}

        <Form.Item className="w-full" label={i18n(`newBillOfLadingHub.newLocation.address`)} required>
          <SearchPlaces
            dispatch={newDriverDispatch}
            placeName={newDriverState.address}
            disabled={isEditing}
            isEditingLocation={isEditing}
          />
        </Form.Item>

        <Button onClick={saveDriver} type="primary" className="float-right">
          {i18n('buttons.save')}
        </Button>
      </Form>
    </div>
  )
}
