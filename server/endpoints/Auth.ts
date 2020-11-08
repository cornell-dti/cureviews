import { body } from "express-validator";
import { OAuth2Client } from 'google-auth-library';
import { Endpoint } from "../endpoints";
import { Students } from "../dbDefs";

const client = new OAuth2Client("836283700372-msku5vqaolmgvh3q1nvcqm3d6cgiu0v1.apps.googleusercontent.com");

// The type for a search query
interface AdminRequest {
    token: string;
}

/**
   * Returns true if [netid] matches the netid in the email of the JSON
   * web token. False otherwise.
   * This method authenticates the user token through the Google API.
   * @param token: google auth token
   * @param netid: netid to verify
   * @requires that you have a handleVerifyError, like as follows:
   * verify(token, function(){//do whatever}).catch(function(error){
   * handleVerifyError(error, res);
   */
export const getVerificationTicket = async (token?: string) => {
  try {
    if (token === null) {
      console.log("Token was undefined in getVerificationTicket");
      return null; // Token was undefined
    }
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "836283700372-msku5vqaolmgvh3q1nvcqm3d6cgiu0v1.apps.googleusercontent.com", // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      // [CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    return ticket.getPayload();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getVerificationTicket' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return null;
  }
};
  /**
   * Used in the .catch when verify is used, handles whatever should be done
   * @param errorObj (required) the error that is returned from the .catch
   * @param res the response object
   * @return {boolean} true if their token is too old, false if some other error
   * @requires that you have the verify function, like as follows:
   * verify(token, function(){//do whatever}).catch(function(error){
   *        handleVerifyError(error, res);
   * }
   */
export const handleVerifyError = (errorObj, res) => {
  if (errorObj && errorObj.toString()) {
    if (errorObj.toString().indexOf('used too late') !== -1) {
      res.status(409).send('Token used too late');
      return true;
    }

    res.status(409).send('Invalid token');
    return true;
  }
  return false;
};

// Get a user with this netId from the Users collection in the local database
export const getUserByNetId = async (netId: string) => {
  try {
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(netId)) {
      return await Students.findOne({ netId }).exec();
    }
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getUserByNetId' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return null;
  }
};

/*
 * Check if a token is for an admin
 */
export const tokenIsAdmin: Endpoint<AdminRequest> = {
  guard: [body("token").notEmpty().isAscii()],
  callback: async (adminRequest: AdminRequest) => {
    try {
      const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
      if (regex.test(adminRequest.token)) {
        const ticket = await getVerificationTicket(adminRequest.token);
        if (ticket && ticket.email) {
          const user = await getUserByNetId(ticket.email.replace('@cornell.edu', ''));
          if (user) {
            return user.privilege === 'admin';
          }
        }
      }
      return false;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Error: at 'tokenIsAdmin' method");
      // eslint-disable-next-line no-console
      console.log(error);
      return false;
    }
  },
};
