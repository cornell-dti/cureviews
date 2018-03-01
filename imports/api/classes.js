import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';
import { check, Match} from 'meteor/check';
import { Classes, Users, Subjects, Reviews, Validation } from './dbDefs.js';
import { addAllCourses, findCurrSemester, findAllSemesters, addCrossList } from './dbInit.js';

/*
Main API file. Defines all interactions between the client and server sides of the
meteor application. Client code will call funtions defined here to
insert, update and query the local meteor database.

Uses dbDefs.js as a blueprint for collections in the local meteor database.
Uses dbInit.js 

*/
// defines all methods that will be editing the database so that database changes occur only on the server
Meteor.methods({
    //insert a new review into the reviews database
    insert: function(review, classId) {
        //only insert if all necessary feilds are filled in
        if (review.text !== null && review.diff !== null && review.quality !== null && review.medGrade !== null && classId !== undefined && classId !== null) {
            var fullReview = {
                text: review.text,
                difficulty: review.diff,
                quality: review.quality,
                class: classId,
                grade: review.medGrade,
                date: new Date(),
                atten: review.atten,
                visible: 0,
                reported: 0
            };

            try {
              //check(fullReview, Reviews);
              Reviews.insert(fullReview);
              return 1; //success
            } catch(error) {
              console.log(error)
              return 0; //fail
            }
        } else {
            console.log("some review values are null")
            return 0; //fail
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
    addCrossList: function(initiate) {
        if (initiate && Meteor.isServer) {
            console.log("adding cross-listed classes");
            return addCrossList();
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
    getCourseByInfo: function (number, subject) {
        const numberRegex  = new RegExp(/^(?=.*[0-9])/i);
        const subjectRegex = new RegExp(/^(?=.*[A-Z])/i);
        if (numberRegex.test(number) && subjectRegex.test(subject)) {
            return Classes.find({classSub: subject, classNum: number}).fetch()[0];
        }
        else {
            return null;
        }
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
    },
    // print on the server side for API testing. Should print in logs if
    // called (in the Auth component) by the API.
    printOnServer: function(text) {
      console.log(text);
    },
    //TODO: find the user identified by userID, and save the given token
    saveUserToken: function(userId, token) {

    },
    //TODO: invalidate this user's token by deleting it
    removeToken: function(userId) {

    },
    //validate admin password
    vailidateAdmin: function(pass) {
      console.log(Validation.find({}).fetch()[0].adminPass);
      if (Validation.find({}).fetch()[0].adminPass == pass) {
        return 1;
      } else {
        return 0;
      }
    }
});

//Code that runs only on the server
if (Meteor.isServer) {
    Meteor.startup(() => { // code to run on server at startup
        //add indexes to collections for faster search

        //commenting out the following because heroku does not like it and refuses to build.
        //You can add _id directly to the database on mlab

        // Classes._ensureIndex(
        //     { 'classSub' : 1 },
        //     { 'classNum' : 1 },
        //     { 'classTitle' : 1 },
        //     { '_id:' : 1 }
        // );
        // Subjects._ensureIndex(
        //     { 'subShort' : 1 },
        //     { 'subFull' : 1 }
        // );
        // Reviews._ensureIndex(
        //     { 'class' : 1},
        //     { 'difficulty' : 1 },
        //     { 'quality' : 1 },
        //     { 'grade' : 1 },
        //     { 'user' : 1 },
        //     { 'visible' : 1 }
        // );
    });

    //code that runs whenever needed
    //"publish" classes based on search query. Only published classes are visible to the client
    Meteor.publish('classes', function validClasses(searchString) {
      if (searchString !== undefined && searchString !== "") {
        //console.log("query entered:", searchString);
        //first check for exact subject match
        exactSubSearch = Classes.find({classSub : searchString}, {limit: 200});
        if (exactSubSearch.fetch().length > 0) {
          return exactSubSearch;
        }
        //next check for subject containing the query
        subSearch = Classes.find({classSub :{ '$regex' : `.*${searchString}.*`, '$options' : '-i' }},{limit: 200});
        if (subSearch.fetch().length > 0) {
          return subSearch;
        }
        else {
          //last check eveerything else
          return Classes.find(
            {'$or' : [
              { 'classSub':  { '$regex' : `.*${searchString}.*`, '$options' : '-i' }},
              { 'classNum':  { '$regex' : `.*${searchString}.*`, '$options' : '-i' } },
              { 'classTitle':{ '$regex' : `.*${searchString}.*`, '$options' : '-i' }},
              { 'classFull': { '$regex' : `.*${searchString}.*`, '$options' : '-i' }}]
            },
            { limit: 200 }
          );
        }
      } else {
        //console.log("no search");
        return Classes.find({}, {limit: 200});
      }
    });

    //"publish" reviews based on selected course, visibility and reporting requirements. Only published reviews are visible to the client
    Meteor.publish('reviews', function validReviews(courseId, visiblity, reportStatus) {
        var ret = null;
        //for a -1 courseId, display the most popular reviews (visible, non reported only)
        if (courseId === "-1") {
          //console.log('popular reviews');
          ret =  Reviews.find({visible : 1, reported: 0}, { sort: {date: -1}, limit: 5});
        }
        else if (courseId !== undefined && courseId !== "" && visiblity === 1 && reportStatus===0) { //show valid reviews for this course
            //console.log('course valid reviews');
            //get the list of crosslisted courses for this class
            var crossList;
            crossListResult = Classes.find({_id: courseId}).fetch()[0];
            if (crossListResult !== undefined) {
                // Why
                crossList = crossListResult.crossList;
            }
            //console.log(crossList);
            //if there are crossListed Courses, merge the reviews
            if (crossList !== undefined && crossList.length > 0) {
              //format each courseid into an object to input to the find's '$or' search
              crossListOR = crossList.map(function(courseId) {
                return {"class": courseId};
              });
              crossListOR.push({"class": courseId}) //make sure to add the original course to the list
              ret =  Reviews.find({visible : 1, reported: 0, '$or': crossListOR}, {sort: {date: -1}, limit: 700});
            } else {
              ret =  Reviews.find({class : courseId, visible : 1, reported: 0}, {sort: {date: -1}, limit: 700});
            }
        } else if (courseId !== undefined && courseId !== "" && visiblity === 0) { //invalidated reviews for a class
            console.log('course invalid reviews');
            crossList = Classes.find({_id : courseId}).fetch()[0].crossList
            ret =  Reviews.find({class : courseId, visible : 0}, {sort: {date: -1}, limit: 700});
        } else if (visiblity === 0) { //all invalidated reviews
            console.log('all reviews');
            ret =  Reviews.find({visible : 0}, {sort: {date: -1}, limit: 700});
        } else { //no reviews
            //will always be empty because visible is 0 or 1. allows meteor to still send the ready flag when a new publication is sent
            ret = Reviews.find({visible : 10});
        }
        return ret
    });

    //publish users to the client. for a valid netId, return user, otherwise show nothing.
    Meteor.publish('users', function getUser(netId) {
        return Users.find({netId: netId}, {limit: 20});
    });

    // COMMENT THESE OUT AFTER THE FIRST METEOR BUILD!!
    // Classes.remove({});
    // Subjects.remove({});
    // addAllCourses(findAllSemesters());
    // addCrossList();
}
