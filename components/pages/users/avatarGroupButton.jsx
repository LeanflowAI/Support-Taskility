import React, { useState, useReducer } from 'react'
import { Space, Typography, Button, Card, Popconfirm, message, Avatar, Tooltip, Popover, Checkbox } from 'antd'
import { EditOutlined, DeleteOutlined, UserOutlined, AntDesignOutlined } from '@ant-design/icons'
import { array } from '@google/maps/lib/internal/validate'
import { i18n } from '../../../services/i18n'
import { taskilityLightBluePersonalColorArray } from '../../ui-elements/colors/color-array'

export const AvatarGroupButton = ({usersArray, colors, placement, title, trigger, maxCount, size, content}) => {
  // console.log('usersArray in avatarGroupButton', usersArray)
  if (!usersArray) return 'Users array not exists'
  if (!(usersArray instanceof Array)) return 'Not an array'

  const colorsArray = colors ?? taskilityLightBluePersonalColorArray
    // GENERATE THE AVATARS LIST FROM usersArray
  // eslint-disable-next-line react/destructuring-assignment
  const avatarsList = usersArray?.map((user, index) => {

    // eslint-disable-next-line react/destructuring-assignment
    const circularIndex = index % colorsArray.length
    return (
      // eslint-disable-next-line react/destructuring-assignment
      <Avatar
        style={
          { 
            backgroundColor: colorsArray[circularIndex].color, 
            textColor: colorsArray[circularIndex].textColor 
          } 
          ?? 
          {
            backgroundColor: '#0085ff',
            textColor: '#ffffff'
          }
        }
        key={`${user?.initials}-${user?.name}`}
      >
        {user?.initials ?? '=)'}
      </Avatar>
    )
  })

  return (
    <Popover
      content={content ?? `Place content`}
      placement={placement ?? 'bottomRight'}
      title={title ?? 'Who can see this Item?'}
      trigger={trigger ?? 'click'}
    >
      <Button type="text">
        <Avatar.Group maxCount={maxCount ?? 4} size={size ?? 'small'}>
          {avatarsList}
        </Avatar.Group>
      </Button>
    </Popover>
  )
}
