import { Students } from "../db/dbDefs";

// Get a user with this netId from the Users collection in the local database
export const getUserByNetId = async (netId: string) => {
  try {
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(netId)) {
      const student = await Students.findOne({ netId }).exec();
      if (student === undefined) {
        return null;
      }
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

export const saveUser = async (user) => {
  try {
    const newUser = new Students(user);
    return await newUser.save();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'saveUser' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return null;
  }
};

export const getStudentReviewIds = async (studentDoc) => {
  const reviewIds = studentDoc.reviews;
  if (reviewIds === null) {
    return [];
  }

  return reviewIds;
};
