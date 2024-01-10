import { Class, Professor, Review, Student, Subject } from 'common';

export const testSubjects: Subject[] = [
  {
    _id: 'newSubject1',
    subShort: 'MORK',
    subFull: 'Study of Angry Fungi',
  },
  {
    _id: 'angry subject',
    subShort: 'MAD',
    subFull: 'The Study of Anger Issues',
  },
  {
    _id: 'federation subject',
    subShort: 'FEDN',
    subFull: 'The Study of Where No Man has Gone Before!',
  },
];

export const testStudents: Student[] = [
  {
    _id: 'Irrelevant',
    firstName: 'John',
    lastName: 'Smith',
    netId: 'js0',
    affiliation: '',
    token: '',
    privilege: 'regular',
    reviews: [],
    likedReviews: [],
  },
];

export const testReviews: Review[] = [
  {
    _id: '4Y8k7DnX3PLNdwRPr',
    text: 'review text for cs 2110',
    user: 'User1234',
    difficulty: 1,
    class: 'oH37S3mJ4eAsktypy',
    visible: 1,
    reported: 0,
    likes: 2,
    likedBy: ['user1234', 'user0'],
  },
  {
    _id: '4Y8k7DnX3PLNdwRPq',
    text: 'review text for cs 2110 number 2',
    user: 'User1234',
    difficulty: 1,
    class: 'oH37S3mJ4eAsktypy',
    visible: 1,
    reported: 0,
    likedBy: [],
  },
];

export const testProfessors: Professor[] = [
  {
    _id: 'prof_1',
    fullName: 'Gazghul Thraka',
    courses: ['newCourse1', 'newCourse2'],
    major: 'MORK',
  },
  {
    _id: 'prof_2',
    fullName: 'Jean-Luc Picard',
    courses: [],
    major: 'FEDN',
  },
];

export const testClasses: Class[] = [
  {
    _id: 'oH37S3mJ4eAsktypy',
    classSub: 'CS',
    classNum: '2110',
    classTitle: 'Object-Oriented Programming and Data Structures',
    classPrereq: [],
    classFull: 'CS 2110 Object-Oriented Programming and Data Structures',
    classSems: [
      'FA14',
      'SP15',
      'SU15',
      'FA15',
      'SP16',
      'SU16',
      'FA16',
      'SP17',
      'SU17',
      'FA17',
      'SP18',
      'FA18',
      'SU18',
      'SP19',
      'FA19',
      'SU19',
    ],
    crossList: ['q75SxmqkTFEfaJwZ3'],
    classProfessors: [
      'David Gries',
      'Douglas James',
      'Siddhartha Chaudhuri',
      'Graeme Bailey',
      'John Foster',
      'Ross Tate',
      'Michael George',
      'Eleanor Birrell',
      'Adrian Sampson',
      'Natacha Crooks',
      'Anne Bracy',
      'Michael Clarkson',
    ],
    classDifficulty: 2.9,
    classRating: undefined,
    classWorkload: 3,
  },
  {
    _id: 'newCourse1',
    classSub: 'MORK',
    classNum: '1110',
    classTitle: 'Introduction to Testing',
    classFull: 'MORK 1110: Introduction to Testing',
    classSems: ['FA19'],
    classProfessors: ['Gazghul Thraka'],
    classRating: 1,
    classWorkload: 2,
    classDifficulty: 3,
    classPrereq: [],
    crossList: [],
  },
  {
    _id: 'newCourse2',
    classSub: 'MORK',
    classNum: '2110',
    classTitle: 'Intermediate Testing',
    classFull: 'MORK 2110: Intermediate Testing',
    classSems: ['SP20'],
    classPrereq: ['newCourse1'], // the class above
    classProfessors: ['Gazghul Thraka'],
    classRating: 3,
    classWorkload: 4,
    classDifficulty: 5,
    crossList: [],
  },
];
