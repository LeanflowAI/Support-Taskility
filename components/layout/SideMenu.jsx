import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Layout, Menu, Divider, Avatar, Typography, Button, Dropdown, Space, Tooltip } from 'antd'
import {
  DollarOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  MessageOutlined,
  LogoutOutlined,
  UserOutlined,
  DeploymentUnitOutlined,
  ContactsOutlined,
} from '@ant-design/icons'
import { useDispatch } from 'react-redux'
import { logout } from '../../state/actions/index.ts'

import { i18n } from '../../services/i18n'
import { post } from '../../services/fetch'

const { Text } = Typography

const LoggedUserMenu = ({loggedName, loggedEmail}) => {
  const dispatch = useDispatch()
  const onLogout = () => dispatch(logout())

  const menu = (
    <Menu>
      {/* <Menu.Item>
          <Button type="link" icon={<SettingOutlined />}>
            Configuración
          </Button>
        </Menu.Item> */}
      <Menu.Item>
        <Button type="link" onClick={onLogout}>
          <LogoutOutlined /> Cerrar sesión
        </Button>
      </Menu.Item>
    </Menu>
  )

  return (
    <div className="px-4 pt-3 pb-10 w-full">
      <Space>
        <Dropdown overlay={menu} placement="bottomLeft">
          <Avatar size="default" icon={<UserOutlined />} />
        </Dropdown>
        <Space direction="vertical" size={0} className="w-4/5 pl-2">
          <Tooltip title={loggedName} placement="bottomRight">
            <Text className="text-white w-max" ellipsis>
              {loggedName}
            </Text>
          </Tooltip>
          <Tooltip title={loggedEmail} placement="bottomRight">
            <Text className="text-white w-max" ellipsis>
              {loggedEmail}
            </Text>
          </Tooltip>
        </Space>
      </Space>
    </div>
  )
}

export const SideMenu = ({ collapsed, page }) => {
  // const [collapsed, toggleCollapsed] = useReducer(state => !state, true)
  const router = useRouter()
  const goTo = route => () => router.push(route)
  // console.log('SideMenu page = ', page)
  const [isBoLHAuthorized, setIsBoLHAuthorized] = useState(false)
  const [isBillingAuthorized, setIsBillingAuthorized] = useState(false)
  const [isBetaAuthorized, setIsBetaAuthorized] = useState(false)
  const [loggedEmail, setLoggedEmail] = useState()
  const [loggedName, setLoggedName] = useState()

  useEffect(() => {}, [isBoLHAuthorized, loggedEmail])

  post('/api/logged-user/get-authorizations')
    .then(({ ok, loggedUserLicenses, loggedUserEmail, loggedUserName, error }) => {
      if (loggedUserLicenses) {
        loggedUserLicenses.map(license => {
          if (license.licenseName === 'BoLHub') {
            setIsBoLHAuthorized(license.active)
          }
          if (license.licenseName === 'Billing') {
            setIsBillingAuthorized(license.active)
          }
          if (license.licenseName === 'BetaTester') {
            setIsBetaAuthorized(license.active)
          }
          return null
        })
      }
      if (loggedUserEmail) setLoggedEmail(loggedUserEmail)
      if (loggedUserName) setLoggedName(loggedUserName)

      // if (!error) setFinished('signed')
      // setApiError(error, details?.message || '')
    })
    // eslint-disable-next-line
    .catch(error => console.log(error))


  const dispatch = useDispatch()
  const onLogout = () => dispatch(logout())

  return (
    <Layout.Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      reverseArrow
      collapsedWidth={0}
      className="bg-tkyBlue-darkest h-screen sticky top-0 mb-0"
    >
      <LoggedUserMenu loggedName={loggedName} loggedEmail={loggedEmail} />
      <Menu
        defaultSelectedKeys={[page]}
        defaultOpenKeys={['sub1']}
        mode="inline"
        theme="dark"
        className="bg-tkyBlue-darkest"
        key="Menu Top"
      >
        <Menu.Item key="bill-of-lading" icon={<DeploymentUnitOutlined />} onClick={goTo('/bill-of-lading')} className="bg-tkyBlue-darkest">
          {i18n('billOfLading.title')}
        </Menu.Item>
        <Menu.Item key="customers" icon={<ContactsOutlined />} onClick={goTo('/customers')} className="bg-tkyBlue-darkest">
          {i18n('customers.title')}
        </Menu.Item>
        {isBillingAuthorized ? (
          <Menu.Item key="billing" icon={<DollarOutlined />} onClick={goTo('/billing')} className="bg-tkyBlue-darkest">
            {i18n('billing.title')}
          </Menu.Item>
        ) : null}
        {isBetaAuthorized ? (
          <Menu.Item key="users" icon={<TeamOutlined />} onClick={goTo('/users')} className="bg-tkyBlue-darkest">
            {i18n('users.title')}
          </Menu.Item>
        ) : null}
        {isBetaAuthorized ? (
          <Menu.Item key="new-quote" icon={<FileTextOutlined />} onClick={goTo('/new-quote')} className="bg-tkyBlue-darkest">
            {i18n('quotes.title')}
          </Menu.Item>
        ) : null}
      </Menu>
      <Divider />
      <Menu mode="inline" theme="dark" className="bg-tkyBlue-darkest absolute inset-x-0 bottom-0 mb-0" key="Menu bottom">
        <Menu.Item key="help" icon={<MessageOutlined />} onClick={goTo('/help')} className="bg-tkyBlue-darkest">
          {i18n('help.title')}
        </Menu.Item>
        <Menu.Item key="configuration" icon={<SettingOutlined />} onClick={goTo('/settings')} className="bg-tkyBlue-darkest">
          {i18n('settings.title')}
        </Menu.Item>
        <Menu.Item
          key="logout"
          icon={<LogoutOutlined />}
          onClick={onLogout}
          className="bg-tkyBlue-darkest text-tkyBlue hover:bg-tkyBlue hover:text-white active:bg-tkyBlue-dark mb-0"
        >
          {i18n('buttons.logout')}
        </Menu.Item>
      </Menu>
    </Layout.Sider>
  )
}
