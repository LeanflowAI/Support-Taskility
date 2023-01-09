import React, { useState } from 'react'
import useSWR from 'swr'
import { Space, Typography, Button, Card, Popconfirm, message, Divider, Drawer, Upload, Avatar, Tooltip } from 'antd'
import { EditOutlined, DeleteOutlined, UploadOutlined, UserOutlined, AntDesignOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { NewDocument } from './newDocument'
import { get } from '../../../services/fetch'
import { AvatarGroupSelector } from '../users/avatarGroupSelector'
import { AvatarGroupButton } from '../users/avatarGroupButton'
import { DocumentCard } from './documentCard'
import { AppLogo } from '../../layout/app-logo'
import { TransportDetail } from './transportDetail'

import { i18n } from '../../../services/i18n'

const { Text } = Typography

export const LandTransport = ({
  index,
  parentDispatch,
  transports,
  isEditing,
  disabled,
  usersList,
  loggedEmail,
  sharePermission = false,
  companyProfile,
}) => {
  const { autotransport, figures, company, authorizedUsers = [], documents = [], taskilityObjective } = transports[index]
  // authorizations
  const [isNewDocumentsVisible, setIsNewDocumentVisible] = useState(false)
  const [isEditTransportDetailVisible, setIsEditTransportDetailVisible] = useState(false)
  const usersForAvatarGroup = usersList?.filter(user => authorizedUsers.includes(user.email))
  // eslint-disable-next-line array-callback-return
  const avatarGroupSelector2 = (
    <AvatarGroupSelector
      usersArray={usersList}
      defaultUsersArray={authorizedUsers}
      onChange={e => parentDispatch({ type: 'Update Transport Authorization', payload: { usersEmails: e, itemIndex: index } })}
    />
  )

  const createDocumentCards = documents.map(document => {
    // console.log('document', document)
    return <DocumentCard file={document} key={document.fileId} />
  })
  const viewPermission = authorizedUsers.includes(loggedEmail)

  const onCloseNewDocument = () => {
    setIsNewDocumentVisible(false)
  }
  const uploadProps = {
    action: `/api/admin/transloadit/upload-file?hubId=123`,

    onChange({ file, fileList }) {
      // const { error, data } = useSWR(file ? `api/admin/transloadit/upload-file?hubId=123` : null, get, { dedupingInterval: 100 })
      const { ok, message } = fetch(file ? `/api/admin/transloadit/upload-file?hubId=123` : null, { method: 'POST', body: file })
      if (file.status !== 'uploading') {
        console.log(file, fileList)
        console.log('ok', ok)
        console.log('message', message)
      }
    },

    defaultFileList: [
      {
        uid: '1',
        name: 'Prueba de Entrega 1.png',
        status: 'done',
        response: 'Server Error 500',
        // custom error message to show
        url: 'http://www.baidu.com/xxx.png',
      },
      {
        uid: '2',
        name: 'Carta Porte.pdf',
        status: 'done',
        url: 'http://www.baidu.com/yyy.png',
      },
      {
        uid: '3',
        name: 'Carta Porte.xml',
        status: 'error',
        response: 'Server Error 500',
        // custom error message to show
        url: 'http://www.baidu.com/zzz.png',
      },
    ],
    showUploadList: {
      showDownloadIcon: true,
      downloadIcon: 'Download',
      showRemoveIcon: true,
    },
  }

  // const goodsRendered = () => {
  //   const goodsArray = goods.map(good =>
  // if (autotransport && figures)
  return (
    <div>
      {viewPermission ? (
        <Card className="w-full mt-2">
          <div>
            <Space className="float-right" size={12}>
              {sharePermission ? (
                <AvatarGroupButton
                  usersArray={usersForAvatarGroup}
                  content={avatarGroupSelector2}
                  title={i18n('hubSectionAvatarGroupSelector.title')}
                />
              ) : null}
              {/* <Button type="link" onClick={()=> parentDispatch({type: 'Stamp', payload: {index: index, transports: transports}})}>{i18n('newBillOfLadingHub.transport.stamp')}</Button> */}
              {disabled ? (
                <Button type="link" onClick={() => parentDispatch({ type: 'Edit a Transport', payload: { index: index } })}>
                  <EditOutlined />
                </Button>
              ) : null}
              {disabled ? (
                <Popconfirm
                  title={i18n('newBillOfLadingHub.newTransport.deleteTransportConfirmation')}
                  onConfirm={() => {
                    parentDispatch({ type: 'Delete a Transport', payload: { index: index } })
                    message.success(i18n('newBillOfLadingHub.newTransport.transportDeletedMessage'))
                  }}
                  onCancel={() => message.error(i18n('newBillOfLadingHub.newTransport.transportNotDeletedMessage'))}
                  okText={i18n('buttons.delete')}
                  cancelText={i18n('buttons.cancel')}
                >
                  <Button type="link">
                    <DeleteOutlined />
                  </Button>
                </Popconfirm>
              ) : null}
            </Space>
            <Space direction="vertical" size={0} className="w-2/3">
              <Text ellipsis style={{ width: '100%' }} className="text-xl">
                <strong>{company?.name}</strong>
              </Text>
              <Text ellipsis style={{ width: '100%' }} className="text-lg">
                {i18n('newBillOfLadingHub.transport.autotransport')}
              </Text>{' '}
            </Space>
          </div>

          <div>
            <Divider plain />
            {taskilityObjective !== 'Send BoL Data' ? (
              <Space className="float-right" size={12}>
                <Button onClick={() => setIsEditTransportDetailVisible(true)}>{i18n('buttons.edit')}</Button>
                <Button type="primary" className="float-right" onClick={() => parentDispatch({ type: 'Transport Complete by Index', payload: {index: index} })}>
                  {i18n('buttons.complete')}
                </Button>
              </Space>
            ) : null}
            <Space direction="vertical" size={0} className="w-2/3">
              <Text ellipsis style={{ width: '100%' }} className="text-lg">
                {i18n('newBillOfLadingHub.transport.detail')}
              </Text>{' '}
            </Space>
          </div>
          {autotransport ? (
            <div>
              <div className="mt-5">
                <Space>
                  <Text className="text-xs">
                    <strong>{i18n('newBillOfLadingHub.transport.vehicleIdentification')} </strong>
                  </Text>
                </Space>
              </div>
              <div className="mt-0">
                <Space>
                  <Text type="secondary" className="text-xs">
                    {i18n('newBillOfLadingHub.transport.vehicleNumber')}{' '}
                  </Text>
                  <Text>{autotransport?.vehicle?.number}</Text>
                </Space>
              </div>
              <div className="mt-0">
                <Space>
                  <Text type="secondary" className="text-xs">
                    {i18n('newBillOfLadingHub.transport.vehicleConfiguration')}{' '}
                  </Text>
                  <Text>{autotransport?.vehicle?.typeOfVehicleSAT}</Text>
                </Space>
              </div>
              <div className="mt-0">
                <Space>
                  <Text type="secondary" className="text-xs">
                    {i18n('newBillOfLadingHub.transport.licensePlate')}{' '}
                  </Text>
                  <Text>{autotransport?.vehicle?.plateNumber}</Text>
                </Space>
              </div>
              <div className="mt-0">
                <Space>
                  <Text type="secondary" className="text-xs">
                    {i18n('newBillOfLadingHub.transport.yearAndModel')}{' '}
                  </Text>
                  <Text>{autotransport?.vehicle?.modelYear}</Text>
                </Space>
              </div>
              <div className="mt-5">
                <Space>
                  <Text className="text-xs">
                    <strong>{i18n('newBillOfLadingHub.transport.sct')} </strong>
                  </Text>
                </Space>
              </div>
              <div className="mt-0">
                <Space>
                  <Text type="secondary" className="text-xs">
                    {i18n('newBillOfLadingHub.transport.numSCTPermit')}{' '}
                  </Text>
                  <Text>{autotransport?.vehicle?.SCTPermitNumber}</Text>
                </Space>
              </div>
              <div className="mt-0">
                <Space>
                  <Text type="secondary" className="text-xs">
                    {i18n('newBillOfLadingHub.transport.SCTPermit')}{' '}
                  </Text>
                  <Text>{autotransport?.vehicle?.SCTPermit}</Text>
                </Space>
              </div>
              <div className="mt-5">
                <Space>
                  <Text className="text-xs">
                    <strong>{i18n('newBillOfLadingHub.transport.trailers')} </strong>
                  </Text>
                </Space>
              </div>
              <div className="mt-0">
                <Space>
                  <Text type="secondary" className="text-xs">
                    {i18n('newBillOfLadingHub.transport.trailerNumber')}{' '}
                  </Text>
                  <Text>{autotransport?.trailers?.number}</Text>
                </Space>
              </div>
              <div className="mt-0">
                <Space>
                  <Text type="secondary" className="text-xs">
                    {i18n('newBillOfLadingHub.transport.trailerType')}{' '}
                  </Text>
                  <Text>{autotransport?.trailers?.typeOfTrailerSAT}</Text>
                </Space>
              </div>
              <div className="mt-0">
                <Space>
                  <Text type="secondary" className="text-xs">
                    {i18n('newBillOfLadingHub.transport.licensePlate')}{' '}
                  </Text>
                  <Text>{autotransport?.trailers?.plateNumber}</Text>
                </Space>
              </div>
              <div className="mt-5">
                <Space>
                  <Text className="text-xs">
                    <strong>{i18n('newBillOfLadingHub.transport.insurance')} </strong>
                  </Text>
                </Space>
              </div>
              <div className="mt-0">
                <Space>
                  <Text type="secondary" className="text-xs">
                    {i18n('newBillOfLadingHub.transport.civilResponsibility')}{' '}
                  </Text>
                  <Text>
                    {autotransport?.vehicle?.insurance?.civilResponsibility?.company} |{' '}
                    {autotransport?.vehicle?.insurance?.civilResponsibility?.policy}
                  </Text>
                </Space>
              </div>
              <div className="mt-0">
                <Space>
                  <Text type="secondary" className="text-xs">
                    {i18n('newBillOfLadingHub.transport.environmentalProtection')}{' '}
                  </Text>
                  <Text>
                    {autotransport?.vehicle?.insurance?.environmentalProtection?.company} |{' '}
                    {autotransport?.vehicle?.insurance?.environmentalProtection?.policy}
                  </Text>
                </Space>
              </div>
              <div className="mt-0">
                <Space>
                  <Text type="secondary" className="text-xs">
                    {i18n('newBillOfLadingHub.transport.load')}{' '}
                  </Text>
                  <Text>
                    {autotransport?.vehicle?.insurance?.environmentalProtection?.company} |{' '}
                    {autotransport?.vehicle?.insurance?.environmentalProtection?.policy}{' '}
                  </Text>
                </Space>
              </div>
              <div className="mt-5">
                <Space>
                  <Text className="text-xs">
                    <strong>{i18n('newBillOfLadingHub.transport.driver')} </strong>
                  </Text>
                </Space>
              </div>
            </div>
          ) : null}
          {figures ? (
            <div>
              <div className="mt-0">
                <Space>
                  <Text type="secondary" className="text-xs">
                    {i18n('newBillOfLadingHub.transport.typeOfFigure.name')}{' '}
                  </Text>
                  <Text>{figures ? figures[0].name : ''}</Text>
                </Space>
              </div>
              <div className="mt-0">
                <Space>
                  <Text type="secondary" className="text-xs">
                    {i18n('newBillOfLadingHub.transport.typeOfFigure.RFC')}{' '}
                  </Text>
                  <Text>{figures ? figures[0].rfc : ''}</Text>
                </Space>
              </div>
              <div className="mt-0">
                <Space>
                  <Text type="secondary" className="text-xs">
                    {i18n('newBillOfLadingHub.transport.typeOfFigure.licenseNumber')}{' '}
                  </Text>
                  <Text>{figures ? figures[0].document : ''}</Text>
                </Space>
              </div>
              <div className="mt-0">
                <Space>
                  <Text type="secondary" className="text-xs">
                    {i18n('newBillOfLadingHub.transport.typeOfFigure.typeOfFigure')}{' '}
                  </Text>
                  <Text>{figures ? figures[0].figureType : ''}</Text>
                </Space>
              </div>
            </div>
          ) : null}

          {/* Documents */}
          <Divider plain />
          <Space className="float-right" size={12}>
            <Button onClick={() => setIsNewDocumentVisible(true)}>Upload</Button>
          </Space>
          <Space direction="vertical" size={0} className="w-2/3">
            <Text ellipsis style={{ width: '100%' }} className="text-lg">
              {i18n('documents')}
            </Text>
          </Space>
          <Space direction="vertical" size={12} className="w-full mt-4">
            {createDocumentCards}
          </Space>
          <Drawer
            width="80%"
            onClose={onCloseNewDocument}
            visible={isNewDocumentsVisible}
            bodyStyle={{ paddingBottom: 80 }}
            // eslint-disable-next-line prettier/prettier
            // extra={
            //   <Space>
            //     <Button onClick={() => setIsLocationVisible(false)}>Cancel</Button>
            //     {/* <Button onClick={() => setIsLocationVisible(false)} type="primary">
            //       {i18n('buttons.submit')}
            //     </Button> */}
            //   </Space>
            //   // eslint-disable-next-line prettier/prettier
            // }
            key="drawerDocuments"
            destroyOnClose
          >
            <NewDocument
              dispatch={parentDispatch}
              setIsNewDocumentVisible={setIsNewDocumentVisible}
              userEmail={loggedEmail}
              index={index}
              company={company}
            />
          </Drawer>
          <Drawer
            width="80%"
            onClose={() => setIsEditTransportDetailVisible(false)}
            visible={isEditTransportDetailVisible}
            bodyStyle={{ paddingBottom: 80 }}
            destroyOnClose
            // eslint-disable-next-line prettier/prettier
            // extra={
            //   <Space>
            //     <Button onClick={() => setIsLocationVisible(false)}>Cancel</Button>
            //     {/* <Button onClick={() => setIsLocationVisible(false)} type="primary">
            //       {i18n('buttons.submit')}
            //     </Button> */}
            //   </Space>
            //   // eslint-disable-next-line prettier/prettier
            // }
            key={4}
          >
            <TransportDetail
              dispatch={parentDispatch}
              setIsTransportVisible={setIsEditTransportDetailVisible}
              transports={transports}
              index={index}
              isEditingTransport
              authorizedUsers={usersList}
              companyProfile={companyProfile}
            />
          </Drawer>

          {/* Taskility Action Status Bar */}
          <div>
            <Divider plain />
            <Space size={0} className="w-2/3">
              <AppLogo />
              <Text ellipsis style={{ width: '100%' }} className="text-md ml-8">
                {i18n('newBillOfLadingHub.transport.taskilityObjective')}
                {taskilityObjective === 'Stamp BoL Income' ? i18n(`newBillOfLadingHub.transport.stampBolIncome`) : null}
                {taskilityObjective === 'Stamp BoL Transport' ? i18n(`newBillOfLadingHub.transport.stampBolTransport`) : null}
                {taskilityObjective === 'Send BoL Data' ? i18n(`newBillOfLadingHub.transport.sendBolData`) : null}
              </Text>
            </Space>
          </div>
        </Card>
      ) : null}
    </div>
  )
  // return null
  // ))
}
