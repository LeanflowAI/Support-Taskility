import React, { useReducer, useState } from 'react'
import moment from 'moment'
import { Typography, Button, Select, Input, Form, Divider, DatePicker } from 'antd'
import { i18n } from '../../../services/i18n'
import { rfcValido } from '../../../services/sat/rfcValidator'
import { SearchPlaces } from './searchPlaces'
import { SearchCompanies } from '../companies/searchCompanies'

const { Title } = Typography
const { Option } = Select

export const NewLocation = ({
  dispatch,
  setIsLocationVisible,
  locations,
  index,
  isEditingLocation,
  isDisabledSearchPlaces,
  isDisabledSearchCompanies,
  authorizedUsers
}) => {
  const [isTypeSelected, setIsTypeSelected] = useState(isEditingLocation)
  const [RFCvalid, setRFCValid] = useState()
  const [RFCValidateStatus, setRFCValidateStatus] = useState()
  const [RFCMessage, setRFCMessage] = useState()
  const [internationalRFC, setInternationalRFC] = useState()

  // console.log(isDisabledSearchCompanies)
  const newLocationInitialState = locations && index !== undefined ? locations[index] : {authorizedUsers: authorizedUsers}
  const newLocationReducer = (state, action) => {
    switch (action.type) {
      case 'New Location Type':
        return { ...state, locationType: { sat: action.payload, print: action.payload } }
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
          delete state.fiscalResidence
        }
        return { ...state, issuerReceiverRFC: { sat: trimmedRfc, print: trimmedRfc } }
      case 'Name Update':
        return { ...state, RFCName: { sat: action.payload, print: action.payload } }
      case 'Foreign TaxID Update':
        return { ...state, foreignFiscalId: { sat: action.payload, print: action.payload } }
      case 'Foreign Fiscal Residence Update':
        return { ...state, fiscalResidence: { sat: action.payload, print: action.payload } }
      case 'Date Update':
        // eslint-disable-next-line no-case-declarations
        const formattedDate = action.payload.replace(/\s/, 'T')
        return { ...state, departureArrivalDateTime: { sat: formattedDate, print: action.payload } }
      case 'Address Update':
        return { ...state, place: action.payload }
      //   const { satAddress } = action.payload
      //   if (satAddress.interiorNumber && satAddress.interiorNumber !== '' && satAddress.interiorNumber !== undefined)
      //     return {
      //       ...state,
      //       name: action.payload.name,
      //       formattedAddress: action.payload.formattedAddress,
      //       address: {
      //         street: { sat: satAddress.street, print: satAddress.street },
      //         exteriorNumber: { sat: satAddress.exteriorNumber, print: satAddress.exteriorNumber },
      //         postalCode: { sat: satAddress.postalCode, print: satAddress.postalCode },
      //         suburb: { sat: satAddress.suburb.satCode, print: satAddress.suburb.satDescription },
      //         politicalState: { sat: satAddress.politicalState.satCode, print: satAddress.politicalState.satDescription },
      //         municipality: { sat: satAddress.municipality.satCode, print: satAddress.municipality.satDescription },
      //         locality: { sat: satAddress.locality.satCode, print: satAddress.locality.satDescription },
      //         country: { sat: satAddress.country, print: satAddress.country },
      //       },
      //     }
      //   return {
      //     ...state,
      //     name: action.payload.name,
      //     formattedAddress: action.payload.formattedAddress,
      //     address: {
      //       street: { sat: satAddress.street, print: satAddress.street },
      //       exteriorNumber: { sat: satAddress.exteriorNumber, print: satAddress.exteriorNumber },
      //       interiorNumber: { sat: satAddress.interiorNumber, print: satAddress.interiorNumber },
      //       postalCode: { sat: satAddress.postalCode, print: satAddress.postalCode },
      //       suburb: { sat: satAddress.suburb.satCode, print: satAddress.suburb.satDescription },
      //       politicalState: { sat: satAddress.politicalState.satCode, print: satAddress.politicalState.satDescription },
      //       municipality: { sat: satAddress.municipality.satCode, print: satAddress.municipality.satDescription },
      //       locality: { sat: satAddress.locality.satCode, print: satAddress.locality.satDescription },
      //       country: { sat: satAddress.country, print: satAddress.country },
      //     },
      //   }
      // }
      case 'New Place Update':
        return { ...state, place: action.payload }
      // if (
      //   action.payload.satAddress.interiorNumber &&
      //   action.payload.satAddress.interiorNumber !== '' &&
      //   action.payload.satAddress.interiorNumber !== undefined
      // )
      //   return {
      //     ...state,
      //     name: action.payload.name,
      //     formattedAddress: action.payload.formattedAddress,
      //     address: {
      //       street: { sat: action.payload.satAddress.street, print: action.payload.satAddress.street },
      //       exteriorNumber: { sat: action.payload.satAddress.exteriorNumber, print: action.payload.satAddress.exteriorNumber },
      //       postalCode: { sat: action.payload.satAddress.postalCode, print: action.payload.satAddress.postalCode },
      //       suburb: { sat: action.payload.satAddress.suburb.satCode, print: action.payload.satAddress.suburb.satDescription },
      //       politicalState: {
      //         sat: action.payload.satAddress.politicalState.satCode,
      //         print: action.payload.satAddress.politicalState.satDescription,
      //       },
      //       municipality: {
      //         sat: action.payload.satAddress.municipality.satCode,
      //         print: action.payload.satAddress.municipality.satDescription,
      //       },
      //       locality: { sat: action.payload.satAddress.locality.satCode, print: action.payload.satAddress.locality.satDescription },
      //       country: { sat: action.payload.satAddress.country, print: action.payload.satAddress.country },
      //     },
      //   }
      // return {
      //   ...state,
      //   name: action.payload.name,
      //   formattedAddress: action.payload.formattedAddress,
      //   address: {
      //     street: { sat: action.payload.satAddress.street, print: action.payload.satAddress.street },
      //     exteriorNumber: { sat: action.payload.satAddress.exteriorNumber, print: action.payload.satAddress.exteriorNumber },
      //     interiorNumber: { sat: action.payload.satAddress.interiorNumber, print: action.payload.satAddress.interiorNumber },
      //     postalCode: { sat: action.payload.satAddress.postalCode, print: action.payload.satAddress.postalCode },
      //     suburb: { sat: action.payload.satAddress.suburb.satCode, print: action.payload.satAddress.suburb.satDescription },
      //     politicalState: {
      //       sat: action.payload.satAddress.politicalState.satCode,
      //       print: action.payload.satAddress.politicalState.satDescription,
      //     },
      //     municipality: {
      //       sat: action.payload.satAddress.municipality.satCode,
      //       print: action.payload.satAddress.municipality.satDescription,
      //     },
      //     locality: { sat: action.payload.satAddress.locality.satCode, print: action.payload.satAddress.locality.satDescription },
      //     country: { sat: action.payload.satAddress.country, print: action.payload.satAddress.country },
      //   },
      // }
      case 'New Company Update':
        return { ...state, company: action.payload }
      // if (action.payload.rfc !== 'XEXX010101000') {
      //   // eslint-disable-next-line no-param-reassign
      //   delete state.foreignFiscalId
      //   // eslint-disable-next-line no-param-reassign
      //   delete state.fiscalResidence
      //   return {
      //     ...state,
      //     issuerReceiverRFC: { sat: action.payload.rfc, print: action.payload.rfc },
      //     RFCName: { sat: action.payload.comercialName, print: action.payload.comercialName },
      //   }
      // }
      // return {
      //   ...state,
      //   issuerReceiverRFC: { sat: action.payload.rfc, print: action.payload.rfc },
      //   RFCName: { sat: action.payload.comercialName, print: action.payload.comercialName },
      //   foreignFiscalId: { sat: action.payload, print: action.payload },
      //   fiscalResidence: { sat: action.payload, print: action.payload },
      // }
      case 'Company Update':
        return { ...state, company: action.payload }
      // if (action.payload?.rfc !== 'XEXX010101000') {
      //   // eslint-disable-next-line no-param-reassign
      //   delete state.foreignFiscalId
      //   // eslint-disable-next-line no-param-reassign
      //   delete state.fiscalResidence
      //   return {
      //     ...state,
      //     issuerReceiverRFC: { sat: action.payload?.rfc, print: action.payload?.rfc },
      //     RFCName: { sat: action.payload?.comercialName, print: action.payload?.comercialName },
      //   }
      // }
      // return {
      //   ...state,
      //   issuerReceiverRFC: { sat: action.payload.rfc, print: action.payload.rfc },
      //   RFCName: { sat: action.payload.comercialName, print: action.payload.comercialName },
      //   foreignFiscalId: { sat: action.payload, print: action.payload },
      //   fiscalResidence: { sat: action.payload, print: action.payload },
      // }
      default:
        return state
    }
  }

  const [newLocationState, newLocationDispatch] = useReducer(newLocationReducer, newLocationInitialState)

  const onSubmitTeam = data => {
    // console.log(data)
  }

  const showStateInConsole = () => {
    // console.log(newLocationState)
  }

  const typeChange = value => {
    if (!isTypeSelected) {
      setIsTypeSelected(true)
    }
    if (value === 'Origen') {
      newLocationDispatch({ type: 'New Location Type', payload: value })
    } else {
      newLocationDispatch({ type: 'New Location Type', payload: value })
    }
  }

  const saveLocation = () => {
    dispatch({ type: 'Add a Location', payload: newLocationState })
    setIsLocationVisible(false)
  }

  const updateLocation = () => {
    dispatch({ type: 'Update a Location', payload: { location: newLocationState, index: index } })
    setIsLocationVisible(false)
  }

  return (
    <div className="w-full mt-10">
      <Form layout="vertical">
        <Title level={3}>
          {isEditingLocation ? i18n(`newBillOfLadingHub.newLocation.editTitle`) : i18n(`newBillOfLadingHub.newLocation.title`)}
        </Title>
        <span className="text-blue">{i18n('newBillOfLadingHub.newLocation.description')}</span>
        <Divider plain />
        {/* <Button onClick={showStateInConsole}>Console State</Button> */}

        {/* Type y Id */}
        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.newLocation.type`)}
        </Title>
        <Form.Item label={i18n(`newBillOfLadingHub.newLocation.type`)} required>
          <Select
            className="w-full"
            placeholder={i18n(`newBillOfLadingHub.newLocation.type`)}
            onChange={typeChange}
            defaultValue={newLocationState.locationType ? newLocationState.locationType.sat : null}
          >
            <Option value="Origen">{i18n(`newBillOfLadingHub.newLocation.origin`)}</Option>
            <Option value="Destino">{i18n(`newBillOfLadingHub.newLocation.destination`)}</Option>
          </Select>
        </Form.Item>

        {/* Sender / Recipient */}
        {isTypeSelected ? (
          <div>
            <Title level={5} className="mt-8">
              {newLocationState.locationType.sat === 'Origen'
                ? i18n(`newBillOfLadingHub.newLocation.sender`)
                : i18n(`newBillOfLadingHub.newLocation.recipient`)}
            </Title>
            <SearchCompanies
              dispatch={newLocationDispatch}
              companyName={newLocationState.company?.name}
              disabled={isDisabledSearchCompanies}
              isEditingLocation={isEditingLocation}
            />
          </div>
        ) : null}

        {/* Date and Place */}
        <Title level={5} className="mt-8">
          {newLocationState.locationType?.sat === 'Origen'
            ? i18n(`newBillOfLadingHub.newLocation.departure`)
            : i18n(`newBillOfLadingHub.newLocation.arrival`)}
        </Title>
        <Form.Item label={i18n(`newBillOfLadingHub.newLocation.date`)} required>
          <DatePicker
            className="w-full"
            showTime
            onChange={(value, dateString) => newLocationDispatch({ type: 'Date Update', payload: dateString })}
            defaultValue={newLocationState.departureArrivalDateTime ? moment(newLocationState.departureArrivalDateTime.print) : null}
          />
        </Form.Item>
        <Form.Item className="w-full" label={i18n(`newBillOfLadingHub.newLocation.address`)} required>
          <SearchPlaces
            dispatch={newLocationDispatch}
            placeName={newLocationState.place?.name ? newLocationState.place?.name : null}
            disabled={isDisabledSearchPlaces}
            isEditingLocation={isEditingLocation}
          />
        </Form.Item>
        <Button type="primary" onClick={isEditingLocation ? updateLocation : saveLocation} className="float-right">
          {i18n('buttons.save')}
        </Button>
      </Form>
    </div>
  )
}
