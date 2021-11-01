import React from 'react';
import './css/LoginModal.css'

const LoginModal = () => {
  
  return (
    <div className="modal fade loginModal" id="signinModal" tabIndex={-1} role="dialog" aria-labelledby="signinModalLabel" aria-hidden="true">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="signinModalLabel">Modal title</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="signin-message">
              <p>Don't worry - all of your reviews will be <b>anonymous!</b></p>
            </div>
            <div className="signin-button-container">
              <button type="button" className="btn btn-primary">Verify Cornell Email</button>
            </div>
            <div className="signin-logo-container">
              <img src='/dti_logo.png' className="signing-dti-logo" alt="DTI Logo" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default LoginModal;
