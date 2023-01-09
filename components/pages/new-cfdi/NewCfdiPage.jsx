/* eslint-disable react/prop-types */
import React, { useEffect, useReducer, useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import {
  Space,
  PageHeader,
  Button,
  Layout,
  Steps,
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
} from 'antd'
import { useForm, Controller } from 'react-hook-form'
import { isNull } from 'util'
import { i18n } from '../../../services/i18n'
import { AppHeader } from '../../layout/AppHeader'
import { SideMenu } from '../../layout/SideMenu'
import { CfdiPreview } from '../cfdi/Cfdi'
import {
  labelValueCurrencies,
  labelValuePaymentMethods,
  labelValuePaymentTypes,
  labelValueCreditTerms,
  labelValueCfdiUses,
  labelValueServices,
  labelValueUnitCodes,
} from '../../../services/catalogs'
import { get, post } from '../../../services/fetch'
import { num } from '../../../services/helpers/mathHelp'
import { PaymentProofDetailsStep } from './PaymentProofDetailsStep'
import { PaymentProofInvoicesStep } from './PaymentProofInvoicesStep'
import { newCfdiReducer, defaultState, cfdiIncludesQuotation, cfdiIncludesAllServiceQuotations, buildCfdiToPreview } from './utils'

const { Option } = Select

const cfdiTypeStepButtons = ({ setCfdiFields }) => {
  return (
    <Row gutter={[8, 8]} align="middle">
      <Col xs={24} sm={24} md={6} lg={6} xl={6} xxl={6}>
        <Button style={{ width: '100%' }} type="default" onClick={() => setCfdiFields({ cfdiType: 'billOfLading' })}>
          {i18n('newCfdi.cfdiTypeTitle.billOfLading')}
        </Button>
      </Col>
      <Col xs={24} sm={24} md={6} lg={6} xl={6} xxl={6}>
        <Button style={{ width: '100%' }} type="default" onClick={() => setCfdiFields({ cfdiType: 'paymentProof' })}>
          {i18n('newCfdi.cfdiTypeTitle.paymentProof')}
        </Button>
      </Col>
      <Col xs={24} sm={24} md={6} lg={6} xl={6} xxl={6}>
        <Button style={{ width: '100%' }} type="default" onClick={() => setCfdiFields({ cfdiType: 'creditNote' })}>
          {i18n('newCfdi.cfdiTypeTitle.creditNote')}
        </Button>
      </Col>
      <Col xs={24} sm={24} md={6} lg={6} xl={6} xxl={6}>
        <Button style={{ width: '100%' }} type="primary" onClick={() => setCfdiFields({ cfdiType: 'invoice' })}>
          {i18n('newCfdi.cfdiTypeTitle.invoice')}
        </Button>
      </Col>
    </Row>
  )
}

const continueOrCancelStepButtons = ({ resetForm, nextStep, previousStep }) => {
  return (
    <Row gutter={[8, 8]} align="middle">
      <Col xs={24} sm={8} md={8} lg={8} xl={8} xxl={8}>
        <Button style={{ width: '100%' }} type="default" onClick={() => resetForm()}>
          {i18n('newCfdi.cancel')}
        </Button>
      </Col>
      <Col xs={12} sm={8} md={8} lg={8} xl={8} xxl={8}>
        <Button style={{ width: '100%' }} type="default" onClick={() => previousStep()}>
          {i18n('newCfdi.previousStep')}
        </Button>
      </Col>
      <Col xs={12} sm={8} md={8} lg={8} xl={8} xxl={8}>
        <Button style={{ width: '100%' }} type="primary" onClick={() => nextStep()}>
          {i18n('newCfdi.nextStep')}
        </Button>
      </Col>
    </Row>
  )
}

const confirmationStepButtons = ({ resetForm, previousStep, saveDraft, createCfdi, creatingCfdi, finished, cfdi }) => {
  const router = useRouter()
  if (finished)
    return (
      <Row gutter={[8, 8]} align="middle">
        <Col xs={24} sm={12} md={12} lg={12} xl={12} xxl={12}>
          <Button style={{ width: '100%' }} type="default" onClick={() => router.push('/billing')}>
            {i18n('newCfdi.goToList')}
          </Button>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={12} xxl={12}>
          <Button style={{ width: '100%' }} key="add" type="primary" onClick={() => resetForm()}>
            {i18n('newCfdi.startAgain')}
          </Button>
        </Col>
      </Row>
    )
  return (
    <Row gutter={[8, 8]} align="middle">
      <Col xs={24} sm={6} md={6} lg={6} xl={6} xxl={6}>
        <Button style={{ width: '100%' }} type="default" onClick={resetForm}>
          {i18n('newCfdi.cancel')}
        </Button>
      </Col>
      <Col xs={12} sm={6} md={6} lg={6} xl={6} xxl={6}>
        <Button style={{ width: '100%' }} type="default" onClick={previousStep}>
          {i18n('newCfdi.previousStep')}
        </Button>
      </Col>
      <Col xs={24} sm={6} md={6} lg={6} xl={6} xxl={6}>
        <Button style={{ width: '100%' }} key="add" type={cfdi.requestedFrom === 'BillOfLadingHub' ? "primary" : "default"} onClick={saveDraft} loading={creatingCfdi === 'draft'}>
          {i18n('newCfdi.saveDraft')}
        </Button>
      </Col>
      {cfdi.requestedFrom === 'BillOfLadingHub' ? null : (
        <Col xs={12} sm={6} md={6} lg={6} xl={6} xxl={6}>
          <Button style={{ width: '100%' }} key="add" type="primary" onClick={createCfdi} loading={creatingCfdi === 'signed'}>
            {i18n('newCfdi.createSignedCfdi')}
          </Button>
        </Col>
      )}
    </Row>
  )
}

const steps = [
  { name: 'newCfdi.stepNames.cfdiType', buttons: cfdiTypeStepButtons },
  { name: 'newCfdi.stepNames.issuerReceiver', buttons: continueOrCancelStepButtons },
  { name: 'newCfdi.stepNames.cfdiDetails', buttons: continueOrCancelStepButtons },
  { name: 'newCfdi.stepNames.cfdiItems', buttons: continueOrCancelStepButtons },
  { name: 'newCfdi.stepNames.confirmation', buttons: confirmationStepButtons },
]

const NewCfdiPageHeader = props => {
  const { cfdi, resetForm, setCfdiFields, nextStep, previousStep, currentStep, creatingCfdi, saveDraft, createCfdi, finished } = props
  const buttonsByStep = steps.map(({ buttons }) => buttons)
  return (
    <PageHeader
      ghost={false}
      title={i18n('billing.title')}
      subTitle={`${i18n(`newCfdi.cfdiTypeTitle.${cfdi.cfdiType}`)}`}
      extra={buttonsByStep[currentStep]({
        resetForm,
        setCfdiFields,
        nextStep,
        previousStep,
        saveDraft,
        creatingCfdi,
        createCfdi,
        finished,
        cfdi,
      })}
      className="text-right py-1"
    />
  )
}

const ReceiverSelector = ({ cfdi, setCfdiFields, errors, setReceivers }) => {
  const { data: receiversData, error: receiversError } = useSWR(
    cfdi.issuerId ? `/api/billing/new-cfdi/receivers/${cfdi.issuerId}` : null,
    url => get(url)
  )
  useEffect(() => setReceivers(receiversData?.receivers), [receiversData])

  if (!cfdi.issuerId) return null
  if (receiversError) return <div>{i18n(receiversError)}</div>
  if (!receiversData)
    return (
      <Card bordered={false} className="invoice-card w-full p-4">
        <Spin />
      </Card>
    )
  if (receiversData.error) return <div>{i18n(receiversData.error)}</div>
  const receiverOptions = (receiversData && receiversData.receivers) || []
  const selectedReceiver = receiverOptions.find(({ _id }) => _id === cfdi.receiverId)
  return (
    <>
      <Form layout="vertical">
        <Form.Item
          label={i18n('newCfdi.issuerReceiverStep.receiver')}
          validateStatus={errors.receiverId && 'error'}
          help={errors.receiverId && i18n(errors.receiverId)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.issuerReceiverStep.receiverPlaceholder')}
            value={cfdi.receiverId}
            optionFilterProp="children"
            onChange={receiverId => setCfdiFields({ receiverId })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={receiverOptions.map(({ _id, name }) => ({ value: _id, label: name }))}
          />
        </Form.Item>
      </Form>
      {selectedReceiver && (
        <Card size="small">
          <List size="small">
            <List.Item>{`Rfc: ${selectedReceiver.rfc}`}</List.Item>
            <List.Item>
              <Row gutter={4} className="w-full justify-center flex-no-wrap max-w-full">
                <Col flex="30px">Address:</Col>
                <Col flex="auto" className="flex-shrink truncate ...">
                  <Tooltip placement="topLeft" title={selectedReceiver.address}>
                    {selectedReceiver.address}
                  </Tooltip>
                </Col>
              </Row>
            </List.Item>
            <List.Item>{`Fiscal Regime: ${selectedReceiver.fiscalRegime}`}</List.Item>
          </List>
        </Card>
      )}
    </>
  )
}

const IssuerReceiverStep = ({ cfdi, setCfdiFields, services, errors, setIssuers, setReceivers }) => {
  const { data: issuersData, error: issuersError } = useSWR('/api/billing/new-cfdi/issuers', url => get(url))
  useEffect(() => setIssuers(issuersData?.issuers), [issuersData])

  if (issuersError) return <div>{i18n(issuersError.message)}</div>
  if (!issuersData)
    return (
      <Card bordered={false} className="invoice-card w-full p-4">
        <Spin />
      </Card>
    )
  if (issuersData.error) return <div>{i18n(issuersData.error)}</div>
  const selectedIssuer = issuersData.issuers.find(({ _id }) => _id === cfdi.issuerId)

  return (
    <Card bordered={false} className="invoice-card w-full p-4">
      <strong>{i18n('newCfdi.issuerReceiverStep.title')}</strong>

      <Form layout="vertical">
        <Form.Item
          label={i18n('newCfdi.issuerReceiverStep.issuer')}
          validateStatus={errors.issuerId && 'error'}
          help={errors.issuerId && i18n(errors.issuerId)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.issuerReceiverStep.issuerPlaceholder')}
            value={cfdi.issuerId}
            optionFilterProp="children"
            onChange={issuerId => setCfdiFields({ issuerId, receiverId: null })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={issuersData.issuers.map(({ _id, name }) => ({ value: _id, label: name }))}
          />
        </Form.Item>
      </Form>
      {selectedIssuer && (
        <Card size="small">
          <List size="small">
            <List.Item>{`Rfc: ${selectedIssuer.rfc}`}</List.Item>
            <List.Item>
              <Row gutter={4} className="w-full justify-center flex-no-wrap max-w-full">
                <Col flex="30px">Address:</Col>
                <Col flex="auto" className="flex-shrink truncate ...">
                  <Tooltip placement="topLeft" title={selectedIssuer.address}>
                    {selectedIssuer.address}
                  </Tooltip>
                </Col>
              </Row>
            </List.Item>
            <List.Item>{`Fiscal Regime: ${selectedIssuer.fiscalRegime}`}</List.Item>
          </List>
        </Card>
      )}

      <br />
      <ReceiverSelector cfdi={cfdi} errors={errors} setCfdiFields={setCfdiFields} setReceivers={setReceivers} />
      <br />

      {cfdi.cfdiType === 'invoice' && services && (
        <div>{`${i18n('newCfdi.issuerReceiverStep.billingPendingServices')} ${services.length}`}</div>
      )}
    </Card>
  )
}

const InvoiceDetailsStep = ({ cfdi, errors, setDefaultFields, setCfdiFields, relationship = {} }) => {
  const { creditDays, cfdiUse, paymentMethod, paymentType } = relationship
  useEffect(() => setDefaultFields({ creditDays, cfdiUse, paymentMethod, paymentType }), [])

  const rateUrl = cfdi.currency ? `/api/exchange-rates/get-yesterday-rate/${cfdi.currency}/MXN` : null
  const { data, error } = useSWR(rateUrl, url => get(url))
  useEffect(() => {
    if (!error && data && data.ok) setCfdiFields({ exchangeRate: data.exchangeRate })
  }, [data])

  return (
    <Card bordered={false} className="invoice-card w-full p-4">
      <strong>{i18n('newCfdi.invoiceDetailsStep.title')}</strong>

      <Form layout="vertical">
        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.currency')}
          validateStatus={errors.currency && 'error'}
          help={errors.currency && i18n(errors.currency)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.invoiceDetailsStep.currency')}
            value={cfdi.currency}
            optionFilterProp="children"
            onChange={currency => setCfdiFields({ currency })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValueCurrencies}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.exchangeRate')}
          validateStatus={errors.exchangeRate && 'error'}
          help={errors.exchangeRate && i18n(errors.exchangeRate)}
        >
          <InputNumber className="w-full" min={0} onChange={rate => setCfdiFields({ exchangeRate: rate })} value={cfdi.exchangeRate} />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.paymentMethod')}
          validateStatus={errors.paymentMethod && 'error'}
          help={errors.paymentMethod && i18n(errors.paymentMethod)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.invoiceDetailsStep.paymentMethod')}
            optionFilterProp="children"
            value={cfdi.paymentMethod}
            defaultValue={paymentMethod}
            onChange={method => setCfdiFields({ paymentMethod: method })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValuePaymentMethods}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.paymentType')}
          validateStatus={errors.paymentType && 'error'}
          help={errors.paymentType && i18n(errors.paymentType)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.invoiceDetailsStep.paymentType')}
            optionFilterProp="children"
            value={cfdi.paymentType}
            defaultValue={paymentType}
            onChange={type => setCfdiFields({ paymentType: type })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValuePaymentTypes}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.creditDays')}
          validateStatus={errors.creditDays && 'error'}
          help={errors.creditDays && i18n(errors.creditDays)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.invoiceDetailsStep.creditDays')}
            optionFilterProp="children"
            value={cfdi.creditDays}
            defaultValue={creditDays}
            onChange={days => setCfdiFields({ creditDays: days })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValueCreditTerms}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.cfdiUse')}
          validateStatus={errors.cfdiUse && 'error'}
          help={errors.cfdiUse && i18n(errors.cfdiUse)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.invoiceDetailsStep.cfdiUse')}
            optionFilterProp="children"
            defaultValue={cfdiUse}
            value={cfdi.cfdiUse}
            onChange={use => setCfdiFields({ cfdiUse: use })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValueCfdiUses}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.notes')}
          validateStatus={errors.notes && 'error'}
          help={errors.notes && i18n(errors.notes)}
        >
          <Input.TextArea rows={4} value={cfdi.notes} onChange={e => setCfdiFields({ notes: e.target.value })} />
        </Form.Item>
      </Form>
    </Card>
  )
}

/** Only the service quotations with the same currency and required fields can be attached to the invoice. */
const isValidAttachableQuotation = cfdiCurrency => quotation => {
  if (quotation.relatedCfdi) return false
  const { id, quantity, unit, unitValue, description, productCode, currency, subtotal, total } = quotation
  return id && quantity && unit && unitValue && description && productCode && subtotal && total && currency === cfdiCurrency
}

const serviceHaveQuotations = ({ quotations }) => Boolean(quotations) && quotations.length

const InvoiceItemsFromServices = ({ cfdiItems = [], services = [], addServiceQuotation, addAllServiceQuotations, cfdiCurrency }) => {
  return (
    <Collapse accordion bordered={false}>
      {services.map(({ service, quotations }) => {
        const unbilledTotal = quotations.reduce((unbilled, { total }) => unbilled + total, 0)
        return (
          <Collapse.Panel key={service._id} id={service._id} header={service.referencia}>
            <List size="small" bordered>
              {service.referencia && (
                <List.Item>{`${i18n('newCfdi.invoiceItemsStep.servicePendingValue')}: ${unbilledTotal} ${cfdiCurrency}`}</List.Item>
              )}
              {service.origin && (
                <List.Item>
                  <Tooltip placement="topLeft" title={service.origin}>
                    <span className="truncate ...">{`${i18n('newCfdi.invoiceItemsStep.serviceOrigin')}: ${service.origin}`}</span>
                  </Tooltip>
                </List.Item>
              )}
              {service.origin && (
                <List.Item>
                  <Tooltip placement="topLeft" title={service.destination}>
                    <span className="truncate ...">{`${i18n('newCfdi.invoiceItemsStep.serviceDestination')}: ${service.destination}`}</span>
                  </Tooltip>
                </List.Item>
              )}
              {service.orderClientReference && (
                <List.Item>{`${i18n('newCfdi.invoiceItemsStep.serviceClientReference')}: ${service.orderClientReference}`}</List.Item>
              )}

              <List.Item>
                <Row gutter={4} className="w-full justify-center flex-no-wrap max-w-full">
                  <Col flex="30px">
                    <Checkbox
                      onChange={() => addAllServiceQuotations(service._id, quotations)}
                      checked={cfdiIncludesAllServiceQuotations(cfdiItems, quotations)}
                    />
                  </Col>
                  <Col flex="auto" />
                </Row>
              </List.Item>

              {quotations.map(quotation => (
                <List.Item key={quotation.id}>
                  <Row gutter={4} className="w-full justify-center flex-no-wrap max-w-full">
                    <Col flex="30px">
                      <Checkbox
                        onChange={() => addServiceQuotation({ serviceId: service._id, quotation })}
                        checked={cfdiIncludesQuotation(cfdiItems, quotation.id)}
                      />
                    </Col>
                    <Col flex="auto" className="flex-shrink truncate ...">
                      <Tooltip placement="topLeft" title={quotation.description}>
                        {quotation.description || ''}
                      </Tooltip>
                    </Col>
                    <Col flex="120px" className="flex-shrink text-right truncate ...">
                      {`${quotation.total} ${quotation.currency}`}
                    </Col>
                  </Row>
                </List.Item>
              ))}
            </List>
          </Collapse.Panel>
        )
      })}
    </Collapse>
  )
}

const validateAdditionalItemForm = item => {
  const errors = {}
  if (!item.productCode) errors.productCode = 'newCfdi.errors.productCodeRequired'
  if (!item.unit) errors.unit = 'newCfdi.errors.unitRequired'
  if (!item.quantity || item.quantity <= 0) errors.quantity = 'newCfdi.errors.invalidQuantity'
  if (!item.unitValue || item.unitValue <= 0) errors.unitValue = 'newCfdi.errors.invalidUnitValue'
  return errors
}

const NewInvoiceItemForm = ({ addAdditionalItem, removeAdditionalItem, selectedAdditionalItem }) => {
  const defaultValues = {
    id: null,
    productCode: null,
    unit: null,
    quantity: 1,
    unitValue: 0,
    haveTax: false,
    tax: 0,
    haveIvaRet: false,
    ivaRet: 0,
    subtotal: 0,
    total: 0,
    notes: '',
  }
  const resolver = values => {
    const validationErrors = validateAdditionalItemForm(values)
    const error = Object.keys(validationErrors).length > 0
    return { values: error ? {} : values, errors: validationErrors }
  }
  const { control, handleSubmit, errors, watch, setValue, reset } = useForm({ defaultValues, resolver })
  const { id, quantity, unitValue, haveTax, haveIvaRet, subtotal, tax, ivaRet } = watch()
  useEffect(() => {
    if (!selectedAdditionalItem) return
    reset({
      ...selectedAdditionalItem,
      haveTax: Boolean(selectedAdditionalItem.taxes.find(({ name, isRetention }) => name === 'iva' && isRetention === false)),
      haveIvaRet: Boolean(selectedAdditionalItem.taxes.find(({ name, isRetention }) => name === 'iva' && isRetention === true)),
    })
  }, [selectedAdditionalItem])
  useEffect(() => setValue('subtotal', num(quantity).times(unitValue).val()), [quantity, unitValue])
  useEffect(() => setValue('tax', haveTax ? num(subtotal).times(0.16).val() : 0), [subtotal, haveTax])
  useEffect(() => setValue('ivaRet', haveIvaRet ? num(subtotal).times(0.04).val() : 0), [subtotal, haveIvaRet])
  useEffect(() => setValue('total', num(subtotal).plus(tax).minus(ivaRet).val()), [subtotal, tax, ivaRet])
  const onSubmit = data => {
    addAdditionalItem(data)
    reset(defaultValues)
  }

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <h3>{i18n('newCfdi.invoiceItemsStep.additionalItems')}</h3>
      <Controller name="id" control={control} />

      <Form.Item
        label={i18n('newCfdi.additionalItem.productCode')}
        validateStatus={errors.productCode && 'error'}
        help={errors.productCode && i18n(errors.productCode)}
      >
        <Controller
          name="productCode"
          as={Select}
          className="w-full"
          placeholder={i18n('newCfdi.additionalItem.productCodePlaceholder')}
          optionFilterProp="children"
          filterOption={(input, option) => option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          showSearch
          options={labelValueServices.map(({ label, value }) => ({ value, label: `${value} - ${label}` }))}
          control={control}
          defaultValue=""
        />
      </Form.Item>
      <Form.Item
        label={i18n('newCfdi.additionalItem.unit')}
        validateStatus={errors.unit && 'error'}
        help={errors.unit && i18n(errors.unit)}
      >
        <Controller
          name="unit"
          as={Select}
          className="w-full"
          placeholder={i18n('newCfdi.additionalItem.unitPlaceholder')}
          optionFilterProp="children"
          filterOption={(input, option) => option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          showSearch
          options={labelValueUnitCodes.map(({ label, value }) => ({ value, label: `${value} - ${label}` }))}
          control={control}
          defaultValue=""
        />
      </Form.Item>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          label={i18n('newCfdi.additionalItem.quantity')}
          validateStatus={errors.quantity && 'error'}
          help={errors.quantity && i18n(errors.quantity)}
        >
          <Controller name="quantity" as={InputNumber} control={control} className="w-full" min={1} />
        </Form.Item>
        <Form.Item
          label={i18n('newCfdi.additionalItem.unitValue')}
          validateStatus={errors.unitValue && 'error'}
          help={errors.unitValue && i18n(errors.unitValue)}
        >
          <Controller name="unitValue" as={InputNumber} control={control} className="w-full" min={0} step={0.01} />
        </Form.Item>
        <Form.Item label={i18n('newCfdi.additionalItem.tax')}>
          <Controller
            name="haveTax"
            control={control}
            render={({ value, onChange }) => <Checkbox checked={value} onChange={e => onChange(e.target.checked)} />}
          />
          <Controller className="w-full" name="tax" as={InputNumber} control={control} disabled defaultValue={0} />
        </Form.Item>
        <Form.Item label={i18n('newCfdi.additionalItem.ivaRet')}>
          <Controller
            name="haveIvaRet"
            control={control}
            render={({ value, onChange }) => <Checkbox checked={value} onChange={e => onChange(e.target.checked)} />}
          />
          <Controller className="w-full" name="ivaRet" as={InputNumber} control={control} disabled defaultValue={0} />
        </Form.Item>
        <Form.Item label={i18n('newCfdi.additionalItem.subtotal')}>
          <Controller className="w-full" name="subtotal" as={InputNumber} control={control} disabled defaultValue={0} />
        </Form.Item>
        <Form.Item label={i18n('newCfdi.additionalItem.total')}>
          <Controller className="w-full" name="total" as={InputNumber} control={control} disabled defaultValue={0} />
        </Form.Item>
      </div>
      <Form.Item label={i18n('newCfdi.additionalItem.notes')}>
        <Controller name="notes" as={Input.TextArea} control={control} defaultValue="" />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            {i18n(id !== null ? 'newCfdi.additionalItem.updateItem' : 'newCfdi.additionalItem.addItem')}
          </Button>
          {id !== null && (
            <Button
              danger
              onClick={() => {
                removeAdditionalItem(id)
                reset(defaultValues)
              }}
            >
              {i18n('newCfdi.additionalItem.deleteItem')}
            </Button>
          )}
          {id !== null && <Button onClick={() => reset(defaultValues)}>{i18n('newCfdi.additionalItem.cancelEditItem')}</Button>}
        </Space>
      </Form.Item>
    </Form>
  )
}

const BillOfLadingItemForm = ({ addAdditionalItem, removeAdditionalItem, selectedAdditionalItem }) => {
  const defaultValues = {
    id: null,
    productCode: null,
    unit: null,
    quantity: 1,
    unitValue: 0,
    haveTax: false,
    tax: 0,
    haveIvaRet: false,
    ivaRet: 0,
    subtotal: 0,
    total: 0,
    notes: '',
  }
  const resolver = values => {
    const validationErrors = validateAdditionalItemForm(values)
    const error = Object.keys(validationErrors).length > 0
    return { values: error ? {} : values, errors: validationErrors }
  }
  const { control, handleSubmit, errors, watch, setValue, reset } = useForm({ defaultValues, resolver })
  const { id, quantity, unitValue, haveTax, haveIvaRet, subtotal, tax, ivaRet } = watch()
  useEffect(() => {
    if (!selectedAdditionalItem) return
    reset({
      ...selectedAdditionalItem,
      haveTax: Boolean(selectedAdditionalItem.taxes.find(({ name, isRetention }) => name === 'iva' && isRetention === false)),
      haveIvaRet: Boolean(selectedAdditionalItem.taxes.find(({ name, isRetention }) => name === 'iva' && isRetention === true)),
    })
  }, [selectedAdditionalItem])
  useEffect(() => setValue('subtotal', num(quantity).times(unitValue).val()), [quantity, unitValue])
  useEffect(() => setValue('tax', haveTax ? num(subtotal).times(0.16).val() : 0), [subtotal, haveTax])
  useEffect(() => setValue('ivaRet', haveIvaRet ? num(subtotal).times(0.04).val() : 0), [subtotal, haveIvaRet])
  useEffect(() => setValue('total', num(subtotal).plus(tax).minus(ivaRet).val()), [subtotal, tax, ivaRet])
  const onSubmit = data => {
    addAdditionalItem(data)
    reset(defaultValues)
  }

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <h3>{i18n('newCfdi.billOfLadingItemsStep.incomeOrTransfer')}</h3>
      <Controller name="id" control={control} />

      <Form.Item
        label={i18n('newCfdi.additionalItem.productCode')}
        validateStatus={errors.productCode && 'error'}
        help={errors.productCode && i18n(errors.productCode)}
      >
        <Controller
          name="productCode"
          as={Select}
          className="w-full"
          placeholder={i18n('newCfdi.additionalItem.productCodePlaceholder')}
          optionFilterProp="children"
          filterOption={(input, option) => option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          showSearch
          options={labelValueServices.map(({ label, value }) => ({ value, label: `${value} - ${label}` }))}
          control={control}
          defaultValue=""
        />
      </Form.Item>
      <Form.Item
        label={i18n('newCfdi.additionalItem.unit')}
        validateStatus={errors.unit && 'error'}
        help={errors.unit && i18n(errors.unit)}
      >
        <Controller
          name="unit"
          as={Select}
          className="w-full"
          placeholder={i18n('newCfdi.additionalItem.unitPlaceholder')}
          optionFilterProp="children"
          filterOption={(input, option) => option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          showSearch
          options={labelValueUnitCodes.map(({ label, value }) => ({ value, label: `${value} - ${label}` }))}
          control={control}
          defaultValue=""
        />
      </Form.Item>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item
          label={i18n('newCfdi.additionalItem.quantity')}
          validateStatus={errors.quantity && 'error'}
          help={errors.quantity && i18n(errors.quantity)}
        >
          <Controller name="quantity" as={InputNumber} control={control} className="w-full" min={1} />
        </Form.Item>
        <Form.Item
          label={i18n('newCfdi.additionalItem.unitValue')}
          validateStatus={errors.unitValue && 'error'}
          help={errors.unitValue && i18n(errors.unitValue)}
        >
          <Controller name="unitValue" as={InputNumber} control={control} className="w-full" min={0} step={0.01} />
        </Form.Item>
        <Form.Item label={i18n('newCfdi.additionalItem.tax')}>
          <Controller
            name="haveTax"
            control={control}
            render={({ value, onChange }) => <Checkbox checked={value} onChange={e => onChange(e.target.checked)} />}
          />
          <Controller className="w-full" name="tax" as={InputNumber} control={control} disabled defaultValue={0} />
        </Form.Item>
        <Form.Item label={i18n('newCfdi.additionalItem.ivaRet')}>
          <Controller
            name="haveIvaRet"
            control={control}
            render={({ value, onChange }) => <Checkbox checked={value} onChange={e => onChange(e.target.checked)} />}
          />
          <Controller className="w-full" name="ivaRet" as={InputNumber} control={control} disabled defaultValue={0} />
        </Form.Item>
        <Form.Item label={i18n('newCfdi.additionalItem.subtotal')}>
          <Controller className="w-full" name="subtotal" as={InputNumber} control={control} disabled defaultValue={0} />
        </Form.Item>
        <Form.Item label={i18n('newCfdi.additionalItem.total')}>
          <Controller className="w-full" name="total" as={InputNumber} control={control} disabled defaultValue={0} />
        </Form.Item>
      </div>
      <Form.Item label={i18n('newCfdi.additionalItem.notes')}>
        <Controller name="notes" as={Input.TextArea} control={control} defaultValue="" />
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            {i18n(id !== null ? 'newCfdi.additionalItem.updateItem' : 'newCfdi.additionalItem.addItem')}
          </Button>
          {id !== null && (
            <Button
              danger
              onClick={() => {
                removeAdditionalItem(id)
                reset(defaultValues)
              }}
            >
              {i18n('newCfdi.additionalItem.deleteItem')}
            </Button>
          )}
          {id !== null && <Button onClick={() => reset(defaultValues)}>{i18n('newCfdi.additionalItem.cancelEditItem')}</Button>}
        </Space>
      </Form.Item>
    </Form>
  )
}

const InvoiceItemsStep = props => {
  const { cfdi, errors, addServiceQuotation, addAllServiceQuotations, services = [], addAdditionalItem } = props
  const { removeAdditionalItem, selectedAdditionalItem } = props
  const servicesWithAttachableQuotations = services
    .map(({ quotations = [], ...service }) => ({ service, quotations: quotations.filter(isValidAttachableQuotation(cfdi.currency)) }))
    .filter(serviceHaveQuotations)

  return (
    <Card bordered={false} className="invoice-card w-full p-4">
      <Form layout="vertical">
        <h3>{i18n('newCfdi.invoiceItemsStep.services')}</h3>
        {servicesWithAttachableQuotations.length ? (
          <Form.Item label="" validateStatus={errors.itemsRequired && 'error'} help={errors.itemsRequired && i18n(errors.itemsRequired)}>
            <InvoiceItemsFromServices
              services={servicesWithAttachableQuotations}
              cfdiItems={cfdi.items}
              cfdiCurrency={cfdi.currency}
              addServiceQuotation={addServiceQuotation}
              addAllServiceQuotations={addAllServiceQuotations}
            />
          </Form.Item>
        ) : null}
      </Form>
      {!servicesWithAttachableQuotations.length ? (
        <Alert description={i18n('newCfdi.invoiceItemsStep.noBillingPendingServices')} type="warning" showIcon />
      ) : null}

      <Divider />

      <NewInvoiceItemForm
        cfdiCurrency={cfdi.currency}
        addAdditionalItem={addAdditionalItem}
        removeAdditionalItem={removeAdditionalItem}
        selectedAdditionalItem={selectedAdditionalItem}
      />
    </Card>
  )
}

const CreditNoteDetailsStep = ({ cfdi, errors, setDefaultFields, setCfdiFields, relationship = {} }) => {
  const { creditDays, cfdiUse, paymentMethod, paymentType } = relationship
  useEffect(() => setDefaultFields({ creditDays, cfdiUse, paymentMethod, paymentType }), [])

  const rateUrl = cfdi.currency ? `/api/exchange-rates/get-yesterday-rate/${cfdi.currency}/MXN` : null
  const { data, error } = useSWR(rateUrl, url => get(url))
  useEffect(() => {
    if (!error && data && data.ok) setCfdiFields({ exchangeRate: data.exchangeRate })
  }, [data])

  return (
    <Card bordered={false} className="invoice-card w-full p-4">
      <strong>{i18n('newCfdi.invoiceDetailsStep.title')}</strong>

      <Form layout="vertical">
        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.currency')}
          validateStatus={errors.currency && 'error'}
          help={errors.currency && i18n(errors.currency)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.invoiceDetailsStep.currency')}
            value={cfdi.currency}
            optionFilterProp="children"
            onChange={currency => setCfdiFields({ currency })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValueCurrencies}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.exchangeRate')}
          validateStatus={errors.exchangeRate && 'error'}
          help={errors.exchangeRate && i18n(errors.exchangeRate)}
        >
          <InputNumber className="w-full" min={0} onChange={rate => setCfdiFields({ exchangeRate: rate })} value={cfdi.exchangeRate} />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.paymentMethod')}
          validateStatus={errors.paymentMethod && 'error'}
          help={errors.paymentMethod && i18n(errors.paymentMethod)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.invoiceDetailsStep.paymentMethod')}
            optionFilterProp="children"
            value={cfdi.paymentMethod}
            defaultValue={paymentMethod}
            onChange={method => setCfdiFields({ paymentMethod: method })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValuePaymentMethods}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.paymentType')}
          validateStatus={errors.paymentType && 'error'}
          help={errors.paymentType && i18n(errors.paymentType)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.invoiceDetailsStep.paymentType')}
            optionFilterProp="children"
            value={cfdi.paymentType}
            defaultValue={paymentType}
            onChange={type => setCfdiFields({ paymentType: type })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValuePaymentTypes}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.creditDays')}
          validateStatus={errors.creditDays && 'error'}
          help={errors.creditDays && i18n(errors.creditDays)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.invoiceDetailsStep.creditDays')}
            optionFilterProp="children"
            value={cfdi.creditDays}
            defaultValue={creditDays}
            onChange={days => setCfdiFields({ creditDays: days })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValueCreditTerms}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.cfdiUse')}
          validateStatus={errors.cfdiUse && 'error'}
          help={errors.cfdiUse && i18n(errors.cfdiUse)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.invoiceDetailsStep.cfdiUse')}
            optionFilterProp="children"
            defaultValue={cfdiUse}
            value={cfdi.cfdiUse}
            onChange={use => setCfdiFields({ cfdiUse: use })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValueCfdiUses}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.notes')}
          validateStatus={errors.notes && 'error'}
          help={errors.notes && i18n(errors.notes)}
        >
          <Input.TextArea rows={4} value={cfdi.notes} onChange={e => setCfdiFields({ notes: e.target.value })} />
        </Form.Item>
      </Form>
    </Card>
  )
}

const CreditNoteItemsStep = props => {
  const { cfdi, errors, addServiceQuotation, addAllServiceQuotations, services = [], addAdditionalItem } = props
  const { removeAdditionalItem, selectedAdditionalItem } = props
  const servicesWithAttachableQuotations = services
    .map(({ quotations = [], ...service }) => ({ service, quotations: quotations.filter(isValidAttachableQuotation(cfdi.currency)) }))
    .filter(serviceHaveQuotations)

  return (
    <Card bordered={false} className="invoice-card w-full p-4">
      {/* <Form layout="vertical">
        <h3>{i18n('newCfdi.invoiceItemsStep.services')}</h3>
        {servicesWithAttachableQuotations.length ? (
          <Form.Item label="" validateStatus={errors.itemsRequired && 'error'} help={errors.itemsRequired && i18n(errors.itemsRequired)}>
            <InvoiceItemsFromServices
              services={servicesWithAttachableQuotations}
              cfdiItems={cfdi.items}
              cfdiCurrency={cfdi.currency}
              addServiceQuotation={addServiceQuotation}
              addAllServiceQuotations={addAllServiceQuotations}
            />
          </Form.Item>
        ) : null}
      </Form>
      {!servicesWithAttachableQuotations.length ? (
        <Alert description={i18n('newCfdi.invoiceItemsStep.noBillingPendingServices')} type="warning" showIcon />
      ) : null}
      <Divider /> */}

      <NewInvoiceItemForm
        cfdiCurrency={cfdi.currency}
        addAdditionalItem={addAdditionalItem}
        removeAdditionalItem={removeAdditionalItem}
        selectedAdditionalItem={selectedAdditionalItem}
      />
    </Card>
  )
}

const BillOfLadingDetailsStep = ({ cfdi, errors, setDefaultFields, setCfdiFields, relationship = {} }) => {
  const { creditDays, cfdiUse, paymentMethod, paymentType } = relationship
  useEffect(() => setDefaultFields({ creditDays, cfdiUse, paymentMethod, paymentType }), [])

  const rateUrl = cfdi.currency ? `/api/exchange-rates/get-yesterday-rate/${cfdi.currency}/MXN` : null
  const { data, error } = useSWR(rateUrl, url => get(url))
  useEffect(() => {
    if (!error && data && data.ok) setCfdiFields({ exchangeRate: data.exchangeRate })
  }, [data])

  return (
    <Card bordered={false} className="invoice-card w-full p-4">
      <strong>{i18n('newCfdi.billOfLadingDetailsStep.title')}</strong>

      <Form layout="vertical">
        <Form.Item
          label={i18n('newCfdi.billOfLadingDetailsStep.typeOfBillOfLading')}
          validateStatus={errors.currency && 'error'}
          help={errors.currency && i18n(errors.currency)}
        >
          <Select
            className="w-full"
            placeholder={i18n('newCfdi.billOfLadingDetailsStep.typeOfBillOfLading')}
            onChange={billOfLadingType => setCfdiFields({ billOfLadingType })}
          >
            <Option key="I">Income</Option>
            <Option key="T">Transfer</Option>
          </Select>
        </Form.Item>
      </Form>
    </Card>
  )
}

const BillOfLadingItemsStep = props => {
  const {
    cfdi,
    errors,
    addServiceQuotation,
    addAllServiceQuotations,
    services = [],
    addAdditionalItem,
    setDefaultFields,
    setCfdiFields,
  } = props
  const { removeAdditionalItem, selectedAdditionalItem } = props
  const servicesWithAttachableQuotations = services
    .map(({ quotations = [], ...service }) => ({ service, quotations: quotations.filter(isValidAttachableQuotation('USD')) }))
    .filter(serviceHaveQuotations)
  const rateUrl = cfdi.currency ? `/api/exchange-rates/get-yesterday-rate/${cfdi.currency}/MXN` : null
  const { data, error } = useSWR(rateUrl, url => get(url))
  useEffect(() => {
    if (!error && data && data.ok) setCfdiFields({ exchangeRate: data.exchangeRate })
  }, [data])

  return (
    <Card bordered={false} className="invoice-card w-full p-4">
      <Form layout="vertical">
        <h3>{i18n('newCfdi.invoiceItemsStep.services')}</h3>
        <Form.Item
          label={i18n('newCfdi.billOfLadingDetailsStep.typeOfBillOfLading')}
          validateStatus={errors.currency && 'error'}
          help={errors.currency && i18n(errors.currency)}
        >
          <Select
            className="w-full"
            placeholder={i18n('newCfdi.billOfLadingDetailsStep.typeOfBillOfLading')}
            onChange={billOfLadingType => setCfdiFields({ billOfLadingType })}
          >
            <Option key="I">Income</Option>
            <Option key="T">Transfer</Option>
          </Select>
        </Form.Item>
        {servicesWithAttachableQuotations.length ? (
          <Form.Item label="" validateStatus={errors.itemsRequired && 'error'} help={errors.itemsRequired && i18n(errors.itemsRequired)}>
            <InvoiceItemsFromServices
              services={servicesWithAttachableQuotations}
              cfdiItems={cfdi.items}
              cfdiCurrency={cfdi.currency}
              addServiceQuotation={addServiceQuotation}
              addAllServiceQuotations={addAllServiceQuotations}
            />
          </Form.Item>
        ) : null}
      </Form>
      {!servicesWithAttachableQuotations.length ? (
        <Alert description={i18n('newCfdi.invoiceItemsStep.noBillingPendingServices')} type="warning" showIcon />
      ) : null}

      <Divider />
      {/* 
      <BillOfLadingItemForm
        cfdiCurrency={cfdi.currency}
        addAdditionalItem={addAdditionalItem}
        removeAdditionalItem={removeAdditionalItem}
        selectedAdditionalItem={selectedAdditionalItem}
      /> */}
    </Card>
  )
}

const NewCfdiSideBar = props => {
  const { cfdi, errors, currentStep, setDefaultFields, setCfdiFields, addServiceQuotation, addAllServiceQuotations } = props
  const { addAdditionalItem, removeAdditionalItem, selectedAdditionalItem, relationship, services, setIssuers, setReceivers } = props
  const { addPaymentProofPayment, selectedPayment, removePaymentProofPayment, addInvoiceToPayment, attachableInvoices } = props
  const { setInvoicePayedValue, setInvoiceExchangeRate } = props

  const cfdiDetailsStepByCfdiType = {
    invoice: InvoiceDetailsStep,
    paymentProof: PaymentProofDetailsStep,
    creditNote: CreditNoteDetailsStep,
    billOfLading: BillOfLadingItemsStep,
  }

  const cfdiItemsStepByCfdiType = {
    invoice: InvoiceItemsStep,
    paymentProof: PaymentProofInvoicesStep,
    creditNote: CreditNoteItemsStep,
    billOfLading: BillOfLadingItemsStep,
  }

  const sidebars = [null, IssuerReceiverStep, cfdiDetailsStepByCfdiType[cfdi.cfdiType], cfdiItemsStepByCfdiType[cfdi.cfdiType], null]
  const ComponentToSidebar = sidebars[currentStep]
  return ComponentToSidebar ? (
    <ComponentToSidebar
      cfdi={cfdi}
      errors={errors}
      setDefaultFields={setDefaultFields}
      setCfdiFields={setCfdiFields}
      addServiceQuotation={addServiceQuotation}
      addAllServiceQuotations={addAllServiceQuotations}
      relationship={relationship}
      services={services}
      setIssuers={setIssuers}
      setReceivers={setReceivers}
      addAdditionalItem={addAdditionalItem}
      removeAdditionalItem={removeAdditionalItem}
      selectedAdditionalItem={selectedAdditionalItem}
      addPaymentProofPayment={addPaymentProofPayment}
      selectedPayment={selectedPayment}
      removePaymentProofPayment={removePaymentProofPayment}
      addInvoiceToPayment={addInvoiceToPayment}
      attachableInvoices={attachableInvoices}
      setInvoicePayedValue={setInvoicePayedValue}
      setInvoiceExchangeRate={setInvoiceExchangeRate}
    />
  ) : null
}

const customDot = (dot, { index }) => {
  const stepsNames = steps.map(({ name }) => name)
  return (
    <Popover content={<span>{i18n(stepsNames[index])}</span>} placement="bottom">
      {dot}
    </Popover>
  )
}

const validateForm = (step, cfdi) => {
  const errors = {}
  if (step === 1) {
    if (!cfdi.issuerId) errors.issuerId = 'newCfdi.errors.issuerIdRequired'
    if (cfdi.issuerId && !cfdi.receiverId) errors.receiverId = 'newCfdi.errors.receiverIdRequired'
  }
  if (step === 2 && cfdi.cfdiType === 'invoice') {
    if (!cfdi.currency) errors.currency = 'newCfdi.errors.currencyRequired'
    if (!cfdi.exchangeRate) errors.exchangeRate = 'newCfdi.errors.exchangeRateRequired'
    if (!cfdi.paymentMethod) errors.paymentMethod = 'newCfdi.errors.paymentMethodRequired'
    if (!cfdi.paymentType) errors.paymentType = 'newCfdi.errors.paymentTypeRequired'
    if (!cfdi.creditDays && cfdi.creditDays !== 0) errors.creditDays = 'newCfdi.errors.creditDaysRequired'
    if (!cfdi.cfdiUse) errors.cfdiUse = 'newCfdi.errors.cfdiUseRequired'
  }
  if (step === 3 && cfdi.cfdiType === 'invoice') {
    // TODO: Show this error on form
    if (!cfdi.items || cfdi.items.length === 0) errors.itemsRequired = 'newCfdi.errors.itemsRequired'
  }
  if (step === 2 && cfdi.cfdiType === 'paymentProof') {
    // TODO Show this error on form
    if (!cfdi.payments || cfdi.payments.length === 0) errors.paymentsRequired = 'newCfdi.errors.paymentsRequired'
  }
  if (step === 3 && cfdi.cfdiType === 'paymentProof') {
    // TODO
  }
  return errors
}

const NewCfdi = () => {
  const [newCfdiState, updateCfdiState] = useReducer(newCfdiReducer, defaultState)
  const { step, cfdi, errors, creatingCfdi, finished, apiError, apiErrorDetails, issuers, receivers, selectedAdditionalItem } = newCfdiState
  const { selectedPayment } = newCfdiState

  // Update state depending on the page from where this component was otiginally called.
  const mainRouter = useRouter()
  useEffect(() => {
    const { issuerId, receiverId, BoLHId, requestedFrom, BoLHSection } = mainRouter.query

    if (requestedFrom) {
      switch (requestedFrom) {
        case 'BillOfLadingHub': {
          cfdi.cfdiType = 'invoice'
          cfdi.issuerId = issuerId
          cfdi.receiverId = receiverId
          cfdi.BoLHId = BoLHId
          cfdi.requestedFrom = requestedFrom
          cfdi.BoLHSection = BoLHSection
          updateCfdiState({ type: 'setStep', value: 1 })
          break
        }
        default:
          break
      }
    }
  }, [mainRouter.query])

  const relationshipUrl = cfdi.issuerId && cfdi.receiverId ? `/api/billing/new-cfdi/relationship/${cfdi.issuerId}/${cfdi.receiverId}` : null
  const { data: relationshipData } = useSWR(relationshipUrl, url => get(url))
  const { relationship, services } = (relationshipUrl && relationshipData) || {}

  const attachableInvoicesUrl =
    cfdi.issuerId && cfdi.receiverId && cfdi.cfdiType === 'paymentProof'
      ? `/api/billing/new-cfdi/new-payment-proof-invoices/${cfdi.issuerId}/${cfdi.receiverId}`
      : null
  const { data: attachableInvoicesData } = useSWR(attachableInvoicesUrl, url => get(url))
  const { invoices: attachableInvoices } = attachableInvoicesData || {}

  const setDefaultFields = fields => updateCfdiState({ type: 'setDefaultFields', value: fields })
  const setIssuers = value => updateCfdiState({ type: 'setIssuers', value })
  const setReceivers = value => updateCfdiState({ type: 'setReceivers', value })
  const setCfdiFields = fields => updateCfdiState({ type: 'setFields', value: fields })
  const addServiceQuotation = ({ serviceId, quotation }) =>
    updateCfdiState({ type: 'addServiceQuotation', value: { serviceId, quotation } })
  const addAllServiceQuotations = (serviceId, quotations = []) => {
    if (cfdiIncludesAllServiceQuotations(cfdi.items, quotations))
      quotations.forEach(quotation => updateCfdiState({ type: 'addServiceQuotation', value: { serviceId, quotation } }))
    else
      quotations.forEach(quotation => {
        if (!cfdiIncludesQuotation(cfdi.items, quotation.id))
          updateCfdiState({ type: 'addServiceQuotation', value: { serviceId, quotation } })
      })
  }
  const nextStep = () => {
    const validationErrors = validateForm(step, cfdi)
    if (Object.keys(validationErrors).length === 0) updateCfdiState({ type: 'nextStep' })
    else updateCfdiState({ type: 'setErrors', value: validationErrors })
  }
  const previousStep = () => updateCfdiState({ type: 'previousStep' })
  const setCreatingCfdi = value => updateCfdiState({ type: 'setCreatingCfdi', value })
  const setFinished = value => updateCfdiState({ type: 'setFinished', value })
  const setApiError = (error, details = '') => updateCfdiState({ type: 'setApiError', value: { error, details } })
  const resetForm = () => updateCfdiState({ type: 'reset' })
  const addAdditionalItem = value => updateCfdiState({ type: 'addAdditionalItem', value })
  const removeAdditionalItem = itemId => updateCfdiState({ type: 'removeAdditionalItem', value: itemId })
  const setSelectedAdditionalItem = value => updateCfdiState({ type: 'setSelectedAdditionalItem', value })
  const addPaymentProofPayment = value => updateCfdiState({ type: 'addPaymentProofPayment', value })
  const setSelectedPayment = value => updateCfdiState({ type: 'setSelectedPayment', value })
  const removePaymentProofPayment = value => updateCfdiState({ type: 'removePaymentProofPayment', value })
  const addInvoiceToPayment = value => updateCfdiState({ type: 'addInvoiceToPayment', value })
  const setInvoicePayedValue = value => updateCfdiState({ type: 'setInvoicePayedValue', value })
  const setInvoiceExchangeRate = value => updateCfdiState({ type: 'setInvoiceExchangeRate', value })

  const saveDraft = () => {
    setCreatingCfdi('draft')
    post('/api/billing/save-cfdi-draft', { body: cfdi })
      .then(({ error }) => {
        if (!error) setFinished('draft')
        setApiError(error)
      })
      .catch(setApiError)
      .finally(() => {
        setCreatingCfdi(false)
        mainRouter.push(`/bill-of-lading-hub/${cfdi.BoLHId}`)
      })
  }

  const createCfdi = () => {
    setCreatingCfdi('signed')
    post('/api/billing/create-cfdi', { body: cfdi })
      .then(({ error, details }) => {
        if (!error) setFinished('signed')
        setApiError(error, details?.message || '')
      })
      .catch(setApiError)
      .finally(() => setCreatingCfdi(false))
  }
  // console.log(cfdi)
  const finishMessages = { draft: 'newCfdi.messages.cfdiDraftCreated', signed: 'newCfdi.messages.cfdiCreated' }

  return (
    <div>
      <NewCfdiPageHeader
        currentStep={step}
        cfdi={cfdi}
        setCfdiFields={setCfdiFields}
        nextStep={nextStep}
        previousStep={previousStep}
        creatingCfdi={creatingCfdi}
        saveDraft={saveDraft}
        createCfdi={createCfdi}
        finished={finished}
        resetForm={resetForm}
      />

      {apiError && <Alert message="Error" description={`${i18n(apiError)} ${apiErrorDetails}`} type="error" closable onClose={() => {}} />}
      {finished && <Alert message="" description={i18n(finishMessages[finished])} type="success" />}

      <div className="mt-3">
        <Steps current={step} progressDot={customDot}>
          {steps.map(({ name }) => (
            <Steps.Step key={name} />
          ))}
        </Steps>
      </div>

      <div className="flex flex-wrap">
        {step !== 4 ? (
          <div className="w-full sm:w-1/3 mb-4">
            <NewCfdiSideBar
              cfdi={cfdi}
              errors={errors}
              currentStep={step}
              setDefaultFields={setDefaultFields}
              setCfdiFields={setCfdiFields}
              addServiceQuotation={addServiceQuotation}
              addAllServiceQuotations={addAllServiceQuotations}
              setIssuers={setIssuers}
              setReceivers={setReceivers}
              addAdditionalItem={addAdditionalItem}
              removeAdditionalItem={removeAdditionalItem}
              selectedAdditionalItem={selectedAdditionalItem}
              relationship={relationship}
              services={services}
              addPaymentProofPayment={addPaymentProofPayment}
              selectedPayment={selectedPayment}
              removePaymentProofPayment={removePaymentProofPayment}
              addInvoiceToPayment={addInvoiceToPayment}
              attachableInvoices={attachableInvoices}
              setInvoicePayedValue={setInvoicePayedValue}
              setInvoiceExchangeRate={setInvoiceExchangeRate}
            />
          </div>
        ) : null}

        <div className="w-full sm:w-2/3 pl-4 mx-auto">
          {step ? (
            <CfdiPreview
              cfdi={buildCfdiToPreview(cfdi, issuers, receivers, services, attachableInvoices)}
              onAdditionalItemClicked={step === 3 ? setSelectedAdditionalItem : null}
              onPaymentClicked={step === 2 ? setSelectedPayment : null}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export const NewCfdiPage = () => {
  const [collapsedMenu, setCollapsedMenu] = useState(true)
  const toggleMenu = () => {
    setCollapsedMenu(!collapsedMenu)
  }
  return (
    <Layout className="min-h-screen" hasSider>
      <Layout>
        <AppHeader toggleMenu={toggleMenu} collapsed={collapsedMenu} />
        <Layout.Content className="p-4">
          <NewCfdi />
        </Layout.Content>
      </Layout>
      <SideMenu collapsed={collapsedMenu} page="billing" />
    </Layout>
  )
}
