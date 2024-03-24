import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'

import axios from 'axios'

import { Review } from 'common'

import { useAuthMandatoryLogin } from '../../../auth/auth_utils'

import '../Styles/Admin.Costing.css'

import UpdateReview from '../../Admin/Components/AdminReview'
import Stats from '../../Admin/Components/Stats'
import RaffleWinner from '../../Admin/Components/RaffleWinner'

/** Admin Costing Page
 * Get costing estimates for GPT4 and GPT3.5 using data from courses that have
 * at least an x amount of reviews.
 */
export const AdminCosting = () => {
  const [minimumReviews, setMinimumReviews] = useState<number | "">("");
  const [totalTokens, setTotalTokens] = useState<number>(0)
  const [totalReviews, setTotalReviews] = useState<number>(0)
  const [totalChars, setTotalChars] = useState<number>(0)
  const [totalWords, setTotalWords] = useState<number>(0)
  const [avgWords, setAvgWords] = useState<number>(0)
  const [avgChars, setAvgChars] = useState<number>(0)
  const [avgTokens, setAvgTokens] = useState<number>(0)
  const [gpt4cost, setGpt4Cost] = useState<number>(0)
  const [gpt3cost, setGpt3Cost] = useState<number>(0)

  const { isLoggedIn, token, isAuthenticating } = useAuthMandatoryLogin('admin')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function confirmAdmin() {
      const res = await axios.post(`/api/tokenIsAdmin`, {
        token: token,
      })

      if (res.data.result) {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    }

    if (isLoggedIn) {
      confirmAdmin()
    }
  }, [isLoggedIn, token, isAuthenticating])

  // Takes in a minimum number of reviews selected from a dropdown menu.  
  // Gets data from all courses that have at least that number of reviews.
  function getCostingData(min: number, setTotalTokens: React.Dispatch<React.SetStateAction<number>>) {
    console.log('loading costing data...');

    axios.post('/ai/costing', { min })
      .then((response) => {
        const result = response.data.result;
        console.log('Costing Data Loaded');
        setTotalTokens(result.tokens);
        setTotalChars(result.chars);
        setTotalWords(result.words);
        setTotalReviews(result.reviews);
        setAvgTokens(result.avgtokens);
        setAvgWords(result.avgwords);
        setAvgChars(result.avgchar);
        setGpt3Cost(result.gpt3cost);
        setGpt4Cost(result.gpt4cost);
      })
      .catch((error) => {
        console.error('Error loading costing data:', error);
      });
  }

  function renderAdmin(token: string) {
    return (
      <div>
        <div className="heading">
          <h1>GPT Costing Page</h1>
          <label htmlFor="minReviews">For courses with minimum of</label>
          <select
            id="minReviews"
            value={minimumReviews}
            onChange={(e) => {
              const value = Number(e.target.value);
              setMinimumReviews(value);
              getCostingData(value, setTotalTokens);
            }}
          >
            <option value="100000">x</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
          </select>
          <span>reviews:</span>
        </div>

        <div className="gpt4">
          <h1>${gpt4cost}</h1>
          <h2>GPT-4 cost</h2>
          <p>$30/1M tokens input</p>
          <p>$60/1M tokens output</p>
        </div>
        <div className="gpt3">
          <h1>${gpt3cost}</h1>
          <h2>GPT-3.5 cost</h2>
          <p>$0.50/1M tokens input</p>
          <p>$1.50/1M tokens output</p>
        </div>

        <div className="other-numbers">
          <p>Number of total reviews: {totalReviews}</p>
          <p>Number of total words: {totalWords}</p>
          <p>Number of total characters: {totalChars}</p>
          <p>Number of total tokens: {totalTokens}</p>
          <p>Number of average words per review: {avgWords}</p>
          <p>Number of average characters per review: {avgChars}</p>
          <p>Number of average tokens per review: {avgTokens}</p>
        </div>
      </div>
    )
  }

  function adminLogin() {
    if (loading) {
      return <div>Loading...</div>
    } else if (isLoggedIn && token && isAdmin) {
      return renderAdmin(token)
    } else {
      return <Redirect to="/" />
    }
  }

  return adminLogin()
}
