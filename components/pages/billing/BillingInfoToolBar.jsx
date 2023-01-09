import React, { useState } from 'react'
import { ToolBar, ToolBarToggleButton } from '../../ui-elements/tool-bar'
import { ProgressBarCard } from '../../ui-elements/progress-bar-card'
import { VerticalExpandable } from '../../ui-elements/vertical-expandable'
import { ToolBarSection } from '../../ui-elements/tool-bar-section/index.ts'

export const BillingInfoToolBar = () => {
  const [collapseState, setCollapsedState] = useState('initial')
  const buttonText = ['initial', 'collapsed'].includes(collapseState) ? '+' : '-'

  const toggleCollapsedState = () => {
    const newCollapsedState = ['initial', 'collapsed'].includes(collapseState) ? 'expanded' : 'collapsed'
    setCollapsedState(newCollapsedState)
  }

  return (
    <>
      <VerticalExpandable key="bar" expandedHeight={148} collapseState={collapseState}>
        <ToolBar color="inverse" height="auto" scrollX>
          <ToolBarSection>
            <ProgressBarCard title="Facturas en el mes" value={0} total={10} />
            <ProgressBarCard title="Facturado" value={1} total={10} />
            <ProgressBarCard title="IVA Transladado" value={2} total={10} />
            <ProgressBarCard title="IVA Retenido" value={3} total={10} />
            <ProgressBarCard title="Ingreso" value={10} total={10} />
            <ProgressBarCard title="Cancelado" value={5} total={10} />
          </ToolBarSection>
        </ToolBar>
      </VerticalExpandable>
      <ToolBarToggleButton key="toggle-btn" onClick={toggleCollapsedState}>
        {buttonText}
      </ToolBarToggleButton>
    </>
  )
}
