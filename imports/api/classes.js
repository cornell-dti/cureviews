import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';
import { check } from 'meteor/check';

export const Classes = new Mongo.Collection('classes');
Classes.schema = new SimpleSchema({
    _id: {type: String},
    classSub: {type: String},
    classNum: {type: Number},
    classTitle: {type: String},
    classPrereq : { type: [String] ,optional: true},
    classFull: {type: String},
    classSems: {type: [String]}
});

export const Users = new Mongo.Collection('users');
Users.schema = new SimpleSchema({
    _id: {type: String},
    firstName: {type: String},
    lastName: {type: String},
    netId: {type: String},
    affiliation: {type: String}
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
    user: {type: String},
    text: {type: String,optional: true},
    difficulty: {type: Number},
    quality: {type: Number},
    class: {type: String}, //ref to classId
    grade: {type: Number},
    date: {type: Date},
    atten: {type: Number},
    visible: {type: Number},
    reported: {type: Number},
});

// defines all methods that will be editing the database so that database changes occur only on the server
Meteor.methods({
    //insert a new review into the reviews database
    insert: function(review, classId) {
        //only insert if all necessary feilds are filled in
        if (review.text !== null && review.diff !== null && review.quality !== null && review.medGrade !== null && classId !== undefined && classId !== null) {
            //ensure there are no illegal characters
            var regex = new RegExp(/^(?=.*[A-Z0-9])[\w:;.,!()"'\/$ ]+$/i)
            if (regex.test(review.text)) {
                Reviews.insert({
                    text: review.text,
                    difficulty: review.diff,
                    quality: review.quality,
                    class: classId,
                    grade: review.medGrade,
                    date: new Date(),
                    visible: 0,
                    reported: 0,
                    atten: review.atten
                });
                return 1 //success
            } else {
                return 0 //fail
            }
        } else {
            return 0 //fail
        }
    },
    //make the reveiw with this id visible, checking to make sure it has a real id
    makeVisible: function (review) {
        var regex = new RegExp(/^(?=.*[A-Z0-9])/i);
        if (regex.test(review._id)) {
            Reviews.update(review._id, {$set: { visible: 1} });
            return 1;
        } else {
            return 0;
        }
    },
    //remove the review with this id, checking to make sure the id is a real id
    removeReview: function(review) {
        var regex = new RegExp(/^(?=.*[A-Z0-9])/i);
        if (regex.test(review._id)) {
            Reviews.remove({ _id: review._id});
            return 1;
        } else {
            return 0;
        }
    },
    //update the database to add any new classes in the current semester if they don't already exist. To be called from the admin page once a semester.
    addNewSemester: function(initiate) {
        if (initiate && Meteor.isServer) {
            console.log("updating");
            return addAllCourses(findCurrSemester());
            //return addAllCourses(['FA15']);
        }
    },
    addAll: function(initiate) {
        if (initiate && Meteor.isServer) {
            console.log("adding everything");
            Classes.remove({});
            Subjects.remove({});
            return addAllCourses(findAllSemesters());
        }
    },
    //get the course (as an object) with this id, checking to make sure the id is real
    getCourseById: function(courseId) {
        var regex = new RegExp(/^(?=.*[A-Z0-9])/i);
        if (regex.test(courseId)) {
            var c = Classes.find({_id: courseId}).fetch()[0];
            //console.log(c);
            return c;
        }
        return null
    },
    //allow user to flag a review - make it invisible and allow admin to review it.
    reportReview: function(review) {
      var regex = new RegExp(/^(?=.*[A-Z0-9])/i)
      if (regex.test(review._id)) {
        Reviews.update({_id: review._id}, { $set: {visible: 0, reported: 1} });
        return 1;
      } else {
        return 0;
      }
    },
    //un-flag a user, make it visible and unreported
    undoReportReview: function(review) {
      var regex = new RegExp(/^(?=.*[A-Z0-9])/i)
      if (regex.test(review._id)) {
        Reviews.update({_id: review._id}, { $set: {visible: 1, reported: 0} });
        return 1;
      } else {
        return 0;
      }
    },
    //most popular classes by number of reviews
    topClasses: function() {
      console.log("popular classes");
      //using the add-on library meteorhacks:aggregate, define pipeline aggregate functions
      var pipeline = [
        //consider only visible reviews
        {$match: { visible: 1}},
        //group by class and get count of reviews
        {$group: { _id: '$class', reviewCount: { $sum: 1} }},
        //sort by decending count
        {$sort: {"reviewCount": -1}},
        {$limit: 10}
      ];

      //run the functions, and find the course object for each courseId
      mostReviews = Reviews.aggregate(pipeline).map(function(course) {
        return Classes.find({_id: course._id}).fetch()[0];
      });

      return  mostReviews
    }
});

//Code that runs only on the server
if (Meteor.isServer) {
    // Meteor.startup(() => { // code to run on server at startup
    //     //add indexes to collections for faster search
    //     Classes._ensureIndex(
    //         { 'classSub' : 1 },
    //         { 'classNum' : 1 },
    //         { 'classTitle' : 1 },
    //         { '_id:' : 1 }
    //     );
    //     Subjects._ensureIndex(
    //         { 'subShort' : 1 },
    //         { 'subFull' : 1 }
    //     );
    //     Reviews._ensureIndex(
    //         { 'class' : 1},
    //         { 'difficulty' : 1 },
    //         { 'quality' : 1 },
    //         { 'grade' : 1 },
    //         { 'user' : 1 },
    //         { 'visible' : 1 }
    //     );
    // });

    //code that runs whenever needed
    //"publish" classes based on search query. Only published classes are visible to the client
    Meteor.publish('classes', function validClasses(searchString) {
      if (searchString !== undefined && searchString !== "") {
            console.log("query entered:", searchString);
            return Classes.find({'$or' : [
                    { 'classSub':{ '$regex' : `.*${searchString}.*`, '$options' : '-i' }},
                    { 'classNum':{ '$regex' : `.*${searchString}.*`, '$options' : '-i' } },
                    { 'classTitle':{ '$regex' : `.*${searchString}.*`, '$options' : '-i' }},
                    { 'classFull':{ '$regex' : `.*${searchString}.*`, '$options' : '-i' }}]

                },
                {limit: 200});
        }
        else {
            console.log("no search");
            return Classes.find({},
                {limit: 200});
        }
    });

    //"publish" reviews based on selected course, visibility and reporting requirements. Only published reviews are visible to the client
    Meteor.publish('reviews', function validReviews(courseId, visiblity, reportStatus) {
        var ret = null
        //show valid reviews for this course
        console.log('getting reviews');
        //for a -1 courseId, disply the most popular reviews (visible, non reported only)
        if (courseId == -1) {
          console.log('in popular');
          ret =  Reviews.find({visible : 1, reported: 0}, { sort: { date: -1 }, limit: 20});
        }
        else if (courseId !== undefined && courseId !== "" && visiblity === 1 && reportStatus===0) {
            console.log('in 1');
            ret =  Reviews.find({class : courseId, visible : 1, reported: 0}, {limit: 700});
        } else if (courseId !== undefined && courseId !== "" && visiblity === 0) { //invalidated reviews for a class
            console.log('in 2');
            ret =  Reviews.find({class : courseId, visible : 0},
                {limit: 700});
        } else if (visiblity === 0) { //all invalidated reviews
            console.log('in 3');
            ret =  Reviews.find({visible : 0}, {limit: 700});
        } else { //no reviews
            //will always be empty because visible is 0 or 1. allows meteor to still send the ready flag when a new publication is sent
            ret = Reviews.find({visible : 10});
        }
        return ret
    });

    // COMMENT THESE OUT AFTER THE FIRST METEOR BUILD!!
    //Classes.remove({});
    //Subjects.remove({});
    //addAllCourses(findAllSemesters());
}

//Other helper functions used above

// Adds all classes and subjects from Cornell's API between the selected semesters to the database.
// Called when updating for a new semester and when initializing the database
function addAllCourses(semesters) {
    // var semesters = ["SP17", "SP16", "SP15","FA17", "FA16", "FA15"];
    for (semester in semesters) {
        //get all classes in this semester
        var result = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/config/subjects.json?roster=" + semesters[semester], {timeout: 30000});
        if (result.statusCode !== 200) {
            console.log("error");
        } else {
            response = JSON.parse(result.content);
            //console.log(response);
            var sub = response.data.subjects;
            for (course in sub) {
                parent = sub[course];
                //if subject doesn't exist add to Subjects collection
                checkSub = Subjects.find({'subShort' : (parent.value).toLowerCase()}).fetch();
                if (checkSub.length === 0) {
                    console.log("new subject: " + parent.value);
                    Subjects.insert({
                        subShort : (parent.value).toLowerCase(),
                        subFull : parent.descr
                    });
                }

                //for each subject, get all classes in that subject for this semester
                var result2 = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/search/classes.json?roster=" + semesters[semester] + "&subject="+ parent.value, {timeout: 30000});
                if (result2.statusCode !== 200) {
                    console.log("error2");
                } else {
                    response2 = JSON.parse(result2.content);
                    courses = response2.data.classes;

                    //add each class to the Classes collection if it doesnt exist already
                    for (course in courses) {
                        try {
                            var check = Classes.find({'classSub' : (courses[course].subject).toLowerCase(), 'classNum' : courses[course].catalogNbr}).fetch();
                            if (check.length === 0) {
                                console.log("new class: " + courses[course].subject + " " + courses[course].catalogNbr + "," + semesters[semester]);
                                //insert new class with empty prereqs and reviews
                                Classes.insert({
                                    classSub : (courses[course].subject).toLowerCase(),
                                    classNum : courses[course].catalogNbr,
                                    classTitle : courses[course].titleLong,
                                    classPrereq : [],
                                    classFull: (courses[course].subject).toLowerCase() + " " + courses[course].catalogNbr +" " + courses[course].titleLong.toLowerCase(),
                                    classSems: [semesters[semester]]
                                });
                            } else {
                                var matchedCourse = check[0] //only 1 should exist
                                var oldSems = matchedCourse.classSems;
                                if (oldSems.indexOf(semesters[semester]) === -1) {
                                    console.log("update class " + courses[course].subject + " " + courses[course].catalogNbr + "," + semesters[semester]);
                                    oldSems.push(semesters[semester]) //add this semester to the list
                                    Classes.update({_id: matchedCourse._id}, {$set: {classSems: oldSems}})
                                }
                            }
                        } catch(error){
                            console.log(course);
                        }
                    }
                }
            }
        }
    }
}

//returns an array of the current semester, to be given to the addAllCourses function
function findCurrSemester()  {
    var response = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/config/rosters.json", {timeout: 30000});
    if (response.statusCode !== 200) {
        console.log("error");
    } else {
        response = JSON.parse(response.content);
        allSemesters = response.data.rosters;
        thisSem = allSemesters[allSemesters.length - 1].slug;
        return [thisSem];
    }
}

//returns an array of all current semesters, to be given to the addAllCourses function
function findAllSemesters() {
    var response = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/config/rosters.json", {timeout: 30000});
    if (response.statusCode !== 200) {
        console.log("error");
    } else {
        response = JSON.parse(response.content);
        allSemesters = response.data.rosters;
        var allSemestersArray = allSemesters.map(function(semesterObject) {
            return semesterObject.slug;
        });
        console.log(allSemestersArray);
        return allSemestersArray
    }
}
