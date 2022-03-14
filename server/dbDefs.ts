import mongoose, { Schema } from "mongoose";
import { Class, Student, Subject, Review, Professor } from "common";

/*

 Database definitions file. Defines all collections in the local database,
 with collection attributes, types, and required fields.

 Used by both the Server and Client to define local and minimongo database
 structures.

*/

/* # Classes collection.
   # Holds data about each class in the course roster.
*/
export interface ClassDocument extends mongoose.Document, Class {
  _id: string;
}

const ClassSchema = new Schema<ClassDocument>({
  _id: { type: String }, // overwritten _id field to play nice with our old db
  classSub: { type: String }, // subject, like "PHIL" or "CS"
  classNum: { type: String }, // course number, like 1110
  classTitle: { type: String }, // class title, like 'Introduction to Algorithms'
  classPrereq: { type: [String], required: false }, // list of pre-req classes, a string of Classes _id.
  crossList: { type: [String], required: false }, // list of classes that are crosslisted with this one, a string of Classes _id.
  classFull: { type: String }, // full class title to search by, formated as 'classSub classNum: classTitle'
  classSems: { type: [String] }, // list of semesters this class was offered, like ['FA17', 'FA16']
  classProfessors: { type: [String] }, // list of professors that have taught the course over past semesters
  classRating: { type: Number }, // the average class rating from reviews
  classWorkload: { type: Number }, // the average workload rating from reviews
  classDifficulty: { type: Number }, // the average difficulty rating from reviews

});

export const Classes = mongoose.model<ClassDocument>("classes", ClassSchema);
/* # Users collection.
   # Holds data about each user. Data is collected via Cornell net-id login.
*/

export interface StudentDocument extends mongoose.Document, Student {
  readonly _id: string;
}

const StudentSchema = new Schema<StudentDocument>({
  _id: { type: String }, // overwritten _id field to play nice with our old db
  firstName: { type: String }, // user first name
  lastName: { type: String }, // user last name
  netId: { type: String }, // user netId
  affiliation: { type: String }, // user affliaition, like ENG or A&S
  token: { type: String }, // random token generated during login process
  privilege: { type: String }, // user privilege level
  reviews: { type: [String] }, // the reviews that this user has posted.
  likedReviews: { type: [String] },
});
export const Students = mongoose.model<StudentDocument>("students", StudentSchema);

/* # Subjects Collection
   # List of all course subject groups and their full text names
   # ex: CS -> Computer Science
*/

export interface SubjectDocument extends mongoose.Document, Subject {
  readonly _id: string;
}

const SubjectSchema = new Schema<SubjectDocument>({
  _id: { type: String }, // overwritten _id field to play nice with our old db
  subShort: { type: String }, // subject, like "PHIL" or "CS"
  subFull: { type: String }, // subject full name, like 'Computer Science'
});
export const Subjects = mongoose.model<SubjectDocument>("subjects", SubjectSchema);

/* # Reviews Collection.
   # Stores each review inputted by a user. Linked with the course that was
   # reviewed via a mapping with on class, which holds the _id attribute of
   # the class from the Classes collection
*/

export interface ReviewDocument extends mongoose.Document, Review {
  readonly _id: string;
}

const ReviewSchema = new Schema<ReviewDocument>({
  _id: { type: String }, // overwritten _id field to play nice with our old db
  user: { type: String, required: false }, // user who wrote this review, a Users _id
  text: { type: String, required: false }, // text from the review
  difficulty: { type: Number }, // difficulty measure from the review
  rating: { type: Number }, // quality measure from the review
  workload: { type: Number }, // quality measure from the review
  class: { type: String }, // class the review was for, a Classes _id
  date: { type: Date }, // date/timestamp the review was submited
  visible: { type: Number }, // visibility flag - 1 if visible to users, 0 if only visible to admin
  reported: { type: Number }, // reported flag - 1 if review was reported, 0 otherwise
  professors: { type: [String] }, // list of professors that have thought the course over past semesters
  likes: { type: Number, min: 0 }, // number of likes a review has
  likedBy: { type: [String] },
  isCovid: { type: Boolean },
  selectedGrade: { type: String },
  selectedMajors: { type: [String] },
  // The following was a temporary field used to keep track of reviews for a contest
  // The full functional code for counting reviews can be found on the following branch:
  // review-counting-feature
});
export const Reviews = mongoose.model<ReviewDocument>("reviews", ReviewSchema);

/* # Professors collection.
   # Holds data about each professor.
*/

export interface ProfessorDocument extends mongoose.Document, Professor {
  readonly _id: string;
}

const ProfessorSchema = new Schema<ProfessorDocument>({
  _id: { type: String }, // mongo-generated random id for this document
  fullName: { type: String }, // the full name of the professor
  courses: { type: [String] }, // a list of the ids all the courses
  major: { type: String }, // professor affliation by probable major
});
export const Professors = mongoose.model<ProfessorDocument>("professors", ProfessorSchema);

/* # Validation Collection.
   # Stores passwords and other sensitive application keys.
   # Must be manually populated with data when the app is initialized.
*/
const ValidationSchema = new Schema({
  _id: { type: String }, // mongo-generated random id for this document
  adminPass: { type: String }, // admin password to validate against
});

interface ValidationDocument extends mongoose.Document {
  _id: string;
  adminPass?: string;
}

export const Validation = mongoose.model<ValidationDocument>("validation", ValidationSchema);
