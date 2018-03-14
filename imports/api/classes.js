import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';
import { check, Match} from 'meteor/check';
import { Classes, Users, Subjects, Reviews, Validation } from './dbDefs.js';
import { addAllCourses, findCurrSemester, findAllSemesters, addCrossList } from './dbInit.js';

/*

 Main API file. Defines all interactions between the client and server sides of the
 meteor application. Client code will call funtions defined here to insert, update
 and query the local meteor database.

 imports dbDefs.js for blueprints of collections in the local meteor database.
 imports dbInit.js for initializing the local meteor database with courses from the
 cornell course api

*/

/* # Meteor Methods
   # Client-side code in meteor is not allowed direct access to the local database
   # (this makes it easier to keep the backend secure from outside users).
   # Instead, the Client interacts with the database through the functions definied below,
   # which can be initiated by the Client but run on the Server.
*/
Meteor.methods({
    // insert a new review into the reviews collection.
    // Upon success returns 1, else returns 0.
    insert: function(review, classId) {
        // check: only insert if all form feilds are filled in
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
            //error handling
            console.log("some review values are null")
            return 0; //fail
        }
    },

    // Make this reveiw visible to everyone (ex: un-report a review)
    // Upon succcess, return 1, else 0.
    makeVisible: function (review) {
        // check: make sure review id is valid and non-malicious
        var regex = new RegExp(/^(?=.*[A-Z0-9])/i);
        if (regex.test(review._id)) {
            Reviews.update(review._id, {$set: { visible: 1} });
            return 1;
        } else {
            return 0;
        }
    },

    // Delete this review from the local database.
    // Upon succcess, return 1, else 0.
    removeReview: function(review) {
        // check: make sure review id is valid and non-malicious
        var regex = new RegExp(/^(?=.*[A-Z0-9])/i);
        if (regex.test(review._id)) {
            Reviews.remove({ _id: review._id});
            return 1;
        } else {
            return 0;
        }
    },

    // Update the local database when Cornell Course API adds data for the
    // upcoming semester. Will add new classes if they don't already exist,
    // and update the semesters offered for classes that do.
    // Should be is called by an admin via the admin page once a semester.
    addNewSemester: function(initiate) {
        // ensure code is running on the server, not client
        if (initiate && Meteor.isServer) {
            console.log("updating new semester");
            return addAllCourses(findCurrSemester());
        }
    },

    // Update the local database by linking crosslisted courses, so reviews
    // from all "names" of a class are visible under each course.
    // Should be called by an admin via the admin page ONLY ONCE
    // during database initialization, after calling addAll below.
    addCrossList: function(initiate) {
        // ensure the code is running on the server, not the client
        if (initiate && Meteor.isServer) {
            console.log("adding cross-listed classes");
            return addCrossList();
        }
    },

    // Update the local database with all courses from the Cornell Class Roster.
    // Should be is called by an admin via the admin page ONLY ONCE
    // during database initialization.
    addAll: function(initiate) {
        // ensure code is running on the server, not the client
        if (initiate && Meteor.isServer) {
            console.log("adding everything");
            Classes.remove({});
            Subjects.remove({});
            return addAllCourses(findAllSemesters());
        }
    },

    // Get a course with this course_id from the Classes collection in the local database.
    getCourseById: function(courseId) {
        // check: make sure course id is valid and non-malicious
        var regex = new RegExp(/^(?=.*[A-Z0-9])/i);
        if (regex.test(courseId)) {
            var c = Classes.find({_id: courseId}).fetch()[0];
            return c;
        }
        return null
    },

    // Get a course with this course number and subject from the Classes collection in the local database.
    getCourseByInfo: function (number, subject) {
        // check: make sure number and subject are valid, non-malicious strings
        const numberRegex  = new RegExp(/^(?=.*[0-9])/i);
        const subjectRegex = new RegExp(/^(?=.*[A-Z])/i);
        if (numberRegex.test(number) && subjectRegex.test(subject)) {
            return Classes.find({classSub: subject, classNum: number}).fetch()[0];
        }
        else {
            return null;
        }
    },

    // Flag a review - mark it as reported and make it invisible to non-admin users.
    // To be called by a non-admin user from a specific review.
    reportReview: function(review) {
      // check: make sure review id is valid and non-malicious
      var regex = new RegExp(/^(?=.*[A-Z0-9])/i)
      if (regex.test(review._id)) {
        Reviews.update({_id: review._id}, { $set: {visible: 0, reported: 1} });
        return 1;
      } else {
        return 0;
      }
    },

    // Un-flag a review, making it visible to everyone and "unreported"
    // To be called by an admin via the admin interface.
    undoReportReview: function(review) {
      // check: make sure review id is valid and non-malicious
      var regex = new RegExp(/^(?=.*[A-Z0-9])/i)
      if (regex.test(review._id)) {
        Reviews.update({_id: review._id}, { $set: {visible: 1, reported: 0} });
        return 1;
      } else {
        return 0;
      }
    },

    // Get a list the most popular courses from the Classes collection (objects)
    // popular classes -> most reviewed.
    topClasses: function() {
      // using the add-on library meteorhacks:aggregate, define pipeline aggregate functions
      // to run complex queries
      var pipeline = [
        //consider only visible reviews
        {$match: { visible: 1}},
        //group by class and get count of reviews
        {$group: { _id: '$class', reviewCount: { $sum: 1} }},
        //sort by decending count
        {$sort: {"reviewCount": -1}},
        {$limit: 10}
      ];

      //run the query, and grap the full course object for each returned course_id
      mostReviews = Reviews.aggregate(pipeline).map(function(course) {
        return Classes.find({_id: course._id}).fetch()[0];
      });

      return  mostReviews
    },

    // Print on the server side for API testing. Should print in logs if
    // called by the API (in the Auth component).
    printOnServer: function(text) {
      console.log(text);
    },
    //TODO: find the user identified by userID, and save the given token
    saveUserToken: function(userId, token) {

    },
    //TODO: invalidate this user's token by deleting it
    removeToken: function(userId) {

    },
    // Validate admin password.
    // Upon success, return 1, else return 0.
    vailidateAdmin: function(pass) {
      // check: make sure review id is valid and non-malicious
      var regex = new RegExp(/^(?=.*[A-Z0-9])/i)
      if (regex.test(pass)) {
        if (Validation.find({}).fetch()[0].adminPass == pass) {
          return 1;
        }
        return 0;
      } else {
        return 0;
      }
    }
});

