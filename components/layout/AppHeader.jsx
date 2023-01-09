import React, { useState } from 'react'
import { Space, Layout, Select, Dropdown, Button, Menu, AutoComplete, Input, Avatar, Col, Row } from 'antd'
import useSWR from 'swr'
import { BellOutlined, SettingOutlined, LogoutOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons'
import { useDispatch } from 'react-redux'
import { AppLogo } from './app-logo'
import { logout } from '../../state/actions/index.ts'
import { get } from '../../services/fetch'
import { i18n } from '../../services/i18n'

// TODO: Keep search text even after a result has been selected
// TODO: Highlight serach text into results
const GlobalSearchInput = () => {
  const [searchText, setSearchText] = useState('')
  const { error, data } = useSWR(searchText ? `api/search/${searchText}` : null, get, { dedupingInterval: 100 })

  const renderSearchResultTitle = (title, href) => (
    <span>
      {title}
      <a href={href} className="float-right">
        Ver
      </a>
    </span>
  )

  const renderSearchResultItem = (href, title, count) => ({
    value: title,
    label: (
      <a className="flex justify-between" href={href}>
        <div>
          <strong>{title}</strong>
        </div>
        <span>{count}</span>
      </a>
    ),
  })

  const createAutocompleteOptions = () => {
    if (!searchText || error) return []
    return data?.searchResults
      ? data.searchResults.map(({ category, categoryUrl, items }) => ({
          label: renderSearchResultTitle(category, `/${categoryUrl}`),
          options: items.map(({ href, description, details }) => renderSearchResultItem(href, description, details)),
        }))
      : []
  }

  return (
    <AutoComplete dropdownMatchSelectWidth options={createAutocompleteOptions()} style={{width: '100%'}}>
      <Input.Search
        className="global-search-input"
        placeholder="Search..."
        onSearch={setSearchText}
        loading={!!searchText && !data}
        value={searchText}
      />
    </AutoComplete>
  )
}

// TODO: Use card style layout for notification details
const notificationsMenu = (
  <Menu>
    {/* <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="#">
        1st sample notification
      </a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="#">
        2nd sample notification
      </a>
    </Menu.Item>
    <Menu.Item>
      <a target="_blank" rel="noopener noreferrer" href="#">
        3rd sample notification
      </a>
    </Menu.Item> */}
  </Menu>
)

const LoggedUserMenu = () => {
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
    <Dropdown overlay={menu} placement="bottomRight">
      <Avatar size='default' icon={<UserOutlined />} />
    </Dropdown>
  )
}

export const AppHeader = ({toggleMenu, collapsed}) => {

  return (
    <Layout.Header className="bg-gradient-to-r from-tkyBlue-dark to-tkyBlue">
      <Row>
        <Col xs={collapsed ? 4 : 4} sm={8} md={8} lg={8} xl={8} xxl={8} className="text-left">
          <AppLogo />
        </Col>
        <Col xs={collapsed ? 8 : 0} sm={8} md={8} lg={8} xl={8} xxl={8} className="text-center">
          <GlobalSearchInput />
        </Col>
        <Col xs={collapsed ? 9 : 0} sm={7} md={7} lg={7} xl={7} xxl={7} className="text-right">
          <Dropdown overlay={notificationsMenu} placement="bottomRight">
            <Button type="default" className="border-none" ghost>
              <BellOutlined className="hover:text-tkyBlue-lightest text-white" />
            </Button>
          </Dropdown>
          {collapsed ? <LoggedUserMenu /> : null }
        </Col>
        <Col xs={collapsed ? 1 : 20} sm={1} md={1} lg={1} xl={1} xxl={1} className="text-right">
          <Button type="default" className="border-none " ghost onClick={toggleMenu}>
            <MenuOutlined className="hover:text-tkyBlue-lightest text-white" />
          </Button>          
        </Col>
        {/*
          <Space size="middle" className="float-right">
        <Select
          showSearch
          className="w-64"
          placeholder={i18n('companySelector.placeholder')}
          optionFilterProp="children"
          // onChange={onChange} onFocus={onFocus} onBlur={onBlur} onSearch={onSearch}
          // filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          <Select.Option value="jack">A1A Logistics</Select.Option>
          <Select.Option value="lucy">A1A Expedited</Select.Option>
          <Select.Option value="tom">A1A Trucking</Select.Option>
        </Select>
        </Space>
        */}
      
        
      </Row>
    </Layout.Header>
  )
}
