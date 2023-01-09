import React from 'react'
import Document from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class TaskilityDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      // eslint-disable-next-line
      ctx.renderPage = () => originalRenderPage({ enhanceApp: App => props => sheet.collectStyles(<App {...props} />) })
      const initialProps = await Document.getInitialProps(ctx)
      const styles = (
        // eslint-disable-next-line react/react-in-jsx-scope
        <div id="taskility-document-styles">
          {initialProps.styles}
          {sheet.getStyleElement()}
        </div>
      )
      return { ...initialProps, styles }
    } finally {
      sheet.seal()
    }
  }
}
