import React, { useEffect, useState } from 'react';

import { CourseEvaluation } from 'common';
import styles from '../Styles/CourseEval.module.css'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

type CourseEvalProps = {
  courseEval: CourseEvaluation;
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const CourseEval = ({ courseEval }: CourseEvalProps) => {
  const [mappedSentiments, setMappedSentiments] = useState(
    mapSentiments(courseEval.sentiments)
  );

  useEffect(() => {
    setMappedSentiments(mapSentiments(courseEval.sentiments));
    console.log(mappedSentiments);
  }, [courseEval]);

  const horiz_options = {
    indexAxis: 'y' as const,
    elements: {
      bar: {
        borderWidth: 2
      }
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const
      },
      title: {
        display: true,
        text: 'Chart.js Horizontal Bar Chart'
      }
    }
  };

  const vert_options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Chart.js Bar Chart'
      }
    }
  };

  const profData = {
    labels: [
      'Teaching Skills',
      'Knowledge of Subject Matter',
      'Classroom Climate',
      'Overall'
    ],
    datasets: [
      {
        label: 'Dataset 1',
        data: [
          courseEval.profTeachingSkill,
          courseEval.profKnowledge,
          courseEval.profClimate,
          courseEval.profOverall
        ],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)'
      }
    ]
  };

  const gradeData = {
    labels: ['A', 'B', 'C', 'D', 'F', 'S', 'U', 'Declined'],
    datasets: [
      {
        label: 'Dataset 1',
        data: [
          courseEval.numA,
          courseEval.numB,
          courseEval.numC,
          courseEval.numD,
          courseEval.numF,
          courseEval.numS,
          courseEval.numU,
          courseEval.numGradeNA
        ],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)'
      }
    ]
  };

  const yearData = {
    labels: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
    datasets: [
      {
        label: '# of Students',
        data: [
          courseEval.numFresh,
          courseEval.numSoph,
          courseEval.numJr,
          courseEval.numSr
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const collegeData = {
    labels: ['CALS', 'AAP', 'CAS', 'COE', 'Hotel', 'HumEc', 'ILR'],
    datasets: [
      {
        label: '# of Students',
        data: [
          courseEval.numAg,
          courseEval.numArch,
          courseEval.numArts,
          courseEval.numEng,
          courseEval.numHotel,
          courseEval.numHumec,
          courseEval.numILR
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }
    ]
  }

  return (
    <div>
      <p>COURSE NAME: {courseEval.courseName}</p>
      <p>EVAL SEMESTER: {courseEval.semester}</p>
      <div className={styles.dashboardContainer}>
        <div className={styles.professorRating}>
          <Bar options={horiz_options} data={profData} />
        </div>
        <div className={styles.topSentiments}>
          <p>TOP SENTIMENTS: {mappedSentiments[0].join(', ')}.</p>
        </div>
        <div className={styles.gradeDistribution}>
          <Bar options={vert_options} data={gradeData} />
        </div>
        <div className={styles.studentYear}>
          <Pie data={yearData} />
        </div>
        <div className={styles.schoolCollege}>
          <Pie data={collegeData} />
        </div>
        <div className={styles.reasonTaking}>
          <p>REASONS FOR TAKING COURSE: {mappedSentiments[1].join(', ')}.</p>
        </div>
      </div>
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