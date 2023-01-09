import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { Flex } from 'rebass'
import { Text } from '../text'
import { Title } from '../title'
import { ProgressBar } from '../progress-bar'

// TODO: 3 Lines max

const Card = styled(Flex)`
  min-width: 124px;
  width: 124px;
  height: 124px;
  padding: 12px;
  margin: 4px;
  background-color: ${({ theme }) => theme.colors.empty};
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.25);
`

const InnerGrid = styled(Flex)`
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
`

export const ProgressBarCard = ({ title, value, total }) => (
  <Card>
    <InnerGrid>
      <Text>{title}</Text>
      <Title level={2} pt="16px" textAlign="center">
        {value}
      </Title>
      <ProgressBar value={value} max={total} />
    </InnerGrid>
  </Card>
)

ProgressBarCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
}
