/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react'
// import Image from 'next/image'
// import { useRouter } from 'next/router'
import { Typography, Button, Timeline, Popconfirm, message, Avatar, Tooltip } from 'antd'
import { EditOutlined, DeleteOutlined, UserOutlined, AntDesignOutlined } from '@ant-design/icons'
import { Location } from './locationCard'
import { i18n } from '../../../services/i18n'

// import next from 'next'

const { Title } = Typography

export const RouteTimeline = ({ locations = [], dispatch, disabled, usersList, loggedEmail, sharePermission = false}) => {
  return (
    <Timeline>
      {locations.map((location, index) => (
        <Location key={location?.place?._id} location={location} index={index} size={locations.length} dispatch={dispatch} disabled={disabled} usersList={usersList} loggedEmail={loggedEmail} sharePermission={sharePermission} />
        // eslint-disable-next-line react/no-array-index-key
        // <Timeline.Item key={index}>
        //   <div className="bg-tkyGrey-light pl-4 my-4 py-4 bg-opacity-40">
        //     <Title level={4}>
        //       {location.locationType.print === 'Origen'
        //         ? i18n('newBillOfLadingHub.newLocation.origin')
        //         : i18n('newBillOfLadingHub.newLocation.destination')}
        //       <Avatar.Group maxCount={3} className="float-right">
        //         <Avatar src="https://joeschmoe.io/api/v1/random" />
        //         <Avatar style={{ backgroundColor: '#f56a00' }}>K</Avatar>
        //         <Tooltip title="Ant User" placement="top">
        //           <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
        //         </Tooltip>
        //         <Avatar style={{ backgroundColor: '#1890ff' }} icon={<AntDesignOutlined />} />
        //       </Avatar.Group>
        //       {disabled ? (
        //         <Popconfirm
        //           title={i18n('newBillOfLadingHub.newLocation.deleteLocationConfirmation')}
        //           onConfirm={() => {
        //             dispatch({ type: 'Delete Location', payload: { index: index, size: locations.length } })
        //             message.success(i18n('newBillOfLadingHub.newLocation.locationDeletedMessage'))
        //           }}
        //           onCancel={() => message.error(i18n('newBillOfLadingHub.newLocation.locationNotDeletedMessage'))}
        //           okText={i18n('buttons.delete')}
        //           cancelText={i18n('buttons.cancel')}
        //         >
        //           <Button type="link" className="float-right mr-1 ml-1 pl-1 pr-4">
        //             <DeleteOutlined />
        //             {/* {i18n('buttons.delete')} */}
        //           </Button>
        //         </Popconfirm>
        //       ) : null}
        //       {disabled ? (
        //         <Button
        //           type="link"
        //           onClick={() => dispatch({ type: 'Edit Location', payload: { index: index, size: locations.length } })}
        //           className="float-right mx-2 px-0"
        //         >
        //           <EditOutlined /> {/*  {i18n('buttons.edit')} */}
        //         </Button>
        //       ) : null}
        //     </Title>
        //     <p>{location?.departureArrivalDateTime?.print}</p>
        //     <p>
        //       <strong>
        //         {location?.locationType?.print === 'Origen'
        //           ? i18n('newBillOfLadingHub.newLocation.sender')
        //           : i18n('newBillOfLadingHub.newLocation.recipient')}
        //       </strong>
        //     </p>
        //     <p>
        //       {location?.company?.name} | {location?.company?.rfc}
        //     </p>
        //     {location?.company?.rfc === 'XEXX010101000' ? (
        //       <p>
        //         {location?.company?.country} | {location?.company?.foreignFiscalId}
        //       </p>
        //     ) : null}
        //     <p>
        //       <strong>{i18n('newBillOfLadingHub.newLocation.address')}</strong>
        //     </p>
        //     <p>
        //       {i18n('newPlace.street')}: {location?.place?.satAddress?.street}
        //     </p>
        //     <p>
        //       {i18n('newPlace.exteriorNumber')}: {location?.place?.satAddress?.exteriorNumber}
        //       {location?.place?.satAddress?.interiorNumber !== undefined
        //         ? ` | ${i18n('newPlace.interiorNumber')}: ${location?.place?.satAddress?.interiorNumber}`
        //         : null}
        //     </p>
        //     <p>
        //       {location?.place?.satAddress?.country === 'MEX'
        //         ? `${i18n('newPlace.suburb')}: ${location?.place?.satAddress?.suburb?.satCode} - ${
        //             location?.place?.satAddress?.suburb?.satDescription
        //           }`
        //         : `${i18n('newPlace.suburb')}: ${location?.place?.satAddress?.suburb || location?.place?.satAddress?.locality}`}
        //     </p>
        //     <p>
        //       {location?.place?.satAddress?.country === 'MEX'
        //         ? `${i18n('newPlace.locality')}: ${location?.place?.satAddress?.locality?.satCode} - ${
        //             location?.place?.satAddress?.locality?.satDescription
        //           }`
        //         : `${i18n('newPlace.locality')}: ${location?.place?.satAddress?.locality}`}
        //     </p>
        //     <p>
        //       {location?.place?.satAddress?.country === 'MEX'
        //         ? `${i18n('newPlace.municipality')}: ${location?.place?.satAddress?.municipality?.satCode} - ${
        //             location?.place?.satAddress?.municipality?.satDescription
        //           }`
        //         : `${i18n('newPlace.municipality')}: ${location?.place?.satAddress?.municipality}`}
        //     </p>
        //     <p>
        //       {location?.place?.satAddress?.country === 'MEX'
        //         ? `${i18n('newPlace.state')}: ${location?.place?.satAddress?.politicalState?.satCode} - ${
        //             location?.place?.satAddress?.politicalState?.satDescription
        //           }`
        //         : `${i18n('newPlace.state')}: ${location?.place?.satAddress?.politicalState}`}
        //     </p>
        //     <p>
        //       {i18n('newPlace.country')}: {location?.place?.satAddress?.country}
        //     </p>
        //     <p>
        //       {i18n('newPlace.postalCode')}: {location?.place?.satAddress?.postalCode}
        //     </p>
        //   </div>
        // </Timeline.Item>
      ))}
    </Timeline>
  )
}
