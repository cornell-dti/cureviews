import { insertNewStudent } from '../auth/auth.data-access';
import {
  GetUserType,
  InsertStudentType,
  VerifyAuthType,
  VerifyStudentType,
} from './auth.type';
import shortid from 'shortid';

import { findStudent } from '../utils/index';

export const insertUser = async ({ token }: GetUserType) => {
  try {
    if (!token.email) {
      return false;
    }

    if (token.email.replace('@cornell.edu', '') !== null) {
      const user = await findStudent(token.email.replace('@cornell.edu', ''));

      if (user === null) {
        const newStudent: InsertStudentType = {
          _id: shortid.generate(),
          firstName: token.given_name ? token.given_name : '',
          lastName: token.family_name ? token.family_name : '',
          netId: token.email.replace('@cornell.edu', ''),
          affiliation: '',
          token: '',
          privilege: 'regular',
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

  if (ticket.hd === 'cornell.edu') {
    if (!ticket.email) {
      return null;
    } else {
      const result = await insertUser({ token: ticket });

      if (!result) {
        return null;
      }
    }

    const netId = ticket.email.replace('@cornell.edu', '');
    const student = await findStudent(netId);
    return { netId, student } as VerifyStudentType;
  } else {
    return null;
  }
};
