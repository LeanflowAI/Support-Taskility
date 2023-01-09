import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Input, Form } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { Link } from '../../ui-elements/link'
import { UserNotificationsContainer, UserNotification } from '../../ui-elements/user-notification'
import { AuthForm } from '../../layout/auth-form'
import { i18n } from '../../../services/i18n'
import { login } from '../../../state/actions/index.ts'

// TODO: Show spinner over the entire form while the loggin is in progress
// TODO: UI stucked on login if there's no server response (server down).

export const LoginPage = () => {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()

  const { isLoggingIn = false, loginError = '' } = user
  const emailRules = [{ required: true, message: i18n('login.emailPlaceholder') }]
  const passwordRules = [{ required: true, message: i18n('login.passwordPlaceholder') }]

  const onFinish = formInputs => {
    console.log({ formInputs })
    dispatch(login(formInputs))
  }

  return (
    <AuthForm onFinish={onFinish} title={i18n('login.title')}>
      <Form.Item name="email" rules={emailRules}>
        <Input bordered prefix={<MailOutlined className="site-form-item-icon" />} placeholder={i18n('login.email')} />
      </Form.Item>
      <Form.Item name="password" rules={passwordRules}>
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          placeholder={i18n('login.password')}
          visibilityToggle={false}
        />
      </Form.Item>
      <Button
        name="login-btn"
        type="primary"
        htmlType="submit"
        loading={isLoggingIn}
        className="bg-transparent border-white hover:bg-white hover:text-primary"
      >
        {i18n(isLoggingIn ? 'login.loggingIn' : 'login.loginButton')}
      </Button>

      <div className="button-space" />
      <a href="/account-recovery" className="text-white hover:text-tkyBlue-lightest">
        {i18n('login.goToRecovery')}
      </a>
      <a href="/signup" className="text-white hover:text-tkyBlue-lightest">
        {i18n('login.goToSignUp')}
      </a>

      <UserNotificationsContainer>
        {loginError && <UserNotification type="warning">{i18n(loginError)}</UserNotification>}
      </UserNotificationsContainer>
    </AuthForm>
  )
}
