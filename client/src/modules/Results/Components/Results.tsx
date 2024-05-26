import React, { Component } from 'react'
import axios from 'axios'

import Navbar from '../../Globals/Navbar'
import ResultsDisplay from './ResultsDisplay.jsx'

import styles from '../Styles/Results.module.css'

type ResultsProps = {
  match: {
    params: {
      input: string;
      type: string;
    };
  };
  history: any;
};

type ResultsLists = {
  courseList: any[];
  loading: boolean;
};

/**
 * Results Component
 * Used to render the results page. Uses Navbar and ResultsDisplay components directly.
 */
export class Results extends Component<ResultsProps, ResultsLists> {
  constructor(props: ResultsProps) {
    super(props)
    this.state = {
      courseList: [],
      loading: true,
    }

    this.updateResults = this.updateResults.bind(this)
  }

  async updateResults() {
    const response = await axios.post( `/api/search/get-courses`, {
      query: this.props.match.params.input.toLowerCase()
    })

    const courseList = response.data.result.courses
    this.setState({
      courseList: !courseList.error && courseList.length > 0 ? courseList : [],
      loading: false,
    })
  }

  componentDidUpdate(prevProps: ResultsProps) {
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
    );
  }
}
