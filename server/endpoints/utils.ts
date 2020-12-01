import { CourseId } from "./Review";
import { Classes } from "../dbDefs";
import { getUserByNetId, getVerificationTicket } from "./Auth";

// eslint-disable-next-line import/prefer-default-export
export const getCourseById = async (courseId: CourseId) => {
  try {
    // check: make sure course id is valid and non-malicious
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(courseId.courseId)) {
      return await Classes.findOne({ _id: courseId.courseId }).exec();
    }
    return { error: "Malformed Query" };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getCourseById' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return { error: "Internal Server Error" };
  }
};

export const verifyToken = async (token: string) => {
  try {
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(token)) {
      const ticket = await getVerificationTicket(token);
      if (ticket && ticket.email) {
        const user = await getUserByNetId(ticket.email.replace('@cornell.edu', ''));
        if (user) {
          return user.privilege === 'admin';
        }
      }
    }
    return false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'verufyToken' method");
    // eslint-disable-next-line no-console
    console.log(error);
    return false;
  }
};