import { Class, Professor, Review, Student, Subject } from 'common';

export const testSubjects: Subject[] = [
  {
    _id: 'newSubject1',
    subShort: 'MORK',
    subFull: 'Study of Angry Fungi'
  },
  {
    _id: 'angry subject',
    subShort: 'MAD',
    subFull: 'The Study of Anger Issues'
  },
  {
    _id: 'federation subject',
    subShort: 'FEDN',
    subFull: 'The Study of Where No Man Has Gone Before!'
  }
];

export const testStudents: Student[] = [
  {
    _id: 'Irrelevant',
    firstName: 'John',
    lastName: 'Smith',
    netId: 'hu33',
    affiliation: '',
    token: '',
    privilege: 'regular',
    reviews: [],
    likedReviews: []
  },
  {
    _id: 'Irrelevant2',
    firstName: 'Dan Thomas',
    lastName: 'Ivy',
    netId: 'dti1',
    affiliation: '',
    token: 'fakeTokenDti1',
    privilege: 'admin',
    reviews: [],
    likedReviews: []
  },
  {
    _id: 'bleh',
    firstName: 'whatever',
    lastName: 'ok',
    netId: 'cv4620',
    affiliation: '',
    token: 'fakeTokencv4620',
    privilege: 'regular',
    reviews: [
      '4Y8k7DnX3PLNdwRPr',
      '4Y8k7DnX3PLNdwRPq',
      '3yMwTbiyd4MZLPQJF',
      '52x7j6tkXHxvrZizx'
    ],
    likedReviews: []
  },
  {
    _id: 'test1',
    firstName: 'test',
    lastName: 'test',
    netId: 'dhs234',
    affiliation: '',
    token: 'fakeTokencv4620',
    privilege: 'regular',
    reviews: [],
    likedReviews: []
  }
];

export const testReviews: Review[] = [
  {
    _id: '4Y8k7DnX3PLNdwRPr',
    text: 'review text for cs 2110',
    user: 'bleh',
    difficulty: 1,
    class: 'oH37S3mJ4eAsktypy',
    visible: 0,
    reported: 1,
    likes: 2,
    likedBy: ['user1234', 'user0']
  },
  {
    _id: '4Y8k7DnX3PLNdwRPq',
    text: 'review text for cs 2110 number 2',
    user: 'bleh',
    difficulty: 1,
    class: 'oH37S3mJ4eAsktypy',
    visible: 1,
    reported: 0,
    likedBy: []
  },
  {
    _id: '3yMwTbiyd4MZLPQJF',
    text: 'review text for cs 3110',
    user: 'bleh',
    difficulty: 3,
    class: 'cJSmM8bnwm2QFnmAn',
    date: new Date(),
    visible: 0,
    reported: 0,
    likes: 0,
    likedBy: []
  },
  {
    _id: '52x7j6tkXHxvrZizx',
    text: 'review text for cs 3110 - 2',
    user: 'bleh',
    difficulty: 3,
    class: 'cJSmM8bnwm2QFnmAn',
    date: new Date(),
    visible: 0,
    reported: 1,
    likes: 5,
    likedBy: []
  }
];

export const testProfessors: Professor[] = [
  {
    _id: 'prof_1',
    fullName: 'Gazghul Thraka',
    courses: ['newCourse1', 'newCourse2'],
    major: 'mork'
  },
  {
    _id: 'prof_2',
    fullName: 'Jean-Luc Picard',
    courses: [],
    major: 'fedn'
  }
];

export const testClasses: Class[] = [
  {
    _id: 'cJSmM8bnwm2QFnmAn',
    classSub: 'cs',
    classNum: '3110',
    classTitle: 'Data Structures and Functional Programming',
    classPrereq: [],
    classFull: 'CS 3110 Data Structures and Functional Programming',
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
      'SU19'
    ],
    crossList: [],
    classProfessors: ['John Foster', 'Michael Clarkson'],
    classDifficulty: 2.9,
    classRating: undefined,
    classWorkload: 3
  },
  {
    _id: 'oH37S3mJ4eAsktypy',
    classSub: 'cs',
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
      'SU19'
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
      'Michael Clarkson'
    ],
    classDifficulty: 2.9,
    classRating: undefined,
    classWorkload: 3
  },
  {
    _id: 'newCourse1',
    classSub: 'mork',
    classNum: '1110',
    classTitle: 'Introduction to Testing',
    classFull: 'MORK 1110: Introduction to Testing',
    classSems: ['FA19'],
    classProfessors: ['Gazghul Thraka'],
    classRating: 1,
    classWorkload: 2,
    classDifficulty: 3,
    classPrereq: [],
    crossList: []
  },
  {
    _id: 'newCourse2',
    classSub: 'mork',
    classNum: '2110',
    classTitle: 'Intermediate Testing',
    classFull: 'MORK 2110: Intermediate Testing',
    classSems: ['SP20'],
    classPrereq: ['newCourse1'], // the class above
    classProfessors: ['Gazghul Thraka'],
    classRating: 3,
    classWorkload: 4,
    classDifficulty: 5,
    crossList: []
  },
  {
    _id: 'newCourse3',
    classSub: 'mork',
    classNum: '3110',
    classTitle: 'Advanced Mock',
    classFull: 'MORK 3110: Advanced Mock',
    classSems: ['SP20'],
    classPrereq: ['newCourse2'], // the class above
    classProfessors: ['Gazghul Thraka'],
    classRating: 3,
    classWorkload: 5,
    classDifficulty: 5,
    crossList: []
  }
];
