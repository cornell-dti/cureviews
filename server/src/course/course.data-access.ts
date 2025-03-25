import { Classes, RecommendationMetadata, GlobalMetadata } from "../../db/schema";
import { CourseEvaluations } from '../../db/schema';

export const findCourseById = async (courseId: string) =>
  await Classes.findOne({ _id: courseId }).exec();

export const findCourseByInfo = async (
  courseNumber: string,
  courseSubject: string
) =>
  await Classes.findOne({
    classSub: courseSubject,
    classNum: courseNumber
  }).exec();

export const findRecommendationByInfo = async (
  courseNumber: string,
  courseSubject: string
) =>
  await RecommendationMetadata.findOne({
    classSub: courseSubject,
    classNum: courseNumber
  }).exec();

export const findGlobalMetadata = async () => await GlobalMetadata.find().exec();

export const findCourseEval = async (subject: string, courseNumber: string) =>
  await CourseEvaluations.findOne({ subject, courseNumber }).exec();
