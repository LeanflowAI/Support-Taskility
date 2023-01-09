import React, { useReducer, useState, useRef } from 'react'
import {
  Space,
  Typography,
  Button,
  Radio,
  Select,
  Input,
  Form,
  Divider,
} from 'antd'
import { useForm } from 'react-hook-form'
import { i18n } from '../../../services/i18n'
import { Teammate } from './teammate'
import { BoLHBenefits } from './marketingMessages'

const { Title } = Typography
const { Option } = Select


export const ShareWithTeam = ({ initialState, BoLHName, BoLHFolio, BoLHId, parentDispatch, emailInputRef, disabled = false }) => {
  const { control, handleSubmit, errors, watch } = useForm()
  const [accessSetting, setAccessSetting] = useState(1)
  const [currentNotificated, setCurrentNotificated] = useState(3)
  const [totalNotificated, setTotalNotificated] = useState(3)

  const selectARandomBenefit = () => {
    const randomBenefit = BoLHBenefits[Math.floor(Math.random() * BoLHBenefits.length)]
    return randomBenefit
  }

  const sendEmailInvitation = (userToInvite, initialState1) => {
    // console.log('router.pathname', router.pathname)
    const adminUser = initialState1.users.find(user => user.hubManager === true)
    const benefit = selectARandomBenefit()
    const currentTime = new Date()
    const templateModel = {
      emailSubject: `${BoLHFolio} | ${BoLHName}`,
      greeting: 'Hola',
      receiverName: userToInvite?.name ? userToInvite.name : '',
      BoLHName: BoLHName,
      BoLHLink: `https://app.taskility.com/bill-of-lading-hub/${BoLHId}`,
      BoLHFolio: BoLHFolio,
      benefitTitle: benefit?.title,
      benefitDescription: benefit?.description,
      benefitLinkUrl: benefit?.linkUrl,
      benefitLinkText: benefit?.linkText,
      createUserLink: 'https://app.taskility.com/signup',
      adminUserEmail: adminUser?.email,
      adminUserName: `${adminUser?.name} ${adminUser?.lastName}`,
      year: currentTime.getFullYear(),
      headText: 'headText_Value',
      linkText: 'linkText_Value',
    }
    // console.log(templateModel)
  }

  const shareInitialState = {
    ...initialState,
    hubLink: `https://app.taskility.com/bill-of-lading-hub/${BoLHId}`,
    // users: [
    //   {
    //     userId: '',
    //     name: 'Alejandro Alonso',
    //     lastName: 'Cruz Romero',
    //     notify: true,
    //     writePermissions: ['share', 'generalInfo', 'locations', 'goods', 'transports'],
    //     viewPermissions: ['share', 'generalInfo', 'locations', 'goods', 'transports'],
    //     email: 'acruz@a1alogistics.com',
    //     mobile: '+524424760006',
    //     companyId: '',
    //     companyName: '',
    //     telegramAutenticationToken: '',
    //     hubManager: true,
    //   },
    //   {
    //     userId: '',
    //     name: 'Adolfo',
    //     lastName: 'Avila Baeza',
    //     notify: true,
    //     writePermissions: ['share', 'generalInfo', 'locations', 'goods', 'transports'],
    //     viewPermissions: ['share', 'generalInfo', 'locations', 'goods', 'transports'],
    //     email: 'aavila@a1alogistics.com',
    //     mobile: '+524423053788',
    //     companyId: '',
    //     companyName: '',
    //     telegramAutenticationToken: '',
    //     hubManager: false,
    //   },
    // ],
  }

  const shareReducer = (state, action) => {
    switch (action.type) {
      case 'Change Type of Access':
        // console.log('Change Type of Access', action.payload)
        return { ...state, typeOfAccess: action.payload }
      case 'Email Update': {
        const initials = typeof action.payload === 'string' ? action.payload.substring(0, 2).toUpperCase() : ''
        return {
          ...state,
          userToSendInvitation: {
            userId: '',
            name: '',
            lastName: '',
            initials: initials || '',
            notify: true,
            writePermissions: ['share', 'generalInfo', 'locations', 'goods', 'transports'],
            viewPermissions: ['share', 'generalInfo', 'locations', 'goods', 'transports'],
            email: action.payload,
            mobile: '',
            companyId: '',
            companyName: '',
            telegramAutenticationToken: '',
            telegramChatId: '',
            hubManager: false,
          },
        }
      }
      case 'Send Invitation': {
        sendEmailInvitation(state.userToSendInvitation, state)
        const newUser = state.userToSendInvitation
        // console.log('emailInputRef value: ', emailInputRef.current)
        // eslint-disable-next-line no-param-reassign
        emailInputRef.current.value = ''
        // eslint-disable-next-line no-param-reassign
        emailInputRef.current.input.value = ''
        // eslint-disable-next-line no-param-reassign
        emailInputRef.current.state.value = ''
        return { ...state, userToSendInvitation: {}, users: [...state.users, newUser] }
      }
      default:
        return { ...state }
    }
  }

  const [shareState, shareDispatch] = useReducer(shareReducer, shareInitialState)

  const onSubmitTeam = data => {
    // console.log(data)
  }
  const onChange = e => {
    setAccessSetting(e.target.value)
  }
  const hubLink = `https://app.taskility.com/bill-of-lading-hub/${BoLHId}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hubLink).then(
      // eslint-disable-next-line no-console
      () => console.log('Async: Copying to clipboard was successful!', hubLink),
      // eslint-disable-next-line no-console
      err => console.log('Async: Could not copy text', err)
    )
  }

  const notifyCheckboxChange = (value, index) => {
    parentDispatch({ type: 'Update Notify User', payload: { index: index, value: value } })
  }

  const writePermissionChange = (value, index) => {
    parentDispatch({ type: 'Update Write Permissions User', payload: { index: index, value: value } })
  }

  const viewPermissionChange = (value, index) => {
    parentDispatch({ type: 'Update View Permissions User', payload: { index: index, value: value } })
  }

  const deleteUser = index => {
    parentDispatch({ type: 'Delete User', payload: index })
  }

  const preferedLanguageChange = (value, index) => {
    parentDispatch({ type: 'Update Prefered Language User', payload: { index: index, value: value } })
  }

  const teammatesRender = initialState?.users.map((user, index) => (
    <Teammate
      user={user}
      index={index}
      notifyCheckboxChange={notifyCheckboxChange}
      writePermissionChange={writePermissionChange}
      viewPermissionChange={viewPermissionChange}
      deleteUser={deleteUser}
      preferedLanguageChange={preferedLanguageChange}
      key={user.email}
      disabled={disabled}
    />
  ))

  const handleChangeLanguage = value => {
    parentDispatch({ type: 'Update Prefered Language UserToSendInvitation', payload: value })
  }

  return (
    <div className="w-full mt-10">
      <Form layout="vertical" onFinish={handleSubmit(onSubmitTeam)}>
        <Title level={3}>{i18n(`newBillOfLadingHub.team.title`)}</Title>
        <span className="text-blue">{i18n('newBillOfLadingHub.team.formDescription')}</span>

        {/* Access Settings */}
        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.team.accessSettings`)}
        </Title>
        <Radio.Group
          onChange={e => parentDispatch({ type: 'Change Type of Access', payload: e.target.value })}
          value={initialState.typeOfAccess}
          className="mt-2"
          disabled={disabled}
        >
          <Space size={[60, 32]} wrap>
            <Radio value="Private">
              <Space direction="vertical" size={2}>
                <span>
                  <strong className="">{i18n(`newBillOfLadingHub.team.privateAccess`)}</strong>
                </span>
                <span className="">{i18n(`newBillOfLadingHub.team.privateAccessDescription`)}</span>
              </Space>
            </Radio>
            <Radio value="Organization Only">
              <Space direction="vertical" size={2}>
                <span>
                  <strong className="">{i18n(`newBillOfLadingHub.team.organizationAccess`)}</strong>
                </span>
                <span className="">{i18n(`newBillOfLadingHub.team.organizationAccessDescription`)}</span>
              </Space>
            </Radio>
          </Space>
        </Radio.Group>

        {/* Invite people */}
        <Title level={5} className="mt-8">
          {i18n(`newBillOfLadingHub.team.invite`)}
        </Title>
        <Space size={[8, 16]} wrap>
          <Input
            ref={emailInputRef}
            className="w-60"
            placeholder={i18n(`newBillOfLadingHub.team.invitePlaceholder`)}
            onKeyUp={e => parentDispatch({ type: 'Email Update', payload: e.target.value })}
            disabled={disabled}
          />
          <Select
            className="w-full"
            placeholder={i18n('newBillOfLadingHub.team.language')}
            defaultValue="es"
            onChange={handleChangeLanguage}
            style={{ width: '100%' }}
            disabled={disabled}
            // options={viewOptions}
          >
            <Option key="english" value="en">
              {i18n('newBillOfLadingHub.team.english')}
            </Option>
            <Option key="espanish" value="es">
              {i18n('newBillOfLadingHub.team.spanish')}
            </Option>
          </Select>
          <Button type="primary" onClick={() => parentDispatch({ type: 'Send Invitation' })} disabled={disabled}>
            {i18n(`newBillOfLadingHub.team.share`)}
          </Button>
        </Space>

        {/* Shared with */}
        <Divider plain />
        <div>
          <Title level={5} className="mt-0">
            {i18n(`newBillOfLadingHub.team.sharedWith`)}
          </Title>
          {/* <span className="float-right -mt-7">
            {currentNotificated}/{totalNotificated} {i18n('newBillOfLadingHub.team.notificationsRecipientsLeft')}{' '}
          </span> */}
        </div>

        {teammatesRender}

        {/* <Teammate />
        <Teammate></Teammate>
        <Teammate></Teammate> */}
        <Divider plain />

        {/* Copy Link */}
        <Title level={5} className="mt-4">
          {i18n(`newBillOfLadingHub.team.copyLink`)}
        </Title>
        <p>{i18n(`newBillOfLadingHub.team.copyDescription`)}</p>
        {/* <Space size={[8, 16]} wrap> */}
        <Input disabled className="w-full sm:w-96 mr-2 mb-2" value={hubLink} />
        <Button type="primary" onClick={copyToClipboard()}>
          {i18n(`newBillOfLadingHub.team.copyLink`)}
        </Button>
        {/* </Space> */}
      </Form>
    </div>
  )
}
