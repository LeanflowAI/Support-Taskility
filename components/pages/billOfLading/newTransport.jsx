import React, { useReducer, useState } from 'react'
import { Typography, Button, Select, Form, Divider, Radio, Space } from 'antd'
import { i18n } from '../../../services/i18n'
import { SearchCompanies } from '../companies/searchCompanies'
import { SearchVehicles } from '../vehicles/searchVehicles'
import { SearchDrivers } from '../drivers/searchDrivers'

// eslint-disable-next-line import/named
import { labelValueSatCveTransporte, sctTypePermit, configAutotransport, subTipoRem } from '../../../services/catalogs'

const { Title, Text } = Typography
const { Option } = Select

export const NewTransport = ({
  dispatch,
  setIsTransportVisible,
  transports,
  index,
  isEditingTransport,
  authorizedUsers,
  companyProfile,
  isDisabledSearchPlaces,
  isDisabledSearchCompanies,
  isDisabledSearchVehicles,
  isDisabledSearchTrailers,
}) => {
  const [isTypeSelected, setIsTypeSelected] = useState(isEditingTransport)
  const [RFCvalid, setRFCValid] = useState()
  const [RFCValidateStatus, setRFCValidateStatus] = useState()
  const [RFCMessage, setRFCMessage] = useState()
  const [internationalRFC, setInternationalRFC] = useState()

  const newTransportInitialState = transports && index !== undefined ? transports[index] : { authorizedUsers: authorizedUsers }
  const newTransportReducer = (state, action) => {
    switch (action.type) {
      case 'Company Update':
        return {
          ...state,
          company: {
            ...state.company,
            ...action.payload,
          },
        }
      case 'Change Hub Objective': {
        return { ...state, taskilityObjective: action.payload }
      }
      case 'New Vehicle Update': {
        if (action.payload.type === 'truck')
          return {
            ...state,
            autotransport: {
              ...state.autotransport,
              vehicle: action.payload,
            },
          }
        if (action.payload.type === 'trailer')
          return {
            ...state,
            autotransport: {
              ...state.autotransport,
              trailers: action.payload,
            },
          }
        return { ...state }
      }
      case 'Vehicle Update':
        if (action.payload.type === 'truck')
          return {
            ...state,
            autotransport: {
              ...state.autotransport,
              vehicle: action.payload,
            },
          }
        if (action.payload.type === 'trailer')
          return {
            ...state,
            autotransport: {
              ...state.autotransport,
              trailers: action.payload,
            },
          }
        return { ...state }
      case 'Select Transport Type':
        return { ...state, transportType: action.payload }
      case 'New Driver Update':
        if (action.payload.rfc === 'XEXX010101000') {
          return {
            ...state,
            figures: [
              {
                ...state.figure,
                figureType: '01',
                driverId: action.payload._id,
                rfc: action.payload.rfc,
                document: action.payload.document,
                name: action.payload.name,
                foreignFiscalId: action.payload.foreignFiscalId, // En caso de que RFCFigura sea XEXX010101000
                countryOfResidence: action.payload.countryOfResidence, // En caso de que RFCFigura sea XEXX010101000
                satAddress: action.payload.address.satAddress,
              },
            ],
          }
        }
        return {
          ...state,
          figures: [
            {
              ...state.figure,
              figureType: '01',
              driverId: action.payload._id,
              rfc: action.payload.rfc,
              document: action.payload.document,
              name: action.payload.name,
              satAddress: action.payload.address.satAddress,
            },
          ],
        }

      case 'Driver Update':
        if (action.payload.rfc === 'XEXX010101000')
          return {
            ...state,
            figures: [
              {
                ...state.figure,
                figureType: '01',
                driverId: action.payload._id,
                rfc: action.payload.rfc,
                document: action.payload.document,
                name: action.payload.name,
                foreignFiscalId: action.payload.foreignFiscalId, // En caso de que RFCFigura sea XEXX010101000
                countryOfResidence: action.payload.countryOfResidence, // En caso de que RFCFigura sea XEXX010101000
                satAddress: action.payload.address.satAddress,
              },
            ],
          }
        // eslint-disable-next-line no-param-reassign
        delete state?.TipoFigura?.NumRegIdTribFigura
        // eslint-disable-next-line no-param-reassign
        delete state?.TipoFigura?.ResidenciaFiscalFigura
        return {
          ...state,
          figures: [
            {
              ...state.figure,
              figureType: '01',
              driverId: action.payload._id,
              rfc: action.payload.rfc,
              document: action.payload.document,
              name: action.payload.name,
              satAddress: action.payload.address.satAddress,
            },
          ],
        }
      default:
        return state
    }
  }

  const [newTransportState, newTransportDispatch] = useReducer(newTransportReducer, newTransportInitialState)

  const sctTypePermitOptions = sctTypePermit.map(permit => (
    <Option value={permit.code}>
      {permit.code} - {permit.name}
    </Option>
  ))

  const typeOfVehicleOptions = configAutotransport.map(vehicle => (
    <Option value={vehicle.code}>
      {vehicle.code} - {vehicle.name}
    </Option>
  ))

  const typeOfTrailerOptions = subTipoRem.map(trailer => (
    <Option value={trailer.code}>
      {trailer.code} - {trailer.name}
    </Option>
  ))

  const onChange = value => {
    newTransportDispatch({ type: 'Select Transport Type', payload: value })
  }

  const saveTransport = () => {
    dispatch({ type: 'Add a Transport', payload: newTransportState })
    setIsTransportVisible(false)
  }

  const updateTransport = () => {
    dispatch({ type: 'Update a Transport', payload: { transport: newTransportState, index: index } })
    setIsTransportVisible(false)
  }

  return (
    <div className="w-full mt-10">
      <Form layout="vertical">
        <Title level={3}>
          {isEditingTransport ? i18n(`newBillOfLadingHub.newTransport.editTitle`) : i18n(`newBillOfLadingHub.newTransport.title`)}
        </Title>
        <span className="text-blue">{i18n('newBillOfLadingHub.newTransport.description')}</span>
        {/* <Button onClick={() => console.log(newTransportState)}>Console State</Button> */}
        <Divider plain />
        {/* <Button onClick={showStateInConsole}>Console State</Button> */}

        {/* Company */}
        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.newTransport.company`)}
        </Title>
        <Text>{i18n(`newBillOfLadingHub.newTransport.companyDescription`)}</Text>
        <Form.Item label={i18n(`newBillOfLadingHub.newTransport.company`)} required>
          <SearchCompanies
            dispatch={newTransportDispatch}
            companyName={newTransportState.company?.name}
            disabled={isEditingTransport}
            isEditingLocation={isEditingTransport}
          />
        </Form.Item>
        <Title level={5} className="mt-2">
          {i18n(`newBillOfLadingHub.hubObjective`)}
        </Title>
        <div className="mb-4">{i18n(`newBillOfLadingHub.hubObjectiveDescription`)}</div>
        <Form.Item>
          <Radio.Group
            onChange={e => newTransportDispatch({ type: 'Change Hub Objective', payload: e.target.value })}
            value={newTransportState.taskilityObjective}
            className="mt-2"
            disabled={companyProfile ? companyProfile.disableTaskilityBoLHObjective : false}
          >
            <Space size={[60, 32]} wrap>
              <Radio value="Stamp BoL Income">
                <Space direction="vertical" size={2}>
                  <span>
                    <strong className="">{i18n(`newBillOfLadingHub.stampBoLIncome`)}</strong>
                  </span>
                  <span className="">{i18n(`newBillOfLadingHub.stampBoLIncomeDescription`)}</span>
                </Space>
              </Radio>
              <Radio value="Stamp BoL Transport">
                <Space direction="vertical" size={2}>
                  <span>
                    <strong className="">{i18n(`newBillOfLadingHub.stampBoLTransport`)}</strong>
                  </span>
                  <span className="">{i18n(`newBillOfLadingHub.stampBoLTransportDescription`)}</span>
                </Space>
              </Radio>
              <Radio value="Send BoL Data">
                <Space direction="vertical" size={2}>
                  <span>
                    <strong className="">{i18n(`newBillOfLadingHub.sendBoLInfo`)}</strong>
                  </span>
                  <span className="">{i18n(`newBillOfLadingHub.sendBoLInfoDescription`)}</span>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {/* Type of Transport */}
        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.newTransport.type`)}
        </Title>
        <Form.Item label={i18n(`newBillOfLadingHub.newTransport.type`)} required>
          <Select
            className="w-full"
            placeholder={i18n(`newBillOfLadingHub.newTransport.type`)}
            onChange={onChange}
            defaultValue={newTransportState.transportType ? newTransportState.transportType : null}
            options={labelValueSatCveTransporte}
          />
        </Form.Item>
        <Button type="primary" onClick={isEditingTransport ? updateTransport : saveTransport} className="float-right">
          {i18n('buttons.save')}
        </Button>
      </Form>
    </div>
  )
}
