import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';
import { check, Match} from 'meteor/check';
import { addAllCourses, findCurrSemester, findAllSemesters, addCrossList, updateProfessors} from './dbInit.js';
import { Classes, Users, Subjects, Reviews, Validation } from '../imports/api/dbDefs.js';

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
    // Then, call a second function to link crosslisted courses, so reviews
    // from all "names" of a class are visible under each course.
    // Should be called by an admin via the admin page once a semester.
    addNewSemester: function(initiate) {
        // ensure code is running on the server, not client
        if (initiate && Meteor.isServer) {
            console.log("updating new semester");
            const val = addAllCourses(findCurrSemester());
            if (val) {
              return addCrossList();
            } else {
              console.log("fail");
              return 0;
            }
        }
    },

    // Update the local database by linking crosslisted courses, so reviews
    // from all "names" of a class are visible under each course.
    // Should be called by an admin via the admin page ONLY ONCE
    // during database initialization, after calling addAll below.
    // addCrossList: function(initiate) {
    //     // ensure the code is running on the server, not the client
    //     if (initiate && Meteor.isServer) {
    //         console.log("adding cross-listed classes");
    //         return addCrossList();
    //     }
    // },

    // Update the local database with all courses from the Cornell Class Roster.
    // Then, call a second function to link crosslisted courses, so reviews
    // from all "names" of a class are visible under each course.
    // Should be called by an admin via the admin page ONLY ONCE during database
    // initialization.
    addAll: function(initiate) {
        // ensure code is running on the server, not the client
        if (initiate && Meteor.isServer) {
            Classes.remove({});
            Subjects.remove({});
            const val =  addAllCourses(findAllSemesters());
            if (val) {
              return addCrossList();
            } else {
              console.log("fail");
              return 0;
            }
        }
    },

    /* Update the database so we have the professors information.
    This calls updateProfessors in dbInit */
    setProfessors: function(initiate){
        if (initiate && Meteor.isServer){
          const val = updateProfessors(findAllSemesters());
          if (val == 0){
            console.log("fail")
            return 0;
          }
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
    topSubjects: function() {
      // using the add-on library meteorhacks:aggregate, define pipeline aggregate functions
      // to run complex queries
      var pipeline = [
        //consider only visible reviews
        {$match: { visible: 1}},
        //group by class and get count of reviews
        {$group: { _id: '$class', reviewCount: { $sum: 1} }}
        //sort by decending count
        // {$sort: {"reviewCount": -1}},
        // {$limit: 10}
      ];
      // reviewedSubjects is a dictionary-like object of subjects (key) and
      // number of reviews (value) associated with that subject
      var reviewedSubjects = new defaultDict();
      //run the query and return the class name and number of reviews written to it
      mostReviews = Reviews.aggregate(pipeline).map(function(course) {
        // classObject is the Class object associated with course._id
        var classObject =  Classes.find({_id: course._id}).fetch()[0];
        // classSubject is the string of the full subject of classObject
        var classSubject = Subjects.find({subShort: classObject.classSub}).fetch()[0].subFull;
        // Adds the number of reviews to the ongoing count of reviews per subject
        reviewedSubjects[classSubject] = reviewedSubjects.get(classSubject) + course.reviewCount;
        return classObject;
      });
      // Creates a map of subjects (key) and total number of reviews (value)
      var subjectsMap = new Map(Object.entries(reviewedSubjects));
      subjectsMap.delete("get");
      var subjectsAndReviewCountArray = Array.from(subjectsMap);
      subjectsAndReviewCountArray = subjectsAndReviewCountArray.sort(function(a,b) {
        //Sorts array by number of reviews each topic has
        return a[1]<b[1]? 1:a[1]>b[1]?-1:0;
      });

      // Returns the top 15 most reviewed classes
      return subjectsAndReviewCountArray.slice(0, 15)
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

// Recreation of Python's defaultdict to be used in topSubjects method
function defaultDict(){
  this.get = function (key){
    if(this.hasOwnProperty(key)){
      return this[key];
    }
    else{
      return 0;
    }
  }
};
