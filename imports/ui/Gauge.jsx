import React, { Component } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import PropTypes from 'prop-types';
import './css/Gauge.css';

export default class Gauge extends Component{
  constructor(props) {
    super(props);

    this.state={
      color:"#00000",
      percentage: 0.0,
      rating: 0.0
    }
  }

    componentDidUpdate(prevProps) {
      if (prevProps != this.props) {
        if(!isNaN(this.props.rating)){
          let percentage = 20*this.props.rating;
          let color= "hsl(212, 100%,"+(86-(percentage*.36))+"%)";
          console.log(color);
          this.setState({percentage: percentage, color: color, rating: this.props.rating});
        }
      }
  }

  render(){
    return (
      <div className="h-align">
        <div style={{width: this.props.width, height: this.props.height}} className="gauge-center">
          <div className="row">
            <div className="col-md-5 col-md-offset-1 no-side-padding">
              <h1 className="gauge-text rating">
                  {this.state.rating}
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
      </div>
    )
  }
}

Gauge.propTypes ={
  width: PropTypes.string.isRequired,
  height: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired
};
