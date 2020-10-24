import React, { Component } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './css/Gauge.css';

type Props = {
  width: string;
  height: string;
  rating: number;
  text: string,
  isInPreviewCard?: boolean;
}

type State = {
    color: string;
    percentage: number;
    rating: number|string;
}

let initState={
  color:"#00000",
  percentage: 0.0,
  rating: 0.0
};

export default class Gauge extends Component<Props,State>{
  gauge_text_top:string;
  gauge_container:string;
  gauge_size_class:string;
  gauge_text_size_class:string;
  gauge_text_padding:string;
  constructor(props:Props) {
    super(props);

    this.state=initState;
    this.updateRating=this.updateRating.bind(this);
    this.componentDidUpdate=this.componentDidUpdate.bind(this);
    this.gauge_text_top = props.isInPreviewCard ? "gauge-text-top-preview" : "gauge-text-top";
    this.gauge_container = props.isInPreviewCard ? "gauge-container-preview" : "gauge-container";
    this.gauge_size_class = props.isInPreviewCard ? "col-sm-6 col-xs-6" : "d-sm-none d-xs-none";
    this.gauge_text_size_class = props.isInPreviewCard ? "col-sm-6 col-xs-6" : "col-sm-12 col-xs-12";
    this.gauge_text_padding = props.isInPreviewCard ? "gauge-text-padding-preview" : "gauge-text-padding";

  }

    componentDidMount(){
      this.updateRating();
    }

    componentDidUpdate(prevProps:Props) {
      if (prevProps !== this.props) {
        this.updateRating();
      }
    }

    updateRating(){
      if(!isNaN(this.props.rating)){
        let percentage = 20*this.props.rating;
        let color= "hsl(212, 100%,"+(86-(percentage*.36))+"%)";
        this.setState({percentage: percentage, color: color, rating: this.props.rating.toFixed(1)});
      }
      else{
        this.setState({rating: "-", percentage:0.0});
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
          <div className={"col-md-6  no-side-padding gauge-text-container " + this.gauge_text_padding + " " + this.gauge_text_size_class}>
            <p className="gauge-text">
                <span className={this.gauge_text_top}>{this.state.rating}</span>
                <span className="gauge-text-bottom ">{this.props.text}</span>
            </p>
          </div>
          <div className={"col-md-6 no-side-padding gauge-height-center " + this.gauge_size_class}>
            <div className={this.gauge_container}>
              <CircularProgressbar value={this.state.percentage} strokeWidth={10} styles={buildStyles({ pathColor: this.state.color, strokeLinecap: "butt" })}/>
            </div>
          </div>
        </div>

    )
  }
}
