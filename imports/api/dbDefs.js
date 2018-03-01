import { Mongo } from 'meteor/mongo';

//defines struture of database elements 
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

export const Users = new Mongo.Collection('users');
Users.schema = new SimpleSchema({
    _id: {type: String},
    firstName: {type: String},
    lastName: {type: String},
    netId: {type: String},
    affiliation: {type: String},
    token: {type: String}
});

export const Subjects = new Mongo.Collection('subjects');
Subjects.schema = new SimpleSchema({
    _id: {type: String},
    subShort : {type: String},
    subFull: {type: String}
});

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

export const Validation = new Mongo.Collection('validation');
Validation.schema = new SimpleSchema({
    _id: {type: String},
    adminPass: {type: String},
});
