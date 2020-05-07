import axios from 'axios';
import { Classes, Subjects } from './dbDefs';

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
export async function addAllCourses(semesters: any) {
  console.log(semesters);
  Object.keys(semesters).forEach(async (semester) => {
    // get all classes in this semester
    console.log(`Adding classes for the following semester: ${semesters[semester]}`);
    const result = await axios.get(`https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${semesters[semester]}`, { timeout: 30000 });
    if (result.status !== 200) {
      console.log('Error in addAllCourses: 1');
      return 0;
    }
    const response = result.data;
    // console.log(response);
    const sub = response.data.subjects;
    await Promise.all(Object.keys(sub).map(async (course) => {
      const parent = sub[course];
      // if subject doesn't exist add to Subjects collection
      const checkSub = await Subjects.find({ subShort: parent.value.toLowerCase() }).exec();
      if (checkSub.length === 0) {
        console.log(`new subject: ${parent.value}`);
        await new Subjects({
          subShort: (parent.value).toLowerCase(),
          subFull: parent.descr,
        }).save();
      }

      // for each subject, get all classes in that subject for this semester
      const result2 = await axios.get(`https://classes.cornell.edu/api/2.0/search/classes.json?roster=${semesters[semester]}&subject=${parent.value}`, { timeout: 30000 });
      if (result2.status !== 200) {
        console.log('Error in addAllCourses: 2');
        return 0;
      }
      const response2 = result2.data;
      const courses = response2.data.classes;

      // add each class to the Classes collection if it doesnt exist already
      for (const course in courses) {
        try {
          console.log(`${courses[course].subject} ${courses[course].catalogNbr}`);
          const check = await Classes.find({ classSub: courses[course].subject.toLowerCase(), classNum: courses[course].catalogNbr }).exec();
          console.log(check);
          if (check.length === 0) {
            console.log(`new class: ${courses[course].subject} ${courses[course].catalogNbr},${semesters[semester]}`);
            // insert new class with empty prereqs and reviews
            await new Classes({
              classSub: (courses[course].subject).toLowerCase(),
              classNum: courses[course].catalogNbr,
              classTitle: courses[course].titleLong,
              classPrereq: [],
              classFull: `${(courses[course].subject).toLowerCase()} ${courses[course].catalogNbr} ${courses[course].titleLong.toLowerCase()}`,
              classSems: [semesters[semester]],
            }).save();
          } else {
            const matchedCourse = check[0]; // only 1 should exist
            const oldSems = matchedCourse.classSems;
            if (oldSems && oldSems.indexOf(semesters[semester]) === -1) {
              // console.log("update class " + courses[course].subject + " " + courses[course].catalogNbr + "," + semesters[semester]);
              oldSems.push(semesters[semester]); // add this semester to the list
              Classes.update({ _id: matchedCourse._id }, { $set: { classSems: oldSems } });
            }
          }
        } catch (error) {
          console.log('Error in addAllCourses: 3');
          return 0;
        }
      }
    }));
  });
  console.log('Finished addAllCourses');
  return 1;
}


