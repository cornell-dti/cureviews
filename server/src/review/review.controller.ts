import { ValidationChain, body } from 'express-validator';
import shortid from 'shortid';
import { InsertUserRequest } from './review.dto';
import { getUserByNetId, saveUser } from '../../data/Students';

/**
 * Creates a ValidationChain[] where the json object denoted by [jsonFieldName]
 * has non-empty fields listed in [fields].
 */
export const JSONNonempty = (jsonFieldName: string, fields: string[]) => {
  const ret: ValidationChain[] = [];
  fields.forEach((fieldName) => {
    ret.push(body(`${jsonFieldName}.${fieldName}`).notEmpty());
  });
  return ret;
};

/**
 * Inserts a new user into the database, if the user was not already present
 *
 * Returns 1 if the user was added to the database, or was already present
 * Returns 0 if there was an error
 */
// eslint-disable-next-line import/prefer-default-export
export const insertUser = async (request: InsertUserRequest) => {
  const { googleObject } = request;
  try {
    // Check user object has all required fields
    if (googleObject.email.replace('@cornell.edu', '') !== null) {
      const user = await getUserByNetId(
        googleObject.email.replace('@cornell.edu', ''),
      );
      if (user === null) {
        const newUser = {
          _id: shortid.generate(),
          // Check to see if Google returns first and last name
          // If not, insert empty string to database
          firstName: googleObject.given_name ? googleObject.given_name : '',
          lastName: googleObject.family_name ? googleObject.family_name : '',
          netId: googleObject.email.replace('@cornell.edu', ''),
          affiliation: null,
          token: null,
          privilege: 'regular',
        };

        await saveUser(newUser);
      }
      return 1;
    }

    // eslint-disable-next-line no-console
    console.log('Error: Some user values are null in insertUser');
    return 0;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'insertUser' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return 0;
  }
};
