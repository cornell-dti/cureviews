import React, { Component, useEffect, useState } from "react";
import axios from "axios";
import ProfileReviews from "./ProfileReviews";
import "./css/App.css";
import "./css/ClassView.css";
import "rodal/lib/rodal.css";
import "./css/Form.css";
import "./css/ResultsDisplay.css";

type ProfileProps = {
  imageSrc: any;
  verifiedEmail: string;
};

export default function Profile({
  imageSrc = "/profile_bear.png",
  verifiedEmail = "myl39@cornell.edu",
}: ProfileProps) {


  return (
    <div>
      <div className="hidden-sm hidden-xs  container-fluid container-top-gap-fix classViewContainer">
        <div className="clearfix" />
        <div className="container-width no-padding classview-column-container">
          <div className="col-md-5 col-sm-5 col-xs-5 sticky no-padding navbar-margin classview-coursecard-min-width">
          </div>
          <div className="col navbar-margin classview-right-panel">
            <div className="row no-padding classview-reviews-container">
              <ProfileReviews studentID={"cv4620"} onScroll={undefined} transformGauges={undefined} ></ProfileReviews>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}