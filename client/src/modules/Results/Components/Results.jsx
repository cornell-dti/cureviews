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
    axios
      .post('/api/getResultsFromQuery', {
        query: this.props.match.params.input.toLowerCase(),
      })
      .then((response) => {
        const subjectList = response.data.result.subjects
        const professorList = response.data.result.professors
        const courseList = response.data.result.courses
        this.setState({
          subjectList: !subjectList.error && subjectList.length > 0 ? subjectList : [],
          professorList: !professorList.error && professorList.length > 0 ? professorList : [],
          courseList: !courseList.error && courseList.length > 0 ? courseList : [],
          loading: false,
        })
      })
      .catch((e) => console.log('Getting subjects, professors, or courses failed!'))
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({
        subjectList: [],
        professorList: [],
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
          subjects={this.state.subjectList}
          professors={this.state.professorList}
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
