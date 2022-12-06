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

/**
 * This is a react hook that provides user credentials on pages where authentication is mandatory.
 * On these pages, you can use this hook and the user will be forced to log in before viewing the page.
 * Usage is as follows:
 * 
 * const [isLoggedIn, token, isAuthenticating, signOut] = useAuthMandatoryLogin("<redirect string>");
 * 
 * The variable isLoggedIn tells us whether the user is fully logged in or is still going through the process.
 * The token is the authentication token that must be passed to the backend, and isAuthenticating tells us
 * if the user is currently authenticating. The signOut function allows the user to signOut, and since
 * the user cannot view this page when not signed in, it automatically redirects to the home page.
 * 
 * @param redirectFrom the redirectFrom variable tells the hook where to send the user back to after they
 * have logged in. For this value, you can either specify the name of the page (it must be set up in AuthRedirect)
 * or you can give a path directly by setting it to "path:<the desired path>".
 */
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

/**
 * This hook is similar to the above hook but it should be used for pages or components where the user does not have to be
 * logged in to view it. If you want to have a sign in button on a page, you would use this component. Its usage is as follows:
 * 
 * const [isLoggedIn, token, signIn, signOut] = useAuthOptionalLogin();
 * 
 * The isLoggedIn value tells us whether the user is logged in or not. The token is the user credentials that should be passed to
 * the backend when necessary. Finally, signIn and signOut are functions that allow a user to sign in and sign out. They each take
 * a redirect string as described above to tell the hook where to send the user to after they have logged in or out.
 */
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