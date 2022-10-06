import React, { Component, useEffect, useState } from 'react';
import Admin from './Admin.jsx';
import CUreviewsGoogleLogin from './CUreviewsGoogleLogin';
import "./css/Login.css";
import { Session } from "../session-store";
import axios from 'axios';
import { getAuthToken, useAuth } from '../auth/auth_utils';
import { Redirect } from 'react-router-dom';
/*
  Admin Interface Login Component.

  View component accessed via /admin.

  Requests a password from the user and validates it with the password stored in the database.
  If the user enters the correct password, the Admin Interface is displayed using
  the Admin component. Otherwise, an error message is displayed.

*/

export default function AdminLogin() {

    const [token, isAuthenticating, signOut] = useAuth("admin");

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
            <Redirect to="/" />
        );
    }

}
