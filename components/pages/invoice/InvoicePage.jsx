import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
// import { Document, Page } from 'react-pdf'
// import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5'
// import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack5'
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'
import { selectInvoice } from '../../../state/reducers'
import { loadInvoice } from '../../../state/actions/invoices-actions'
import { i18n } from '../../../services/i18n'
import { AppBody } from '../../layout/app-body'
import { LoggedUserMainLayout } from '../../layout/logged-user-main-layout'
import { Tabs, Tab, TabPanel } from '../../ui-elements/tabs'

const { Document, Page } = require('react-pdf')

// pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

const xsltText1 = `
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- Here is the magic: set indent to format the output -->
  <xsl:output omit-xml-declaration="yes" indent="yes"/>
  <!-- Match any element or attribute -->
  <xsl:template match="node()|@*">
    <xsl:copy>
      <xsl:apply-templates select="node()|@*"/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>
`

/**
 * Apply an XSLT to transform XML
 * @param {String} xmlText to format
 * @param {String} xsltText to apply
 * @returns {String} formatted XML on success, xmlText on failure
 */
function transformXML(xmlText, xsltText) {
  // Bomb out if this browser does not support DOM parsing and transformation
  if (!(window.DOMParser && window.XSLTProcessor)) {
    return xmlText
  }

  // Load the XSLT into a document
  const xsltDoc = new DOMParser().parseFromString(xsltText, 'text/xml')

  // Apply that document to as a stylesheet to a transformer
  const xslt = new XSLTProcessor()
  xslt.importStylesheet(xsltDoc)

  // Load the XML into a document.
  // Trim any preceding whitespace to prevent parse failure.
  const xml = new DOMParser().parseFromString(xmlText.trim(), 'text/xml')

  // Transform it
  const transformedXml = xslt.transformToDocument(xml)

  // Apply the transformed document if it was successful
  return !transformedXml ? xmlText : new XMLSerializer().serializeToString(transformedXml)
}

const getDecodedXmlData = xmlData => {
  try {
    return transformXML(atob(xmlData.split(',')[1]), xsltText1)
  } catch (e) {
    return ''
  }
}

const invoiceTabs = getProps => (
  <>
    <Tab {...getProps('pdf')}>PDF</Tab>
    <Tab {...getProps('xml')}>XML</Tab>
  </>
)
const tabPanels = (getProps, invoice, onPdfLoad, currentPage) => (
  <>
    <TabPanel {...getProps('pdf')}>
      <Document file={invoice.pdfData} onLoadSuccess={onPdfLoad}>
        <Page pageNumber={currentPage} />
      </Document>
    </TabPanel>
    <TabPanel {...getProps('xml')}>
      <div style={{ overflow: 'scroll', whiteSpace: 'pre' }}>{getDecodedXmlData(invoice.xmlData)}</div>
    </TabPanel>
  </>
)

export const InvoicePage = () => {
  const router = useRouter()
  const { invoiceId } = router.query
  const dispatch = useDispatch()
  const invoice = useSelector(selectInvoice(invoiceId))
  useEffect(() => dispatch(loadInvoice(invoiceId)), [])
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  if (!invoice) {
    return null // TODO: Error and loading states.
  }

  const onPdfLoad = ({ numPages: pages }) => setNumPages(pages)

  return (
    <LoggedUserMainLayout title={i18n('invoice.title')} tabTitle={invoice.folio}>
      <AppBody key="appBody">
        <Tabs
          defaultTab="pdf"
          tabs={getProps => invoiceTabs(getProps)}
          panels={getProps => tabPanels(getProps, invoice, onPdfLoad, currentPage)}
        />
      </AppBody>
    </LoggedUserMainLayout>
  )
}
