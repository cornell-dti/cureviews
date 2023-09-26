import { body } from "express-validator";
import { Context, Endpoint } from "../../endpoints";
import { Students } from "../../db/dbDefs";
import { verifyToken } from "../utils/utils";
import { AdminRequest } from "./types";
import { verifyTicket } from "./functions";

const audience = "836283700372-msku5vqaolmgvh3q1nvcqm3d6cgiu0v1.apps.googleusercontent.com";

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
    if (token === null) {
      // eslint-disable-next-line no-console
      console.log("Token was undefined in getVerificationTicket");
      return null;
    }

    return verifyTicket(token, audience);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getVerificationTicket' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return null;
  }
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
  callback: async (ctx: Context, adminRequest: AdminRequest) => await verifyToken(adminRequest.token),
};