export async function updateProfessors(semesters: any) {
  // You just want to go through all the classes in the Classes database and update the Professors field
  // Don't want to go through the semesters
  // Might want a helper function that returns that professors for you
  console.log('In updateProfessors method');
  for (const semester in semesters) {
    // get all classes in this semester
    console.log(`https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${semesters[semester]}`);
    try {
      await axios.get(`https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${semesters[semester]}`, { timeout: 30000 });
    } catch (error) {
      console.log('Error in updateProfessors: 1');
      console.log(error);
      continue;
    }
    const result = await axios.get(`https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${semesters[semester]}`, { timeout: 30000 });
    // console.log(result)
    if (result.status !== 200) {
      console.log('Error in updateProfessors: 2');
      console.log(result.status);
      continue;
    } else {
      const response = result.data;
      // console.log(response);
      const sub = response.data.subjects; // array of the subjects
      for (const course in sub) { // for every subject
        const parent = sub[course];
        // console.log("https://classes.cornell.edu/api/2.0/search/classes.json?roster=" + semesters[semester] + "&subject="+ parent.value)
        try {
          await axios.get(`https://classes.cornell.edu/api/2.0/search/classes.json?roster=${semesters[semester]}&subject=${parent.value}`, { timeout: 30000 });
        } catch (error) {
          console.log('Error in updateProfessors: 3');
          console.log(error);
          continue;
        }
        const result2 = await axios.get(`https://classes.cornell.edu/api/2.0/search/classes.json?roster=${semesters[semester]}&subject=${parent.value}`, { timeout: 30000 });
        if (result2.status !== 200) {
          console.log('Error in updateProfessors: 4');
          console.log(result2.status);
          continue;
        } else {
          const response2 = result2.data;
          const courses = response2.data.classes;

          // add each class to the Classes collection if it doesnt exist already
          for (const course in courses) {
            try {
              const check = await Classes.find({ classSub: courses[course].subject.toLowerCase(), classNum: courses[course].catalogNbr }).exec();
              const matchedCourse = check[0]; // catch this if there is no class existing
              if (typeof matchedCourse !== 'undefined') {
                // console.log(courses[course].subject);
                // console.log(courses[course].catalogNbr);
                // console.log("This is the matchedCourse")
                // console.log(matchedCourse)
                let oldProfessors = matchedCourse.classProfessors;
                if (oldProfessors == undefined) {
                  oldProfessors = [];
                }
                // console.log("This is the length of old profs")
                // console.log(oldProfessors.length)
                const { classSections } = courses[course].enrollGroups[0]; // This returns an array
                for (const section in classSections) {
                  if (classSections[section].ssrComponent == 'LEC'
                                      || classSections[section].ssrComponent == 'SEM') {
                    // Checks to see if class has scheduled meetings before checking them
                    if (classSections[section].meetings.length > 0) {
                      const professors = classSections[section].meetings[0].instructors;
                      // Checks to see if class has instructors before checking them
                      // Example of class without professors is:
                      // ASRC 3113 in FA16
                      // ASRC 3113 returns an empty array for professors
                      if (professors.length > 0) {
                        for (const professor in professors) {
                          const { firstName } = professors[professor];
                          const { lastName } = professors[professor];
                          const fullName = `${firstName} ${lastName}`;
                          if (!oldProfessors.includes(fullName)) {
                            oldProfessors.push(fullName);
                            // console.log("This is a new professor")
                            // console.log(typeof oldProfessors)
                            // console.log(oldProfessors)
                          }
                        }
                      } else {
                        // console.log("This class does not have professors");
                      }
                    } else {
                      // console.log("This class does not have meetings scheduled");
                    }
                  }
                }
                Classes.update({ _id: matchedCourse._id }, { $set: { classProfessors: oldProfessors } });
              }
            } catch (error) {
              console.log('Error in updateProfessors: 5');
              console.log(`Error on course ${courses[course].subject} ${courses[course].catalogNbr}`);
              console.log(error);

              return 0;
            }
          }
        }
      }
    }
  }
  console.log('Finished updateProfessors');
  return 1;
}

export async function resetProfessorArray(semesters: any) {
  // Initializes the classProfessors field in the Classes collection to an empty array so that
  // we have a uniform empty array to fill with updateProfessors
  // Will only have to be called ONCE
  console.log('In resetProfessorArray method');
  for (const semester in semesters) {
    // get all classes in this semester
    const result = await axios.get(`https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${semesters[semester]}`, { timeout: 30000 });
    if (result.status !== 200) {
      console.log('Error in resetProfessorArray: 1');
      console.log(result.status);
      return 0;
    }


    const response = result.data;
    // console.log(response);
    const sub = response.data.subjects; // array of the subjects
    for (const course in sub) { // for every subject
      const parent = sub[course];
      console.log(`https://classes.cornell.edu/api/2.0/search/classes.json?roster=${semesters[semester]}&subject=${parent.value}`);
      const result2 = await axios.get(`https://classes.cornell.edu/api/2.0/search/classes.json?roster=${semesters[semester]}&subject=${parent.value}`, { timeout: 30000 });

      if (result2.status !== 200) {
        console.log('Error in resetProfessorArray: 2');
        return 0;
      }


      const response2 = result2.data;
      // console.log("PRINTING ALL THE COURSES")
      const courses = response2.data.classes;
      // console.log(courses)

      // add each class to the Classes collection if it doesnt exist already
      for (const course in courses) {
        try {
          const check = await Classes.find({ classSub: courses[course].subject.toLowerCase(), classNum: courses[course].catalogNbr }).exec();
          const matchedCourse = check[0]; // catch this if there is no class existing
          if (typeof matchedCourse !== 'undefined') {
            console.log(courses[course].subject);
            console.log(courses[course].catalogNbr);
            console.log('This is the matchedCourse');
            console.log(matchedCourse);
            // var oldProfessors = matchedCourse.classProfessors
            const oldProfessors = [];
            console.log('This is the length of old profs');
            console.log(oldProfessors.length);
            Classes.update({ _id: matchedCourse._id }, { $set: { classProfessors: oldProfessors } });
          }
        } catch (error) {
          console.log('Error in resetProfessorArray: 5');
          console.log(`Error on course ${courses[course].subject} ${courses[course].catalogNbr}`);
          console.log(error);
          return 0;
        }
      }
    }
  }
  console.log('professors reset');
  return 1;
}


