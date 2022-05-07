import { Session } from './session-store';

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
    const exp = JSON.parse(atob(token.split(".")[1])).exp;
    if (token && token !== "" && exp > Math.floor(Date.now() / 1000)) {
        return token;
    }
    else return null;
}