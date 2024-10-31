import { Classes, RecommendationMetadata, GlobalMetadata } from '../db/schema';
import { preprocess, idf } from '../src/course/course.recalgo';

export const addAllProcessedDescriptions = async (): Promise<boolean> => {
  try {
    const courses = await Classes.find().exec();
    if (courses) {
      for (const course of courses) {
        await addProcessedDescription(course);
      }
    }
    return true;
  } catch (err) {
    console.log(`Error in adding processed descriptions: ${err}`);
  }
}

const addProcessedDescription = async (course): Promise<boolean> => {
  const courseId = course._id;
  const description = course.classDescription;
  const processed = preprocess(description);
  const subject = course.classSub;
  const num = course.classNum;
  try {
    console.log(`${subject} ${num}: ${processed}`)
    const rec = await RecommendationMetadata.findOne({ _id: courseId });
    if (rec) {
      await RecommendationMetadata.updateOne(
        { _id: courseId },
        { $set: { processedDescription: processed } }
      );
    } else {
      const res = await new RecommendationMetadata({
        _id: courseId,
        classSub: subject,
        classNum: num,
        processedDescription: processed
      })
        .save()
        .catch((err) => {
          console.log(err);
          return null;
        });
      if (!res) {
        throw new Error();
      }
    }
    return true;
  } catch (err) {
    console.log(`Error in adding processed description for ${subject} ${num}: ${err}`);
  }
}

export const addIdfVector = async (): Promise<boolean> => {
  try {
    const metadata = await RecommendationMetadata.find().exec();
    const descriptions = metadata.map(course => course.processedDescription.split(' '));
    const allTerms = [...new Set(descriptions.flat())];
    const idfValues = idf(allTerms, descriptions);
    const res = await new GlobalMetadata({
      idfVector: idfValues
    }).save();

    if (!res) {
      throw new Error();
    }
    return true;
  } catch (err) {
    console.log(`Error in adding IDF Vector to Global Metadata database: ${err}`);
    return false;
  }
}