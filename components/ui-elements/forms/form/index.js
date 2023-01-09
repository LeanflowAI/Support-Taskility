import styled from 'styled-components'

const flexFlow = ({ formType }) => {
  const formTypes = {
    default: 'column',
    horizontal: 'row',
  }
  return formTypes[formType]
}

export const Form = styled.form`
  background: ${({ theme }) => theme.colors.empty};
  display: flex;
  flex-flow: ${flexFlow} wrap;
`

// TODO: Add styles for inner controls placement.
