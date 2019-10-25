import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Accordian extends Component{
    render(){
      return(
        <div className="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
          <div className="panel panel-default">
            <div className="panel-heading" role="tab" id="headingOne">
              <h4 className="panel-title">
                <a data-toggle="collapse" data-parent="#accordion" href="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                  Number of Courses in each Dept
                </a>
              </h4>
            </div>
            <div id="collapseOne" className="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne">
              <div className="panel-body">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Dept</th>
                    <th scope="col">Num of courses</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.props.data.map(function(data) {
                      return(
                        <tr key={data._id1}>
                          <th scope="row" key={data._id2}>{data._id}</th>
                          <td key={data._id3}>{data.total}</td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>

      )
    }
}

Accordian.propTyes ={
  data: PropTypes.object.isRequired
};
