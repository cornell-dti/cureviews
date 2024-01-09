import { Auth } from './auth';
import { findStudent, insertNewStudent } from '../profile/profile.data-access';
import {
  GetUserType,
  InsertStudentType,
  ProfileInfoType,
  VerifyAuthType,
} from './auth.type';
import shortid from 'shortid';

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
    const result = await insertUser({ token: ticket });

    if (!result) {
      return null;
    }

    if (!ticket.email) {
      return null;
    }

    const netId = ticket.email.replace('@cornell.edu', '');
    const student = await findStudent(netId);
    return { netId, student } as ProfileInfoType;
  } else {
    return null;
  }
};

export const verifyTokenAdmin = async ({ auth }: VerifyAuthType) => {
  try {
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);

    if (regex.test(auth.getToken())) {
      const ticket = await auth.getVerificationTicket();
      if (ticket && ticket.email) {
        const user = await findStudent(
          ticket.email.replace('@cornell.edu', ''),
        );
        if (user) {
          return user.privilege === 'admin';
        }
      }
    }

    return false;
  } catch (error) {
    return false;
  }
};
