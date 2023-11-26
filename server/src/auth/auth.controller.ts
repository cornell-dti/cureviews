import { OAuth2Client } from 'google-auth-library';
import { getUserByNetId } from '../data/Students';
import { googleAudience } from '../utils/const';

/**
 * Returns true if [netid] matches the netid in the email of the JSON
 * web token. False otherwise.
 * This method authenticates the user token through the Google API.
 * @param token: google auth token
 * @param netid: netid to verify
 * @requires that you have a handleVerifyError, like as follows:
 * verify(token, function(){//do whatever}).catch(function(error){
 */
export const getVerificationTicket = async (token?: string) => {
  try {
    if (token === undefined) {
      // eslint-disable-next-line no-console
      console.log('Token was undefined in getVerificationTicket');
      return null;
    }

    const audience = googleAudience;
    const client = new OAuth2Client(audience);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience,
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

export const getUserEmail = async (token: string) => {
  try {
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (!regex.test(token)) {
      return null;
    }

    const ticket = await getVerificationTicket(token);
    if (!(ticket && ticket.email)) {
      return null;
    }

    if (ticket.hd === 'cornell.edu') {
      return ticket.email;
    }

    return null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getUserEmail' method", err);
    return null;
  }
};

export const getUserNetId = async (token: string) => {
  const email = await getUserEmail(token);

  try {
    const netId = email.replace('@cornell.edu', '');
    return netId;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getUserNetId' method", error);
    return null;
  }
};

export const verifyAdminToken = async (token: string) => {
  try {
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (!regex.test(token)) {
      return false;
    }

    const ticket = await getVerificationTicket(token);
    if (!(ticket && ticket.email)) {
      return false;
    }

    const user = await getUserByNetId(ticket.email.replace('@cornell.edu', ''));
    if (user) {
      return user.privilege === 'admin';
    }

    return false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'verifyAdminToken' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return false;
  }
};
