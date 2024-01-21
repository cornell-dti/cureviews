import shortid from 'shortid';

import { findStudent } from '../utils';
import { insertNewStudent } from './auth.data-access';
import { InsertStudentType, TokenPayloadType } from './auth.type';

/**
 * Inserts a new user.
 *
 * @param {TokenPayloadType} token: represents Google OAuth token payload derived from Google verifyIdToken.
 * @returns true if operation was successful, false if operations was not successful, null if token not admin
 */
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

      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
};
