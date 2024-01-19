import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Session } from '../session-store'
import axios from 'axios'

export const setAuthToken = (token: string) => {
  Session.setPersistent({ token: token })
  if (Session.get('token') !== token) {
    console.log('Error saving token to session')
    return false
  }
  return true
}

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

export function useAuthMandatoryLogin(
  redirectFrom: string
): [boolean, string | null, string, boolean, () => void] {
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
        .post('/api/getStudentEmailByToken', {
          token: token,
        })
        .then((response) => {
          const res = response.data
          let verifiedEmail = ''

          if (response.status === 200) {
            verifiedEmail = res.result
          }

          setNetId(verifiedEmail.substring(0, verifiedEmail.lastIndexOf('@')))
        })
        .catch((e) => console.log(e.response))
    }

    setToken(token)
    setIsAuthenticating(false)
    setIsLoggedIn(true)
  }, [redirectFrom, history])

  return [isLoggedIn, token, netId, isAuthenticating, signOut]
}

export function useAuthOptionalLogin(): [
  boolean,
  string | null,
  string,
  (redirectFrom: string) => void,
  (redirectTo?: string) => void
] {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState(null)
  const [netId, setNetId] = useState('')

  const history = useHistory()

  useEffect(() => {
    const token = getAuthToken()

    if (token && token !== '') {
      axios
        .post('/api/getStudentEmailByToken', {
          token: token,
        })
        .then((response) => {
          const data = response.data
          var verifiedEmail = ''

          if (response.status === 200) {
            verifiedEmail = data.result
          }

          console.log(
            verifiedEmail.substring(0, verifiedEmail.lastIndexOf('@'))
          )
          const netId = verifiedEmail.substring(
            0,
            verifiedEmail.lastIndexOf('@')
          )
          setNetId(netId)
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

  return [isLoggedIn, token, netId, signIn, signOut]
}
