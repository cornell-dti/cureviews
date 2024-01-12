import shortid from "shortid";
import { insertNewStudent } from "./auth.data-access";
import {
  TokenPayloadType,
  InsertStudentType,
  VerifyAuthType,
  VerifyStudentType,
} from "./auth.type";

import { findStudent } from "../utils";

export const insertUser = async ({ token }: TokenPayloadType) => {
  try {
    if (!token.email) {
      return false;
    }

    if (token.email.replace("@cornell.edu", "") !== null) {
      const user = await findStudent(token.email.replace("@cornell.edu", ""));

      if (user === null) {
        const newStudent: InsertStudentType = {
          _id: shortid.generate(),
          firstName: token.given_name ? token.given_name : "",
          lastName: token.family_name ? token.family_name : "",
          netId: token.email.replace("@cornell.edu", ""),
          affiliation: "",
          token: "",
          privilege: "regular",
        };

        await insertNewStudent(newStudent);
      }
    }
  } catch (err) {
    return false;
  }

  return true;
};

export const verifyToken = async ({ auth }: VerifyAuthType) => {
  const ticket = await auth.getVerificationTicket();

  if (!ticket) {
    return null;
  }

  if (ticket.hd === "cornell.edu") {
    if (!ticket.email) {
      return null;
    }
    const result = await insertUser({ token: ticket });

    if (!result) {
      return null;
    }


    const netId = ticket.email.replace("@cornell.edu", "");
    const student = await findStudent(netId);
    return { netId, student } as VerifyStudentType;
  }
  return null;
};
