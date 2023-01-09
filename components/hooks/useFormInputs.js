import { useState } from 'react'

export const useFormInputs = onFormSubmit => {
  const [inputs, setInputs] = useState({})

  const handleSubmit = event => {
    if (event) {
      event.preventDefault()
    }
    onFormSubmit(inputs)
  }

  const handleInputChange = event => {
    event.persist()
    setInputs(currentInputs => ({ ...currentInputs, [event.target.name]: event.target.value }))
  }

  const setInput = (fieldName, value) => setInputs(currentInputs => ({ ...currentInputs, [fieldName]: value }))

  return { handleSubmit, handleInputChange, inputs, setInput }
}
