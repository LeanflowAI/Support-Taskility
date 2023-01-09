import React, { useState, useReducer } from 'react'
import useSWR from 'swr'
import Router, { useRouter } from 'next/router'
import {
  Layout,
  Space,
  Button,
  Dropdown,
  Menu,
  Avatar,
  Empty,
  PageHeader,
  Card,
  Row,
  Col,
  Result,
  Tooltip,
  Divider,
  Radio,
  Spin,
  notification,
  Modal,
  Select,
  Switch,
} from 'antd'
import {
  LoadingOutlined,
  PlusOutlined,
  FilterOutlined,
  FontSizeOutlined,
  MoreOutlined,
  FileExcelOutlined,
  CloseCircleTwoTone,
  EditOutlined,
  UserOutlined,
} from '@ant-design/icons'
import parsePhoneNumber from 'libphonenumber-js'
import { i18n } from '../../../services/i18n'
import { post } from '../../../services/fetch'
import { downloadBase64File } from '../../../services/helpers/base64'
import { AppHeader } from '../../layout/AppHeader'
import { SideMenu } from '../../layout/SideMenu'

const { Option } = Select
const { Meta } = Card

// TODO: i18n "Ha ocurrido un error durante la operación"
const UsersListPageErrorState = ({ errorMessage }) => {
  const retryButton = (
    <Button href="/billing" type="primary" key="back">
      Reintentar
    </Button>
  )
  return <Result status="error" title={i18n('users.errorDuringOperation')} subTitle={i18n(errorMessage)} extra={retryButton} />
}

const UsersListPageLoadingState = () => <Empty image={<LoadingOutlined className="p-24 text-6xl" />} description="" />

const UsersListPageEmptyState = () => (
  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>{i18n('users.emptyPageDescription')}</span>} />
)

const UsersSubtitle = () => {
  return <div>{i18n('users.subtitle')}</div> // TODO: i18n
}

const DownloadUsersListCsvButton = ({ dateRange, reportType, label, tooltip, userType, userStatus, userClients }) => {
  const downloadCsv = () => {
    const url = `/api/user/list-csv?from=${dateRange[0].toISOString()}&to=${dateRange[1].toISOString()}&userType=${userType}&userStatus=${userStatus}&userClients=${userClients}&reportType=${reportType}`
    post(url)
      .then(({ csvData, count, error }) => {
        if (error) notification.error({ message: 'Error', description: i18n(error) })
        else if (count > 0) downloadBase64File(`data:text/csv;charset=utf-8;base64,${btoa(csvData)}`, `${reportType}.csv`)
      })
      .catch(error => notification.error({ message: 'Error', description: i18n(error.message) }))
  }
  // const disabled =
  //   userType && userType.length !== 0
  //     ? (reportType === 'billing' && !cfdiType.includes('invoice') && !cfdiType.includes('creditNote')) ||
  //       (reportType === 'paymentProofs' && !cfdiType.includes('paymentProof'))
  //     : false

  return (
    <Tooltip placement="topLeft" title={i18n(tooltip)} mouseEnterDelay={0} onClick={downloadCsv}>
      <Button icon={<FileExcelOutlined />} disabled style={{ width: '100%' }} className="text-left">
        {i18n(label)}
      </Button>
    </Tooltip>
  )
}

