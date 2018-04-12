import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';
import { check, Match} from 'meteor/check';
import { Classes, Users, Subjects, Reviews, Validation } from '../imports/api/dbDefs.js';
import { addAllCourses, findCurrSemester, findAllSemesters, addCrossList } from './dbInit.js';

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
