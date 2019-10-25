import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Reviews } from '../api/dbDefs.js';
import { Classes } from '../api/dbDefs.js';
import { Students } from '../api/dbDefs.js';

export class Statistics extends Component{
  constructor(props) {
    super(props);

    this.state={
      totalCS: -1,
      howManyEachClass: []
    }
    this.getTotalCs();
    this.howManyEachClass();
  }

  getTotalCs(){
      Meteor.call('totalCS', (error, result) =>{
        if(!error){
          this.setState({totalCS: result});
        //  return result;
      }else{
        console.log(error);
      }

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
        <p>{this.state.totalCS}</p>
          <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">Dept</th>
                <th scope="col">Num of courses</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.howManyEachClass.map(function(data) {
                  return(
                    <tr key={data._id}>
                      <th scope="row" key={data._id}>{data._id}</th>
                      <td key={data._id}>{data.total}</td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
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
