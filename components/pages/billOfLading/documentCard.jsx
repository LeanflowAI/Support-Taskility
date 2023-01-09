import React from 'react'
import { Card, Typography, Space, Button } from 'antd'
import {
  FileImageOutlined,
  FileOutlined,
  FileTextOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FilePdfOutlined,
  FileDoneOutlined,
  FileUnknownOutlined,
  FileZipOutlined,
  FileProtectOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import { dateFormat } from '../../../services/helpers/dateFormat'
import { formatFileSizeKb } from '../../../services/helpers/formatFileSize'
import { i18n } from '../../../services/i18n'

export const DocumentCard = ({ file }) => {
  let fileIcon
  // eslint-disable-next-line camelcase
  const { fileId, name, dateUploaded, sslUrl, userEmail, size, extension } = file
  switch (extension) {
    case 'pdf':
      fileIcon = <FilePdfOutlined />
      break
    case 'xml': {
      const { validCfdi = false } = file
      fileIcon = validCfdi ? <FileDoneOutlined twoToneColor="#53cf8c" /> : <FileTextOutlined />
      break
    }
    case 'xls':
      fileIcon = <FileExcelOutlined />
      break
    case 'xlsx':
      fileIcon = <FileExcelOutlined />
      break
    case 'xlsm':
      fileIcon = <FileExcelOutlined />
      break
    case 'xlsb':
      fileIcon = <FileExcelOutlined />
      break
    case 'xltx':
      fileIcon = <FileExcelOutlined />
      break
    case 'xltm':
      fileIcon = <FileExcelOutlined />
      break
    case 'xlt':
      fileIcon = <FileExcelOutlined />
      break
    case 'doc':
      fileIcon = <FileWordOutlined />
      break
    case 'docx':
      fileIcon = <FileWordOutlined />
      break
    case 'ppt':
      fileIcon = <FilePptOutlined />
      break
    case 'pptx':
      fileIcon = <FilePptOutlined />
      break
    case 'jpg':
      fileIcon = <FileImageOutlined />
      break
    case 'jpeg':
      fileIcon = <FileImageOutlined />
      break
    case 'gif':
      fileIcon = <FileImageOutlined />
      break
    case 'png':
      fileIcon = <FileImageOutlined />
      break
    case 'tiff':
      fileIcon = <FileImageOutlined />
      break
    case 'tif':
      fileIcon = <FileImageOutlined />
      break
    case 'eps':
      fileIcon = <FileImageOutlined />
      break
    case 'raw':
      fileIcon = <FileImageOutlined />
      break
    case 'zip':
      fileIcon = <FileZipOutlined />
      break
    default:
      fileIcon = <FileOutlined />
      break
  }
  return (
    <Card key={`${fileId}-${size}-${dateUploaded}`}>
      <Space className="float-right">
        {/* <DeleteOutlined /> */}
        {/* <Button type="link" href={sslUrl} target="_blank" rel="noopener noreferrer">
          <DownloadOutlined />
        </Button> */}
      </Space>
      <Space className="w-2/3">
        <Button type="link" href={sslUrl} target="_blank" rel="noopener noreferrer">
          <Typography.Text className="text-2xl">{fileIcon}</Typography.Text>
        </Button>
        <Space direction="vertical" size={0}>
          <Typography.Text className="text-xs" key="fileDateUploadedTitle">
            <a href={sslUrl} target="_blank" rel="noopener noreferrer">
              {name}
            </a>
          </Typography.Text>
          <Typography.Text className="text-xs" key="fileUserUploaded">
            {userEmail}
          </Typography.Text>
          <Typography.Text className="text-xs" key="fileDateUploaded">
            {dateFormat(new Date(dateUploaded), { format: 'DD-MMM-YY | HH:mm:ss' })}
          </Typography.Text>
          <Typography.Text className="text-xs" key="fileSize">
            {formatFileSizeKb(size)}
          </Typography.Text>
        </Space>
      </Space>
    </Card>
  )
}
