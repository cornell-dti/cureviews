import React, { Component } from 'react';

type Props = {
  data: any[];
  title: string;
  col1: string;
  col2: string;
};

/*
  An accordian for the Statistics component.
*/
export default class Accordian extends Component<Props> {

  getRandNum() {
    return Math.floor((Math.random() * 1000000) + 0);
  }

  render() {
    let accId = "accordion" + this.getRandNum();
    let headingOneId = "headingOne" + this.getRandNum();
    let collapseOneId = "collapseOne" + this.getRandNum();

    return (
      <div id={accId} role="tablist" aria-multiselectable="true">
        <div className="card card-default">
          <div className="card-header" role="tab" id={headingOneId}>
            <h4 className="card-title">
              <a data-toggle="collapse" data-parent={"#" + accId} href={"#" + collapseOneId} aria-expanded="true" aria-controls={collapseOneId}>
                {this.props.title}
              </a>
            </h4>
          </div>
          <div id={collapseOneId} className="card-collapse collapse" role="tabpanel" aria-labelledby={headingOneId}>
            <div className="card-body">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">{this.props.col1}</th>
                    <th scope="col">{this.props.col2}</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.props.data.map(function (data) {
                      return (
                        <tr key={data._id}>
                          <th scope="row">{data._id}</th>
                          <td >{data.total}</td>
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
