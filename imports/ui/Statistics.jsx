import React, { Component } from 'react';

import Accordian from './Accordian.jsx';
import Gauge from './Gauge.jsx';

import { LineChart } from 'react-chartkick';
import 'chart.js';

/*
  A Statistics component that gives data concerning the
  database and allows devs to moniter status and progress of the project
*/
export default class Statistics extends Component{
  constructor(props) {
    super(props);

    this.state={
      howManyEachClass: [],
      howManyReviewsEachClass: [],
      totalReviews: -1,
      chartData: []
    }
    this.howManyEachClass();
    this.howManyReviewsEachClass();
    this.totalReviews();
    this.getChartData();
  }

  getChartData(){
    let data=[];
    //{cs: [{date1:totalNum}, {date2: totalNum}, ...], math: [{date1:total}, {date2: total}, ...] }
      Meteor.call('getReviewsOverTimeTop15', Session.get("token"), (err, res)=>{
        //key-> EX: cs
        for(let key in res){
          let finalDateObj={};//{date1:totalNum, date2:totalNum}
          let obj ={}; // {name: cs, data: {date1:totalNum, date2:totalNum}}
          obj.name=key;

          //[{date1:totalNum}, {date2: totalNum}, ...]
          let arrDates = res[key];

          arrDates.forEach((arrEntry)=>{
            let dateObject = Object.keys(arrEntry); //[date1]
            dateObject.map(date=>{
              finalDateObj[date]=arrEntry[date]
            });
          });

          obj.data=finalDateObj;
          data.push(obj);
        }
        console.log("clicked");
        this.setState({chartData: data});
      });
  }

  howManyReviewsEachClass(){
    Meteor.call('howManyReviewsEachClass', Session.get("token"), (error, result) =>{
      if(!error){
        //sort descending
        result.sort((rev1, rev2)=>(rev1.total > rev2.total)?-1:1);
        this.setState({howManyReviewsEachClass: result});
      } else{
          console.log(error);
      }
    });
  }

  howManyEachClass(){
    Meteor.call('howManyEachClass', Session.get("token"), (error, result) =>{
      if(!error){
        result.sort((rev1, rev2)=>(rev1.total > rev2.total)?-1:1);
        this.setState({howManyEachClass: result});
      }else{
        console.log(error);
      }
    });
  }

  totalReviews(){
    Meteor.call('totalReviews', Session.get("token"),(error, result)=>{
      if(!error)
        this.setState({totalReviews: result});
      else
        console.log(error);
    });
  }

  render(){
    return(
      <div>
        <Accordian data={this.state.howManyEachClass} title="Number of Courses in each Dept" col1="Dept" col2="Num of courses"/>
        <Accordian data={this.state.howManyReviewsEachClass} title="Number of Reviews in each Class" col1="Class" col2="Num of Reviews"/>
        <p>Total reviews: {this.state.totalReviews}</p>
        <LineChart width="77vw" height="55vh" data={this.state.chartData} />
          <Gauge width="14vw" height="14vh" rating={2.6} text="Workload"/>
      </div>
    )
  }

}
