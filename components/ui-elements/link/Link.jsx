import React from 'react'
import NextLink from 'next/link'
import { Button } from 'antd'

// Using NextLink for navigation (properly handle client navigation without reloading)
export const Link = ({ href = '', children }) => {
  return (
    <NextLink href={href}>
      <Button type="link">{children}</Button>
    </NextLink>
  )
}
