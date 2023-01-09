import React from 'react'
import { Button } from 'antd'
import { Icon } from '../../ui-elements/icon'
import { Link } from '../../ui-elements/link'
import { Select } from '../../ui-elements/forms'
import { ActionsToolbar } from '../../ui-elements/tool-bar'
import { ToolBarSection } from '../../ui-elements/tool-bar-section/index.ts'
import { ResponsiveVisibilityToogle } from '../../layout'

const viewOptions = [
  { value: 'cobranza', label: 'Cobranza' },
  { value: 'facturas', label: 'Facturas' },
  { value: 'facturasMora', label: 'Facturas en mora' },
]

const moreOptions = [
  { value: '1', label: 'Cargar factura' },
  { value: '2', label: 'Nuevo comprobante' },
]

export const BillingActionsToolBar = () => (
  <ActionsToolbar>
    <ToolBarSection width={1 / 2}>
      <Select placeholder="Selección de vista" options={viewOptions} minWidth="87px" />
    </ToolBarSection>
    <ToolBarSection width={1}>
      <Link href="/" tabIndex="-1">
        <ResponsiveVisibilityToogle cssBreakpoint="480px">
          <Icon icon="share" />
          <Button color="subtle">Compartir</Button>
        </ResponsiveVisibilityToogle>
      </Link>
      <Link href="/" tabIndex="-1">
        <ResponsiveVisibilityToogle cssBreakpoint="480px">
          <Icon icon="save" />
          <Button color="subtle">Guardar</Button>
        </ResponsiveVisibilityToogle>
      </Link>
    </ToolBarSection>

    <ToolBarSection width={1} textAlign="right">
      <ResponsiveVisibilityToogle cssBreakpoint="720px">
        <Icon icon="more-options" />
        <Select placeholder="Más opciones" options={moreOptions} width="180px" />
      </ResponsiveVisibilityToogle>
      {/* TODO: Create a dropdown menu that looks like select but allowing
      to include components like LoadExternalInvoiceXmlModalForm */}
      {/* <LoadExternalInvoiceXmlModalForm>
        <Button>Cargar factura</Button>
      </LoadExternalInvoiceXmlModalForm> */}
      <Link href="/" tabIndex="-1">
        <Button color="primary">Agregar</Button>
      </Link>
    </ToolBarSection>
  </ActionsToolbar>
)
