import { Classes } from "../db/dbDefs";

// eslint-disable-next-line import/prefer-default-export
export const getCourseById = async (courseId: string) => {
  try {
    // check: make sure course id is valid and non-malicious
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(courseId)) {
      return await Classes.findOne({ _id: courseId }).exec();
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

export const getClassByInfo = async (subject, number) => {
  await Classes.findOne({
    classSub: subject,
    classNum: number,
  }).exec();
};
