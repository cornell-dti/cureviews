import { Mongo } from 'meteor/mongo';

/*

 Database definitions file. Defines all collections in the local database,
 with collection attributes, types, and required fields.

 Used by both the Server and Client to define local and minimongo database
 structures.

*/

/* # Classes collection.
   # Holds data about each class in the course roster.
*/
export const Classes = new Mongo.Collection('classes');
Classes.schema = new SimpleSchema({
    _id: {type: String},
    classSub: {type: String},
    classNum: {type: Number},
    classTitle: {type: String},
    classPrereq : { type: [String] ,optional: true},
    crossList : { type: [String] ,optional: true},
    classFull: {type: String},
    classSems: {type: [String]}
});

/* # Users collection.
   # Holds data about each user. Data is collected via Cornell net-id login.
*/
export const Users = new Mongo.Collection('users');
Users.schema = new SimpleSchema({
    _id: {type: String},
    firstName: {type: String},
    lastName: {type: String},
    netId: {type: String},
    affiliation: {type: String},
    token: {type: String}
});

/* # Subjects Collection
   # List of all course subject groups and their full text names
   # ex: CS -> Computer Science
*/
export const Subjects = new Mongo.Collection('subjects');
Subjects.schema = new SimpleSchema({
    _id: {type: String},
    subShort : {type: String},
    subFull: {type: String}
});

/* # Reviews Collection.
   # Stores each review inputted by a user. Linked with the course that was
   # reviewed via a mapping with on class, which holds the _id attribute of
   # the class from the Classes collection
*/
export const Reviews = new Mongo.Collection('reviews');
Reviews.schema = new SimpleSchema({
    _id: {type: String},
    user: {type: String, optional:true},
    text: {type: String, optional: true},
    difficulty: {type: Number},
    quality: {type: Number},
    class: {type: String}, //ref to classId
    grade: {type: Number},
    date: {type: Date},
    atten: {type: Number},
    visible: {type: Number},
    reported: {type: Number},
});

/* # Validation Collection.
   # Stores passwords and other sensitive application keys.
   # Must be manually populated with data when the app is initialized.
*/
export const Validation = new Mongo.Collection('validation');
Validation.schema = new SimpleSchema({
    _id: {type: String},
    adminPass: {type: String},
});
