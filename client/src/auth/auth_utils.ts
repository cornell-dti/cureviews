import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Session } from '../session-store';

export const setAuthToken = (token: string) => {
    setAuthToken(token);
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

export function useAuthToken(): string | null {
    const [token, setToken] = useState(null);
    const history = useHistory();

    useEffect(() => {
        const token = getAuthToken();

        if (!token || token === "") {
            history.push("/login");
        }

        setToken(token);
    });

    return token;
}