import React, { useEffect, useReducer, useState } from 'react'
// import Image from 'next/image'
import useSWR from 'swr'
// import { useRouter } from 'next/router'
import { HEREMap } from 'here-maps-react'
import {
  Space,
  Typography,
  PageHeader,
  Progress,
  Button,
  Layout,
  Steps,
  Radio,
  Popover,
  Card,
  List,
  Select,
  Row,
  Col,
  Tooltip,
  InputNumber,
  Input,
  Spin,
  Checkbox,
  Collapse,
  Alert,
  Form,
  Divider,
  DatePicker,
  TimePicker,
  Avatar,
  AutoComplete,
  Menu,
  Dropdown,
  Tabs,
  Switch,
} from 'antd'
import { EditOutlined, EllipsisOutlined, SettingOutlined, IdcardOutlined, CommentOutlined, FilePdfOutlined } from '@ant-design/icons'
import { useForm, Controller } from 'react-hook-form'
import { i18n } from '../../../services/i18n'
import { AppHeader } from '../../layout/AppHeader'
import { SideMenu } from '../../layout/SideMenu'
import { CfdiPreview } from '../cfdi/Cfdi'
import { get, post } from '../../../services/fetch'
import { num } from '../../../services/helpers/mathHelp'
// import next from 'next'
import { Mapbox } from '../maps/Mapbox'
import geoLocations from '../../../services/gps/geoLocations'
import { encodeTextURL } from '../../../services/helpers/text'
import { Teammate } from '../billOfLading/teammate'
import { rfcValido } from '../../../services/sat/rfcValidator'
import { SearchPlaces } from '../billOfLading/searchPlaces'
// eslint-disable-next-line camelcase
import { ISO_3166CountryCodes } from '../../../services/api/geocoding/ISO3166CountryCodes'
// eslint-disable-next-line import/named
import {
  labelValueSatCveTransporte,
  sctTypePermit,
  configAutotransport,
  subTipoRem,
  insuranceCompaniesMexico,
} from '../../../services/catalogs'

const { Title, Text, Link } = Typography
const { RangePicker } = TimePicker
const { Meta } = Card
const { Option } = Select
const { TextArea, Search } = Input
const { SubMenu } = Menu
const { TabPane } = Tabs

