import React, { Component } from 'react';

import { Session } from "../session-store";
// import Accordian from './Accordian';

import { LineChart } from 'react-chartkick';
import 'chart.js';
import axios from 'axios';
type Props = any
type State = {
  howManyEachClass: any[];
  howManyReviewsEachClass: any[];
  totalReviews: number;
  chartData: any[];
  step: number;
  range: number;
};


/*
  A Statistics component that gives data concerning the
  database and allows devs to moniter status and progress of the project
*/
export default class Statistics extends Component<Props, State>{
  constructor(props: Props) {
    super(props);

    this.state = {
      howManyEachClass: [],
      howManyReviewsEachClass: [],
      totalReviews: -1,
      chartData: [],
      step: 14,
      range: 12
    };

    this.handleClick = this.handleClick.bind(this);

  }

  componentDidMount() {
    this.getHowManyEachClass();
    this.howManyReviewsEachClass();
    this.totalReviews();
  }

  getChartData() {
    axios.post(`/v2/getReviewsOverTimeTop15`, { token: Session.get("token"), step: this.state.step, range: this.state.range })
      .then((resp) => {
        const res = resp.data.result;
        let data: any[] = [];
        //key-> EX: cs
        for (let key in res) {
          let finalDateObj: any = {};//{date1:totalNum, date2:totalNum}
          let obj: any = {}; // {name: cs, data: {date1:totalNum, date2:totalNum}}
          obj.name = key;

          //[{date1:totalNum}, {date2: totalNum}, ...]
          let arrDates = res[key];

          arrDates.forEach((arrEntry: any) => {
            let dateObject = Object.keys(arrEntry); //[date1]
            dateObject.forEach(date => {
              finalDateObj[date] = arrEntry[date]
            });
          });

          obj.data = finalDateObj;
          data.push(obj);
        }

        this.setState({ chartData: data });
      });
  }

  howManyReviewsEachClass() {
    axios.post(`/v2/howManyReviewsEachClass`, { token: Session.get("token") }).then((res) => {
      let data = res.data.result;
      data.sort((rev1: any, rev2: any) => (rev1.total > rev2.total) ? -1 : 1);
      this.setState({ howManyReviewsEachClass: data });
    }).catch((err) => {
      console.log("error retrieving reviews for each class ", err);
    })
  }

  getReviewsPerClassCSV() {
    let strRet = "class,total\n";
    this.state.howManyReviewsEachClass.forEach((obj) => {
      strRet += obj._id + "," + obj.total + "\n";
    });
    return strRet;
  }

  getHowManyEachClass() {
    axios.post(`/v2/howManyEachClass`, { token: Session.get("token") }).then((res) => {
      let data = res.data.result;
      data.sort((rev1: any, rev2: any) => (rev1.total > rev2.total) ? -1 : 1);
      this.setState({ howManyEachClass: data });
    }).catch((err) => {
      console.log("error retrieving how many each class ", err);
    });
  }

  totalReviews() {
    axios.post(`/v2/totalReviews`, { token: Session.get("token") }).then((res) => {
      const total = res.data.result;
      this.setState({ totalReviews: total });
    }).catch((err) => {
      console.log("error retrieving totalReviews ", err);
    })

  }

  handleClick = (e: any) => {
    e.preventDefault();
    this.getChartData();
  }

  downloadCSVFile = () => {
    const element = document.createElement("a");
    const file = new Blob([this.getReviewsPerClassCSV()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "ReviewsPerClass.csv";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  render() {
    return (
      <div>
        {/* <Accordian data={this.state.howManyEachClass} title="Number of Courses in each Dept" col1="Dept" col2="Num of courses" />
        <Accordian data={this.state.howManyReviewsEachClass} title="Number of Reviews in each Class" col1="Class" col2="Num of Reviews" /> */}
        <div>
          <button className="btn btn-primary" onClick={this.downloadCSVFile}>Download CSV For ReviewsPerClass</button>
        </div>
        <p>Total reviews: {this.state.totalReviews}</p>
        <LineChart width="77vw" height="55vh" data={this.state.chartData} />

        <div className="row align-bottom">
          <div className="row">
            <div className="col">
              <label htmlFor="range">Range in months</label>
              <input className="form-control " type="number" id="range" name="range" min="1" value={this.state.range} onChange={e => this.setState({ range: parseInt(e.target.value, 10) })} />
            </div>

            <div className="col">
              <label htmlFor="step">Step in days</label>
              <input className="form-control" type="number" id="step" name="step" min="1" value={this.state.step} onChange={e => this.setState({ step: parseInt(e.target.value, 10) })} />
            </div>
            <div className="col">
              <button type="button" className="btn btn-primary" onClick={this.handleClick}>Load Chart</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

}
