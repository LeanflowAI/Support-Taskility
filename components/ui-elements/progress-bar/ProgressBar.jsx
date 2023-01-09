import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Box } from 'rebass'

const Bar = styled(Box)`
  padding: 0;
  width: ${({ value, max }) => (value / max) * 100}%;
  height: 8px;
  background: ${({ theme }) => theme.colors.secondary};
  border-radius: 4px;
`

const ColoredBar = styled(Bar)`
  background: linear-gradient(90deg, #0085ff, #4accf2);
  border-radius: 4px 0 0 4px;
`

export const ProgressBar = ({ value, max }) => (
  <Bar value={max} max={max}>
    <ColoredBar value={value} max={max} />
  </Bar>
)

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
}
