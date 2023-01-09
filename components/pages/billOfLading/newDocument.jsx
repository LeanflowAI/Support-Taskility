import React, { useReducer, useState } from 'react'
import { Typography, Button, Select, Form, Divider, DatePicker, Input, InputNumber, Space } from 'antd'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'
import { i18n } from '../../../services/i18n'
import { SearchCompanies } from '../companies/searchCompanies'
import { SearchVehicles } from '../vehicles/searchVehicles'
import { SearchDrivers } from '../drivers/searchDrivers'
import { UploadDashboardT } from '../../ui-elements/uppy-transloadit-uploader/uploaderUT'
import { loadXMLFileToParseNewDocumentForm } from './xmlParser'

// eslint-disable-next-line import/named
import { currencies } from '../../../services/catalogs'

const { Title, Text } = Typography
const { Option } = Select

export const NewDocument = ({
  dispatch,
  setIsNewDocumentVisible,
  documents,
  index,
  isEditingDocument,
  authorizedUsers,
  userEmail,
  company,
  isDisabledSearchPlaces,
  isDisabledSearchCompanies,
  isDisabledSearchVehicles,
  isDisabledSearchTrailers,
}) => {
  const [isTypeSelected, setIsTypeSelected] = useState(isEditingDocument)
  const [RFCvalid, setRFCValid] = useState()
  const [RFCValidateStatus, setRFCValidateStatus] = useState()
  const [RFCMessage, setRFCMessage] = useState()
  const [internationalRFC, setInternationalRFC] = useState()

  const currenciesOptions = currencies.map(currency => (
    <Option value={currency.code} key={currency.code}>
      {currency.code}
    </Option>
  ))

  const newDocumentInitialState =
    documents && index !== undefined ? documents[index] : { authorizedUsers: authorizedUsers, uploadedDocuments: [], xmlExtracted: false, cost: {exchangeRate: 1} }
  const newDocumentReducer = (state, action) => {
    switch (action.type) {
      case 'Uploaded Documents': {
        console.log('dispatch uploaded files', action.payload)
        return { ...state, uploadedDocuments: [...state.uploadedDocuments, ...action.payload] }
        // return { ...state, uploadedDocuments: [...state.uploadedDocuments, ...action.payload]}
      }
      case 'Date Update': {
        // eslint-disable-next-line no-case-declarations
        const formattedDate = action.payload.replace(/\s/, 'T')
        return { ...state, cost: { ...state.cost, date: { sat: formattedDate, print: action.payload } } }
      }
      case 'Folio Update':
        return { ...state, cost: { ...state.cost, folio: action.payload } }
      case 'Select Currency':
        return { ...state, cost: { ...state.cost, currency: action.payload } }
        case 'Exchange Rate Update':
        return { ...state, cost: { ...state.cost, exchangeRate: action.payload } }
      case 'National Freight Update': {
        return { ...state, cost: { ...state.cost, nationalFreight: parseFloat(action.payload) } }
      }
      case 'Foreign Freight Update': {
        return { ...state, cost: { ...state.cost, foreignFreight: parseFloat(action.payload) } }
      }
      case 'Border Cross Update': {
        return { ...state, cost: { ...state.cost, borderCross: parseFloat(action.payload) } }
      }
      case 'Extra Cost Update': {
        return { ...state, cost: { ...state.cost, extra: parseFloat(action.payload) } }
      }
      case 'Subtotal Update': {
        return { ...state, cost: { ...state.cost, subtotal: parseFloat(action.payload) } }
      }
      case 'Tax Update': {
        return { ...state, cost: { ...state.cost, tax: parseFloat(action.payload) } }
      }
      case 'Tax Retention Update': {
        return { ...state, cost: { ...state.cost, taxRetention: parseFloat(action.payload) } }
      }
      case 'Total Update': {
        return { ...state, cost: { ...state.cost, total: parseFloat(action.payload) } }
      }
      case 'Add Cost Extracted From XML':
        return { ...state, cost: action.payload, xmlExtracted: true }
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
      case 'Select Document Type':
        return { ...state, documentType: action.payload }
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

  const [newdocumentstate, newDocumentDispatch] = useReducer(newDocumentReducer, newDocumentInitialState)

  const onDocumentTypeChange = value => {
    newDocumentDispatch({ type: 'Select Document Type', payload: value })
  }

  const onDocumentUploaded = results => {
    const files = results[':original']
    const timestamp = new Date()
    const readyFiles = files?.map(file => {
      // console.log(file)
      return {
        fileId: file.id,
        name: file.name,
        extension: file.ext,
        mime: file.mime,
        meta: file.meta,
        size: file.size,
        sslUrl: file.ssl_url,
        url: file.url,
        dateUploaded: moment(timestamp).format(),
        userEmail: userEmail,
      }
    })
    console.log('readyFiles', readyFiles)
    newDocumentDispatch({ type: 'Uploaded Documents', payload: readyFiles })
  }

  const saveDocument = () => {
    dispatch({ type: 'Add Documents', payload: { documents: newdocumentstate.uploadedDocuments, index: index } })
    dispatch({ type: 'Add Costs', payload: { cost: { ...newdocumentstate.cost, company: company }, index: index } })
    setIsNewDocumentVisible(false)
  }

  const updateDocument = () => {
    dispatch({ type: 'Update Documents', payload: { documents: newdocumentstate.uploadedDocuments, index: index } })
    dispatch({ type: 'Update Costs', payload: { costs: newdocumentstate.costs, index: index } })
    setIsNewDocumentVisible(false)
  }

  return (
    <div className="w-full mt-10">
      <Form layout="vertical">
        <Title level={3}>
          {isEditingDocument ? i18n(`newBillOfLadingHub.newDocument.editTitle`) : i18n(`newBillOfLadingHub.newDocument.title`)}
        </Title>
        <span className="text-blue">{i18n('newBillOfLadingHub.newDocument.description')}</span>
        {/* <Button onClick={() => console.log(newdocumentstate)}>Console State</Button> */}
        <Divider plain />
        {/* <Button onClick={showStateInConsole}>Console State</Button> */}

        {/* Company
        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.newDocument.typeOfDocument`)}
        </Title>
        <Text>{i18n(`newBillOfLadingHub.newDocument.typeOfDocumentDescription`)}</Text>
        <Form.Item label={i18n(`newBillOfLadingHub.newDocument.typeOfDocument`)} required>
          <SearchCompanies
            dispatch={newDocumentDispatch}
            companyName={newdocumentstate.company?.name}
            disabled={isEditingDocument}
            isEditingLocation={isEditingDocument}
          />
        </Form.Item> */}

        {/* Type of Transport */}
        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.newDocument.type`)}
        </Title>
        <Form.Item label={i18n(`newBillOfLadingHub.newDocument.type`)} required>
          <Select
            className="w-full"
            placeholder={i18n(`newBillOfLadingHub.newDocument.type`)}
            onChange={onDocumentTypeChange}
            // defaultValue={newdocumentstate.documentType ? newdocumentstate.documentType : null}
          >
            <Option value="cfdi-invoice" key="cfdi-invoice">
              {i18n(`newBillOfLadingHub.newDocument.cfdiInvoice`)}
            </Option>

            {/* <Option value="cfdi-invoice-with-bol" key="cfdi-invoice-with-bol">
              {i18n(`newBillOfLadingHub.newDocument.cfdiInvoiceWithBol`)}
            </Option>
            <Option value="cfdi-transport-with-bol" key="cfdi-transport-with-bol">
              {i18n(`newBillOfLadingHub.newDocument.cfdiTransportWithBol`)}
            </Option>
            <Option value="thirdParty-cfdi-invoice-with-bol" key="thirdParty-cfdi-invoice-with-bol">
              {i18n(`newBillOfLadingHub.newDocument.thirdPartyCfdiInvoiceWithBol`)}
            </Option> */}

            <Option value="invoice" key="invoice">
              {i18n(`newBillOfLadingHub.newDocument.invoice`)}
            </Option>
            <Option value="proof-of-delivery" key="proof-of-delivery">
              {i18n(`newBillOfLadingHub.newDocument.proofOfDelivery`)}
            </Option>
          </Select>
        </Form.Item>

        {newdocumentstate.documentType === 'cfdi-invoice' ? (
          <div>
            <Title level={4}>{i18n(`newBillOfLadingHub.newDocument.cfdiInvoice`)}</Title>
            <Space className="float-right" size={12}>
              <Button onClick={() => loadXMLFileToParseNewDocumentForm(newDocumentDispatch)}>
                {i18n('newBillOfLadingHub.newDocument.extract')}
              </Button>
            </Space>
            <Space direction="vertical" size={0} className="w-2/3 mb-8">
              <Text ellipsis style={{ width: '100%' }} className="">
                {i18n('newBillOfLadingHub.newDocument.extractDetail')}
              </Text>
            </Space>
            {newdocumentstate.xmlExtracted ? (
              <div>
                {/* Extracted Data */}
                <Title level={5}>{i18n(`newBillOfLadingHub.newDocument.extractedData`)}</Title>
                <Space direction="vertical" size={0} className="w-2/3">
                  <Space>
                    <Text type="secondary" className="text-xs">
                      {i18n('newBillOfLadingHub.newDocument.folio')}{' '}
                    </Text>
                    <Text>{newdocumentstate.cost.folio}</Text>
                  </Space>
                  <Space>
                    <Text type="secondary" className="text-xs">
                      {i18n('newBillOfLadingHub.newDocument.dateOfInvoice')}{' '}
                    </Text>
                    <Text>{newdocumentstate.cost.date.print}</Text>
                  </Space>
                  <Space>
                    <Text type="secondary" className="text-xs">
                      {i18n('newBillOfLadingHub.newDocument.currency')}{' '}
                    </Text>
                    <Text>{newdocumentstate.cost.currency}</Text>
                  </Space>
                  <Space>
                    <Text type="secondary" className="text-xs">
                      {i18n('newBillOfLadingHub.newDocument.exchangeRate')}{' '}
                    </Text>
                    <Text>{newdocumentstate.cost.exchangeRate}</Text>
                  </Space>
                  <Space>
                    <Text type="secondary" className="text-xs">
                      {i18n('newBillOfLadingHub.newDocument.subtotal')}{' '}
                    </Text>
                    <Text>{newdocumentstate.cost.subtotal}</Text>
                  </Space>
                  <Space>
                    <Text type="secondary" className="text-xs">
                      {i18n('newBillOfLadingHub.newDocument.tax')}{' '}
                    </Text>
                    <Text>{newdocumentstate.cost.tax}</Text>
                  </Space>
                  <Space>
                    <Text type="secondary" className="text-xs">
                      {i18n('newBillOfLadingHub.newDocument.taxRetention')}{' '}
                    </Text>
                    <Text>{newdocumentstate.cost.taxRetention}</Text>
                  </Space>
                  <Space>
                    <Text type="secondary" className="text-xs">
                      {i18n('newBillOfLadingHub.newDocument.total')}{' '}
                    </Text>
                    <Text>{newdocumentstate.cost.total}</Text>
                  </Space>
                </Space>
                
                {/* Non Extractable Data */}
                <Title level={5} className="mt-8">
                  {i18n(`newBillOfLadingHub.newDocument.noneExtractableData`)}
                </Title>
                <Form.Item label={i18n(`newBillOfLadingHub.newDocument.nationalFreight`)} required>
                  <InputNumber
                    className=""
                    stringMode
                    style={{ width: '100%' }}
                    min={0}
                    defaultValue={0}
                    // defaultValue={newDocumentState.value ? newDocumentState.value : 0}
                    onChange={value => newDocumentDispatch({ type: 'National Freight Update', payload: value })}
                    step="0.01"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
                <Form.Item label={i18n(`newBillOfLadingHub.newDocument.foreignFreight`)} required>
                  <InputNumber
                    className=""
                    stringMode
                    style={{ width: '100%' }}
                    min={0}
                    defaultValue={0}
                    // defaultValue={newDocumentState.value ? newDocumentState.value : 0}
                    onChange={value => newDocumentDispatch({ type: 'Foreign Freight Update', payload: value })}
                    step="0.01"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
                <Form.Item label={i18n(`newBillOfLadingHub.newDocument.borderCross`)} required>
                  <InputNumber
                    className=""
                    stringMode
                    style={{ width: '100%' }}
                    min={0}
                    defaultValue={0}
                    // defaultValue={newDocumentState.value ? newDocumentState.value : 0}
                    onChange={value => newDocumentDispatch({ type: 'Border Cross Update', payload: value })}
                    step="0.01"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
                <Form.Item label={i18n(`newBillOfLadingHub.newDocument.extra`)} required>
                  <InputNumber
                    className=""
                    stringMode
                    style={{ width: '100%' }}
                    min={0}
                    defaultValue={0}
                    // defaultValue={newDocumentState.value ? newDocumentState.value : 0}
                    onChange={value => newDocumentDispatch({ type: 'Extra Cost Update', payload: value })}
                    step="0.01"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
                {/* Document Upload */}
                <Title level={4}>{i18n(`newBillOfLadingHub.newDocument.uploadDocument`)}</Title>
                <Text ellipsis style={{ width: '100%' }} className="mb-4">
                  {i18n('newBillOfLadingHub.newDocument.rememberXml')}
                </Text>
                <UploadDashboardT
                  id="cfdiInvoiceUpload"
                  templateId="ab8c3e13a9374d72b1dc2dd55980df10"
                  processUploadComplete={onDocumentUploaded}
                />
              </div>
            ) : null}
            {/* Vehicle 
            <Title level={5} className="mt-8">
              {i18n(`newBillOfLadingHub.newDocument.vehicle`)}
            </Title>
            <Form.Item label={i18n(`newBillOfLadingHub.newDocument.vehicle`)} required>
              <SearchVehicles
                dispatch={newDocumentDispatch}
                name={newdocumentstate.autotransport?.vehicle?.number}
                disabled={isEditingDocument}
                isEditing={isEditingDocument}
                vehicleCompanyId={newdocumentstate.company?._id}
                typeOfVehicle="truck"
                key={1}
              />
            </Form.Item> */}

            {/* Remolque 
            <Title level={5} className="mt-8">
              {i18n(`newBillOfLadingHub.newDocument.trailer`)}
            </Title>
            <Form.Item label={i18n(`newBillOfLadingHub.newDocument.trailer`)} required>
              <SearchVehicles
                dispatch={newDocumentDispatch}
                name={newdocumentstate.autotransport?.trailer?.number}
                disabled={isEditingDocument}
                isEditing={isEditingDocument}
                vehicleCompanyId={newdocumentstate.company?._id}
                typeOfVehicle="trailer"
                key={2}
              />
            </Form.Item> */}

            {/* Operador 
            <Title level={5} className="mt-8">
              {i18n(`newBillOfLadingHub.newDocument.driver`)}
            </Title>
            <Form.Item label={i18n(`newBillOfLadingHub.newDocument.driver`)} required>
              <SearchDrivers
                dispatch={newDocumentDispatch}
                driverName={newdocumentstate.figures ? newdocumentstate.figures[0].name : null}
                disabled={isEditingDocument}
                isEditing={isEditingDocument}
                driverCompanyId={newdocumentstate.company?._id}
              />
            </Form.Item> 
                    */}
          </div>
        ) : null}

        {/* 
        {newdocumentstate.documentType === 'cfdi-invoice-with-bol' ? (
          <div>
            <Title level={4}>{i18n(`newBillOfLadingHub.newDocument.cfdiInvoiceWithBol`)}</Title>
          </div>
        ) : null}
        {newdocumentstate.documentType === 'cfdi-transport-with-bol' ? (
          <div>
            <Title level={4}>{i18n(`newBillOfLadingHub.newDocument.cfdiTransportWithBol`)}</Title>
          </div>
        ) : null}
        {newdocumentstate.documentType === 'thirdParty-cfdi-invoice-with-bol' ? (
          <div>
            <Title level={4}>{i18n(`newBillOfLadingHub.newDocument.thirdPartyCfdiInvoiceWithBol`)}</Title>
          </div>
        ) : null} 
        */}
        {newdocumentstate.documentType === 'invoice' ? (
          <div>
            <Title level={4}>{i18n(`newBillOfLadingHub.newDocument.invoice`)}</Title>
            <Form.Item label={i18n(`newBillOfLadingHub.newDocument.dateOfInvoice`)} required>
              <DatePicker
                className="w-full"
                onChange={(value, dateString) => newDocumentDispatch({ type: 'Date Update', payload: dateString })}
                // defaultValue={newDocumentState.costs ? moment(newLocationState.departureArrivalDateTime.print) : null}
              />
            </Form.Item>
            <Form.Item label={i18n(`newBillOfLadingHub.newDocument.folio`)} required>
              <Input
                placeholder={i18n(`newBillOfLadingHub.newDocument.folio`)}
                onKeyUp={e => newDocumentDispatch({ type: 'Folio Update', payload: e.target.value })}
                // defaultValue={newTagState.value ? newTagState.value : null}
              />
            </Form.Item>
            <Title level={5}>{i18n(`newBillOfLadingHub.newDocument.costs`)}</Title>
            <Form.Item label={i18n(`newBillOfLadingHub.newDocument.currency`)} required>
              <Select
                style={{ width: '100%' }}
                placeholder={i18n(`newBillOfLadingHub.newDocument.currency`)}
                onChange={value => newDocumentDispatch({ type: 'Select Currency', payload: value })}
                // defaultValue={newDocumentState.currency ? newDocumentState.currency : 'USD'}
              >
                {currenciesOptions}
              </Select>
            </Form.Item>
            <Form.Item label={i18n(`newBillOfLadingHub.newDocument.exchangeRate`)} required>
              <InputNumber
                className=""
                stringMode
                style={{ width: '100%' }}
                min={0}
                defaultValue={0}
                // defaultValue={newDocumentState.value ? newDocumentState.value : 0}
                onChange={value => newDocumentDispatch({ type: 'Exchange Rate Update', payload: value })}
                step="0.01"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
            <Form.Item label={i18n(`newBillOfLadingHub.newDocument.nationalFreight`)} required>
              <InputNumber
                className=""
                stringMode
                style={{ width: '100%' }}
                min={0}
                defaultValue={0}
                // defaultValue={newDocumentState.value ? newDocumentState.value : 0}
                onChange={value => newDocumentDispatch({ type: 'National Freight Update', payload: value })}
                step="0.01"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
            <Form.Item label={i18n(`newBillOfLadingHub.newDocument.foreignFreight`)} required>
              <InputNumber
                className=""
                stringMode
                style={{ width: '100%' }}
                min={0}
                defaultValue={0}
                // defaultValue={newDocumentState.value ? newDocumentState.value : 0}
                onChange={value => newDocumentDispatch({ type: 'Foreign Freight Update', payload: value })}
                step="0.01"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
            <Form.Item label={i18n(`newBillOfLadingHub.newDocument.borderCross`)} required>
              <InputNumber
                className=""
                stringMode
                style={{ width: '100%' }}
                min={0}
                defaultValue={0}
                // defaultValue={newDocumentState.value ? newDocumentState.value : 0}
                onChange={value => newDocumentDispatch({ type: 'Border Cross Update', payload: value })}
                step="0.01"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
            <Form.Item label={i18n(`newBillOfLadingHub.newDocument.extra`)} required>
              <InputNumber
                className=""
                stringMode
                style={{ width: '100%' }}
                min={0}
                defaultValue={0}
                // defaultValue={newDocumentState.value ? newDocumentState.value : 0}
                onChange={value => newDocumentDispatch({ type: 'Extra Cost Update', payload: value })}
                step="0.01"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
            <Title level={5}>{i18n(`newBillOfLadingHub.newDocument.costsTotals`)}</Title>
            <Form.Item label={i18n(`newBillOfLadingHub.newDocument.subtotal`)} required>
              <InputNumber
                className=""
                stringMode
                style={{ width: '100%' }}
                min={0}
                defaultValue={0}
                // defaultValue={newDocumentState.value ? newDocumentState.value : 0}
                onChange={value => newDocumentDispatch({ type: 'Subtotal Update', payload: value })}
                step="0.01"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
            <Form.Item label={i18n(`newBillOfLadingHub.newDocument.tax`)} required>
              <InputNumber
                className=""
                stringMode
                style={{ width: '100%' }}
                min={0}
                defaultValue={0}
                // defaultValue={newDocumentState.value ? newDocumentState.value : 0}
                onChange={value => newDocumentDispatch({ type: 'Tax Update', payload: value })}
                step="0.01"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
            <Form.Item label={i18n(`newBillOfLadingHub.newDocument.taxRetention`)} required>
              <InputNumber
                className=""
                stringMode
                style={{ width: '100%' }}
                min={0}
                defaultValue={0}
                // defaultValue={newDocumentState.value ? newDocumentState.value : 0}
                onChange={value => newDocumentDispatch({ type: 'Tax Retention Update', payload: value })}
                step="0.01"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
            <Form.Item label={i18n(`newBillOfLadingHub.newDocument.total`)} required>
              <InputNumber
                className=""
                stringMode
                style={{ width: '100%' }}
                min={0}
                defaultValue={0}
                // defaultValue={newDocumentState.value ? newDocumentState.value : 0}
                onChange={value => newDocumentDispatch({ type: 'Total Update', payload: value })}
                step="0.01"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
            <Title level={4}>{i18n(`newBillOfLadingHub.newDocument.uploadDocument`)}</Title>
            <UploadDashboardT id="invoiceUpload" templateId="ab8c3e13a9374d72b1dc2dd55980df10" processUploadComplete={onDocumentUploaded} />
          </div>
        ) : null}
        {newdocumentstate.documentType === 'proof-of-delivery' ? (
          <div>
            <Title level={4}>{i18n(`newBillOfLadingHub.newDocument.proofOfDelivery`)}</Title>
            <UploadDashboardT
              id="proofOfDeliveryUpload"
              templateId="ab8c3e13a9374d72b1dc2dd55980df10"
              processUploadComplete={onDocumentUploaded}
            />
          </div>
        ) : null}

        <Button type="primary" onClick={isEditingDocument ? updateDocument : saveDocument} className="float-right mt-4">
          {i18n('buttons.save')}
        </Button>
      </Form>
    </div>
  )
}
