import React, { useEffect, useState } from 'react';
import { CourseEvaluation } from 'common';

type CourseEvalProps = {
  courseEval: CourseEvaluation;
};

const CourseEval = ({ courseEval }: CourseEvalProps) => {
  const [mappedSentiments, setMappedSentiments] = useState(
    mapSentiments(courseEval.sentiments)
  );

  useEffect(() => {
    setMappedSentiments(mapSentiments(courseEval.sentiments));
    console.log(mappedSentiments)
  }, [courseEval]);

  return (
    <div>
      <p>COURSE NAME: {courseEval.courseName}</p>
      <p>EVAL SEMESTER: {courseEval.semester}</p><br/>
      <p>-- PROFESSOR RATINGS --</p>
      <p>TEACHING SKILLS: {courseEval.profTeachingSkill}</p>
      <p>KNOWLEDGE OF SUBJECT MATTER: {courseEval.profKnowledge}</p>
      <p>CLASSROOM CLIMATE: {courseEval.profClimate}</p>
      <p>OVERALL: {courseEval.profOverall}</p><br/>

      <p>APPROX. GRADE IN COURSE: A: {courseEval.numA}. B: {courseEval.numB}. C: {courseEval.numC}. D:{' '}
        {courseEval.numD}. F: {courseEval.numF}. S: {courseEval.numS}. U:{' '}
        {courseEval.numU}.
      </p>

      <p>
        STUDENT YEAR -- FROSH: {courseEval.numFresh}. SOPH: {courseEval.numSoph}.
        JR: {courseEval.numJr}. SR: {courseEval.numSr}.
      </p><br/>

      <p>TOP SENTIMENTS: {mappedSentiments[0].join(', ')}.</p>
      <p>REASONS FOR TAKING COURSE: {mappedSentiments[1].join(', ')}.</p><br/>

      <p>
        SCHOOL -- CALS: {courseEval.numAg}. AAP: {courseEval.numArch}. CAS:{' '}
        {courseEval.numArts}. COE: {courseEval.numEng}. HOTEL:{' '}
        {courseEval.numHotel}. HUMEC: {courseEval.numHumec}. ILR:{' '}
        {courseEval.numILR}.
      </p>
    </div>
  );
};

const mapSentiments = (sentiments: [number, number][]) => {
  const courseEvaluationSentiments: Record<number, string> = {
    8: 'The instructor was enthusiastic about teaching',
    9: 'The instructor encouraged a variety of viewpoints',
    10: 'The instructor conducted an informative & stimulating lecture or class',
    11: 'The instructor demonstrated command of the subject matter',
    12: 'The instructor was well prepared for each class',
    13: 'The instructor presented material across in an interesting way',
    14: 'The instructor was responsive to questions',
    15: 'The instructor(s) and/or teaching assistants were easily available to help me as needed',
    16: 'The instructor treated me fairly',
    17: 'The instructor effectively engaged students in class',
    18: 'I would recommend this course to a fellow student',
    19: 'The course was well planned and organized',
    20: 'I learned a great deal in this course',
    21: 'I gained applicable skill and/or knowledge from this course',
    22: 'This course challenged me intellectually.',
    23: 'The course helped me develop the ability to think through a problem or argument.',
    24: 'During the semester, the instructor made me aware of the course learning objectives',
    25: 'I think that the stated learning objectives of this course were met'
  };

  const topSentimentsBucket = sentiments.filter((s) => s[0] >= 8 && s[0] <= 19);
  const reasonsForTakingBucket = sentiments.filter(
    (s) => s[0] >= 20 && s[0] <= 25
  );

  const sortByScore = (a: [number, number], b: [number, number]) => b[1] - a[1];

  const topSentiments = topSentimentsBucket.sort(sortByScore).slice(0, 3);

  const topReasonsForTaking = reasonsForTakingBucket
    .sort(sortByScore)
    .slice(0, 3);

  return [
    topSentiments.map((sentiment) => [
      courseEvaluationSentiments[sentiment[0]]
    ]),
    topReasonsForTaking.map((sentiment) => [
      courseEvaluationSentiments[sentiment[0]]
    ])
  ];
};

export default CourseEval;