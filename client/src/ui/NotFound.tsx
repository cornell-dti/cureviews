import React from 'react';

export default function NotFound() {
  return (
    <div className="col-md-12 col-sm-12 col-xs-12 not-found-padding-top">
      <img src="/noResults.svg" className="img-responsive no-results" alt="No class found" ></img>
      <div className="not-found-text">404</div>
      <div className="no-results-text">Oops! Page Not Found :(</div>
    </div>
  )
}
