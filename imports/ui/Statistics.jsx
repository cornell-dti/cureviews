import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Reviews } from '../api/dbDefs.js';
import { Classes } from '../api/dbDefs.js';
import { Students } from '../api/dbDefs.js';
import Accordian from './Accordian.jsx';

export default class Statistics extends Component{
  constructor(props) {
    super(props);

    this.state={
      howManyEachClass: [],
      howManyReviewsEachClass: []
    }
    this.howManyEachClass();
    this.howManyReviewsEachClass();
  }

  howManyReviewsEachClass(){
    Meteor.call('howManyReviewsEachClass', (error, result) =>{
      if(!error)
        this.setState({howManyReviewsEachClass: result});
      else
        console.log(error);
    });
  }

  howManyEachClass(){
    Meteor.call('howManyEachClass', (error, result) =>{
      if(!error){
        this.setState({howManyEachClass: result});
        console.log(this.state.howManyEachClass);
      }else{
        console.log(error);
      }
    });
  }

  render(){
    return(
      <div>
        <Accordian data={this.state.howManyEachClass} title="Number of Courses in each Dept" col1="Dept" col2="Num of courses"/>
        <Accordian data={this.state.howManyReviewsEachClass} title="Num of Reviews in each Class" col1="Class" col2="Num of Reviews"/>
      </div>
    )
  }

}

//Statistics.propTypes = {
/*  classes: PropTypes.object.isRequired,
  course: PropTypes.object.isRequired,
  reviews: PropTypes.array.isRequired*/
  //totalCs: PropTypes.number.isRequired
//};

/*export default withTracker(props => {
  const totalCS = Reviews.find({classSub: "cs"}).count();
  return {
    totalCS
  };
}) (Statistics);*/
