import { body } from "express-validator";
import { Context, Endpoint } from "../../../endpoints";
import { verifyToken } from "../../utils/utils";
import { AdminRequest } from "./types";

/*
 * Check if a token is for an admin
 */
// eslint-disable-next-line import/prefer-default-export
export const tokenIsAdmin: Endpoint<AdminRequest> = {
  guard: [body("token").notEmpty().isAscii()],
  callback: async (ctx: Context, adminRequest: AdminRequest) => await verifyToken(adminRequest.token),
};
