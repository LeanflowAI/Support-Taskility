import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { Button, Form, Input } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { verifyAccountRecoveryToken, changeUserPassword } from '../../../state/actions/index.ts'
import { i18n } from '../../../services/i18n'
import { Link } from '../../ui-elements/link'
import { AuthForm } from '../../layout/auth-form'
import { UserNotificationsContainer, UserNotification } from '../../ui-elements/user-notification'

const VerifyingTokenForm = ({ isVerifyingToken, accountRecoveryTokenError }) => {
  return (
    <AuthForm title={i18n('passwordChange.title')}>
      <Link href="/login">{i18n('passwordChange.cancel')}</Link>
      <UserNotificationsContainer>
        {isVerifyingToken && (
          <UserNotification type="info">{i18n('passwordChange.messages.verifyingToken')}</UserNotification>
        )}
        {accountRecoveryTokenError && (
          <UserNotification type="error">{i18n(accountRecoveryTokenError)}</UserNotification>
        )}
      </UserNotificationsContainer>
    </AuthForm>
  )
}

const PasswordChangeForm = ({ token }) => {
  const { passwordChangeError = '', passwordChangeMessage = '', isChangingPassword } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const handleSubmit = inputs => dispatch(changeUserPassword(inputs))
  const passwordRules = [{ required: true }]

  return (
    <AuthForm onFinish={handleSubmit} title={i18n('passwordChange.title')} initialValues={{ token }}>
      <Form.Item name="token">
        <Input value={token} hidden />
      </Form.Item>
      <Form.Item name="newPassword" rules={passwordRules}>
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          placeholder={i18n('passwordChange.fields.newPassword')}
          visibilityToggle={false}
        />
      </Form.Item>
      <Form.Item name="repeatedPassword" rules={passwordRules}>
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          placeholder={i18n('passwordChange.fields.repeatedPassword')}
          visibilityToggle={false}
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={isChangingPassword}>
        {i18n('passwordChange.submitButton')}
      </Button>

      <div className="button-space" />
      {passwordChangeMessage && <Link href="/login">{i18n('passwordChange.goToLogin')}</Link>}
      <UserNotificationsContainer>
        {passwordChangeError && <UserNotification type="error">{i18n(passwordChangeError)}</UserNotification>}
        {passwordChangeMessage && <UserNotification type="success">{i18n(passwordChangeMessage)}</UserNotification>}
      </UserNotificationsContainer>
    </AuthForm>
  )
}

export const PasswordChangePage = () => {
  const { isVerifyingToken = true, accountRecoveryTokenError = '' } = useSelector(state => state.user)
  const [token1, setToken1] = useState(null)
  const router = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    const { token } = router.query
    // Check if password change token is valid
    if (token) {
      setToken1(token)
      dispatch(verifyAccountRecoveryToken(token))
    }
  }, [router.query])

  if (isVerifyingToken || accountRecoveryTokenError)
    return <VerifyingTokenForm {...{ isVerifyingToken, accountRecoveryTokenError }} />
  return <PasswordChangeForm token={token1} />
}
