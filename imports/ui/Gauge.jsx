import React, { Component } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import PropTypes from 'prop-types';
import './css/Gauge.css';

export default class Gauge extends Component{
  constructor(props) {
    super(props);

    let percentage = 20*this.props.rating;
    let color= "rgba(0, 118, 255,"+percentage/100+")";

    this.state={
      color:color,
      percentage: percentage
    }
  }

  render(){
    return (
      <div style={{width: this.props.width, height: this.props.height}} className="gauge-center">
        <div className="row">
          <div className="col-md-5 col-md-offset-1 no-side-padding">
            <h1 className="gauge-text rating">
                {this.props.rating}
            </h1>
            <h1 className="gauge-bottom-text">
              {this.props.text}
            </h1>
          </div>
          <div className="col-md-6 no-side-padding">
            <div className="gauge-container">
              <CircularProgressbar value={this.state.percentage} strokeWidth={10} styles={buildStyles({ pathColor: this.state.color, strokeLinecap: "butt" })}/>
            </div>
          </div>
        </div>


      </div>
    )
  }
}

Gauge.propTypes ={
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  rating: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired
};
