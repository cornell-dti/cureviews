import React, { Component } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import Navbar from '../../Globals/Navbar.tsx'
import ResultsDisplay from './ResultsDisplay.jsx'

import styles from '../Styles/Results.module.css'
/**
 * Results Component
 * Used to render the results page. Uses Navbar and ResultsDisplay components directly.
 * @Props uses params from URL
 */
export class Results extends Component {
  constructor(props) {
    super(props)
    this.state = {
      courseList: [],
      loading: true,
    }

    this.updateResults = this.updateResults.bind(this)
  }

  updateResults() {
    if (this.props.match.params.type === 'major') {
      axios
        .post('/api/getCoursesByMajor', {
          query: this.props.match.params.input.toLowerCase(),
        })
        .then((response) => {
          const courseList = response.data.result
          if (!courseList.error && courseList.length > 0) {
            // Save the Class object that matches the request
            this.setState({
              courseList: courseList,
              loading: false,
            })
          } else {
            this.setState({
              courseList: [],
              loading: false,
            })
          }
        })
    } else if (this.props.match.params.type === 'professor') {
      axios
        .post('/api/getCoursesByProfessor', {
          query: this.props.match.params.input.toLowerCase(),
        })
        .then((response) => {
          const courseList = response.data.result
          if (!courseList.error && courseList.length > 0) {
            // Save the Class object that matches the request
            this.setState({
              courseList: courseList,
              loading: false,
            })
          } else {
            this.setState({
              courseList: [],
              loading: false,
            })
          }
        })
    } else if (this.props.match.params.type === 'keyword') {
      let userQuery = this.props.match.params.input.split('+').join(' ')
      if (userQuery && userQuery.split(' ').length === 1) {
        userQuery = userQuery.match(/[a-z]+|[^a-z]+/gi).join(' ')
      }
      axios
        .post(`/api/getClassesByQuery`, { query: userQuery })
        .then((response) => {
          const queryCourseList = response.data.result
          if (queryCourseList.length !== 0) {
            // Save the Class object that matches the request
            this.setState({
              courseList: queryCourseList,
              loading: false,
            })
          } else {
            this.setState({
              courseList: [],
              loading: false,
            })
          }
        })
        .catch((e) => console.log('Getting courses failed!'))
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({
        courseList: [],
        loading: true,
      })
      this.updateResults()
    }
  }

  componentDidMount() {
    this.updateResults()
  }

  render() {
    const userInput = this.props.match.params.input.split('+').join(' ')
    return (
      <div className={styles.page}>
        <Navbar userInput={userInput} />

        <ResultsDisplay
          courses={this.state.courseList}
          history={this.props.history}
          userInput={userInput}
          loading={this.state.loading}
          type={this.props.match.params.type}
        />
      </div>
    )
  }
}

Results.propTypes = {
  match: PropTypes.object,
}
