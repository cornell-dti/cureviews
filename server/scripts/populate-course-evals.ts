import { CourseEvaluations } from '../db/schema';
// import courseData from './course_eval_data/fa_sp_24_course_eval.json';
import shortid from 'shortid';
import { CourseEvaluation } from 'common';

/** Given raw course evaluation data, return an object with its course code as the key
 * and merged course data from the course evaluations JSON file as an object value. */
const parseEval = (data: CourseEvaluationsRaw): CourseEvaluations => {
  const evals: CourseEvaluations = Object.entries(data)
    .reduce<CourseEvaluations>((acc, [key, value]) => {
      if (value.courseName.split(' ')[2] !== 'LEC') return acc;

      const numGradeNA = parseInt(value.numGradeNA, 10) || 0;
      const numFresh = parseInt(value.numFresh, 10) || 0;
      const numSoph = parseInt(value.numSoph, 10) || 0;
      const numJr = parseInt(value.numJr, 10) || 0;
      const numSr = parseInt(value.numSr, 10) || 0;
      const totalEvals = numGradeNA + numFresh + numSoph + numJr + numSr;
      const courseNameSplit = value.courseName.split(' ')

      acc[key] = {
        ...value,
        _id: shortid.generate(),
        subject: courseNameSplit[0],
        courseNumber: courseNameSplit[1],
        courseName: courseNameSplit[0] + " " + courseNameSplit[1],
        courseOverall: parseFloat(value.courseOverall) || 0,
        profTeachingSkill: parseFloat(value.profTeachingSkill) || 0,
        profKnowledge: parseFloat(value.profKnowledge) || 0,
        profClimate: parseFloat(value.profClimate) || 0,
        profOverall: parseFloat(value.profOverall) || 0,
        numA: parseInt(value.numA, 10) || 0,
        numB: parseInt(value.numB, 10) || 0,
        numC: parseInt(value.numC, 10) || 0,
        numD: parseInt(value.numD, 10) || 0,
        numF: parseInt(value.numF, 10) || 0,
        numS: parseInt(value.numS, 10) || 0,
        numU: parseInt(value.numU, 10) || 0,
        numGradeNA: numGradeNA,
        numFresh: numFresh,
        numSoph: numSoph,
        numJr: numJr,
        numSr: numSr,
        totalEvals: totalEvals,
        numAg: parseInt(value.numAg, 10) || 0,
        numHumec: parseInt(value.numHumec, 10) || 0,
        numArch: parseInt(value.numArch, 10) || 0,
        numILR: parseInt(value.numILR, 10) || 0,
        numArts: parseInt(value.numArts, 10) || 0,
        numEng: parseInt(value.numEng, 10) || 0,
        numHotel: parseInt(value.numHotel, 10) || 0,
        numOther: parseInt(value.numOther, 10) || 0,
        numMajorReq: parseInt(value.numMajorReq, 10) || 0,
        numReputation: parseInt(value.numReputation, 10) || 0,
        numInterest: parseInt(value.numInterest, 10) || 0,
        sentiments: [...Array(18).keys()].map(x =>
          [x += 8, (parseFloat(value['statement' + x + 'Score']) || 0)]
        ),
      }
      return acc
    }, {})

  // Merge objects with the same lecture
  const mergedLecEvals: CourseEvaluations = {};
  for (const [_, value] of Object.entries(evals)) {
    if (mergedLecEvals[value.courseName]) {
      mergedLecEvals[value.courseName] =
        mergeCourseLecEvaluations(mergedLecEvals[value.courseName], value);
    } else {
      mergedLecEvals[value.courseName] = value;
    }
  }

  // Merge objects with the same course
  const mergedCourseEvals: CourseEvaluations = {};
  for (const [_, value] of Object.entries(mergedLecEvals)) {
    const courseName = value.courseName.split(' ').slice(0, 2).join(' ')
    if (mergedCourseEvals[courseName]) {
      mergedCourseEvals[courseName] = mergeCourseEvaluations(mergedCourseEvals[courseName], value);
    } else {
      mergedCourseEvals[courseName] = value;
    }
  }

  const sortedSentimentEvals: CourseEvaluations = Object.fromEntries(
    Object.entries(mergedCourseEvals)
      .map(([key, value]): [string, CourseEvaluation] => {
        return [key, sortTopStatements(value)]
      })
  );

  return sortedSentimentEvals;
};

/** Given two numbers and two corresponding weights, return the weighted average. */
const weightedAvg = (
  n1: number, n2: number, w1: number, w2: number
): number => {
  if (n1 == 0 || w1 == 0) return n2
  if (n2 == 0 || w2 == 0) return n1
  if (w1 + w2 <= 0) throw new Error('Invalid argument: negative weight')
  return Math.floor((((n1 * w1) + (n2 * w2)) / (w1 + w2)) * 100) / 100
};

/** Given a course evaluation, sort the sentiments array to be in order of
 * rating and return the modified eval. */
const sortTopStatements = (
  courseEval: CourseEvaluation
): CourseEvaluation => {
  return {...courseEval,
    sentiments: courseEval.sentiments
      .map((x): [number, number] => [x[0], Math.floor(x[1] * 100) / 100])
      .sort((a, b) => b[1] - a[1])
  };
};

/** Given two course evaluations that should represent the same lecture section
 * but different professors (e.g. the same students are represented
 * by both evals), average all relevant data. */
