import React, {useEffect, useState} from 'react';

import {CourseEvaluation} from 'common';
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
import {Bar, Pie} from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';


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

ChartJS.defaults.scale.grid.display = false;

const CourseEval = ({courseEval}: CourseEvalProps) => {
  const [mappedSentiments, setMappedSentiments] = useState(
    mapSentiments(courseEval.sentiments)
  );

  useEffect(() => {
    setMappedSentiments(mapSentiments(courseEval.sentiments));
  }, [courseEval]);

  const profChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    maxBarThickness: 25,
    plugins: {
      legend: {
        display: false
      },
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'end',
        clip: false,
        color: "#000",
        font: {
          size: 14,
          weight: 600,
          family: 'Arial',
        },
        padding: {
          left: 20,
        }
      }
    },
    layout: {
      padding: {
        bottom: 10,
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 7,
        grid: {
          display: false
        },
        ticks: {
          display: false
        },
        border: {
          display: false
        }
      },
      y: {
        position: 'right',
        grid: {
          display: false
        },
        offset: true,
        ticks: {
          crossAlign: 'far',
          color: '#807B7B',
          font: {
            size: 10,
            weight: 400,
            family: 'Arial',
          }
        },
        border: {
          display: false
        }
      }
    }
  };

  const gradeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
      },
    },
    plugins: {
      legend: {
        display: false
      },
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'end',
        color: "#000",
        font: {
          size: 14,
          weight: 600,
          family: 'Arial',
        },
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        offset: true,
        grid: {
          display: false
        },
        border: {
          display: false
        },
      },
      y: {
        display: false
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          boxHeight: 8,
        },
      }
    }
  }

  const profData = {
    labels: [
      'Teaching Skills',
      'Knowledge of Subject Matter',
      'Classroom Climate',
      'Overall'
    ],
    datasets: [
      {
        data: [
          courseEval.profTeachingSkill,
          courseEval.profKnowledge,
          courseEval.profClimate,
          courseEval.profOverall
        ],
        backgroundColor: '#53B227',
        barThickness: 30,
        borderRadius: 4,
        borderSkipped: false
      }
    ]
  };

  const gradeData = {
    labels: ['A', 'B', 'C', 'D', 'F', 'S', 'U', 'Declined'],
    datasets: [
      {
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
        backgroundColor: '#53B227',
        barThickness: 30,
        borderRadius: 4,
        borderSkipped: false
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
          'rgba(245, 196, 217, 1)',
          'rgba(255, 161, 100, 1)',
          'rgba(154, 198, 247, 1)',
          'rgba(209, 141, 238, 1)',
        ],
        borderColor: 'white',
        borderWidth: 3
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
          'rgba(255, 165, 165, 1)',
          'rgba(255, 161, 100, 1)',
          'rgba(248, 204, 48, 1)',
          'rgba(163, 199, 134, 1)',
          'rgba(154, 198, 247, 1)',
          'rgba(209, 141, 238, 1)',
          'rgba(245, 196, 217, 1)',
        ],
        borderColor: 'white',
        borderWidth: 3
      }
    ]
  }

  return (
    <div>
      <p className={styles.disclaimer}>This course evaluation data is sourced from Cornell’s course evaluation database
        from {courseEval.semester} and reflects feedback from {courseEval.totalEvals} student responses. It may
        not fully capture the course experience for all students.</p>
      <div className={styles.dashboard}>
        <div className={`${styles.container} ${styles.professorRating}`}>
          <h1>Professor Rating</h1>
          <div style={{width:'100%', height:'100%'}}>
            <Bar options={profChartOptions} data={profData} plugins={[ChartDataLabels]}/>
          </div>
        </div>
        <div className={`${styles.container} ${styles.topSentiments}`}>
          <h1>Top Sentiments</h1>
          <div className={styles.textContainer}>
            {mappedSentiments[0].map((statement) => <p>"{statement}"</p>)}
          </div>
        </div>
        <div className={`${styles.container} ${styles.gradeDistribution}`}>
          <h1>Approximate Grade in Course</h1>
          <div style={{width:'100%', height:'100%'}}>
            <Bar className={styles.bar} options={gradeChartOptions} data={gradeData} plugins={[ChartDataLabels]}/>
          </div>
        </div>
        <div className={`${styles.container} ${styles.studentYear}`}>
          <h1>Student Year</h1>
          <div style={{width:'90%', height:'90%'}}>
            <Pie options={pieOptions} data={yearData}/>
          </div>
        </div>
        <div className={`${styles.container} ${styles.schoolCollege}`}>
          <h1>School / College</h1>
          <div style={{width:'90%', height:'90%'}}>
            <Pie options={pieOptions} data={collegeData}/>
          </div>
        </div>
        <div className={`${styles.container} ${styles.reasonTaking}`}>
          <h1>Reasons For Taking Course</h1>
          <div className={styles.textContainer}>
            {mappedSentiments[1].map((statement) => <p>"{statement}"</p>)}
          </div>
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
    .slice(0, 4);

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