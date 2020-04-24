import { findAllSemesters, updateProfessors, resetProfessorArray, addAllCourses, addCrossList } from "./dbInit";
import { Meteor } from "./shim";
import { Classes, Students, Subjects, Reviews, Validation, Class, Student } from "./dbDefs";
import { getGaugeValues, getCrossListOR } from 'common/CourseCard';

import { OAuth2Client } from "google-auth-library";
import { TokenPayload } from "google-auth-library/build/src/auth/loginticket";
const client = new OAuth2Client("836283700372-msku5vqaolmgvh3q1nvcqm3d6cgiu0v1.apps.googleusercontent.com");
/* # Meteor Methods
   # Client-side code in meteor is not allowed direct access to the local database
   # (this makes it easier to keep the backend secure from outside users).
   # Instead, the Client interacts with the database through the functions definied below,
   # which can be initiated by the Client but run on the Server.
*/

// Helper to check if a string is a subject code
const isSubShorthand = async (sub: string) => {
  const subCheck = await Subjects.find({ subShort: sub }).exec();
  return subCheck.length > 0;
}

// helper to format search within a subject
const searchWithinSubject = (sub: string, remainder: string) => {
  return Classes.find(
    { 'classSub': sub, 'classFull': { '$regex': `.*${remainder}.*`, '$options': '-i' } },
    {},
    { sort: { classFull: 1 }, limit: 200, reactive: false }
  ).exec();
};

