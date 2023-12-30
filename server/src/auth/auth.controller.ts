import { Auth } from './auth';
import { findStudent, insertNewStudent } from '../profile/profile.data-access';
import { GetUserDTO, InsertStudentDTO } from './auth.dto';
import shortid from 'shortid';

export const insertUser = async (googleObject: GetUserDTO) => {
  const { token } = googleObject;
  try {
    if (token.email.replace('@cornell.edu', '') !== null) {
      const user = await findStudent(token.email.replace('@cornell.edu', ''));

      if (user === null) {
        const newStudent: InsertStudentDTO = {
          _id: shortid.generate(),
          firstName: token.given_name ? token.given_name : '',
          lastName: token.family_name ? token.family_name : '',
          netId: token.email.replace('@cornell.edu', ''),
          affiliation: null,
          token: null,
          privilege: 'regular',
        };

        insertNewStudent(newStudent);
      }
    }
  } catch (err) {}
};

export const verifyToken = async (auth: Auth) => {
  const ticket = await auth.getVerificationTicket();

  if (!ticket) {
    return null;
  }

  if (ticket.hd === 'cornell.edu') {
    await insertUser({ token: ticket });

    const netId = ticket.email.replace('@cornell.edu', '');
    const student = await findStudent(netId);
    return { netId, student };
  } else {
    return null;
  }
};

export const verifyTokenAdmin = async (auth: Auth) => {
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