const mergeCourseLecEvaluations = (
  eval1: CourseEvaluation,
  eval2: CourseEvaluation
): CourseEvaluation => {
  const w1 = eval1.totalEvals || 0;
  const w2 = eval2.totalEvals || 0;

  return {
    // note for potential edge case: in some cases,
    // discrepancies between the two evals (likely errors)
    // are overwritten here.
    ...eval1,
    courseOverall: weightedAvg(eval1.courseOverall, eval2.courseOverall, w1, w2),
    profTeachingSkill: weightedAvg(eval1.profTeachingSkill, eval2.profTeachingSkill, w1, w2),
    profKnowledge: weightedAvg(eval1.profKnowledge, eval2.profKnowledge, w1, w2),
    profClimate: weightedAvg(eval1.profClimate, eval2.profClimate, w1, w2),
    profOverall: weightedAvg(eval1.profOverall, eval2.profOverall, w1, w2),
    sentiments: eval1.sentiments.map((item, index) => {
      const statementNum = item[0];
      return [
        statementNum,
        weightedAvg(eval1.sentiments[index][1], eval2.sentiments[index][1], w1, w2)
      ];
    }),
  };
};

/** Given two course evaluations that should represent the same course
 * but different sections (e.g. different students are represented
 * in each eval), sum all relevant data. */
const mergeCourseEvaluations = (
  eval1: CourseEvaluation,
  eval2: CourseEvaluation
): CourseEvaluation => {
  const totalEvals1 = eval1.totalEvals || 0;
  const totalEvals2 = eval2.totalEvals || 0;
  const combinedTotalEvals = totalEvals1 + totalEvals2;
  return {
    ...mergeCourseLecEvaluations(eval1, eval2),
    numA: eval1.numA + eval2.numA,
    numB: eval1.numB + eval2.numB,
    numC: eval1.numC + eval2.numC,
    numD: eval1.numD + eval2.numD,
    numF: eval1.numF + eval2.numF,
    numS: eval1.numS + eval2.numS,
    numU: eval1.numU + eval2.numU,
    numGradeNA: eval1.numGradeNA + eval2.numGradeNA,
    numFresh: eval1.numFresh + eval2.numFresh,
    numSoph: eval1.numSoph + eval2.numSoph,
    numJr: eval1.numJr + eval2.numJr,
    numSr: eval1.numSr + eval2.numSr,
    totalEvals: combinedTotalEvals,
    numAg: eval1.numAg + eval2.numAg,
    numHumec: eval1.numHumec + eval2.numHumec,
    numArch: eval1.numArch + eval2.numArch,
    numILR: eval1.numILR + eval2.numILR,
    numArts: eval1.numArts + eval2.numArts,
    numEng: eval1.numEng + eval2.numEng,
    numHotel: eval1.numHotel + eval2.numHotel,
    numOther: eval1.numOther + eval2.numOther,
    numMajorReq: eval1.numMajorReq + eval2.numMajorReq,
    numReputation: eval1.numReputation + eval2.numReputation,
    numInterest: eval1.numInterest + eval2.numInterest,
    sentiments: eval1.sentiments.map((item, index) => {
      const statementNum = item[0];
      return [
        statementNum,
        weightedAvg(
          eval1.sentiments[index][1], eval2.sentiments[index][1], totalEvals1, totalEvals2
        )
      ];
    }),
  };
};

/**
 * Adds all course eval data from a particular semester/web-scraping iteration
 *
 * @returns true if operation was successful, false otherwise
 * @param data course eval json data
 */
export const addCourseEvalsFromJson = async (
  data: CourseEvaluationsRaw
): Promise<boolean> => {
  const parsedData: CourseEvaluations = parseEval(data)

  const v1 = await Promise.all(
    Object.entries(parsedData)
      .map(async ([_, value]) => {
        const cEval = value
        const cEvalIfExists = await CourseEvaluations.findOne({
          subject: cEval.subject,
          courseNumber: cEval.courseNumber
        }).exec();

        if (!cEvalIfExists) {
          console.log(`Adding new course eval for course ${cEval.courseName}`)
          const res = await new CourseEvaluations({
            ...cEval
          }).save().catch((err) => {
            console.log(err);
            return null;
          });
          // db operation was not successful
          if (!res) {
            throw new Error();
          }
        }
        return true;
      })).catch((_) => null);

  if (!v1) {
    console.log('Something went wrong while updating subjects!');
    return false;
  }
  return v1;
};

/** Adds course evaluations to database.
 *  !!! UNCOMMENT WHEN YOU NEED TO ADD COURSE EVALS !!! */
// export const addCurrCourseEvals = async () => {
//   await addCourseEvalsFromJson(courseData)
//   return true
// };

/** Raw course evaluation data for a single course (e.g. as imported from web scraping). */
interface CourseEvaluationRaw {
  courseName: string;
  semester: string;
  courseOverall: string;
  profTeachingSkill: string;
  profKnowledge: string;
  profClimate: string;
  profOverall: string;
  numA: string;
  numB: string;
  numC: string;
  numD: string;
  numF: string;
  numS: string;
  numU: string;
  numGradeNA: string;
  numFresh: string;
  numSoph: string;
  numJr: string;
  numSr: string;
  numAg: string;
  numHumec: string;
  numArch: string;
  numILR: string;
  numArts: string;
  numEng: string;
  numHotel: string;
  numOther: string;
  numMajorReq: string;
  numReputation: string;
  numInterest: string;
  statement8Score: string;
  statement9Score: string;
  statement10Score: string;
  statement11Score: string;
  statement12Score: string;
  statement13Score: string;
  statement14Score: string;
  statement15Score: string;
  statement16Score: string;
  statement17Score: string;
  statement18Score: string;
  statement19Score: string;
  statement20Score: string;
  statement21Score: string;
  statement22Score: string;
  statement23Score: string;
  statement24Score: string;
  statement25Score: string;
}

/** Raw course evaluation data for a single JSON file. */
interface CourseEvaluationsRaw {
  [key: string]: CourseEvaluationRaw;
}

/** Processed list of course evaluations. */
interface CourseEvaluations {
  [key: string]: CourseEvaluation;
}
