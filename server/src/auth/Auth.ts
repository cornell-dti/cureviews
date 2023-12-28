import joi from 'joi';
import { OAuth2Client } from 'google-auth-library';

type AuthEntity = {
  token: string;
};

export class Auth {
  private token: string;
  private static AUDIENCE =
    '836283700372-msku5vqaolmgvh3q1nvcqm3d6cgiu0v1.apps.googleusercontent.com';
  private static CLIENT = new OAuth2Client(Auth.AUDIENCE);

  constructor({ token }: AuthEntity) {
    this.token = token;

    this.validate();
  }

  getToken() {
    return this.token;
  }

  /**
   * Returns true if [netid] matches the netid in the email of the JSON
   * web token. False otherwise.
   * This method authenticates the user token through the Google API.
   * @param token: google auth token
   * @param netid: netid to verify
   * @requires that you have a handleVerifyError, like as follows:
   * verify(token, function(){//do whatever}).catch(function(error){
   */
  async getVerificationTicket(token?: string) {
    try {
      if (token === null) {
        return null;
      }

      const ticket = await Auth.CLIENT.verifyIdToken({
        idToken: token,
        audience: Auth.AUDIENCE,
      });

      return ticket.getPayload();
    } catch (error) {
      return null;
    }
  }

  private validate() {
    const searchSchema = joi.object({
      token: joi.string().required(),
    });

    const { error, value } = searchSchema.validate(this);

    if (error !== undefined) {
      throw error;
    }
  }
}
