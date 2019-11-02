import React, { Component } from 'react';
import PropTypes from 'prop-types';

/*
  An accordian for the Statistics component.
*/
export default class Accordian extends Component{

  getRandNum(){
    return Math.floor((Math.random() * 1000000) + 0);
  }
    render(){
      let accId = "accordion"+this.getRandNum();
      let headingOneId = "headingOne"+this.getRandNum();
      let collapseOneId = "collapseOne"+this.getRandNum();

      return(
        <div className="panel-group" id={accId} role="tablist" aria-multiselectable="true">
          <div className="panel panel-default">
            <div className="panel-heading" role="tab" id={headingOneId}>
              <h4 className="panel-title">
                <a data-toggle="collapse" data-parent={"#"+accId} href={"#"+collapseOneId} aria-expanded="true" aria-controls={collapseOneId}>
                  {this.props.title}
                </a>
              </h4>
            </div>
            <div id={collapseOneId} className="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne">
              <div className="panel-body">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">{this.props.col1}</th>
                    <th scope="col">{this.props.col2}</th>
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
  data: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  col1: PropTypes.string.isRequired,
  col2: PropTypes.string.isRequired
};
