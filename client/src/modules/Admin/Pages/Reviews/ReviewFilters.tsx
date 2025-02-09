import React from 'react';
import './Reviews.module.css';

const ReviewFilters = () => {
  return (
    <div className="review-filters">
      <button>Pending</button>
      <button>Approved</button>
      <button>Reported</button>
    </div>
  );
};

export default ReviewFilters;