const UsersPageHeader = ({ userRole, userStatus, userClients, onUserRoleChange, onUserStatusChange, onUserClientsChange }) => {
  const router = useRouter()
  const selectToolbarReducer = (state, action) => {
    if (state === action) return ''
    return action
  }
  const [selectedToolbar, setSelectedToolbar] = useReducer(selectToolbarReducer, '')

  // Get Clients data to populate the Select Options in the Clients Filter
  const { data: clientsData, error: clientsError } = useSWR('/api/billing/get-all-user-clients', url => fetch(url).then(res => res.json()))
  // console.log(clientsData)
  // useEffect(() => setIssuers(issuersData?.issuers), [issuersData])

  if (clientsError) return <div>client error: {clientsError}</div>
  if (!clientsData || !clientsData.ok)
    return (
      <Card bordered={false} className="invoice-card w-full p-4">
        <Spin />
      </Card>
    )

  const toolBars = {
    appearance: (
      <Space>
        <Button icon={<FontSizeOutlined />} />
      </Space>
    ),
    filters: (
      // TODO: Make a separate component filtersToolBar
      <div className="text-left">
        <Divider orientation="right" plain>
          {i18n(`billing.toolbars.filters`)}
        </Divider>
        <Row gutter={[8, 8]} wrap justify="end">
          <Col className="gutter-row" xs={24} sm={12} md={6} lg={6} xl={4} xxl={3}>
            <Select
              showSearch
              onChange={onUserClientsChange}
              placeholder="Clientes"
              mode="multiple"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
              options={clientsData.clients.map(({ _id, name }) => ({ value: _id, label: name }))}
            />
          </Col>
          <Col className="gutter-row" xs={24} sm={12} md={6} lg={6} xl={4} xxl={3}>
            <Select
              onChange={onUserStatusChange}
              placeholder={i18n(`users.status.placeholder`)}
              style={{ width: '100%' }}
              mode="multiple"
              tokenSeparators={[',']}
            >
              <Option value="active">{i18n(`users.status.active`)}</Option>
              <Option value="deactivated">{i18n(`users.status.deactivated`)}</Option>
            </Select>
          </Col>
          <Col className="gutter-row" xs={24} sm={12} md={6} lg={6} xl={4} xxl={3}>
            <Select
              onChange={onUserRoleChange}
              placeholder={i18n(`users.role.placeholder`)}
              style={{ width: '100%' }}
              mode="multiple"
              tokenSeparators={[',']}
            >
              <Option value="generalManager">{i18n(`users.role.generalManager`)}</Option>
              <Option value="manager">{i18n(`users.role.manager`)}</Option>
              <Option value="customerService">{i18n(`users.role.customerService`)}</Option>
              <Option value="accounting">{i18n(`users.role.accounting`)}</Option>
              <Option value="user">{i18n(`users.role.user`)}</Option>
            </Select>
          </Col>
        </Row>
        <Divider orientation="right" plain>
          {i18n(`billing.toolbars.downloadCsvs`)}
        </Divider>
        <Row gutter={[8, 8]} wrap justify="end">
          {/* <Col className="gutter-row" xs={24} sm={12} md={6} lg={6} xl={4} xxl={3}>
        <DownloadUsersListCsvButton
          dateRange={dateRange}
          reportType="billing"
          label="billing.toolbars.downloadBillingCsv"
          tooltip="billing.toolbars.downloadBillingCsvTooltip"
          userType={userType}
          userStatus={userStatus}
          userClients={userClients}
        />
        </Col>
        <Col className="gutter-row" xs={24} sm={12} md={6} lg={6} xl={4} xxl={3}>
        <DownloadUsersListCsvButton
          dateRange={dateRange}
          reportType="paymentProofs"
          label="billing.toolbars.downloadPaymentsCsv"
          tooltip="billing.toolbars.downloadPaymentsCsvTooltip"
          userType={userType}
          userStatus={userStatus}
          userClients={userClients}
        />
        </Col>
        <Col className="gutter-row" xs={24} sm={12} md={6} lg={6} xl={4} xxl={3}>
        <DownloadUsersListCsvButton
          dateRange={dateRange}
          reportType="contpaq"
          label="billing.toolbars.downloadContpaqCsv"
          tooltip="billing.toolbars.downloadContpaqCsvTooltip"
          userType={userType}
          userStatus={userStatus}
          userClients={userClients}
        />
    </Col> */}
        </Row>
      </div>
    ),
    pills: <Space />,
  }

  const extra = (
    <Row gutter={[8, 0]} wrap justify="end" align="middle">
      <Col>
        <Radio.Group value={selectedToolbar} onChange={event => setSelectedToolbar(event.target.value)}>
          {/* <Radio.Button value="appearance" onClick={() => setSelectedToolbar('')}>
          <FontSizeOutlined />
  </Radio.Button> */}
          <Radio.Button value="filters" onClick={() => setSelectedToolbar('')}>
            <FilterOutlined />
          </Radio.Button>
          {/* <Radio.Button value="pills" onClick={() => setSelectedToolbar('')}>
          <BarChartOutlined />
</Radio.Button> */}
        </Radio.Group>
      </Col>
      <Col>
        <Divider type="vertical" />
      </Col>
      {/* <Radio.Group>
        <Radio.Button value="pills" onClick={() => setSelectedToolbar('')}>
          <BarChartOutlined />
        </Radio.Button>
        <Radio.Button value="pills" onClick={() => setSelectedToolbar('')}>
          <BarChartOutlined />
        </Radio.Button>
        <Radio.Button value="pills" onClick={() => setSelectedToolbar('')}>
          <BarChartOutlined />
        </Radio.Button>
      </Radio.Group>
      <Divider type="vertical" /> */}
      <Col>
        <Button key="add" type="link" icon={<PlusOutlined />} onClick={() => router.push('/new-cfdi')} />
      </Col>
    </Row>
  )

  return (
    <PageHeader ghost={false} title={i18n('users.title')} subTitle={<UsersSubtitle />} extra={extra} className="text-right py-1">
      {selectedToolbar && toolBars[selectedToolbar]}
    </PageHeader>
  )
}