/* # Server Side Code
   # Code within this block can only run on the server-side of the application.
   # Adds indexes to local database collections to optimize search
*/
if (Meteor.isServer) {
    Meteor.startup(() => { // code to run on server at startup
        // Commenting out the following because heroku does not like it and refuses to build.
        // You can add _id directly to the database on mlab

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

    /* # Database Publishers
       # Client-side code in meteor only has access to subsets of the local
       # database collections though the following Publishers. Publishers listen
       # to Client-side requests and return database elements as an array of
       # JSON values to the Client, which stores them in another, minified database
       # with the same format as local database collections.
       #
       # When the Client 'subscribes' to the publisher, it gets the most up-to-date
       # elements in the database, and automaticly updates when the database changes.
       # Client components can subscribe to only one instance of a collection Publisher.
       #
       # see minimongo collections and publish/subsribe to learn more:
       # https://guide.meteor.com/collections.html
       # https://docs.meteor.com/api/pubsub.html
    */

    /* Publish a subset of the local database's Classes collection based on the requested searchstring.
       Return: array of course objects (JSON).
       If searchString is a valid string:
         Return any courses containing the string in the format 'subject number: course name'.
         Courses whose subject matches the string are 'top matches' and should
         placed at the top of the returned array. Courses with subjects containing the string
         are 'secondary matches', placed under top matches in the return array
      If searchString is undefined or empty:
         Return an array of 200 courses.
    */
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

    /* Publish a subset of the local database's Reviews collection based on the requested parameters.
       Return: array of course objects (JSON).
       If courseId is -1:
         return most popular reviews (visible and not reported)
       If courseId is valid, visibility = 1, reportStatus = 0:
         return unreported, visible reviews for the course with this course_id
         or a crosslisted course. Used by CourseCard.js to render a course's reviews.
       If courseId is valid, visiblity = 0:
         return invalidated reviews for a course.
       If visiblity = 0:
         return all invalidated reviews. Used to render reviews in the admin view.
         Includes reviews awaiting approval and those that were reported.
       Else:
         return none
    */
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
            console.log('all invalidated reviews');
            ret =  Reviews.find({visible : 0}, {sort: {date: -1}, limit: 700});
        } else { //no reviews
            //will always be empty because visible is 0 or 1. allows meteor to still send the ready flag when a new publication is sent
            ret = Reviews.find({visible : 10});
        }
        return ret
    });

    /* Publish a subset of the local database's Users collection based on the requested netId.
       Return: User object (JSON).
    */
    Meteor.publish('users', function getUser(netId) {
        return Users.find({netId: netId}, {limit: 20});
    });

  /*
   # Initial database population.
   # Grab data from Cornell Course API to populate local database. Can also be run
   # from the admin interface. Comment out the lines below wait until database
   # population in complete, and re-comment.
  */
    // Classes.remove({});
    // Subjects.remove({});
    // addAllCourses(findAllSemesters());
    // addCrossList();
}
