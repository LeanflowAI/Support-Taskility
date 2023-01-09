import React, { useState } from 'react'
import { Space, Typography, Button, Card, Popconfirm, message, Avatar, Tooltip, Popover, Checkbox } from 'antd'
import { EditOutlined, DeleteOutlined, UserOutlined, AntDesignOutlined } from '@ant-design/icons'
import { i18n } from '../../../services/i18n'
import { AvatarGroupButton } from '../users/avatarGroupButton'
import { AvatarGroupSelector } from '../users/avatarGroupSelector'
import { numberFormat } from '../../../services/helpers/mathHelp'

const { Text } = Typography

export const Good = ({ good, index, size, dispatch, disabled, usersList, loggedEmail, sharePermission = false }) => {
  // const usersArray = [
  //   { name: 'Francisco Insa', initials: 'FI', email:'francisco.insa@camex.com', authorized: true,  isHubManager: true},
  //   { name: 'Mario Aparicio', initials: 'MA', email:'mario.aparicio@camex.com', authorized: true, isHubManager: false},
  //   { name: 'Claudia Andrade', initials: 'CA', email:'clau.andrade@taskility.com', authorized: false, isHubManager: false },
  //   { name: 'Enrique Vargas', initials: 'EV', email:'evargas@a1alogistics.com', authorized: false, isHubManager: false },
  //   { name: 'Alejandro Cruz', initials: 'AC', email:'acruz@a1alogistics.com', authorized: true, isHubManager: false },
  //   { name: 'Adolfo Avila', initials: 'AA', email:'aavila@a1alogistics.com', authorized: true, isHubManager: false },
  //   { name: 'Germán Castro', initials: 'GC', email:'german@taskility.com', authorized: true, isHubManager: false },
  //   { name: 'Miguel Coss', initials: 'MC', email:'miguel.coss@carmi.com', authorized: false, isHubManager: false },
  // ]

  const authorizedUsers = good.authorizedUsers ?? []
  const usersForAvatarGroup = usersList?.filter(user => authorizedUsers.includes(user.email))
  // eslint-disable-next-line array-callback-return
  const avatarGroupSelector2 = (
    <AvatarGroupSelector
      usersArray={usersList}
      defaultUsersArray={authorizedUsers}
      onChange={e => dispatch({ type: 'Update Item Authorization', payload: { usersEmails: e, itemIndex: index } })}
    />
  )
  const viewPermission = authorizedUsers.includes(loggedEmail)

  return (
    <div>
      {viewPermission ? (
        <Card className="w-full mt-2" key={`${good?.productCode}-${index}`}>
          <div>
            {disabled ? (
              <Space className="float-right" size={12}>
                {sharePermission ? (
                  <AvatarGroupButton
                    usersArray={usersForAvatarGroup}
                    content={avatarGroupSelector2}
                    title={i18n('hubSectionAvatarGroupSelector.title')}
                  />
                ) : null}
                <Button type="link" onClick={() => dispatch({ type: 'Edit Item', payload: { index: index, size: size } })}>
                  <EditOutlined />
                </Button>
                <Popconfirm
                  title={i18n('newBillOfLadingHub.newItem.deleteItemConfirmation')}
                  onConfirm={() => {
                    dispatch({ type: 'Delete Item', payload: { index: index, size: size } })
                    message.success(i18n('newBillOfLadingHub.newItem.itemDeletedMessage'))
                  }}
                  onCancel={() => message.error(i18n('newBillOfLadingHub.newItem.itemNotDeletedMessage'))}
                  okText={i18n('buttons.delete')}
                  cancelText={i18n('buttons.cancel')}
                >
                  <Button type="link">
                    <DeleteOutlined />
                  </Button>
                </Popconfirm>
              </Space>
            ) : null}
            <Space direction="vertical" size={0} className="w-2/3">
              <Text ellipsis style={{ width: '100%' }} className="text-lg">
                <strong>{good.quantity || i18n('dataMissing')}</strong> {good.description || i18n('dataMissing')}
              </Text>{' '}
              <Text type="secondary">
                <span className="text-xs">{i18n('newBillOfLadingHub.goods.productNumber')} </span>{' '}
                <strong>{good.productCode || i18n('dataMissing')}</strong>{' '}
              </Text>
              <Text type="secondary">
                <span className="text-xs">{i18n('newBillOfLadingHub.goods.satCode')} </span>{' '}
                <strong>{good.satProductCode || i18n('dataMissing')}</strong>{' '}
              </Text>
              <Text type="secondary">
                <span className="text-xs">{i18n('newBillOfLadingHub.goods.unitCode')} </span>{' '}
                <strong>{good.satUnitKey || i18n('dataMissing')}</strong>{' '}
              </Text>
            </Space>
          </div>
          <div className="mt-5">
            <Space>
              <Text className="text-xs">
                <strong>{i18n('newBillOfLadingHub.goods.details')} </strong>
              </Text>
            </Space>
          </div>
          <div className="mt-0">
            <Space>
              <Text type="secondary" className="text-xs">
                {i18n('newBillOfLadingHub.goods.weight')}{' '}
              </Text>
              <Text>{numberFormat(good.weightInKg) || i18n('dataMissing')}</Text>
            </Space>
            <Space className="float-right">
              <Text type="secondary" className="text-xs">
                {i18n('newBillOfLadingHub.goods.value')}{' '}
              </Text>
              <Text>
                {good.currency || i18n('dataMissing')} {numberFormat(good.value) || i18n('dataMissing')}
              </Text>
            </Space>
          </div>
          <div className="mt-0">
            <Space>
              <Text type="secondary" className="text-xs">
                {i18n('newBillOfLadingHub.goods.dimensions')}{' '}
              </Text>
              <Text>
                {good.dimensions?.width || i18n('dataMissing')}/{good.dimensions?.height || i18n('dataMissing')}/
                {good.dimensions?.depth || i18n('dataMissing')}
                {good.dimensions?.unitMeasure || i18n('dataMissing')}
              </Text>
            </Space>
          </div>
          <div className="mt-0">
            <Space>
              <Text type="secondary" className="text-xs">
                {i18n('newBillOfLadingHub.goods.packaging')}{' '}
              </Text>
              <Text ellipsis style={{ width: '100%' }}>
                {good.packagingCode || i18n('dataMissing')} - {good.packagingDescription || i18n('dataMissing')}
              </Text>
            </Space>
          </div>
          <div className="mt-5">
            <Space>
              <Text className="text-xs">
                <strong>{i18n('newBillOfLadingHub.goods.dangerousMaterial')} </strong>
              </Text>
            </Space>
          </div>
          <div className="mt-0">
            <Space>
              <Text type="secondary" className="text-xs">
                {i18n('newBillOfLadingHub.goods.dangerousMaterial')}{' '}
              </Text>
              {good.dangerousMaterial ? (
                <Text>{i18n(`newBillOfLadingHub.goods.${good.dangerousMaterial}`)}</Text>
              ) : (
                <Text>{i18n(`dataMissing`)}</Text>
              )}
            </Space>
          </div>
          <div className="mt-0">
            <Space>
              <Text type="secondary" className="text-xs">
                {i18n('newBillOfLadingHub.goods.dangerousMaterialCode')}{' '}
              </Text>
              <Text>{good.dangerousMaterialCode || i18n('dataMissing')}</Text>
            </Space>
          </div>
          <div className="mt-5">
            <Space>
              <Text className="text-xs">
                <strong>{i18n('newBillOfLadingHub.goods.customs')} </strong>
              </Text>
            </Space>
          </div>
          <div className="mt-0">
            <Space>
              <Text type="secondary" className="text-xs">
                {i18n('newBillOfLadingHub.goods.fraccionArancelaria')}{' '}
              </Text>
              <Text>{good.tariffCode || i18n('dataMissing')}</Text>
            </Space>
          </div>
          <div className="mt-0">
            <Space>
              <Text type="secondary" className="text-xs">
                {i18n('newBillOfLadingHub.goods.pedimentos')}{' '}
              </Text>
              <Text>{good.pedimento || i18n('dataMissing')}</Text>
            </Space>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
