import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Input, Form } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { AuthForm } from '../../layout/auth-form'
import { i18n } from '../../../services/i18n'
import { Link } from '../../ui-elements/link'
import { UserNotificationsContainer, UserNotification } from '../../ui-elements/user-notification'
import { InputGroup, Label, UnderlinedInput } from '../../ui-elements/forms'
import { sendAccountRecoveryEmail } from '../../../state/actions/index.ts'

export const AccountRecoveryPage = () => {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()
  const handleSubmit = formInputs => dispatch(sendAccountRecoveryEmail(formInputs))

  const { isSendingAccountRecoveryEmail = false, accountRecoveryMessage = '', accountRecoveryError = '' } = user

  const emailRules = [{ required: true, message: i18n('accountRecovery.fields.emailPlaceholder') }]

  return (
    <AuthForm onFinish={handleSubmit} title={i18n('accountRecovery.title')}>
      <Form.Item name="email" rules={emailRules}>
        <Input
          prefix={<MailOutlined className="site-form-item-icon" />}
          placeholder={i18n('accountRecovery.fields.email')}
        />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={isSendingAccountRecoveryEmail} className="bg-transparent border-white hover:bg-white hover:text-primary">
        {i18n(isSendingAccountRecoveryEmail ? 'accountRecovery.messages.sendingEmail' : 'accountRecovery.submitButton')}
      </Button>

      <div className="button-space" />
      <a href="/login" className="text-white hover:text-tkyBlue-lightest">{i18n('accountRecovery.goBack')}</a>

      <UserNotificationsContainer>
        {accountRecoveryError && <UserNotification type="error">{i18n(accountRecoveryError)}</UserNotification>}
        {accountRecoveryMessage && <UserNotification type="success">{i18n(accountRecoveryMessage)}</UserNotification>}
      </UserNotificationsContainer>
    </AuthForm>
  )
}
