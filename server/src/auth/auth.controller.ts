import { OAuth2Client } from 'google-auth-library';
import { getUserByNetId } from '../data/Students';

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

    const audience = '836283700372-msku5vqaolmgvh3q1nvcqm3d6cgiu0v1.apps.googleusercontent.com';
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

export const verifyToken = async (token: string) => {
  try {
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(token)) {
      const ticket = await getVerificationTicket(token);
      if (ticket && ticket.email) {
        const user = await getUserByNetId(
          ticket.email.replace('@cornell.edu', ''),
        );
        if (user) {
          return user.privilege === 'admin';
        }
      }
    }
    return false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'verifyToken' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return false;
  }
};