export async function getProfessorsForClass() {
  // Need the method here to extract the Professor from the response
  // return the array here
}

/* # Grabs the API-required format of the current semester, to be given to the
   # addAllCourses function.
   # Return: String Array (length = 1)
*/
export async function findCurrSemester() {
  let response = await axios.get('https://classes.cornell.edu/api/2.0/config/rosters.json', { timeout: 30000 });
  if (response.status !== 200) {
    console.log('Error in findCurrSemester');
  } else {
    response = response.data;
    const allSemesters = response.data.rosters;
    const thisSem = allSemesters[allSemesters.length - 1].slug;
    console.log(`Updating for following semester: ${thisSem}`);
    return [thisSem];
  }
}

/* # Grabs the API-required format of the all recent semesters to be given to the
   # addAllCourses function.
   # Return: String Array
*/
export async function findAllSemesters() {
  let response = await axios.get('https://classes.cornell.edu/api/2.0/config/rosters.json', { timeout: 30000 });
  if (response.status !== 200) {
    console.log('error');
  } else {
    response = response.data;
    const allSemesters = response.data.rosters;
    return allSemesters.map((semesterObject) => semesterObject.slug);
  }
}

/* # Look through all courses in the local database, and identify those
   # that are cross-listed (have multiple official names). Link these classes
   # by adding their course_id to all crosslisted class's crosslist array.
   #
   # Called once during intialization, only after all courses have been added.
*/
export async function addCrossList() {
  const semesters = await findAllSemesters();
  for (const semester in semesters) {
    // get all classes in this semester
    const result = await axios.get(`https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${semesters[semester]}`, { timeout: 30000 });
    if (result.status !== 200) {
      console.log('Error in addCrossList: 1');
      return 0;
    }
    const response = result.data;
    // console.log(response);
    const sub = response.data.subjects;
    for (const course in sub) {
      const parent = sub[course];

      // for each subject, get all classes in that subject for this semester
      const result2 = await axios.get(`https://classes.cornell.edu/api/2.0/search/classes.json?roster=${semesters[semester]}&subject=${parent.value}`, { timeout: 30000 });
      if (result2.status !== 200) {
        console.log('Error in addCrossList: 2');
        return 0;
      }
      const response2 = result2.data;
      const courses = response2.data.classes;

      for (const course in courses) {
        try {
          const check = await Classes.find({ classSub: courses[course].subject.toLowerCase(), classNum: courses[course].catalogNbr }).exec();
          // console.log((courses[course].subject).toLowerCase() + " "  + courses[course].catalogNbr);
          // console.log(check);
          if (check.length > 0) {
            const crossList = courses[course].enrollGroups[0].simpleCombinations;
            if (crossList.length > 0) {
              const crossListIDs = await Promise.all(crossList.map(async (crossListedCourse: any) => {
                console.log(crossListedCourse);
                const dbCourse = await Classes.find({ classSub: crossListedCourse.subject.toLowerCase(), classNum: crossListedCourse.catalogNbr }).exec();
                // Added the following check because MUSIC 2340
                // was crosslisted with AMST 2340, which was not in our db
                // so was causing an error here when calling 'dbCourse[0]._id'
                // AMST 2340 exists in FA17 but not FA18
                if (dbCourse[0]) {
                  return dbCourse[0]._id;
                }

                return null;
              }));
              console.log(`${courses[course].subject} ${courses[course].catalogNbr}`);
              // console.log(crossListIDs);
              const thisCourse = check[0];
              Classes.update({ _id: thisCourse._id }, { $set: { crossList: crossListIDs } });
            }
          }
        } catch (error) {
          console.log('Error in addCrossList: 3');
          console.log(error);
          return 0;
        }
      }
    }
  }
  console.log('Finished addCrossList');
  return 1;
}
