import React from 'react'
import App from 'next/app'
import { useFormContext } from 'react-hook-form'
import { ThemeProvider } from 'styled-components'
import { Provider } from 'react-redux'
import { useAuthSync } from '../components/hooks/useAuthSync'
import { defaultTheme } from '../components/ui-elements/themes'
import { i18nInit } from '../services/i18n'
import configureStore from '../state/configureStore.ts'
import '../components/ui-elements/styles/main.css'

// import * as serviceWorker from '../services/serviceWorker.ts' // TODO: Add service worker

// eslint-disable-next-line react/prop-types
const TaskilityApp = ({ Component, pageProps, requestedLanguage }) => {
  useAuthSync()
  // TODO: Load and pass the real user
  i18nInit({ user: {}, requestedLanguage })
  const store = configureStore({})
  return (
    // eslint-disable-next-line
    <Provider store={store}>
      <ThemeProvider theme={defaultTheme}>
        {/* eslint-disable-next-line */}
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  )
}

TaskilityApp.getInitialProps = async appContext => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext)
  const requestedLanguage = appContext.ctx.req?.headers['accept-language']
  return { ...appProps, requestedLanguage }
}

export default TaskilityApp
