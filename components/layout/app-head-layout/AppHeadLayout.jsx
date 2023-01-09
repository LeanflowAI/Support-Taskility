import React from 'react'
import Head from 'next/head'

export const AppHeadLayout = ({ title = '', tabTitle = '' }) => {
  const appTitle = tabTitle || `Taskility ${title ? ` - ${title}` : ''}`

  return (
    <Head>
      <title>{appTitle}</title>
      <link rel="shortcut icon" type="image/png" href="/taskility-icon.png" />
      <link rel="manifest" href="/static/manifest.json" />
    </Head>
  )
}
