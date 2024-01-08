import React, { useState } from 'react'
import axios from 'axios'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'
import styles from '../Styles/RaffleWinner.module.css'

type RaffleWinnerProps = {
  adminToken: string
}

export default function RaffleWinner({ adminToken }: RaffleWinnerProps) {
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [raffleWinner, setRaffleWinner] = useState('')

  const updateRaffleWinner = (startDate: Date) => {
    axios
      .post('/api/getRaffleWinner', {
        token: adminToken,
        startDate: startDate,
      })
      .then((response) => {
        const result = response.data.result
        if (response.status === 200) {
          setRaffleWinner(result.netId)
        } else {
          console.log('Error at getRaffleWinner')
        }
      })
  }

  return (
    <div className={`${styles.raffleContainer}`}>
      <DatePicker
        className={`${styles.raffleContainer}`}
        selected={startDate}
        onChange={(date: Date) => setStartDate(date)}
      ></DatePicker>
      <button
        type="button"
        className={`${styles.raffleButton} btn btn-warning`}
        onClick={() => updateRaffleWinner(startDate)}
      >
        Choose a Raffle Winner
      </button>
      <p className={`${styles.raffleWinner}`}>{raffleWinner}</p>
    </div>
  )
}