Meteor.methods({
  // insert a new review into the reviews collection. Also updates
  // course metrics upon successfully inserting review.
  // Upon success returns 1, else returns 0.
  // insert a new review into the reviews collection. Also updates
  // course metrics upon successfully inserting review.
  // Upon success returns 1, else returns 0.
  async insert(token, review, classId) {
    // check: only insert if all form fields are filled in
    if (token == undefined) {
      console.log("Error: Token was undefined in insert");
      return 0; // Token was undefined
    }
    const ticket = await Meteor.call<TokenPayload | null>("getVerificationTicket", token);
    // console.log("ticket");
    // console.log(ticket);
    if (!ticket) return;
    await Meteor.call("insertUser", ticket);
    if (ticket.hd === "cornell.edu") {
      if (review.text !== null && review.diff !== null && review.rating !== null && review.workload !== null && review.professors !== null && classId !== undefined && classId !== null) {
        const fullReview = {
          text: review.text,
          difficulty: review.diff,
          rating: review.rating,
          workload: review.workload,
          class: classId,
          date: new Date(),
          visible: 0,
          reported: 0,
          professors: review.professors,
          likes: 0,
        };

        try {
          //check(fullReview, Reviews);
          await new Reviews(fullReview).save();
          console.log("Success: Submitted review");
          //Update the course metrics
          return 1; //success
        } catch (error) {
          console.log(error)
          return 0; //fail
        }
      } else {
        console.log("Error: Some review values are null");
        return 0; //fail
      }
    } else {
      console.log("Error: non-Cornell email attempted to insert review");
      return 0; //fail
    }

  },

  //Inserts a new user into the Users collection.
  //Upon success returns 1, else returns 0
  async insertUser(googleObject) {
    //Check user object has all required fields
    if (googleObject.email.replace("@cornell.edu", "") != null) {
      const newUser = {
        // Check to see if Google returns first and last name
        // If not, insert empty string to database
        firstName: googleObject.given_name ? googleObject.given_name : "",
        lastName: googleObject.family_name ? googleObject.family_name : "",
        netId: googleObject.email.replace("@cornell.edu", ""),
        affiliation: null,
        token: null,
        privilege: "regular"
      };

      const user = await Meteor.call("getUserByNetId", googleObject.email.replace("@cornell.edu", ""));
      if (user == null) {
        try {
          //check(newUser, Users);
          await new Students(newUser).save();
          return 1; //success
        } catch (error) {
          console.log("Error: In inserting Student");
          console.log(error);
          return 0; //fail
        }
      }
      return 1; //No need to add user again


    }
    else {
      //error handling
      console.log("Some user values are null in insertUser");
      return 0; //fail
    }
  },

  //Increment the number of likes a review has gotten by 1.
  async incrementLike(id) {
    try {
      const results = await Reviews.find({ _id: id }).exec();
      let review = results[0];
      if (review.likes == undefined) {
        Reviews.update(id, { $set: { likes: 1 } });
      }
      else {
        Reviews.update(id, { $set: { likes: review.likes + 1 } });
      }
      return 1;
    }
    catch (error) {
      return 0;
    }
  },

  //Decrement the number of likes a review has gotten by 1.
  async decrementLike(id) {
    try {
      const results = await Reviews.find({ _id: id }).exec();
      let review = results[0];
      if (review.likes == undefined) {
        Reviews.update(id, { $set: { likes: 1 } });
      }
      else {
        Reviews.update(id, { $set: { likes: review.likes - 1 } });
      }
      return 1;
    }
    catch (error) {
      return 0;
    }
  },

  // Make this reveiw visible to everyone (ex: un-report a review)
  // Upon succcess, return 1, else 0.
  async makeVisible(review, token) {
    // check: make sure review id is valid and non-malicious
    const userIsAdmin = await Meteor.call("tokenIsAdmin", token);
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(review._id) && userIsAdmin) {
      Reviews.update(review._id, { $set: { visible: 1 } });
      await Meteor.call("updateCourseMetrics", review.class, token);
      return 1;
    } else {
      return 0;
    }
  },

  // Delete this review from the local database.
  // Upon succcess, return 1, else 0.
  async removeReview(review, token) {
    // check: make sure review id is valid and non-malicious
    const userIsAdmin = await Meteor.call("tokenIsAdmin", token);
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(review._id) && userIsAdmin) {
      Reviews.remove({ _id: review._id });
      await Meteor.call("updateCourseMetrics", review.class, token);
      return 1;
    } else {
      return 0;
    }
  },

  // This updates the metrics for an individual class given its Mongo-generated id.
  // Returns 1 if successful, 0 otherwise.
  async updateCourseMetrics(courseId, token) {
    const userIsAdmin = await Meteor.call("tokenIsAdmin", token);
    if (userIsAdmin) {
      let course = await Meteor.call("getCourseById", courseId);
      if (course) {
        let crossListOR = getCrossListOR(course);
        let reviews = await Reviews.find({ visible: 1, reported: 0, $or: crossListOR }, {}, { sort: { date: -1 }, limit: 700 }).exec();
        let state = getGaugeValues(reviews);

        Classes.update({ _id: courseId },
          {
            $set: {
              //If no data is available, getGaugeValues returns "-" for metric
              classDifficulty: (state.diff !== "-" ? Number(state.diff) : null),
              classRating: (state.rating !== "-" ? Number(state.rating) : null),
              classWorkload: (state.workload !== "-" ? Number(state.workload) : null)
            }
          });
        return 1;

      }
      else return 0;
    }
    else {
      return 0;
    }

  },
  // Used to update the review metrics for all courses
  //in the database.
  async updateMetricsForAllCourses(token) {
    const userIsAdmin = await Meteor.call("tokenIsAdmin", token);
    if (userIsAdmin) {
      console.log("Starting update for metrics");
      let courses = await Classes.find().exec();
      await Promise.all(courses.map(async course => {
        await Meteor.call("updateCourseMetrics", course._id);
      }));
      console.log("Updated metrics for all courses");
    }

  },

  // Returns courses with the given parameters.
  // Takes in a dictionary object of field names
  // and the desired value, i.e.
  // {classSub: "PHIL"} or
  // {classDifficulty: 3.0}
  // Returns an empty array if no classes match.
  // NOTE/TODO: I don't think this actually works as intended
  // let's refactor in future - Julian
  async getCoursesByFilters(parameters) {
    let courses = [];
    let regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    //TODO: add regular expression for floating point numbers
    for (let key in parameters) {
      if (!regex.test(key)) return courses;
    }
    courses = await Classes.find(parameters).exec();
    return courses;
  },

  // Returns courses with the given parameters.
  // Takes in a major abbreviation
  // e.g. CS, INFO, PHIL
  // Returns an empty array if no classes match.
  async getCoursesByMajor(major) {
    let courses = [];
    let regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(major)) {
      courses = await Classes.find({ classSub: major }).exec();
    }
    return courses;
  },

  // Update the local database when Cornell Course API adds data for the
  // upcoming semester. Will add new classes if they don't already exist,
  // and update the semesters offered for classes that do.
  // Then, call a second function to link crosslisted courses, so reviews
  // from all "names" of a class are visible under each course.
  // Should be called by an admin via the admin page once a semester.
  // TODO uncomment
  // async addNewSemester(initiate, token) {
  // const userIsAdmin = await Meteor.call("tokenIsAdmin", token);
  //   // ensure code is running on the server, not client
  //   if (initiate && Meteor.isServer && userIsAdmin) {
  //     console.log("updating new semester");
  //     const val = await addAllCourses(await findCurrSemester());
  //     if (val) {
  //       return await addCrossList();
  //     } else {
  //       console.log("fail");
  //       return 0;
  //     }
  //   }
  // },

  // Update the local database by linking crosslisted courses, so reviews
  // from all "names" of a class are visible under each course.
  // Should be called by an admin via the admin page ONLY ONCE
  // during database initialization, after calling addAll below.
  // async addCrossList(initiate) {
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
  // TODO uncomment
  // async addAll(initiate, token) {
  //  const userIsAdmin = await Meteor.call("tokenIsAdmin", token);
  //   // ensure code is running on the server, not the client
  //   if (initiate && Meteor.isServer && userIsAdmin) {
  //     await Classes.remove({}).exec();
  //     await Subjects.remove({}).exec();
  //     const val = await addAllCourses(await findAllSemesters());
  //     if (val) {
  //       return await addCrossList();
  //     } else {
  //       console.log("fail");
  //       return 0;
  //     }
  //   }
  // },

  /* Update the database so we have the professors information.
  This calls updateProfessors in dbInit */
  async setProfessors(initiate, token) {
    const userIsAdmin = await Meteor.call("tokenIsAdmin", token);
    if (initiate && userIsAdmin) {
      const semesters = findAllSemesters();

      console.log("These are the semesters");
      console.log(semesters);
      const val = updateProfessors(semesters);
      if (val) {
        return val;
      } else {
        console.log("fail at setProfessors in method.js");
        return 0;
      }
    }
  },

  /* Initializes the classProfessors field in the Classes collection to an empty array so that
  we have a uniform empty array to fill with updateProfessors
  This calls the resetProfessorArray in dbInit */
  async resetProfessors(initiate, token) {
    const userIsAdmin = await Meteor.call("tokenIsAdmin", token);
    if (initiate && userIsAdmin) {
      const semesters = findAllSemesters();

      console.log("These are the semesters");
      console.log(semesters);
      const val = resetProfessorArray(semesters);
      if (val) {
        return val;
      } else {
        console.log("fail at resetProfessors in method.js");
        return 0;
      }
    }
  },

  //Get a user with this netId from the Users collection in the local database
  async getUserByNetId(netId) {
    // console.log("This is user in getUserByNetId");
    // console.log(netId);
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(netId)) {
      const user = (await Students.find({ netId: netId }).exec())[0];
      // console.log("This is user object");
      // console.log(user);
      return user;
    }
    return null;
  },

  //Returns true if user matching "netId" is an admin
  async tokenIsAdmin(token) {
    // console.log("This is token in tokenIsAdmin");
    // console.log(token);
    if (token != undefined) {
      const ticket = await Meteor.call<TokenPayload | null>("getVerificationTicket", token);
      // console.log(ticket);
      if (ticket && ticket.email) {
      const user = await Meteor.call<Student | null>("getUserByNetId", ticket.email.replace("@cornell.edu", ""));
      if (user) {
        return user.privilege === "admin";
      }
      }
    }
    console.log("Token is undefined at tokenIsAdmin")
    return false;
  },

  async getClassesByQuery(searchString) {
    if (searchString !== undefined && searchString !== "") {
      // check if first digit is a number. Catches searchs like "1100"
      // if so, search only through the course numbers and return classes ordered by full name
      const indexFirstDigit = searchString.search(/\d/)
      if (indexFirstDigit == 0) {
        // console.log("only numbers")
        return Classes.find(
          { classNum: { '$regex': `.*${searchString}.*`, '$options': '-i' } },
          {},
          { sort: { classFull: 1 }, limit: 200, reactive: false }
        ).exec();
      }

      // check if searchString is a subject, if so return only classes with this subject. Catches searches like "CS"
      if (await isSubShorthand(searchString)) {
        return Classes.find({ classSub: searchString }, {}, { sort: { classFull: 1 }, limit: 200, reactive: false }).exec();
      }
      // check if text before space is subject, if so search only classes with this subject.
      // Speeds up searches like "CS 1110"
      const indexFirstSpace = searchString.search(" ")
      if (indexFirstSpace != -1) {
        const strBeforeSpace = searchString.substring(0, indexFirstSpace)
        const strAfterSpace = searchString.substring(indexFirstSpace + 1)
        if (await isSubShorthand(strBeforeSpace)) {
          // console.log("matches subject with space: " + strBeforeSpace)
          return await searchWithinSubject(strBeforeSpace, strAfterSpace);
        }
      }

      // check if text is subject followed by course number (no space)
      // if so search only classes with this subject.
      // Speeds up searches like "CS1110"
      if (indexFirstDigit != -1) {
        const strBeforeDigit = searchString.substring(0, indexFirstDigit)
        const strAfterDigit = searchString.substring(indexFirstDigit)
        if (await isSubShorthand(strBeforeDigit)) {
          // console.log("matches subject with digit: " + String(strBeforeDigit))
          return await searchWithinSubject(strBeforeDigit, strAfterDigit);
        }
      }

      //last resort, search everything
      // console.log("nothing matches");
      return Classes.find(
        { 'classFull': { '$regex': `.*${searchString}.*`, '$options': '-i' } },
        {}, { sort: { classFull: 1 }, limit: 200, reactive: false }
      ).exec();
    } else {
      //console.log("no search");
      return Classes.find({}, {}, { sort: { classFull: 1 }, limit: 200, reactive: false }).exec();
    }
  },

  // Get a course with this course_id from the Classes collection in the local database.
  async getCourseById(courseId) {
    // check: make sure course id is valid and non-malicious
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(courseId)) {
      const c = (await Classes.find({ _id: courseId }).exec())[0];
      return c;
    }
    return null
  },

  // Get a course with this course number and subject from the Classes collection in the local database.
  async getCourseByInfo(number, subject) {
    // check: make sure number and subject are valid, non-malicious strings
    const numberRegex = new RegExp(/^(?=.*[0-9])/i);
    const subjectRegex = new RegExp(/^(?=.*[A-Z])/i);
    if (numberRegex.test(number) && subjectRegex.test(subject)) {
      return (await Classes.find({ classSub: subject, classNum: number }).exec())[0];
    }
    else {
      return null;
    }
  },

  // Searches the database on Classes's text index and returns matching courses
  async getCoursesByKeyword(keyword) {
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(keyword)) {
      return await Classes.find({ $text: { $search: keyword } }, { score: { $meta: "textScore" } }, { sort: { score: { $meta: "textScore" } } }).exec();
    }
    else return null;
  },

  // Searches the database on Subjects's text index and returns matching subjects (which we're equating to majors)
  async getSubjectsByKeyword(keyword) {
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(keyword)) {
      return await Subjects.find({ $text: { $search: keyword } }, { score: { $meta: "textScore" } }, { sort: { score: { $meta: "textScore" } } }).exec();
    }
    else return null;
  },

  // Flag a review - mark it as reported and make it invisible to non-admin users.
  // To be called by a non-admin user from a specific review.
  async reportReview(review) {
    // check: make sure review id is valid and non-malicious
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i)
    if (regex.test(review._id)) {
      Reviews.update({ _id: review._id }, { $set: { visible: 0, reported: 1 } });
      return 1;
    } else {
      return 0;
    }
  },

  // Un-flag a review, making it visible to everyone and "unreported"
  // To be called by an admin via the admin interface.
  async undoReportReview(review, token) {
    const userIsAdmin = await Meteor.call("tokenIsAdmin", token)
    // check: make sure review id is valid and non-malicious
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(review._id) && userIsAdmin) {
      Reviews.update({ _id: review._id }, { $set: { visible: 1, reported: 0 } });
      return 1;
    } else {
      return 0;
    }
  },

  //get all reviews by professor
  async getReviewsByProfessor(professor) {
    const regex = new RegExp(/^(?=.*[A-Z])/i);
    if (regex.test(professor)) {
      return Reviews.find({ professors: { $elemMatch: { $eq: professor } } }).exec();
    } else {
      return null;
    }
  },

  // Get list of review objects for given class from class _id
  // Accounts for cross-listed reviews
  async getReviewsByCourseId(course_id) {
    const regex = new RegExp(/^(?=.*[A-Z])/i)
    if (regex.test(course_id)) {
      let course = await Meteor.call("getCourseById", course_id);
      if(course){
        let crossListOR = getCrossListOR(course);
        let reviews = Reviews.find({ visible: 1, reported: 0, $or: crossListOR }, {}, { sort: { date: -1 }, limit: 700 }).exec();
        return reviews;
      }
      else{
        return null;
      }
    } else {
      return null;
    }
  },

  //get all classes by professor
  async getClassesByProfessor(professor) {
    const regex = new RegExp(/^(?=.*[A-Z])/i)
    if (regex.test(professor)) {
      return Classes.find({ classProfessors: { $elemMatch: { $eq: professor } } }).exec();
    } else {
      return null;
    }
  },

  // Get a list the most popular courses from the Classes collection (objects)
  // popular classes -> most reviewed.
  async topSubjects() {
    // using the add-on library meteorhacks:aggregate, define pipeline aggregate functions
    // to run complex queries
    const pipeline = [
      //consider only visible reviews
      { $match: { visible: 1 } },
      //group by class and get count of reviews
      { $group: { _id: '$class', reviewCount: { $sum: 1 } } }
      //sort by decending count
      // {$sort: {"reviewCount": -1}},
      // {$limit: 10}
    ];
    // reviewedSubjects is a dictionary-like object of subjects (key) and
    // number of reviews (value) associated with that subject
    const reviewedSubjects = new defaultDict();
    //run the query and return the class name and number of reviews written to it
    const results = await Reviews.aggregate<{ reviewCount: number; _id: string }>(pipeline, () => {});

    await Promise.all(results.map(async course => {
      const results = await Classes.find({ _id: course._id }).exec();
      const classObject = results[0];
      // classSubject is the string of the full subject of classObject
      let subject_arr = await Subjects.find({ subShort: classObject.classSub }).exec();
      if (subject_arr.length > 0) {
        const classSubject = subject_arr[0].subFull;
        // Adds the number of reviews to the ongoing count of reviews per subject
        const curVal = reviewedSubjects.get(classSubject) || 0;
        reviewedSubjects[classSubject] = curVal + course.reviewCount;
      }
    }));

    // Creates a map of subjects (key) and total number of reviews (value)
    const subjectsMap = new Map(Object.entries(reviewedSubjects).filter((x): x is [string, number] => typeof x[1] === "number"));
    let subjectsAndReviewCountArray = Array.from(subjectsMap);
    subjectsAndReviewCountArray = subjectsAndReviewCountArray.sort(function (a, b) {
      //Sorts array by number of reviews each topic has
      return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0;
    });

    // Returns the top 15 most reviewed classes
    return subjectsAndReviewCountArray.slice(0, 15)
  },

  //returns an array of objects in the form {_id: cs, total: 276}
  //represnting how many classes each dept (cs, info, coml etc...) offers
  async howManyEachClass(token) {
    const userIsAdmin = await Meteor.call("tokenIsAdmin", token);
    if(userIsAdmin){
      const pipeline = [
        {
          $group: {
            _id: '$classSub',
            total: {
              $sum: 1
            }
          }
        }
      ];
      return await Classes.aggregate(pipeline, () => {});
    }
  },

  //returns an array of objs in the form {_id: cs 2112, total: 227}
  async howManyReviewsEachClass(token) {
    const userIsAdmin = await Meteor.call('tokenIsAdmin', token);
    if(userIsAdmin){
      const pipeline = [
        {
          $group: {
            _id: '$class',
            total: {
              $sum: 1
            }
          }
        }
      ];

      const results = await Reviews.aggregate<{ _id: string; total: number }>(pipeline, () => {});

      results.map(async data => {
        const subNum = (await Classes.find({ _id: data._id }, { classSub: 1, _id: 0, classNum: 1 }).exec())[0];
        const id = subNum.classSub + " " + subNum.classNum;
        return { _id: id, total: data.total };
      });
      await Promise.all(results);
    }
  },

  // returns a count of the total reviews in the db
  async totalReviews(token) {
    const userIsAdmin = await Meteor.call("tokenIsAdmin", token);
    if(userIsAdmin){
      return Reviews.find({}).count();
    }
  },

  //Returns an array in the form {cs: [{date1:totalNum}, {date2: totalNum}, ...],
  //math: [{date1:total}, {date2: total}, ...], ... } for the top 15 majors where
  //totalNum is the totalNum of reviews for classes in that major at date date1, date2 etc...
  async getReviewsOverTimeTop15(token, step, range) {
    const userIsAdmin = await Meteor.call<boolean>("tokenIsAdmin", token);
    if (userIsAdmin) {
      const top15 = await Meteor.call<[string, number][]>("topSubjects");
      //contains cs, math, gov etc...
      let retArr = [];

      const results = await Promise.all(top15.map(async classs => {
        let [subject] = await Subjects.find({
          subFull: classs[0]
        }, {
          '_id': 0,
          'subShort': 1,
          'subFull': 0
        }).exec(); //EX: computer science--> cs

        let subshort = subject.subShort;
        retArr.push(subshort);
      }));

      let arrHM = [] as any[]; //[ {"cs": {date1: totalNum}, math: {date1, totalNum} },
      // {"cs": {date2: totalNum}, math: {date2, totalNum} } ]

      //last 1 yr step of 14
      for (let i = 0; i < range*30; i=i+step) {
        //"data": -->this{"2017-01-01": 3, "2017-01-02": 4, ...}
        //run on reviews. gets all classes and num of reviewa for each class, in x day
        const pipeline = [{
            $match: {
              date: {
                $lte: new Date(new Date().setDate(new Date().getDate() - i))
              }
            }
          },
          {
            $group: {
              _id: '$class',
              total: {
                $sum: 1
              }
            }
          }
        ];
        let hashMap = {}; //Object {"cs": {date1: totalNum, date2: totalNum, ...}, math: {date1, totalNum} }

        const results = await Reviews.aggregate<{ _id: string; total: number }>(pipeline, () => {});
        await Promise.all(results.map(async data => { // { "_id" : "KyeJxLouwDvgY8iEu", "total" : 1 } //all in same date
          const results = await Classes.find({
            _id: data._id
          }, {
            'classSub': 1,
            '_id': 0,
            'classNum': 0
          }).exec();
          const sub = results[0]; //finds the class corresponding to "KyeJxLouwDvgY8iEu" ex: cs 2112
          //date of this review minus the hrs mins sec
          let timeStringYMD = new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split("T")[0];
          if (retArr.includes(sub.classSub)) { //if thos review is one of the top 15 we want.
            if (hashMap[sub.classSub] == null) //if not in hm then add
              hashMap[sub.classSub] = {
                [timeStringYMD]: data.total
              };
            else //increment totalnum
              hashMap[sub.classSub] = {
                [timeStringYMD]: hashMap[sub.classSub][timeStringYMD] + data.total
              };
          }
          if (hashMap["total"] == null)
            hashMap["total"] = {
              [timeStringYMD]: data.total
            };
          else
            hashMap["total"] = {
              [timeStringYMD]: hashMap["total"][timeStringYMD] + data.total
            };
        }));
        arrHM.push(hashMap);

      }

      let hm2 = {}; // {cs: [{date1:totalNum}, {date2: totalNum}, ...], math: [{date1:total}, {date2: total}, ...], ... }

      //enrty:{"cs": {date1: totalNum}, math: {date1, totalNum} }
      if (arrHM.length > 0) {
      let entry = arrHM[0];
      let keys = Object.keys(entry);

      //"cs"
      keys.map(key => {
        let t = arrHM.map(a => a[key]); //for a key EX:"cs": [{date1:totalNum},{date2:totalNum}]
        hm2[key] = t;
      });
      }
      return hm2;
    }

  },

  // Print on the server side for API testing. Should print in logs if
  // called by the API (in the Auth component).
  printOnServer: function (text) {
    console.log(text);
  },


  //TODO: invalidate this user's token by deleting it
  removeToken: function (userId) {

  },



  // Validate admin password.
  // Upon success, return 1, else return 0.
  async vailidateAdmin(pass) {
    // check: make sure review id is valid and non-malicious
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i)
    if (regex.test(pass)) {
      if ((await Validation.find({}).exec())[0].adminPass == pass) {
        return 1;
      }
      return 0;
    } else {
      return 0;
    }
  },

  /**
   * Returns true if [netid] matches the netid in the email of the JSON
   * web token. False otherwise.
   * This method authenticates the user token through the Google API.
   * @param token: google auth token
   * @param netid: netid to verify
   * @requires that you have a handleVerifyError, like as follows:
   * verify(token, function(){//do whatever}).catch(function(error){
   * handleVerifyError(error, res);
   */
  async getVerificationTicket(token) {
    try {
      if (token == undefined) {
        console.log("Token was undefined in getVerificationTicket")
        return null; // Token was undefined
      }
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: "836283700372-msku5vqaolmgvh3q1nvcqm3d6cgiu0v1.apps.googleusercontent.com",  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
      });
      return ticket.getPayload();
    } catch (e) {
      console.log("Error: at getVerificationTicket");
      console.log(e);
      return null;
    }

  },
  /**
   * Used in the .catch when verify is used, handles whatever should be done
   * @param errorObj (required) the error that is returned from the .catch
   * @param res the response object
   * @return {boolean} true if their token is too old, false if some other error
   * @requires that you have the verify function, like as follows:
   * verify(token, function(){//do whatever}).catch(function(error){
   *        handleVerifyError(error, res);
   * }
   */
  handleVerifyError: function (errorObj, res) {
    if (errorObj && errorObj.toString()) {
      if (errorObj.toString().indexOf('used too late') !== -1) {
        res.status(409).send('Token used too late');
        return true;
      }

      res.status(409).send('Invalid token');
      return true;
    }
    return false;
  }

});

// Recreation of Python's defaultdict to be used in topSubjects method
class defaultDict<T = any> {
  [key: string]: T | Function;

  get(key: string): T | null {
    const val = this[key];

    if (this.hasOwnProperty(key) && typeof val !== "function") {
      return val;
    } else {
      return null;
    }
  }
}

// helper function
// function isJSON(str) {
//   try {
//     return (JSON.parse(str) && !!str);
//   } catch (e) {
//     return false;
//   }
// }
