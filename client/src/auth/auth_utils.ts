import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Session } from '../session-store';

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

export function useLogin(redirectFrom: string): [string | null, boolean, () => void] {
    const [token, setToken] = useState(null);
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const history = useHistory();

    useEffect(() => {
        const token = getAuthToken();

        if (!token || token === "") {
            signIn(redirectFrom)
        }

        setToken(token);
        setIsAuthenticating(false);
    });

    const signIn = (redirectFrom: string) => {
        Session.setPersistent({ "redirectFrom": redirectFrom });
        history.push("/login");
    }

    const signOut = () => {
        Session.set("token", null);
        history.push("/");
    }

    return [token, isAuthenticating, signOut];
}