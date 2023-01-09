import styled from 'styled-components'
import { Flex as Base } from 'rebass'

const alignments = {
  left: 'flex-start',
  right: 'flex-end',
  center: 'center',
}

interface ToolBarSectionProps {
  textAlign?: keyof typeof alignments
}

export const ToolBarSection = styled(Base)`
  align-items: center;
  justify-content: ${({ textAlign = 'left' }: ToolBarSectionProps) => alignments[textAlign] || alignments.left};
  height: 100%;
  @media (min-width: 320px) {
    padding: 14px 4px;
  }
  @media (min-width: 480px) {
    padding: 14px 8px;
  }
  @media (min-width: 768px) {
    padding: 14px 20px;
  }
`
