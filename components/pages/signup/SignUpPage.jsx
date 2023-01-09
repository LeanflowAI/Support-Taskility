import React from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { Button, Input, Form } from 'antd'
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons'
import { Link } from '../../ui-elements/link'
import { UserNotificationsContainer, UserNotification } from '../../ui-elements/user-notification'
import { AuthForm } from '../../layout/auth-form'
import { i18n } from '../../../services/i18n'
import { signup } from '../../../state/actions/index.ts'

export const SignUpPage = () => {
  const { isSigningUp = false, signupError = '' } = useSelector(state => state.user)
  const dispatch = useDispatch()

  const usernameRules = [{ required: true, message: i18n('signup.usernamePlaceholder') }]
  const emailRules = [{ required: true, message: i18n('signup.emailPlaceholder') }]
  const passwordRules = [{ required: true, message: i18n('signup.passwordPlaceholder') }]

  return (
    <AuthForm onFinish={formValues => dispatch(signup(formValues))} title={i18n('signup.title')}>
      <Form.Item name="username" rules={usernameRules}>
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder={i18n('signup.username')} />
      </Form.Item>
      <Form.Item name="email" rules={emailRules}>
        <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder={i18n('signup.email')} />
      </Form.Item>
      <Form.Item name="password" rules={passwordRules}>
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          placeholder={i18n('signup.password')}
          visibilityToggle={false}
        />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={isSigningUp} className="bg-transparent border-white hover:bg-white hover:text-primary">
        {i18n(isSigningUp ? 'signup.signingUp' : 'signup.signUpButton')}
      </Button>

      <div className="button-space" />
      <a href="/account-recovery" className="text-white hover:text-tkyBlue-lightest">{i18n('signup.goToRecovery')}</a>
      <a href="/login" className="text-white hover:text-tkyBlue-lightest">{i18n('signup.goToLogin')}</a>
      <UserNotificationsContainer>
        {signupError && <UserNotification type="error">{i18n(signupError)}</UserNotification>}
      </UserNotificationsContainer>
    </AuthForm>
  )
}
