import { Classes, Users, Subjects, Reviews } from '../imports/api/dbDefs.js';

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
    Return a 'good' search using the following rules:
    - if the first character is a number, return all courses with that number, sorted by number
    - if the searchstring is a subject shorthand
      return all courses with that subject ordered by full course title
    - if the searchstring contains both numbers and letters try to split into numbers and letters
      - if letters form a subject, return courses with this subject containing the given number
    -else look for searchstring matches across class title and full course title.
  If searchString is undefined or empty:
     Return an array of 200 courses.
*/
Meteor.publish('classes', function validClasses(searchString) {
  if (searchString !== undefined && searchString !== "") {
    // check if first digit is a number. Catches searchs like "1100"
    // if so, search only through the course numbers and return classes ordered by full name
    const indexFirstDigit = searchString.search(/\d/)
    if (indexFirstDigit == 0) {
      // console.log("only numbers")
      return Classes.find(
        {classNum : { '$regex' : `.*${searchString}.*`, '$options' : '-i' }},
        {sort: {classFull: 1}, limit: 200},
        {reactive: false});
    }

    // check if searchString is a subject, if so return only classes with this subject. Catches searches like "CS"
    if (isSubShorthand(searchString)) {
      // console.log("matches subject: " + searchString)
      return Classes.find(
        { 'classSub':  searchString},
        {sort: {classFull: 1}, limit: 200},
        {reactive: false});
    }

    // check if text before space is subject, if so search only classes with this subject.
    // Speeds up searches like "CS 1110"
    const indexFirstSpace = searchString.search(" ")
    if (indexFirstSpace != -1) {
      const strBeforeSpace = searchString.substring(0, indexFirstSpace)
      const strAfterSpace = searchString.substring(indexFirstSpace + 1)
      if (isSubShorthand(strBeforeSpace)) {
        // console.log("matches subject with space: " + strBeforeSpace)
        return searchWithinSubject(strBeforeSpace, strAfterSpace)
      }
    }

    // check if text is subject followed by course number (no space)
    // if so search only classes with this subject.
    // Speeds up searches like "CS1110"
    if (indexFirstDigit != -1) {
      const strBeforeDigit = searchString.substring(0, indexFirstDigit)
      const strAfterDigit = searchString.substring(indexFirstDigit)
      if (isSubShorthand(strBeforeDigit)) {
        // console.log("matches subject with digit: " + String(strBeforeDigit))
        return searchWithinSubject(strBeforeDigit, strAfterDigit)
      }
    }

    //last resort, search everything
    // console.log("nothing matches");
    return Classes.find(
      { 'classFull': { '$regex' : `.*${searchString}.*`, '$options' : '-i' }},
      {sort: {classFull: 1}, limit: 200},
      {reactive: false}
    );
  } else {
    //console.log("no search");
    return Classes.find({}, {sort: {classFull: 1}, limit: 200}, {reactive: false});
  }
});

// Helper to check if a string is a subject code
const isSubShorthand = (sub) => {
  const subCheck = Subjects.find({subShort: sub}).fetch()
  return subCheck.length > 0;
}

// helper to format search within a subject
const searchWithinSubject = (sub, remainder) => {
  return Classes.find(
    { 'classSub':  sub, 'classFull': { '$regex' : `.*${remainder}.*`, '$options' : '-i' }},
    {sort: {classFull: 1}, limit: 200},
    {reactive: false});
}

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
Meteor.publish('reviews', function validReviews(courseId, visiblity, reportStatus, token) {
    let ret = null;
    let userIsAdmin;
    if (token === undefined || token===null || token===""){
      userIsAdmin = false;
    }
    else{
      userIsAdmin = Meteor.call('tokenIsAdmin', token);
    }
    //for a -1 courseId, display the most popular reviews (visible, non reported only)
    if (courseId === "-1") {
      //console.log('popular reviews');
      ret =  Reviews.find({visible : 1, reported: 0}, { sort: {date: -1}, limit: 5});
    }
    else if (courseId !== undefined && courseId !== "" && visiblity === 1 && reportStatus===0) { //show valid reviews for this course
        //console.log('course valid reviews');
        //get the list of crosslisted courses for this class
        let crossList;
        const crossListResult = Classes.find({_id: courseId}).fetch()[0];
        if (crossListResult !== undefined) {
            // Why
            crossList = crossListResult.crossList;
        }
        //console.log(crossList);
        //if there are crossListed Courses, merge the reviews
        if (crossList !== undefined && crossList.length > 0) {
          //format each courseid into an object to input to the find's '$or' search
          const crossListOR = crossList.map(function(courseId) {
            return {"class": courseId};
          });
          crossListOR.push({"class": courseId}) //make sure to add the original course to the list
          ret =  Reviews.find({visible : 1, reported: 0, '$or': crossListOR}, {sort: {date: -1}, limit: 700});
        } else {
          ret =  Reviews.find({class : courseId, visible : 1, reported: 0}, {sort: {date: -1}, limit: 700});
        }
    } else if (courseId !== undefined && courseId !== "" && visiblity === 0 && userIsAdmin) { //invalidated reviews for a class
        console.log('course invalid reviews');
        // const crossList = Classes.find({_id : courseId}).fetch()[0].crossList
        ret =  Reviews.find({class : courseId, visible : 0}, {sort: {date: -1}, limit: 700});
    } else if (visiblity === 0 && userIsAdmin) { //all invalidated reviews
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


/* To get class info for Courseplan API. 
   Use simple:rest package to create endpoint out of this.
 */
Meteor.publish('classInfo', function (subject, number) {
  console.log(subject);
  console.log(number);
  // check: make sure number and subject are valid, non-malicious strings
  const numberRegex = new RegExp(/^(?=.*[0-9])/i);
  const subjectRegex = new RegExp(/^(?=.*[A-Z])/i);
  if (numberRegex.test(number) && subjectRegex.test(subject)) {
    // var classRating = Classes.find({ classSub: subject.toLowerCase(), classNum: number }).fetch()[0]['classRating']
    let classRating = Classes.find({ classSub: subject.toLowerCase(), classNum: number }, fields={classRating: 1})

    return classRating;
    // console.log(JSON.parse(JSON.stringify({"classRatingValue": classRating}));
    // return JSON.parse(JSON.stringify({"classRatingValue": classRating}));
  }
  else {
    return null;
  }
}, {
  url: "classInfo/:0/:1",
  httpMethod: "get"
});