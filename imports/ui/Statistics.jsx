import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Reviews } from '../api/dbDefs.js';
import { Classes } from '../api/dbDefs.js';
import { Students } from '../api/dbDefs.js';
import Accordian from './Accordian.jsx';

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
      totalReviews: -1
    }
    this.howManyEachClass();
    this.howManyReviewsEachClass();
    this.totalReviews();
  }

  howManyReviewsEachClass(){
    Meteor.call('howManyReviewsEachClass', (error, result) =>{
      if(!error){
        //sort decending
        result.sort((rev1, rev2)=>(rev1.total > rev2.total)?-1:1);
        this.setState({howManyReviewsEachClass: result});
      } else{
          console.log(error);
      }
    });
  }

  howManyEachClass(){
    Meteor.call('howManyEachClass', (error, result) =>{
      if(!error){
        result.sort((rev1, rev2)=>(rev1.total > rev2.total)?-1:1);
        this.setState({howManyEachClass: result});
      }else{
        console.log(error);
      }
    });
  }

  totalReviews(){
    Meteor.call('totalReviews', (error, result)=>{
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
        <Accordian data={this.state.howManyReviewsEachClass} title="Num of Reviews in each Class" col1="Class" col2="Num of Reviews"/>
        <p>Total reviews: {this.state.totalReviews}</p>
    </div>
    )
  }

}
