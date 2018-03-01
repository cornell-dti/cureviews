import { HTTP } from 'meteor/http';
import { check, Match} from 'meteor/check';
import { Classes, Users, Subjects, Reviews, Validation } from './dbDefs.js';

// Adds all classes and subjects from Cornell's API between the selected semesters to the database.
// Called when updating for a new semester and when initializing the database
export function addAllCourses(semesters) {
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

//returns an array of all current semesters, to be given to the addAllCourses function
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

//call only once to go through all courses and add in cross-listing.
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
                              //console.log(crossListIDs);
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
  return 1;
}
