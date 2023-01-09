import React, { useReducer, useState } from 'react'
import { Typography, Button, Select, Form, Divider, Input } from 'antd'
import { i18n } from '../../../services/i18n'
import { SearchCompanies } from '../companies/searchCompanies'
import { SearchVehicles } from '../vehicles/searchVehicles'
import { SearchDrivers } from '../drivers/searchDrivers'

// eslint-disable-next-line import/named
import { labelValueSatCveTransporte, sctTypePermit, configAutotransport, subTipoRem } from '../../../services/catalogs'

const { Title, Text } = Typography
const { Option } = Select

export const NewTag = ({
  dispatch,
  setIsTagVisible,
  tags,
  index,
  isEditingTag,
  isDisabledSearchPlaces,
  isDisabledSearchCompanies,
  isDisabledSearchVehicles,
  isDisabledSearchTrailers,
}) => {
  const [isTypeSelected, setIsTypeSelected] = useState(isEditingTag)
  const [RFCvalid, setRFCValid] = useState()
  const [RFCValidateStatus, setRFCValidateStatus] = useState()
  const [RFCMessage, setRFCMessage] = useState()
  const [internationalRFC, setInternationalRFC] = useState()

  const newTagInitialState = tags && index !== undefined ? tags[index] : {}
  const newTagReducer = (state, action) => {
    switch (action.type) {
      case 'Company Update':
        return {
          ...state,
          company: {
            ...state.company,
            ...action.payload,
          },
        }
      case 'New Vehicle Update':
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
      case 'Select Tag Type':
        return { ...state, type: action.payload }

      case 'Tag Value Update': 
        return { ...state, value: action.payload }
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

  const [newTagState, newTagDispatch] = useReducer(newTagReducer, newTagInitialState)

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

  const onChangeType = value => {
    newTagDispatch({ type: 'Select Tag Type', payload: value })
  }

 

  const saveTag = () => {
    dispatch({ type: 'Add a Tag', payload: newTagState })
    setIsTagVisible(false)
  }

  const updateTag = () => {
    dispatch({ type: 'Update a Tag', payload: { transport: newTagState, index: index } })
    setIsTagVisible(false)
  }

  return (
    <div className="w-full mt-10">
      <Form layout="vertical">
        <Title level={3}>{isEditingTag ? i18n(`newBillOfLadingHub.newTag.editTitle`) : i18n(`newBillOfLadingHub.newTag.title`)}</Title>
        <span className="text-blue">{i18n('newBillOfLadingHub.newTag.description')}</span>
        {/* <Button onClick={() => console.log(newTagState)}>Console State</Button> */}
        <Divider plain />
        {/* <Button onClick={showStateInConsole}>Console State</Button> */}

        {/* Company */}
        <Form.Item label={i18n(`newBillOfLadingHub.newTag.type`)} required>
          <Select
            className="w-full"
            placeholder={i18n(`newBillOfLadingHub.newTag.type`)}
            onChange={onChangeType}
            defaultValue={newTagState.type ? newTagState.type : null}
            // options={labelValueSatCveTransporte}
          >
            <Option value="shipment" key="shipment">
              {i18n('newBillOfLadingHub.tags.shipment')}
            </Option>
            <Option value="purchaseOrder" key="purchaseOrder">
              {i18n('newBillOfLadingHub.tags.purchaseOrder')}
            </Option>
            <Option value="customerReference" key="customerReference">
              {i18n('newBillOfLadingHub.tags.customerReference')}
            </Option>
            <Option value="category" key="category">
              {i18n('newBillOfLadingHub.tags.category')}
            </Option>
            <Option value="keyword" key="keyword">
              {i18n('newBillOfLadingHub.tags.keyword')}
            </Option>
            <Option value="other" key="other">
              {i18n('newBillOfLadingHub.tags.other')}
            </Option>
          </Select>
        </Form.Item>

        <Form.Item label={i18n(`newBillOfLadingHub.newTag.value`)} required>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newTag.value`)}
            onKeyUp={e => newTagDispatch({ type: 'Tag Value Update', payload: e.target.value })}
            defaultValue={newTagState.value ? newTagState.value : null}
          />
        </Form.Item>

        <Button type="primary" onClick={isEditingTag ? updateTag : saveTag} className="float-right">
          {i18n('buttons.save')}
        </Button>
      </Form>
    </div>
  )
}
