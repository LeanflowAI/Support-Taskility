import React from 'react'
import Form from 'antd/lib/form/Form'
import { AppHeadLayout } from '../app-head-layout'
import { AppLogo } from '../app-logo'

export const AuthForm = props => {
  const { children, title } = props
  return (
    <div className="auth-page-container">
      <AppHeadLayout title={title} />
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Form className="auth-form" {...props}>
        <AppLogo className="auth-page" />
        {children}
        <div className="auth-form-text">
          {/* <div>Its breath is pure and healthy. It is an immense desert, where man is never lonely.</div>
          <div className="font-light">Dalai lama</div> */}
        </div>
      </Form>
    </div>
  )
}
