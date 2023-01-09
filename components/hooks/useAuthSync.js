import { useEffect } from 'react'
import Router from 'next/router'

/**
 * When the user log in/out, keep all openened tabs synced.
 * @param {*} event
 */
const syncUserAuthState = event => {
  if (event.key === 'logout') {
    Router.push('/login')
  }
  if (event.key === 'token') {
    Router.push('/')
  }
}

export const useAuthSync = () => {
  useEffect(() => {
    window.addEventListener('storage', syncUserAuthState)
    return () => {
      window.removeEventListener('storage', syncUserAuthState)
      localStorage.removeItem('logout')
    }
  }, [])
}
