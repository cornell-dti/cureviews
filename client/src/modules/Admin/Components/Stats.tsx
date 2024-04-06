import React, { Component } from 'react'
import axios from 'axios'
import styles from '../Styles/Stats.module.css'
import { Review } from 'common'

type Props = {
  token: string
  reviews: Review[]
}
type State = {
  howManyEachClass: any[]
  howManyReviewsEachClass: any[]
  totalReviews: number
  chartData: any[]
  step: number
  range: number
}

/*
  A Statistics component that gives data concerning the
  database and allows devs to moniter status and progress of the project
*/
export default class Stats extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      howManyEachClass: [],
      howManyReviewsEachClass: [],
      totalReviews: 0,
      // keep this line or make a function to set the value?
      chartData: [],
      step: 14,
      range: 12,
    }

    this.handleClick = this.handleClick.bind(this)
  }

  componentDidMount() {
    this.totalReviews()
  //   this.getHowManyEachClass()
  //   this.howManyReviewsEachClass()
  }

  // Not running currently for some reason
  totalReviews() {
    this.setState({totalReviews: this.props.reviews.length})
  }

  getChartData() {
    axios
      .post(`/api/getReviewsOverTimeTop15`, {
        token: this.props.token,
        step: this.state.step,
        range: this.state.range,
      })
      .then((resp) => {
        const res = resp.data.result
        let data: any[] = []
        //key-> EX: cs
        for (let key in res) {
          let finalDateObj: any = {} //{date1:totalNum, date2:totalNum}
          let obj: any = {} // {name: cs, data: {date1:totalNum, date2:totalNum}}
          obj.name = key

          //[{date1:totalNum}, {date2: totalNum}, ...]
          let arrDates = res[key]

          arrDates.forEach((arrEntry: any) => {
            let dateObject = Object.keys(arrEntry) //[date1]
            dateObject.forEach((date) => {
              finalDateObj[date] = arrEntry[date]
            })
          })

          obj.data = finalDateObj
          data.push(obj)
        }

        this.setState({ chartData: data })
      })
  }

  howManyReviewsEachClass() {
    axios
      .post(`/api/howManyReviewsEachClass`, {
        token: this.props.token,
      })
      .then((res) => {
        let data = res.data.result
        data.sort((rev1: any, rev2: any) => (rev1.total > rev2.total ? -1 : 1))
        this.setState({ howManyReviewsEachClass: data })
      })
      .catch((err) => {
        console.log('error retrieving reviews for each class ', err)
      })
  }

  getReviewsPerClassCSV() {
    let strRet = 'class,total\n'
    this.state.howManyReviewsEachClass.forEach((obj) => {
      strRet += obj._id + ',' + obj.total + '\n'
    })
    return strRet
  }

  getHowManyEachClass() {
    axios
      .post(`/api/howManyEachClass`, {
        token: this.props.token,
      })
      .then((res) => {
        let data = res.data.result
        data.sort((rev1: any, rev2: any) => (rev1.total > rev2.total ? -1 : 1))
        this.setState({ howManyEachClass: data })
      })
      .catch((err) => {
        console.log('error retrieving how many each class ', err)
      })
  }

  handleClick = (e: any) => {
    e.preventDefault()
    this.getChartData()
  }

  downloadCSVFile = () => {
    const element = document.createElement('a')
    const file = new Blob([this.getReviewsPerClassCSV()], {
      type: 'text/plain',
    })
    element.href = URL.createObjectURL(file)
    element.download = 'ReviewsPerClass.csv'
    document.body.appendChild(element) // Required for this to work in FireFox
    element.click()
  }

  render() {
    return (
      <div className={styles.diagnosticbox}>
        <h2>Diagnostic information</h2>
        <div className = {styles.stats}>
          <button className="" onClick={this.downloadCSVFile}>
            Download CSV For ReviewsPerClass
          </button>
          <p>Total reviews: {this.props.reviews.length}</p>
        </div>
      </div>
    )
  }
}
