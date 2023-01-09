import React, { useReducer, useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { Typography, Button, Select, Input, Form, Divider, DatePicker, Checkbox, Radio, Space } from 'antd'
import { i18n } from '../../../services/i18n'
import { post } from '../../../services/fetch'

const { Title } = Typography

export const NewCustomer = ({ setIsNewBillOfLadingHubVisible, userProfile, companyProfile }) => {
  const router = useRouter()
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [allowCreateShipment, setAllowCreateShipment] = useState(companyProfile.allowCreateShipmentWithBoLH)
  const [defaultCreateShipment, setDefaultCreateShipment] = useState(companyProfile.defaultCreateShipmentWithBoLH)
  const [disableCreateShipment, setDisableCreateShipment] = useState(companyProfile.disableCreateShipmentWithBoLH)
  const [defaultTaskilityBoLHObjective, setTaskilityBoLHObjective] = useState(companyProfile.defaultTaskilityObjectiveBoL)
  const [disableTaskilityBoLHObjective, setDisableTaskilityBoLHObjective] = useState(companyProfile.disableTaskilityBoLHObjective)

  const newBoLHInitialState = { createShipmentWithHub: defaultCreateShipment, taskilityBoLHObjective: defaultTaskilityBoLHObjective }
  const newBoLHReducer = (state, action) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      case 'Name Update':
        return { ...state, name: action.payload }
      case 'Customer Update': {
        const client = action.clientsD.clients.find(client => client._id === action.payload)
        return { ...state, clientId: action.payload, clientName: client.name } 
      }
      case 'Create Shipment Update':
        return { ...state, createShipmentWithHub: action.payload }
      case 'Change Hub Objective':
        return { ...state, taskilityBoLHObjective: action.payload }
      default:
        return { ...state }
    }
  }
  const [newBoLHState, newBoLHDispatch] = useReducer(newBoLHReducer, newBoLHInitialState)

  // Get Clients data to populate the Select Options in the Clients Filter
  const { data: clientsData, error: clientsError } = useSWR('/api/billing/get-all-user-clients', url => fetch(url).then(res => res.json()))
  const saveNewBillOfLadingHub = BoLH => {
    // console.log('vehicle: ', BoLH)
    setLoading(true)
    post('/api/bill-of-lading-hub/create-new-bill-of-lading-hub', { body: BoLH })
      .then(({ ok, _id }) => {
        return ok ? _id : 'error'
      })
      .then(_id => router.push(`/bill-of-lading-hub/${_id}`))
      // .then(({ error, details }) => {
      //   // if (!error) setFinished('signed')
      //   setApiError(error, details?.message || '')
      //   // console.log('details', details)
      // })
      .catch()
    // .finally(() => setCreatingCfdi(false))
    // router.push(`/bill-of-lading-hub/${1}`)
    // setIsNewBillOfLadingHubVisible(false)
  }

  return (
    <div className="w-full mt-10">
      <Form layout="vertical">
        <Title level={3}>{i18n(`newBillOfLadingHub.newBoLH.title`)}</Title>
        <span className="text-blue">{i18n('newBillOfLadingHub.newBoLH.description')}</span>
        {/* <Button onClick={() => console.log('newBillOfLadingHubState')}>Console State</Button> */}
        <Divider plain />
        <Form.Item label={i18n(`newBillOfLadingHub.newBoLH.name`)}>
          <Input
            placeholder={i18n(`newBillOfLadingHub.newBoLH.namePlaceholder`)}
            onKeyUp={e => newBoLHDispatch({ type: 'Name Update', payload: e.target.value })}
            defaultValue={newBoLHState.name ? newBoLHState.name : null}
          />
        </Form.Item>
        <Form.Item label={i18n(`newBillOfLadingHub.newBoLH.customer`)}>
          <Select
            showSearch
            onChange={e => newBoLHDispatch({ type: 'Customer Update', payload: e, clientsD: clientsData })}
            placeholder={i18n(`newBillOfLadingHub.newBoLH.customerPlaceholder`)}
            style={{ width: '100%' }}
            tokenSeparators={[',']}
            options={clientsData?.clients?.map(({ _id, name }) => ({ value: _id, label: name }))}
            filterOption={(input, option) =>
              option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
              option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          />
        </Form.Item>
        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.hubObjective`)}
        </Title>
        <div className="mb-4">{i18n(`newBillOfLadingHub.hubObjectiveDescription`)}</div>
        <Radio.Group
          onChange={e => newBoLHDispatch({ type: 'Change Hub Objective', payload: e.target.value })}
          value={newBoLHState.taskilityBoLHObjective}
          className="mt-2"
          disabled={disableTaskilityBoLHObjective}
        >
          <Space size={[60, 32]} wrap>
            <Radio value="Stamp BoL">
              <Space direction="vertical" size={2}>
                <span>
                  <strong className="">{i18n(`newBillOfLadingHub.stampBoL`)}</strong>
                </span>
                <span className="">{i18n(`newBillOfLadingHub.stampBoLDescription`)}</span>
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
        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.newBoLH.createShipment`)}
        </Title>
        <Form.Item label={i18n(`newBillOfLadingHub.newBoLH.createShipmentDetail`)} hidden={!allowCreateShipment}>
          <Checkbox
            onChange={e => newBoLHDispatch({ type: 'Create Shipment Update', payload: e.target.checked })}
            disabled={disableCreateShipment}
            defaultChecked={defaultCreateShipment}
          >
            {i18n(`newBillOfLadingHub.newBoLH.createShipmentCheckbox`)}
          </Checkbox>
        </Form.Item>
        <Button onClick={() => saveNewBillOfLadingHub(newBoLHState)} type="primary" className="float-right" loading={loading}>
          {i18n('buttons.save')}
        </Button>
      </Form>
    </div>
  )
}