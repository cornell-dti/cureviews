import { Students } from "../../db/dbDefs";

// Get a user with this netId from the Users collection in the local database
// eslint-disable-next-line import/prefer-default-export
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