const UserCard = ({ user }) => {
  // const userEnabledDefault = user.enabled
  const [enableUserInProgress, setEnableUserlInProgress] = useState(false)
  const [disableUserInProgress, setDisableUserlInProgress] = useState(false)
  const [deleteUserInProgress, setDeleteUserlInProgress] = useState(false)
  const [deleteUserModalVisible, setDeleteUserModalVisible] = useState(false)
  const [editUserType, setEditUserType] = useState(false)
  // const [isEnabled, setIsEnabled] = useState(userEnabledDefault)
  const handleChangeDeleteUserModalVisibility = isVisible => {
    setDeleteUserModalVisible(isVisible)
  }
  // console.log(`Is user enabled? ${user.username} : ${user.enabled}`)
  const fortmatPhoneNumber = phoneNumber => {
    if (typeof phoneNumber === 'string') {
      const unformatedPhone = parsePhoneNumber(phoneNumber)
      return unformatedPhone.formatInternational()
    }
    return null
  }
  const enableUser = userId => {
    if (enableUserInProgress) return
    setEnableUserlInProgress(true)
    post('/api/users/enable', { body: { user } })
      .then(({ ok, message, error }) => {
        if (error) notification.error({ message: 'Error', description: i18n(error) })
        // if (ok) notification.info({ message: 'Info', description: message })
      })
      .catch(error => notification.error({ message: 'Error', description: i18n(error.message) }))
      .finally(() => setEnableUserlInProgress(false))
  }
  const disableUser = userId => {
    if (disableUserInProgress) return
    setDisableUserlInProgress(true)
    // console.log(`UserPage: userId = ${userId}`)
    post('/api/users/disable', { body: { user } })
      .then(({ ok, message, error }) => {
        if (error) notification.error({ message: 'Error', description: i18n(error) })
        // if (ok) notification.info({ message: 'Info', description: message })
      })
      .catch(error => notification.error({ message: 'Error', description: i18n(error.message) }))
      .finally(() => setDisableUserlInProgress(false))
  }
  const onChangeUserEnabled = () => {
    if (user.enabled) {
      disableUser(user._id)
      // console.log(`Disabling User: ${user.username}`)
    } else {
      enableUser(user._id)
      // console.log(`Enabling User: ${user.username}`)
    }
  }
  const deleteUser = () => {
    if (deleteUserInProgress) return
    const deleteUserDetail = i18n('users.deleteUserDetail')
    Modal.confirm({
      title: `${i18n('users.deleteUserMessage')} ${user.username} ${user.userLastName}?`,
      content: (
        <div>
          <br />
          <div>{deleteUserDetail}</div>
          <br />
        </div>
      ),
      okText: i18n('delete'),
      okButtonProps: { danger: true },
      cancelText: i18n('cancel'),
      onOk: () => {
        setDeleteUserlInProgress(true)
        post('/api/users/delete', { body: { user } })
          .then(({ ok, message, error }) => {
            if (error) notification.error({ message: 'Error', description: i18n(error) })
            if (ok) notification.info({ message: 'Info', description: message })
          })
          .catch(error => notification.error({ message: 'Error', description: i18n(error.message) }))
          .finally(() => setDeleteUserlInProgress(false))
      },
    })
  }
  const handleUserTypeChange = userType => {
    // setEditUserType(!editUserType)
    post('/api/users/update-user-type', { body: { user, userType } })
      .then(({ ok, message, error }) => {
        if (error) notification.error({ message: 'Error', description: i18n(error) })
        // if (ok) notification.info({ message: 'Info', description: message })
      })
      .catch(error => notification.error({ message: 'Error', description: i18n(error.message) }))
      .finally(() => setEditUserType(false))
  }
  const userInitials = (name, lastName) => {
    const nameInitial = typeof name === 'string' ? name.charAt(0) : ''
    const lastNameInitial = typeof lastName === 'string' ? lastName.charAt(0) : ''
    const initials = `${nameInitial}${lastNameInitial}`
    return initials.toUpperCase()
  }
  const menu = (
    <Menu>
      {/* user.disabled ? (
        <Menu.Item
          icon={<CheckCircleTwoTone twoToneColor="#53cf8c" />}
          onClick={() => enableUser(user._id)}
          disabled={!user._id}
           >
          <span className="ml-2">{i18n('users.enableUser')}</span>
        </Menu.Item>
      ) : (
        <Menu.Item
          icon={<MinusCircleTwoTone twoToneColor="#f5c723" />}
          onClick={() => disableUser(user._id)}
          disabled={!user._id}>
          <span className="ml-2">{i18n('users.disableUser')}</span>
        </Menu.Item>
      ) */}
      <Menu.Item
        icon={<EditOutlined className="text-tkyBlue" />}
        onClick={() => Router.push(`/users/${user._id}/edit`)}
        disabled={user.deleted}
      >
        <span className="ml-2">{i18n('users.editUser')}</span>
      </Menu.Item>
      <Menu.Item icon={<UserOutlined className="text-tkyBlue" />} onClick={() => Router.push(`/users/${user._id}`)} disabled={user.deleted}>
        <span className="ml-2">{i18n('users.viewDetails')}</span>
      </Menu.Item>
      <Menu.Item
        icon={<CloseCircleTwoTone twoToneColor="#f97474" />}
        onClick={() => deleteUser(user._id, user.username)}
        disabled={user.deleted}
      >
        <span className="ml-2">{i18n('users.deleteUser')}</span>
      </Menu.Item>
    </Menu>
  )
  return (
    <Card
      bordered={!user.enabled}
      style={{ width: 300, height: 440 }}
      hoverable
      className={user.enabled ? '' : 'bg-tkyGrey-light bg-opacity-100 border-white'}
    >
      <div>
        <Switch
          checked={user.enabled}
          checkedChildren={i18n('users.status.active')}
          unCheckedChildren={i18n('users.status.disabled')}
          onChange={onChangeUserEnabled}
          loading={enableUserInProgress || disableUserInProgress}
        />
        <Dropdown className="text-right" overlay={menu} placement="bottomRight">
          <Button type="link" className="float-right" icon={<MoreOutlined />} />
        </Dropdown>
      </div>
      <div className="w-full mt-3 mb-4 pt-3 pb-4 flex justify-center">
        <Avatar
          size={120}
          alt={user.username}
          className="text-6xl bg-tkyGrey"
          src={user.profile.photo}
          onClick={() => Router.push(`/users/${user._id}`)}
        >
          {userInitials(user.username, user.lastname)}
        </Avatar>
      </div>
      <div className="w-full">
        <a href={`users/${user._id}`}>
          <span className="text-lg flex justify-center">{`${user.username}`}</span>
        </a>
      </div>
      {user.position ? (
        <div className="flex justify-center text-base">{user.position}</div>
      ) : (
        <div className="flex justify-center text-base text-tkyGrey">
          <span>{i18n('users.position')}</span>
        </div>
      )}
      <div className="flex justify-center text-sm mt-8">{user.emails[0].address ? user.emails[0].address : null}</div>
      {user.mobilePhone ? (
        <div className="flex justify-center text-sm mt-1">{fortmatPhoneNumber(user.mobilePhone)}</div>
      ) : (
        <div className="flex justify-center text-sm mt-1 text-tkyGrey">{i18n('users.mobile')}</div>
      )}
      {/* {editUserType ? (
        <div className="flex justify-left text-sm mt-1">
          <Select defaultValue={user.profile.userType} style={{ width: '100%' }} onChange={handleUserTypeChange}>
            <Option value="companyManager">{i18n('users.type.companyManager')}</Option>
            <Option value="manager">{i18n('users.type.manager')}</Option>
            <Option value="customerService">{i18n('users.type.customerService')}</Option>
            <Option value="accounting">{i18n('users.type.accounting')}</Option>
          </Select>
        </div>
      ) : ( */}
      <div className="flex justify-center text-sm mt-1">
        {i18n(`users.type.${user.profile.userType}`)}
        {/* {user.enabled ? (
          <EditOutlined className="ml-1 mt-1 text-white hover:text-tkyBlue" onClick={() => setEditUserType(!editUserType)} />
        ) : null} */}
      </div>
      {/* )} */}
    </Card>
  )
}

