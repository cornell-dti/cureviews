import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Session } from '../session-store'
import axios from 'axios'

/**
 * Sets the authentication token for each active session
 * @param token 
 * @returns `true` if token saving was successful, `false` otherwise
 */

export const setAuthToken = (token: string) => {
  Session.setPersistent({ token: token })
  if (Session.get('token') !== token) {
    console.log('Error saving token to session')
    return false
  }
  return true
}

/**
 * Checks to see if the user has a currently active token
 * @returns a user's session token or null if there is not a current one
 */

export const getAuthToken = () => {
  const token = Session.get('token')
  if (!token || token === '') {
    return null
  }
  const exp = JSON.parse(atob(token.split('.')[1])).exp
  if (token && token !== '' && exp > Math.floor(Date.now() / 1000)) {
    return token
  } else return null
}

/**
 * Manages the authentication for pages that require logging in
 * @param redirectFrom a path representing where the user is redirected to log in
 * @returns An object with the following fields:
 *    isLoggedIn denotes whether a user is logged in
 *    token returns the session token
 *    netid is the user's Cornell netid
 *    isAuthenticating returns whether the user is still being authenticated
 *    signOut is a function to sign out
 */

export function useAuthMandatoryLogin(redirectFrom: string): {
  isLoggedIn: boolean,
  token: string | null,
  netId: string,
  isAuthenticating: boolean,
  signOut: (redirectTo?: string) => void
} {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState(null)
  const [isAuthenticating, setIsAuthenticating] = useState(true)
  const [netId, setNetId] = useState('')
  const history = useHistory()

  const signOut = () => {
    setToken(null)
    Session.set('token', null)
    history.push('/')
  }

  useEffect(() => {
    const signIn = (redirectFrom: string) => {
      Session.setPersistent({ redirectFrom: redirectFrom })
      history.push('/login')
    }

    const token = getAuthToken()

    if (!token || token === '') {
      signIn(redirectFrom)
    } else {
      axios
        .post('/api/auth/get-email', {
          token: token,
        })
        .then((response) => {
          if (response.status === 200) {
            const verifiedEmail = response.data.result
            setNetId(verifiedEmail.substring(0, verifiedEmail.lastIndexOf('@')))
          }
        })
        .catch((e) => console.log(e.response))
    }

    setToken(token)
    setIsAuthenticating(false)
    setIsLoggedIn(true)
  }, [redirectFrom, history])

  return {
    isLoggedIn: isLoggedIn,
    token: token,
    netId: netId,
    isAuthenticating: isAuthenticating,
    signOut: signOut
  }
}

/**
 * Manages authentication for pages with optional login
 * @returns An object with the following fields:
 *    isLoggedIn denotes whether a user is logged in
 *    token returns the session token
 *    netid is the user's Cornell netid
 *    signIn is a function to sign in
 *    signOut is a function to sign out
 */

export function useAuthOptionalLogin(): {
  isLoggedIn: boolean,
  token: string | null,
  netId: string,
  signIn: (redirectFrom: string) => void,
  signOut: (redirectTo?: string) => void
} {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState(null)
  const [netId, setNetId] = useState('')

  const history = useHistory()

  useEffect(() => {
    const token = getAuthToken()

    if (token && token !== '') {
      axios
        .post('/api/auth/get-email', {
          token: token,
        })
        .then((response) => {
          if (response.status === 200) {
            const verifiedEmail = response.data.result
            setNetId(verifiedEmail.substring(0, verifiedEmail.lastIndexOf('@')))
          }
        })
        .catch((e) => console.log(e.response))

      setToken(token)
      setIsLoggedIn(true)
    }
  }, [])

  const signIn = (redirectFrom: string) => {
    Session.setPersistent({ redirectFrom: redirectFrom })
    history.push('/login')
  }

  const signOut = (redirectTo?: string) => {
    setIsLoggedIn(false)
    setToken(null)
    Session.set('token', null)
    if (redirectTo) {
      history.push(redirectTo)
    } else {
      window.location.reload()
    }
  }

  return {
    isLoggedIn: isLoggedIn,
    token: token,
    netId: netId,
    signIn: signIn,
    signOut: signOut
  }
}
