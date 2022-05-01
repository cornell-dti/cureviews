import { Students } from "../dbDefs";

// eslint-disable-next-line import/prefer-default-export
export const fetchMailingList = async () => {
  try {
    const mailingList = await Students.find({ onMailingList: { $exists: true, $nin: false } }).exec();
    const mailingListStr = "";
    const leftClose = "\"";
    const rightClose = "@cornell.edu\", ";

    mailingList.forEach((student) => {
      mailingListStr.concat(leftClose);
      mailingListStr.concat(student.netId);
      mailingListStr.concat(rightClose);
    });

    return mailingListStr;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'fetchMailingList' endpoint");
    // eslint-disable-next-line no-console
    console.log(error);
    return { error: "Internal Server Error" };
  }
};