export const NewVehicle = ({
  quickCreate = false,
  initialVehicle,
  setDrawerVisible,
  parentDispatch,
  setSelection,
  setSearchDisabled,
  companyId,
  type,
}) => {
  const [RFCvalid, setRFCValid] = useState()
  const [RFCValidateStatus, setRFCValidateStatus] = useState()
  const [RFCMessage, setRFCMessage] = useState()
  const [internationalRFC, setInternationalRFC] = useState()

  const newVehicleInitialState = initialVehicle || { companyId: companyId, type: type }
  const newVehicleReducer = (state, action) => {
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
      case 'Economic Number Update':
        return { ...state, number: action.payload }
      case 'License Plate Update':
        return { ...state, plateNumber: action.payload }
      case 'Select SAT Type Vehicle':
        return { ...state, typeOfVehicleSAT: action.payload }
      case 'Select SAT Type Trailer':
        return { ...state, typeOfTrailerSAT: action.payload }
      case 'Select SCT Type Permit':
        return { ...state, SCTPermit: action.payload }
      case 'SCT Permit Update':
        return { ...state, SCTPermitNumber: action.payload }
      case 'Vehicle Model Year Update':
        return { ...state, modelYear: action.payload }
      case 'Vehicle Brand Update':
        return { ...state, brand: action.payload }
      case 'Insurance Company CR Update':
        return {
          ...state,
          insurance: {
            ...state.insurance,
            civilResponsibility: { ...state.insurance?.civilResponsibility, company: action.payload },
          },
        }
      case 'Insurance Policy CR Update':
        return {
          ...state,
          insurance: {
            ...state.insurance,
            civilResponsibility: { ...state.insurance?.civilResponsibility, policy: action.payload },
          },
        }
      case 'Insurance Company EP Update':
        return {
          ...state,
          insurance: {
            ...state.insurance,
            environmentalProtection: { ...state.insurance?.environmentalProtection, company: action.payload },
          },
        }
      case 'Insurance Policy EP Update':
        return {
          ...state,
          insurance: {
            ...state.insurance,
            environmentalProtection: { ...state.insurance?.environmentalProtection, policy: action.payload },
          },
        }
      default:
        return { ...state }
    }
  }
  const [newVehicleState, newVehicleDispatch] = useReducer(newVehicleReducer, newVehicleInitialState)

  const sctTypePermitOptions = sctTypePermit.map(permit => (
    <Option value={permit.code} key={permit.code}>
      {/* eslint-disable-next-line */}
      {permit.code} - {permit.name}
    </Option>
  ))

  const typeOfVehicleOptions = configAutotransport.map(vehicle => (
    <Option value={vehicle.code} key={vehicle.code}>
      {/* eslint-disable-next-line */}
      {vehicle.code} - {vehicle.name}
    </Option>
  ))

  const typeOfTrailerOptions = subTipoRem.map(vehicle => (
    <Option value={vehicle.code} key={vehicle.code}>
      {/* eslint-disable-next-line */}
      {vehicle.code} - {vehicle.name}
    </Option>
  ))

  const carInsuranceCompaniesOptions = insuranceCompaniesMexico.map(company => {
    if (company.carInsurance) return <Option value={company.name} key={company.name}>{company.name}</Option>
    return null
  })

  const insuranceCompaniesOptions = insuranceCompaniesMexico.map(company => {
    return <Option value={company.name} key={company.name}>{company.name}</Option>
  })

  const createNewVehicleInDB = vehicle => {
    // console.log('vehicle: ', vehicle)
    post('/api/vehicles/create-new-vehicle', { body: vehicle }).then(({ error, details }) => {
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
    parentDispatch({ type: 'New Vehicle Update', payload: state })
    setSelection(newVehicleState)
    setSearchDisabled(true)
  }

  const closeDrawer = () => {
    setDrawerVisible(false)
  }

  const saveVehicle = () => {
    // console.log('newVehicleState:', newVehicleState)
    createNewVehicleInDB(newVehicleState)
    passDataToPartentComponent(newVehicleState)
    closeDrawer()
  }

  return (
    <div>
      <Form layout="vertical">
        <Title level={3}>{i18n(`newBillOfLadingHub.newVehicle.title`)}</Title>
        <span className="text-blue">{i18n('newBillOfLadingHub.newVehicle.description')}</span>
        <br />
        {/* <Button onClick={() => console.log(newVehicleState)}>Console State</Button> */}
        <Divider plain />
        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.newVehicle.identification`)}
        </Title>
        {type === 'any' ? (
          <Form.Item label={i18n(`newBillOfLadingHub.newVehicle.type`)} validateStatus={RFCValidateStatus} help={RFCMessage} required>
            <Select
              placeholder={i18n(`newBillOfLadingHub.newVehicle.type`)}
              onChange={value => newVehicleDispatch({ type: 'Type Update', payload: value })}
              defaultValue={newVehicleState.type !== 'any' ? newVehicleState.type : null}
            >
              <Option value="truck">{i18n('newBillOfLadingHub.newVehicle.truck')}</Option>
              <Option value="trailer">{i18n('newBillOfLadingHub.newVehicle.trailer')}</Option>
            </Select>
          </Form.Item>
        ) : null}
        <Form.Item label={i18n(`newBillOfLadingHub.newVehicle.economicNumber`)} required>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newVehicle.economicNumber`)}
            onKeyUp={e => newVehicleDispatch({ type: 'Economic Number Update', payload: e.target.value })}
            defaultValue={newVehicleState.number ? newVehicleState.number : null}
          />
        </Form.Item>
        <Form.Item label={i18n(`newBillOfLadingHub.newVehicle.licensePlate`)} required>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newVehicle.licensePlate`)}
            onKeyUp={e => newVehicleDispatch({ type: 'License Plate Update', payload: e.target.value })}
            defaultValue={newVehicleState.plateNumber ? newVehicleState.plateNumber : null}
          />
        </Form.Item>
        <Form.Item label={i18n(`newBillOfLadingHub.newTransport.modelYear`)} required={type === 'truck'}>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newTransport.modelYear`)}
            onKeyUp={e => newVehicleDispatch({ type: 'Vehicle Model Year Update', payload: e.target.value })}
            defaultValue={newVehicleState.modelYear ? newVehicleState.modelYear : null}
          />
        </Form.Item>
        <Form.Item label={i18n(`newBillOfLadingHub.newVehicle.brand`)}>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newVehicle.brand`)}
            onKeyUp={e => newVehicleDispatch({ type: 'Vehicle Brand Update', payload: e.target.value })}
            defaultValue={newVehicleState.brand ? newVehicleState.brand : null}
          />
        </Form.Item>
        {type === 'truck' ? (
          <Form.Item label={i18n(`newBillOfLadingHub.newTransport.typeOfVehicleSAT`)} required>
            <Select
              className="w-full"
              placeholder={i18n(`newBillOfLadingHub.newTransport.typeOfVehicleSAT`)}
              onChange={value => newVehicleDispatch({ type: 'Select SAT Type Vehicle', payload: value })}
              defaultValue={newVehicleState.typeOfVehicleSAT ? newVehicleState.typeOfVehicleSAT : null}
              // options={labelValueSctTypePermit}
            >
              {typeOfVehicleOptions}
            </Select>
          </Form.Item>
        ) : (
          <Form.Item label={i18n(`newBillOfLadingHub.newTransport.typeOfTrailerSAT`)} required>
            <Select
              className="w-full"
              placeholder={i18n(`newBillOfLadingHub.newTransport.typeOfTrailerSAT`)}
              onChange={value => newVehicleDispatch({ type: 'Select SAT Type Trailer', payload: value })}
              defaultValue={newVehicleState.typeOfTrailerSAT ? newVehicleState.typeOfTrailerSAT : null}
              // options={labelValueSctTypePermit}
            >
              {typeOfTrailerOptions}
            </Select>
          </Form.Item>
        )}
        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.newVehicle.sctInformation`)}
        </Title>
        <Form.Item label={i18n(`newBillOfLadingHub.newTransport.typeSCTPermit`)} required={type === 'truck'}>
          <Select
            className="w-full"
            placeholder={i18n(`newBillOfLadingHub.newTransport.typeSCTPermit`)}
            onChange={value => newVehicleDispatch({ type: 'Select SCT Type Permit', payload: value })}
            defaultValue={newVehicleState.SCTPermit ? newVehicleState.SCTPermit : null}
            // options={labelValueSctTypePermit}
          >
            {sctTypePermitOptions}
          </Select>
        </Form.Item>

        <Form.Item label={i18n(`newBillOfLadingHub.newTransport.SCTPermit`)} required={type === 'truck'}>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newTransport.SCTPermit`)}
            onKeyUp={e => newVehicleDispatch({ type: 'SCT Permit Update', payload: e.target.value })}
            defaultValue={newVehicleState.SCTPermitNumber ? newVehicleState.SCTPermitNumber : null}
          />
        </Form.Item>

        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.newVehicle.insuranceCR`)}
        </Title>

        <Form.Item label={i18n(`newBillOfLadingHub.newVehicle.insuranceCompany`)} required={type === 'truck'}>
          <Select
            className="w-full"
            placeholder={i18n(`newBillOfLadingHub.newVehicle.insuranceCompany`)}
            onChange={value => newVehicleDispatch({ type: 'Insurance Company CR Update', payload: value })}
            defaultValue={
              newVehicleState.insurance?.civilResponsibility?.company ? newVehicleState.insurance?.civilResponsibility.company : null
            }
            showSearch
          >
            {carInsuranceCompaniesOptions}
          </Select>
        </Form.Item>

        <Form.Item label={i18n(`newBillOfLadingHub.newVehicle.insurancePolicy`)} required={type === 'truck'}>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newVehicle.insurancePolicy`)}
            onKeyUp={e => newVehicleDispatch({ type: 'Insurance Policy CR Update', payload: e.target.value })}
            defaultValue={
              newVehicleState.insurance?.civilResponsibility?.policy ? newVehicleState.insurance?.civilResponsibility.policy : null
            }
          />
        </Form.Item>

        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.newVehicle.insuranceEP`)}
        </Title>

        <Form.Item label={i18n(`newBillOfLadingHub.newVehicle.insuranceCompany`)}>
          <Select
            className="w-full"
            placeholder={i18n(`newBillOfLadingHub.newVehicle.insuranceCompany`)}
            onChange={value => newVehicleDispatch({ type: 'Insurance Company EP Update', payload: value })}
            defaultValue={
              newVehicleState.insurance?.environmentalProtection?.company
                ? newVehicleState.insurance?.environmentalProtection.company
                : null
            }
            showSearch
          >
            {insuranceCompaniesOptions}
          </Select>
        </Form.Item>

        <Form.Item label={i18n(`newBillOfLadingHub.newVehicle.insurancePolicy`)}>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newVehicle.insurancePolicy`)}
            onKeyUp={e => newVehicleDispatch({ type: 'Insurance Policy EP Update', payload: e.target.value })}
            defaultValue={
              newVehicleState.insurance?.environmentalProtection?.policy ? newVehicleState.insurance?.environmentalProtection.policy : null
            }
          />
        </Form.Item>

        <Button onClick={saveVehicle} type="primary" className="float-right">
          {i18n('buttons.save')}
        </Button>
      </Form>
    </div>
  )
}
