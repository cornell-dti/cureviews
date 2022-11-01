import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Session } from '../session-store';

export const setAuthToken = (token: string) => {
    Session.setPersistent({ "token": token });
    if (Session.get("token") !== token) {
        console.log("Error saving token to session")
        return false;
    }
    return true;
}

export const getAuthToken = () => {
    const token = Session.get("token");
    if (!token || token === "") {
        return null;
    }
    const exp = JSON.parse(atob(token.split(".")[1])).exp;
    if (token && token !== "" && exp > Math.floor(Date.now() / 1000)) {
        return token;
    }
    else return null;
}

export function useAuthMandatoryLogin(redirectFrom: string): [boolean, string | null, boolean, () => void] {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null);
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const history = useHistory();

    const signOut = () => {
        setToken(null);
        Session.set("token", null);
        history.push("/");
    }

    useEffect(() => {
        const signIn = (redirectFrom: string) => {
            Session.setPersistent({ "redirectFrom": redirectFrom });
            history.push("/login");
        }

        const token = getAuthToken();

        if (!token || token === "") {
            signIn(redirectFrom)
        }

        setToken(token);
        setIsAuthenticating(false);
        setIsLoggedIn(true);
    }, [redirectFrom, history]);

    return [isLoggedIn, token, isAuthenticating, signOut];
}

export function useAuthOptionalLogin(): [boolean, string | null, (redirectFrom: string) => void, (redirectTo?: string) => void] {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null);
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        const token = getAuthToken();

        if (token && token !== "") {
            setToken(token);
            setIsLoggedIn(true);
        }
    }, []);

    const signIn = (redirectFrom: string) => {
        Session.setPersistent({ "redirectFrom": redirectFrom });
        history.push("/login");
    }

    const signOut = (redirectTo?: string) => {
        setIsLoggedIn(false);
        setToken(null);
        Session.set("token", null);
        if (redirectTo) {
            history.push(redirectTo);
        }
        else {
            window.location.reload();
        }
    }

    return [isLoggedIn, token, signIn, signOut];
}