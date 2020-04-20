import React, { Component } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import PropTypes from 'prop-types';
import './css/Gauge.css';

let initState={  
  color:"#00000",
  percentage: 0.0,
  rating: 0.0};

export default class Gauge extends Component{
  constructor(props) {
    super(props);

    this.state=initState;
    this.updateRating=this.updateRating.bind(this);
    this.componentDidUpdate=this.componentDidUpdate.bind(this);
  }

    componentDidMount(){
      this.updateRating(); 
    }

    componentDidUpdate(prevProps) {
      if (prevProps != this.props) {
        this.updateRating();
      }
    }

    updateRating(){
      if(!isNaN(this.props.rating)){
        let percentage = 20*this.props.rating;
        let color= "hsl(212, 100%,"+(86-(percentage*.36))+"%)";
        this.setState({percentage: percentage, color: color, rating: this.props.rating});
      }
      else{
        this.setState({rating: "-"});
      }
    }


    componentWillUnmount(){
      this.setState({
        color:"#00000",
        percentage: 0.0,
        rating: 0.0});
    }

  render(){
    return (

        <div className="row noLeftRightMargin gauge-component-container">
          <div className="col-md-6 col-md-offset-1 no-side-padding gauge-text">
            <h1 className="gauge-text-top">
                {this.state.rating}
            </h1>
            <h1 className="gauge-text-bottom">
              {this.props.text}
            </h1>
          </div>
          <div className="col-md-5 no-side-padding gauge-height-center">
            <div className="gauge-container">
              <CircularProgressbar value={this.state.percentage} strokeWidth={10} styles={buildStyles({ pathColor: this.state.color, strokeLinecap: "butt" })}/>
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
