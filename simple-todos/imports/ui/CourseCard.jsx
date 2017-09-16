import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Reviews } from '../api/classes.js';

// Task component - represents a single todo item
export default class Form extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var theClass = this.props.course;
    return (
      <header>
        <h1 className="subheader">{theClass.classSub.toUpperCase() + " " + theClass.classNum + ": " + theClass.classTitle}</h1>
        <h2>Class Data</h2>
        <div>
          <div className= "panel panel-default">
            <div className = "panel-body">
              <section>
                <div className="row" id="gaugeHolder">
                  <div className="col-sm-4">
                  <ng-gauge id="gauge1" foreground-color="{{$ctrl.qualColor($ctrl.qual)}}" type="arch" thick="{{$ctrl.gaugeThick}}" size="{{$ctrl.gaugeWidth}}" cap="butt" value="$ctrl.qual" label="Overall Quality" append="/5">
                  </ng-gauge>
                  </div>
                  <div className="col-sm-4">
                    <ng-gauge id="gauge2" foreground-color="{{$ctrl.diffColor($ctrl.diff)}}"  type="arch" thick="{{$ctrl.gaugeThick}}" size="{{$ctrl.gaugeWidth}}" cap="butt" value="$ctrl.diff" label="Level of Difficulty" append="/5">
                  </ng-gauge>
                  </div>
                  <div className="col-sm-4">
                    <ng-gauge id="gauge3" foreground-color="{{$ctrl.gradeColor($ctrl.grade)}}" type="arch" thick="{{$ctrl.gaugeThick}}" size="{{$ctrl.gaugeWidth}}" cap="butt" value="$ctrl.grade" label="Median Grade">
                  </ng-gauge>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
        <p>Semesters Offered:</p>
        <p>{theClass.classSems}</p>
      </header>
    )
  };
}