const UserList = ({ userRole, userStatus, userClients }) => {
  const listUrl = `/api/users/list?userRole=${userRole}&userStatus=${userStatus}&userClients=${userClients}`
  const { data, error } = useSWR(listUrl, url => post(url, {}), { refreshInterval: 5000 })

  if (error) return <UsersListPageErrorState errorMessage={error} />
  if (!data) return <UsersListPageLoadingState />
  if (data.error) return <UsersListPageErrorState errorMessage={data.error} />
  if (data.users.length === 0) return <UsersListPageEmptyState />

  return (
    <Row gutter={[16, 16]} className="pt-4 justify-center">
      {data.users.map(user => (
        <Col key={user._id}>
          <UserCard user={user} />
        </Col>
      ))}
    </Row>
  )
}

export const UsersPage = () => {
  const [collapsedMenu, setCollapsedMenu] = useState(true)
  const toggleMenu = () => {
    setCollapsedMenu(!collapsedMenu)
  }
  const [page, setPage] = useState('users')
  // console.log('UserPage page = ', page)
  return (
    <Layout className="min-h-screen" hasSider>
      <Layout>
        <AppHeader toggleMenu={toggleMenu} collapsed={collapsedMenu} />
        <Layout.Content className="p-4">
          <UsersPageHeader />
          <UserList />
        </Layout.Content>
      </Layout>
      <SideMenu collapsed={collapsedMenu} page={page} />
    </Layout>
  )
}
