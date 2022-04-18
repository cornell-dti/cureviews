import { Students } from "../dbDefs";

export const fetchMailingList = {
  try{
    const mailingList = await Students.find({ mailingList: true }).exec();
    const mailingListStr = "";
    const leftClose = "\"";
    const rightClose = "\", "

    mailingList.forEach(function (student) {
      mailingListStr.concat(leftClose);
      mailingListStr.concat(student.netId); 
      mailingListStr.concat(rightClose);
    });

    return mailingListStr;
  }catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'fetchMailingList' endpoint");
    // eslint-disable-next-line no-console
    console.log(error);
    return { error: "Internal Server Error" };
  }
};