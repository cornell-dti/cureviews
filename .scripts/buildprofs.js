/*
 * This file exists to build the professors database.
 * NOTE: This requires having already loaded in a classes collection
 *
 * To Use:
 * 1. Have a local mongodb open: mongod --dbpath ./mongo --port 3001
 * 2. Open the mongodb shell for this local instance `mongo --port 3001`
 * 3. run `load(".scripts/buildprofs.js")`
 */

printjson("Beginning to build Professors Collection");

professors = {}

// For each class, build a list of professors and their classes
db.classes.find().forEach(Class => {
    if (Class.classProfessors) {
        Class.classProfessors.forEach(profName => {
            if (professors[profName]) {
                professors[profName].courses.push(Class._id);
            } else {
                professors[profName] = { fullName: profName, courses: [Class._id], major: Class.classSub };
            }
        });
    }
});

// just for fun, print out every professor and the classes that they teach
classname = Id => db.classes.findOne({_id: Id}).classTitle;

Object.keys(professors).forEach(entry => {
    let classText = "";
    professors[entry].courses.forEach(Class => classText += ", " + classname(Class));
    printjson(professors[entry].fullName + " (" + professors[entry].major + ")" + classText);
});

// batch write the documents into mongo
docs = []

Object.keys(professors).forEach(entry => {
    docs.push(professors[entry]);
});


// Drop professors collection if one exists, and start from scratch
db.professors.drop();
if (!db.professors.insertMany(docs).acknowledged) {
    throw new Error("Unable to insert documents!");
} else {
    printjson("Built professors db!");
}

// For each class, insert the id of the relevant professor 
db.classes.find().forEach(Class => {
    let ids = []
    if (Class.classProfessors) {
        Class.classProfessors.forEach(profName => {
            ids.push(db.professors.findOne({fullName: profName})._id);
        });
    }
    db.classes.update({_id: Class._id}, {$set: {classProfessorIds: ids}});
});

// To verify correctness, print out all classes and the names of the attached professors
profname = Id => db.professors.findOne({_id: Id}).fullName;

db.classes.find().forEach(Class => {
    let profText = "";
    Class.classProfessorIds.forEach(Id => profText += ", " + profname(Id));
    printjson(Class.classTitle + " " + profText);
});

printjson("Done updating collections");