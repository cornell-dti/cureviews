import shortid from 'shortid';

import { insertNewStudent } from './auth.data-access';
import { TokenPayloadType, InsertStudentType } from './auth.type';

import { findStudent } from '../utils';

export const insertUser = async ({ token }: TokenPayloadType) => {
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
