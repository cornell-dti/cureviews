import joi from 'joi';

import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_AUTH_AUDIENCE } from '../utils/constants';

type AuthEntity = {
  token: string;
};

/**
 * Represents core business logic for authentication and contains necessary helper functions pertaining to the token.
 * Should have not other server side dependencies.
 */

export class Auth {
  private token: string;

  private static AUDIENCE = GOOGLE_AUTH_AUDIENCE;

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
   * verify(token, function(){//do whatever}).catch(function(error)){
   */
  async getVerificationTicket() {
    try {
      if (this.token === null) {
        return null;
      }

      const ticket = await Auth.CLIENT.verifyIdToken({
        idToken: this.token,
        audience: Auth.AUDIENCE
      });

      return ticket.getPayload();
    } catch (error) {
      return null;
    }
  }

  /**
   * Validates Auth object based on specified requirements from joi.
   * Throws an exception if object is not valid.
   */
  private validate() {
    const tokenSchema = joi.object({
      token: joi
        .string()
        .regex(new RegExp(/^(?=.*[A-Z0-9])/i))
        .required()
    });

    const { error } = tokenSchema.validate(this);

    if (error !== undefined) {
      throw error;
    }
  }
}
