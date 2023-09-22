import React, { useEffect, useState } from 'react'

import { SearchBar } from '../../SearchBar'
import ProfileDropdown from '../../Globals/ProfileDropdown'

import { useAuthOptionalLogin } from '../../../auth/auth_utils'

import DTITextLogo from '../../../assets/img/dti-text-logo.png'
import DTIWhiteLogo from '../../../assets/img/dti-text-white-logo.png'

import '../home.css'

/**
  Home Page. 
  
  Uppermost View component in the component tree, the first element of the HTML body tag grabbed by index.html.

  @returns the application homepage with a navbar and searchbar, popular
  classes and recent reviews components.

  @param imgSrc for search bar
  
*/
export const Home = (imgSrc: any) => {
  const [isLoggedIn, token, netId, signIn, signOut] = useAuthOptionalLogin()
  const [DTILogo, setDTILogo] = useState(DTITextLogo)
  const [season, setSeason] = useState('winter')
  const [time, setTime] = useState('afternoon')

  /** Logic for deciding the background image */
  const setBackground = () => {
    const sunset_start_times = [
      17.0, 17.5, 18, 19.5, 20, 20.5, 20.5, 19.5, 18.5, 18, 16.5, 16.5,
    ]
    const sunset_end_times = [
      18.5, 19, 20.5, 21, 22, 22, 22, 21.5, 20.5, 20, 19, 18,
    ]
    const date = new Date()
    const month = date.getMonth()
    const hours = date.getHours()
    const minutes = date.getMinutes()

    let time_of_day = hours
    if (minutes > 30) {
      time_of_day += 0.51
    }
    if (month === 11 || month === 0 || month === 1) {
      setSeason('winter')
    } else if (month >= 2 && month <= 4) {
      setSeason('spring')
    } else if (month >= 5 && month <= 7) {
      setSeason('summer')
    } else {
      setSeason('fall')
    }

    if (time_of_day < 6 || time_of_day >= sunset_end_times[month]) {
      setTime('night')
    } else if (time_of_day >= sunset_start_times[month]) {
      setTime('sunset')
    }
  }

  useEffect(() => {
    setBackground()
    if (time === 'night') {
      setDTILogo(DTIWhiteLogo)
    }
    console.log(`background-gradient_${time}${season}`)
  }, [time, season])

  /** Displays "sign in" or profile bear picture */
  const NavButton = () => {
    if (isLoggedIn) {
      return <ProfileDropdown netId={netId} signOut={signOut} />
    }
    return (
      <button
        type="button"
        className="sign-in-button"
        onClick={() => {
          signIn('home')
        }}
      >
        Sign In
      </button>
    )
  }

  return (
    <div className="row">
      <div
        className={`full-height background-common background-gradient_${time}${season}`}
      >
        <NavButton />

        <div className="row">
          <img
            src="/logo.svg"
            className="scale-logo-homepage"
            alt="CU Reviews Logo"
          />
        </div>
        <div className="row homepage-text-padding">
          <div className="col-xl-7 col-lg-7 col-md-12 col-sm-12 col-12">
            <div className="row">
              <p className="homepage-text">
                Search for Cornell courses, rate past classes, and share
                feedback
              </p>
            </div>
            <SearchBar
              imgSrc={`${String(imgSrc.imgSrc)}`}
              signOut={signOut}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>
        <div className="">
          <img src={DTILogo} className="dti-logo" alt="DTI Logo" />
        </div>
      </div>
    </div>
  )
}
