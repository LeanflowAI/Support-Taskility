import React, { useState, useReducer } from 'react'
import { Space, Typography, Button, Card, Popconfirm, message, Avatar, Tooltip, Popover, Checkbox } from 'antd'
import { EditOutlined, DeleteOutlined, UserOutlined, AntDesignOutlined } from '@ant-design/icons'
import { i18n } from '../../../services/i18n'

export const AvatarGroupSelector = ({ usersArray, direction, size, onChange, defaultUsersArray }) => {
  if (!usersArray) return null
  if (!(usersArray instanceof Array)) return null

  // eslint-disable-next-line react/destructuring-assignment
  const listOfUsers = usersArray?.map(user => {
    return (
      <Checkbox checked={user?.checked ?? false} key={user?.name || user?.email} value={user?.email} disabled={user?.hubManager}>
        { (user?.name || user?.email) ?? i18n('noName')}
      </Checkbox>
    )
  })

  return (
    <Checkbox.Group onChange={onChange} defaultValue={defaultUsersArray}>
      <Space direction={direction ?? 'vertical'} size={size ?? 0}>
        {listOfUsers}
      </Space>
    </Checkbox.Group>
  )
}
