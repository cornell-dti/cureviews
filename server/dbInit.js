import { HTTP } from 'meteor/http';
import { check, Match} from 'meteor/check';
import { Classes, Users, Subjects, Reviews, Validation } from '../imports/api/dbDefs.js';

/*
  Course API scraper. Uses HTTP requests to get course data from the Cornell
  Course API and stores the results in the local database.

  Functions defined here should be called during app initialization to populate
  the local database or once a semester to add new semester data to the
  local database.

  Functions are called by admins via the admin interface (Admin component).

*/

/* # Populates the Classes and Subjects collections in the local database by grabbing
   # all courses data for the semesters in the semsters array though requests
   # sent to the Cornell Courses API
   #
   # example: semesters = ["SP17", "SP16", "SP15","FA17", "FA16", "FA15"];
   #
   # Using the findAllSemesters() array as input, the function populates an
   # empty database with all courses and subjects.
   # Using findCurrSemester(), the function updates the existing database.
   #
*/
export function addAllCourses(semesters) {
    for (semester in semesters) {
        //get all classes in this semester
        var result = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/config/subjects.json?roster=" + semesters[semester], {timeout: 30000});
        if (result.statusCode !== 200) {
            console.log("error");
            return 0;
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
                    return 0;
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
                                    //console.log("update class " + courses[course].subject + " " + courses[course].catalogNbr + "," + semesters[semester]);
                                    oldSems.push(semesters[semester]) //add this semester to the list
                                    Classes.update({_id: matchedCourse._id}, {$set: {classSems: oldSems}})
                                }
                            }
                        } catch(error){
                            console.log("error3");
                            return 0;
                        }
                    }
                }
            }
        }
    }
    return 1;
}


export function updateProfessors (semesters){
  //You just want to go through all the classes in the Classes database and update the Professors field
  //Don't want to go through the semesters
  //Might want a helper function that returns that professors for you
    console.log("In updateProfessors method")
     for (semester in semesters) {
        //get all classes in this semester
        var result = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/config/subjects.json?roster=" + semesters[semester], {timeout: 30000});
        if (result.statusCode !== 200) {
            console.log("In the first if statusCode error")
            console.log("error");
            return 0;
        }

        else {
            response = JSON.parse(result.content);
            //console.log(response);
            var sub = response.data.subjects; //array of the subjects
            for (course in sub) {             //for every subject
                parent = sub[course];
                var result2 = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/search/classes.json?roster=" + semesters[semester] + "&subject="+ parent.value, {timeout: 30000});

                if (result2.statusCode !== 200) {
                  //console.log("In the second if statusCode error")
                    //console.log("error2");
                    return 0;
                }

                else {
                    response2 = JSON.parse(result2.content);
                    //console.log("PRINTING ALL THE COURSES")
                    courses = response2.data.classes;
                    //console.log(courses)

                    //add each class to the Classes collection if it doesnt exist already
                    for (course in courses) {
                        try {
                            var check = Classes.find({'classSub' : (courses[course].subject).toLowerCase(), 'classNum' : courses[course].catalogNbr}).fetch();
                            var matchedCourse = check[0]  //catch this if there is no class existing
                            console.log(courses[course].subject);
                            console.log(courses[course].catalogNbr);
                            //We are getting an error here! This doesn't make sense why matchedCourse would return undefined
                            /*if (matchedCourse == undefined){
                              return 0
                            }*/

                            console.log("This is the matchedCourse")
                            console.log(matchedCourse)
                            var oldProfessors = matchedCourse.classProfessors

                            var enrollGroups = courses[course].enrollGroups     //This returns an array
                            for (eg in enrollGroups){
                                if (enrollGroups[eg].classSections[0].ssrComponent == "LEC"){
                                  //if ()
                                  var firstName = enrollGroups[eg].classSections[0].meetings[0].instructors[0].firstName
                                  var lastName = enrollGroups[eg].classSections[0].meetings[0].instructors[0].lastName
                                  var fullName = firstName + " " + lastName
                                  if (!oldProfessors.includes(fullName)){
                                      oldProfessors.push(fullName)
                                      console.log(oldProfessors)
                                  }
                                }
                            }
                            Classes.update({_id: matchedCourse._id}, {$set: {classProfessors: oldProfessors}})
                        }
                        catch(error){
                          console.log("In the catch error")
                          console.log(error)
                          console.log(course)
                          return 0;
                        }
                    }
                }
              }
        }
    }
  }


export function getProfessorsForClass(){
  //Need the method here to extract the Professor from the response
  //return the array here
}

/* # Grabs the API-required format of the current semester, to be given to the
   # addAllCourses function.
   # Return: String Array (length = 1)
*/
export function findCurrSemester()  {
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

/* # Grabs the API-required format of the all recent semesters to be given to the
   # addAllCourses function.
   # Return: String Array
*/
export function findAllSemesters() {
    var response = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/config/rosters.json", {timeout: 30000});
    if (response.statusCode !== 200) {
        console.log("error");
    } else {
        response = JSON.parse(response.content);
        allSemesters = response.data.rosters;
        var allSemestersArray = allSemesters.map(function(semesterObject) {
            return semesterObject.slug;
        });
        return allSemestersArray
    }
}

/* # Look through all courses in the local database, and identify those
   # that are cross-listed (have multiple official names). Link these classes
   # by adding their course_id to all crosslisted class's crosslist array.
   #
   # Called once during intialization, only after all courses have been added.
*/
export function addCrossList() {
  semesters = findAllSemesters()
  for (semester in semesters) {
      //get all classes in this semester
      var result = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/config/subjects.json?roster=" + semesters[semester], {timeout: 30000});
      if (result.statusCode !== 200) {
          console.log("error");
          return 0;
      } else {
          response = JSON.parse(result.content);
          //console.log(response);
          var sub = response.data.subjects;
          for (course in sub) {
              parent = sub[course];

              //for each subject, get all classes in that subject for this semester
              var result2 = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/search/classes.json?roster=" + semesters[semester] + "&subject="+ parent.value, {timeout: 30000});
              if (result2.statusCode !== 200) {
                  console.log("error2");
                  return 0;
              } else {
                  response2 = JSON.parse(result2.content);
                  courses = response2.data.classes;

                  for (course in courses) {
                      try {

                          var check = Classes.find({'classSub' : (courses[course].subject).toLowerCase(), 'classNum' : courses[course].catalogNbr}).fetch();
                          if (check.length > 0) {
                            crossList = courses[course].enrollGroups[0].simpleCombinations;
                            if (crossList.length > 0) {
                              crossListIDs = crossList.map(function(crossListedCourse) {
                                var dbCourse = Classes.find({'classSub' : (crossListedCourse.subject).toLowerCase(), 'classNum' : crossListedCourse.catalogNbr}).fetch();
                                return dbCourse[0]._id;
                              })
                              console.log(courses[course].subject + " " + courses[course].catalogNbr);
                              // console.log(crossListIDs);
                              thisCourse = check[0];
                              Classes.update({_id: thisCourse._id}, {$set: {crossList: crossListIDs}})
                            }
                          }
                      } catch(error) {
                          console.log("error");
                          return 0;
                      }
                  }
              }
          }
      }
  }
  console.log("cross-listings added");
  return 1;
}
