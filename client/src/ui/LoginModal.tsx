import React, { useState } from 'react';
import CUreviewsGoogleLogin from './CUreviewsGoogleLogin';
import './css/LoginModal.css'

const LoginModal = () => {

  const [executeLogin, setExecuteLogin] = useState(false);
  
  return (
    <div className="modal fade loginModal" id="signinModal" tabIndex={-1} role="dialog" aria-labelledby="signinModalLabel" aria-hidden="true">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-body">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <div className="signin-cureviews-logo-container">
              <img src='/logo.svg' className="signin-cureviews-logo" alt="CU Reviews Logo" />
            </div>
            <div className="signin-message">
              <p>Don't worry - all of your reviews will be <b>anonymous!</b></p>
            </div>
            <div className="signin-button-container">
              <button type="button" className="btn btn-primary signin-button" onClick={() => (setExecuteLogin(true))}>Verify Cornell Email</button>
            </div>
            <div className="signin-bottom-message">
              <p>You will be redirected to our login page. Not seeing it? <a href="https://www.google.com/">Click here</a></p>
            </div>
            <div className="signin-dti-logo-container">
              <img src='/dti-logo-grey.png' className="signing-dti-logo" alt="DTI Logo" />
            </div>
            <CUreviewsGoogleLogin
                  executeLogin={executeLogin}
                  waitTime={1500}
                  redirectFrom="admin"/>
          </div>
        </div>
      </div>
    </div>
  )
};

export default LoginModal;
