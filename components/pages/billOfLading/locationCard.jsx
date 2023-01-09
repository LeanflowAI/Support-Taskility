import React, { useState } from 'react'
import { Space, Typography, Button, Timeline, Popconfirm, message, Avatar, Tooltip } from 'antd'
import { EditOutlined, DeleteOutlined, UserOutlined, AntDesignOutlined } from '@ant-design/icons'
import { i18n } from '../../../services/i18n'
import { AvatarGroupButton } from '../users/avatarGroupButton'
import { AvatarGroupSelector } from '../users/avatarGroupSelector'
import { numberFormat } from '../../../services/helpers/mathHelp'

const { Title, Text } = Typography

export const Location = ({ location, index, size, dispatch, disabled, usersList, loggedEmail, sharePermission = false }) => {
  // Authorization
  const authorizedUsers = location?.authorizedUsers ?? []
  const usersForAvatarGroup = usersList?.filter(user => authorizedUsers.includes(user.email))
  // eslint-disable-next-line array-callback-return
  const avatarGroupSelector2 = (
    <AvatarGroupSelector
      usersArray={usersList}
      defaultUsersArray={authorizedUsers}
      onChange={e => dispatch({ type: 'Update Location Authorization', payload: { usersEmails: e, itemIndex: index } })}
    />
  )
  const viewPermission = authorizedUsers.includes(loggedEmail)

  return (
    <div>
      {viewPermission ? (
        <Timeline.Item key={index}>
          <div className="bg-tkyGrey-light pl-4 my-4 py-4 bg-opacity-40">
            {disabled ? (
              <Space className="float-right" size={12}>
                {sharePermission ? (
                  <AvatarGroupButton
                    usersArray={usersForAvatarGroup}
                    content={avatarGroupSelector2}
                    title={i18n('hubSectionAvatarGroupSelector.title')}
                  />
                ) : null}
                <Button
                  type="link"
                  onClick={() => dispatch({ type: 'Edit Location', payload: { index: index, size: size } })}
                  className="float-right mx-2 px-0"
                >
                  <EditOutlined /> {/*  {i18n('buttons.edit')} */}
                </Button>
                <Popconfirm
                  title={i18n('newBillOfLadingHub.newLocation.deleteLocationConfirmation')}
                  onConfirm={() => {
                    dispatch({ type: 'Delete Location', payload: { index: index, size: size } })
                    message.success(i18n('newBillOfLadingHub.newLocation.locationDeletedMessage'))
                  }}
                  onCancel={() => message.error(i18n('newBillOfLadingHub.newLocation.locationNotDeletedMessage'))}
                  okText={i18n('buttons.delete')}
                  cancelText={i18n('buttons.cancel')}
                >
                  <Button type="link" className="float-right mr-1 ml-1 pl-1 pr-4">
                    <DeleteOutlined />
                    {/* {i18n('buttons.delete')} */}
                  </Button>
                </Popconfirm>
              </Space>
            ) : null}
            <Space direction="vertical" size={0} className="w-2/3 mb-4">
              <Text ellipsis style={{ width: '100%' }} className="text-xl">
                <strong>
                  {location.locationType.print === 'Origen'
                    ? i18n('newBillOfLadingHub.newLocation.origin')
                    : i18n('newBillOfLadingHub.newLocation.destination')}
                </strong>
              </Text>
              <Text ellipsis style={{ width: '100%' }} className="text-md">
                {location?.departureArrivalDateTime?.print}
              </Text>{' '}
            </Space>
            <p>
              <strong>
                {location?.locationType?.print === 'Origen'
                  ? i18n('newBillOfLadingHub.newLocation.sender')
                  : i18n('newBillOfLadingHub.newLocation.recipient')}
              </strong>
            </p>
            <p>
              {location?.company?.name} | {location?.company?.rfc}
            </p>
            {location?.company?.rfc === 'XEXX010101000' ? (
              <p>
                {location?.company?.country} | {location?.company?.foreignFiscalId}
              </p>
            ) : null}
            <p>
              <strong>{i18n('newBillOfLadingHub.newLocation.address')}</strong>
            </p>
            <p>
              {i18n('newPlace.street')}: {location?.place?.satAddress?.street}
            </p>
            <p>
              {i18n('newPlace.exteriorNumber')}: {location?.place?.satAddress?.exteriorNumber}
              {location?.place?.satAddress?.interiorNumber !== undefined
                ? ` | ${i18n('newPlace.interiorNumber')}: ${location?.place?.satAddress?.interiorNumber}`
                : null}
            </p>
            <p>
              {location?.place?.satAddress?.country === 'MEX'
                ? `${i18n('newPlace.suburb')}: ${location?.place?.satAddress?.suburb?.satCode} - ${
                    location?.place?.satAddress?.suburb?.satDescription
                  }`
                : `${i18n('newPlace.suburb')}: ${location?.place?.satAddress?.suburb || location?.place?.satAddress?.locality}`}
            </p>
            <p>
              {location?.place?.satAddress?.country === 'MEX'
                ? `${i18n('newPlace.locality')}: ${location?.place?.satAddress?.locality?.satCode} - ${
                    location?.place?.satAddress?.locality?.satDescription
                  }`
                : `${i18n('newPlace.locality')}: ${location?.place?.satAddress?.locality}`}
            </p>
            <p>
              {location?.place?.satAddress?.country === 'MEX'
                ? `${i18n('newPlace.municipality')}: ${location?.place?.satAddress?.municipality?.satCode} - ${
                    location?.place?.satAddress?.municipality?.satDescription
                  }`
                : `${i18n('newPlace.municipality')}: ${location?.place?.satAddress?.municipality}`}
            </p>
            <p>
              {location?.place?.satAddress?.country === 'MEX'
                ? `${i18n('newPlace.state')}: ${location?.place?.satAddress?.politicalState?.satCode} - ${
                    location?.place?.satAddress?.politicalState?.satDescription
                  }`
                : `${i18n('newPlace.state')}: ${location?.place?.satAddress?.politicalState}`}
            </p>
            <p>
              {i18n('newPlace.country')}: {location?.place?.satAddress?.country}
            </p>
            <p>
              {i18n('newPlace.postalCode')}: {location?.place?.satAddress?.postalCode}
            </p>
          </div>
        </Timeline.Item>
      ) : null}
    </div>
  )
}
