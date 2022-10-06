import React, { Component, useEffect, useState } from 'react';
import Admin from './Admin.jsx';
import CUreviewsGoogleLogin from './CUreviewsGoogleLogin';
import "./css/Login.css";
import { Session } from "../session-store";
import axios from 'axios';
import { getAuthToken, useAuthToken } from '../auth/auth_utils';
/*
  Admin Interface Login Component.

  View component accessed via /admin.

  Requests a password from the user and validates it with the password stored in the database.
  If the user enters the correct password, the Admin Interface is displayed using
  the Admin component. Otherwise, an error message is displayed.

*/

export default function AdminLogin() {

    const token = useAuthToken();

    useEffect(() => {
        axios.post(`/v2/tokenIsAdmin`, { token: getAuthToken() })
            .then((res) => {
                const result = res.data.result;
                if (result) {
                    Session.set("adminlogin", true);
                }
                else {
                    Session.set("adminlogin", false);
                }
            });
    })

    // If Google login was valid, show admin interface.
    if (Session.get("adminlogin") === true) {
        return (
            <Admin />
        );
    } else {
        return (
            <div className="container-width whiteBg">
                <div className="pushDown">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Please wait to be authenticated</h3>
                        </div>
                        <div className="card-body">
                            <CUreviewsGoogleLogin
                                executeLogin={true}
                                waitTime={1500}
                                redirectFrom="admin" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}
