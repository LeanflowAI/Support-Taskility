import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { useRouter } from 'next/router'
import actions from '../../../state/actions/index.ts'
import { i18n } from '../../../services/i18n'
import { Link } from '../../ui-elements/link'
import { AuthForm } from '../../layout/auth-form'
import { UserNotificationsContainer, UserNotification } from '../../ui-elements/user-notification'

const VerifyEmailPageComponent = ({ verifyEmailAccount, isVerifyingEmail, verifyEmailError, verifyEmailMessage }) => {
  const router = useRouter()
  useEffect(() => {
    const { token } = router.query
    if (token) {
      verifyEmailAccount({ token })
    }
  }, [router.query])

  // TODO: Redirect to login with error or success message.
  return (
    <AuthForm title={i18n('verifyEmail.title')}>
      <UserNotificationsContainer>
        {isVerifyingEmail && (
          <UserNotification type="info">{i18n('verifyEmail.messages.verifyingEmail')}</UserNotification>
        )}
        {verifyEmailError && <UserNotification type="error">{i18n(verifyEmailError)}</UserNotification>}
        {verifyEmailMessage && <UserNotification type="success">{i18n(verifyEmailMessage)}</UserNotification>}
      </UserNotificationsContainer>
      {(verifyEmailError || verifyEmailMessage) && (
        <Link color="inverse" href="/login">
          {i18n('verifyEmail.messages.goBack')}
        </Link>
      )}
    </AuthForm>
  )
}

VerifyEmailPageComponent.propTypes = {
  verifyEmailAccount: PropTypes.func.isRequired,
  isVerifyingEmail: PropTypes.bool,
  verifyEmailError: PropTypes.string,
  verifyEmailMessage: PropTypes.string,
}

VerifyEmailPageComponent.defaultProps = {
  isVerifyingEmail: false,
  verifyEmailError: '',
  verifyEmailMessage: '',
}

export const VerifyEmailPage = connect(state => state.user, actions)(VerifyEmailPageComponent)
