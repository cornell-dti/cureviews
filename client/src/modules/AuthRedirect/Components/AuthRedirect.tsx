import React from 'react'
import { Redirect } from 'react-router'

import { setAuthToken } from '../../../auth/auth_utils'
import { Session } from '../../../session-store'

type Props = { location: { hash: string } }

/** 
Auth Redirect Component.

Component mainly for accepting user redirect from Google and redirecting user back to
the appropriate class (eg. /course/CS/2110) or admin page (eg. /admin)

Saves Google ID Token from URL parameters when Google redirects user back to this page
(eg. /auth/#id_token=abcd123)

*/

export const AuthRedirect = ({location}: Props) => {

  const googleHash = location.hash
  if (googleHash !== '') {
    const googleToken = googleHash
      .match(/(?=id_token=)([^&]+)/)![0]
      .split('=')[1]
    setAuthToken(googleToken)
  }

  const redirectFrom = Session.get('redirectFrom')

  if (redirectFrom === 'course') {
    return (
      <Redirect
        push
        to={`/course/${Session.get('review_major')}/${Session.get(
          'review_num'
        )}`}
      ></Redirect>
    )
  } else if (redirectFrom === 'admin') {
    return <Redirect push to={'/admin'}></Redirect>
  } else if (redirectFrom === 'profile') {
    return <Redirect push to={'/profile'}></Redirect>
  } else if (redirectFrom === 'home') {
    return <Redirect push to={'/'}></Redirect>
  } else if (redirectFrom.startsWith('path:')) {
    return (<Redirect push to={redirectFrom.replace('path:', '')} />)
  } else {
    return <Redirect push to={'/'}></Redirect>
  }
}