import React from 'react';

import CUReviewsGoogleLogin from './CUReviewsGoogleLogin';
import '../Styles/Login.css';

/**
 * Redirects a user to the login page.
 */
const Login = () => {
  return <CUReviewsGoogleLogin executeLogin={true} waitTime={0} />;
};

export { Login };
