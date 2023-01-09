import React from 'react'
import { Space, Button, Select, Checkbox, Avatar, Popconfirm, message } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { i18n } from '../../../services/i18n'

const { Option } = Select

export const Teammate = ({
  user,
  index,
  parentDispatch,
  notifyCheckboxChange,
  writePermissionChange,
  viewPermissionChange,
  deleteUser,
  preferedLanguageChange,
  disabled = false,
}) => {
  const editDefaultOptions = [
    i18n('newBillOfLadingHub.team.title'),
    i18n('newBillOfLadingHub.generalInfo.title'),
    i18n('newBillOfLadingHub.locations.title'),
    i18n('newBillOfLadingHub.goods.title'),
    // i18n('newBillOfLadingHub.customs.title'),
    i18n('newBillOfLadingHub.transport.title'),
    i18n('newBillOfLadingHub.costs.title'),
    // i18n('newBillOfLadingHub.documents.title'),
  ]
  const editOptions = [
    { key: 'edit.share', value: i18n('newBillOfLadingHub.team.title') },
    { key: 'edit.generalInfo', value: i18n('newBillOfLadingHub.generalInfo.title') },
    { key: 'edit.locations', value: i18n('newBillOfLadingHub.locations.title') },
    { key: 'edit.goods', value: i18n('newBillOfLadingHub.goods.title') },
    // { key: 'edit.customs', value: i18n('newBillOfLadingHub.customs.title') },
    { key: 'edit.transports', value: i18n('newBillOfLadingHub.transport.title') },
    { key: 'edit.prices', value: i18n('newBillOfLadingHub.prices.title') },
    { key: 'edit.costs', value: i18n('newBillOfLadingHub.costs.title') },

    // { key: 'edit.documents', value: i18n('newBillOfLadingHub.documents.title')},
  ]
  const viewDefaultOptions = [
    i18n('newBillOfLadingHub.team.title'),
    i18n('newBillOfLadingHub.generalInfo.title'),
    i18n('newBillOfLadingHub.locations.title'),
    i18n('newBillOfLadingHub.goods.title'),
    // i18n('newBillOfLadingHub.customs.title'),
    i18n('newBillOfLadingHub.transport.title'),
    i18n('newBillOfLadingHub.prices.title'),
    i18n('newBillOfLadingHub.costs.title'),
    // i18n('newBillOfLadingHub.documents.title'),
    // i18n('newBillOfLadingHub.logs.title'),
  ]
  const viewOptions = [
    { key: 'view.share', value: i18n('newBillOfLadingHub.team.title') },
    { key: 'view.generalInfo', value: i18n('newBillOfLadingHub.generalInfo.title') },
    { key: 'view.locations', value: i18n('newBillOfLadingHub.locations.title') },
    { key: 'view.goods', value: i18n('newBillOfLadingHub.goods.title') },
    // { key: 'view.customs', value: i18n('newBillOfLadingHub.customs.title') },
    { key: 'view.transports', value: i18n('newBillOfLadingHub.transport.title') },
    { key: 'view.prices', value: i18n('newBillOfLadingHub.prices.title') },
    { key: 'view.costs', value: i18n('newBillOfLadingHub.prices.title') },
    // { key: 'view.documents', value: i18n('newBillOfLadingHub.documents.title')},
    // { key: 'view.logs', value: i18n('newBillOfLadingHub.logs.title') },
  ]
  const onCheckboxChange = e => {
    notifyCheckboxChange(e.target.checked, index)
  }
  const handleChangeEdit = value => {
    // console.log('Edit: ')
    // console.log(value)
    writePermissionChange(value, index)
  }
  const handleChangeView = value => {
    // console.log('View: ')
    // console.log(value)
    viewPermissionChange(value, index)
  }

  const handleChangeLanguage = value => {
    preferedLanguageChange(value, index)
  }

  return (
    <div className="grid grid-cols-12 gap-4 mb-10 mt-4" key={index}>
      <div className="col-span-2 sm:col-span-1">
        <Avatar className="mr-2 bg-tskyBlue" size="large">
          {user?.initials || ''}
        </Avatar>
      </div>
      <div className="col-span-10 sm:col-span-11">
        <div>
          <span className="mr-1">
            <strong>{user?.name !== '' ? user?.name : user?.email}</strong>
          </span>
          <span className="mr-1">
            <strong>{user?.lastName !== '' ? user?.lastName : ''}</strong>
          </span>
          <span className="italic">{user?.hubManager ? `(${i18n('newBillOfLadingHub.team.hubManager')})` : null}</span>
          <span className="float-right">
            <Space>
              <Checkbox checked={user?.notify} disabled={user?.hubManager || disabled} onChange={onCheckboxChange}>
                {i18n('newBillOfLadingHub.team.notificationsRecipient')}
              </Checkbox>
              {user?.hubManager || disabled ? null : (
                <Popconfirm
                  title={i18n('newBillOfLadingHub.team.deleteUserConfirmation')}
                  onConfirm={() => {
                    deleteUser(index)
                    message.success(i18n('newBillOfLadingHub.team.userDeletedMessage'))
                  }}
                  onCancel={() => message.error(i18n('newBillOfLadingHub.team.userNotDeletedMessage'))}
                  okText={i18n('buttons.delete')}
                  cancelText={i18n('buttons.cancel')}
                >
                  <Button type="link" className="float-right mr-1 ml-1 pl-1 pr-4">
                    <DeleteOutlined />
                    {/* {i18n('buttons.delete')} */}
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </span>
        </div>
        <div>
          <div className="mt-8 md:mt-2 mb-1">
            {i18n('newBillOfLadingHub.team.writingPermisions')}
            <Select
              className="w-full"
              mode="multiple"
              placeholder={i18n('newBillOfLadingHub.team.writingPermisions')}
              defaultValue={user?.writePermissions}
              onChange={handleChangeEdit}
              style={{ width: '100%' }}
              disabled={user?.hubManager || disabled}
              // options={editOptions}
            >
              <Option key="share" value="share">
                {i18n('newBillOfLadingHub.team.share')}
              </Option>
              <Option key="generalInfo" value="generalInfo">
                {i18n('newBillOfLadingHub.generalInfo.title')}
              </Option>
              <Option key="locations" value="locations">
                {i18n('newBillOfLadingHub.locations.title')}
              </Option>
              <Option key="goods" value="goods">
                {i18n('newBillOfLadingHub.goods.title')}
              </Option>
              <Option key="transports" value="transports">
                {i18n('newBillOfLadingHub.transport.title')}
              </Option>
              <Option key="prices" value="prices">
                {i18n('newBillOfLadingHub.prices.title')}
              </Option>
              <Option key="costs" value="costs">
                {i18n('newBillOfLadingHub.costs.title')}
              </Option>
            </Select>
          </div>
          <div className="mt-2 mb-1">
            {i18n('newBillOfLadingHub.team.readingPermisions')}
            <Select
              className="w-full"
              mode="tags"
              placeholder={i18n('newBillOfLadingHub.team.readingPermisions')}
              defaultValue={user?.viewPermissions}
              onChange={handleChangeView}
              style={{ width: '100%' }}
              disabled={user?.hubManager || disabled}
              // options={viewOptions}
              color="blue"
            >
              <Option key="share" value="share">
                {i18n('newBillOfLadingHub.team.share')}
              </Option>
              <Option key="generalInfo" value="generalInfo">
                {i18n('newBillOfLadingHub.generalInfo.title')}
              </Option>
              <Option key="locations" value="locations">
                {i18n('newBillOfLadingHub.locations.title')}
              </Option>
              <Option key="goods" value="goods">
                {i18n('newBillOfLadingHub.goods.title')}
              </Option>
              <Option key="transports" value="transports">
                {i18n('newBillOfLadingHub.transport.title')}
              </Option>
              <Option key="prices" value="prices">
                {i18n('newBillOfLadingHub.prices.title')}
              </Option>
              <Option key="costs" value="costs">
                {i18n('newBillOfLadingHub.costs.title')}
              </Option>
            </Select>
          </div>
          <div className="mt-2 mb-1">
            {i18n('newBillOfLadingHub.team.preferedLanguage')}
            <Select
              className="w-full"
              placeholder={i18n('newBillOfLadingHub.team.preferedLanguage')}
              defaultValue={user?.preferedLanguage}
              onChange={handleChangeLanguage}
              style={{ width: '100%' }}
              disabled={user?.hubManager || disabled}
              // options={viewOptions}
              color="blue"
            >
              <Option key="english" value="en">
                {i18n('newBillOfLadingHub.team.english')}
              </Option>
              <Option key="espanish" value="es">
                {i18n('newBillOfLadingHub.team.spanish')}
              </Option>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
