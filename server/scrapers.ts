import axios from "axios";
import { Classes, Subjects, Class } from "./dbDefs";

// Due to the asynchronous nature of the program, any times measures are unreliable

function time() {
    return Date.now() / 1000;
}

export async function runTests() {
    console.log("Running tests");
    // For the purposes of testing, drop our collections
    await Subjects.deleteMany({}).exec();
    await Classes.deleteMany({}).exec();

    const runTime = await addAllCoursesOld(["SP19", "FA19"]);
    console.log("Test time: " + runTime);
}

/*
 * A new scraping function. Uses batch writing to maybe improve runtime.
 */
async function addAllCoursesNew(semesters: string[]) {
    const begin_time = time();

    console.log("Query over semesters: " + semesters)

    // Await the joint completion of fetching all information for all subjects
    // The result is a list of tuples which look like [Semester, [Subject1, Subject2...]]
    const semesterSubjects = await Promise.all(semesters.map(async semester => {
        console.log("Building for semester: " + semester);
        const subjectQuery = await axios.get("https://classes.cornell.edu/api/2.0/config/subjects.json?roster=" + semester, { timeout: 30000 });
        if (subjectQuery.status !== 200) {
            console.log("Unable to fetch subjects for semester " + semester);
            return Promise.reject("Unable to fetch subjects for semester " + semester);
        } else {
            return Promise.resolve({ semester: semester, subjects: subjectQuery.data.data.subjects});
        }
    }));

    
    // aggregate the subjects to remove any duplicates. We don't want to write more than we have to
    let subjectDocs = [];
    let includes = subject => {
        for (const entry in subjectDocs) { // I would use reduce, but this allows for early returns
            if (subjectDocs[entry].value == subject.value) {
                return true;
            }
        }

        return false;
    };

    semesterSubjects.forEach(semesterData => semesterData.subjects.forEach(subject => !includes(subject) ? subjectDocs.push(subject) : 0));

    // filter out any subjects already present in our collection
    subjectDocs = subjectDocs.filter(async doc => (await Subjects.find({ subShort : doc.value.toLowerCase() }).exec()).length == 0);

    // Bulk insert the fetched information
    const subjectRes = await Subjects.collection.insertMany(subjectDocs.map(doc => new Subjects({
        subShort : doc.value.toLowerCase(),
        subFull : doc.descrformal // This was changed. The old version had doc.descr
    })));

    if (subjectRes.result.ok != 1) {
        throw new Error("Unable to write subjects to db!");
    } else {
        console.log("Done writing " + subjectRes.result.n + " subjects to db!");
    }

    // a array of semesters and the classes in them by subject: [[{Semester, [Classes...]}... (by Subject)]... (by Semester)]
    const semesterClasses: any[][] = await Promise.all(semesterSubjects.map(async semesterData => {
        const semester = semesterData.semester;
        const subjects = semesterData.subjects;

        return Promise.all(subjects.map(async subject => {
            const classesQuery = await axios.get("https://classes.cornell.edu/api/2.0/search/classes.json?roster=" + semester + "&subject=" + subject.value, { timeout: 30000 });
            if (classesQuery.status !== 200) {
                console.log("Unable to fetch subjects for semester " + semester);
                return Promise.reject("Unable to fetch subjects for semester " + semester);
            } else {
                return Promise.resolve({semester: semester, classes: classesQuery.data.data.classes});
            }
        }));
    }));

    console.log("Net requests done!");

    // a collection of classes documents to be added
    // of the format of a map Class Title -> {classInfo, [Semester1, Semester2...]}
    let classesInformation = new Map<string, any>();
    
    // update information about the class
    let upsert = (classInfo, semester) => {
        let info = classesInformation.get(classInfo.titleLong);
        if (info) {
            const newSemesters = info.semesters.includes(semester) ? info.semesters : info.semesters.concat([semester]);
            classesInformation.set(classInfo.titleLong, {classInfo: info.classInfo, semesters: newSemesters});
        } else {
            classesInformation.set(classInfo.titleLong, {classInfo: classInfo, semesters: [semester]} );
        }
    }

    semesterClasses.forEach(semester => semester.forEach(subjectData => subjectData.classes.forEach(cl => upsert(cl, subjectData.semester))));

    // a list of new classes to be inserted into the db
    let classDocs = [];
    for (const [title, details] of classesInformation.entries()) {
        // find any additional semester information present in the database and include it
        let cl = await Classes.findOne({classTitle: title}).exec();
        if (cl) {
           cl.classSems.forEach(sem => !details.semester.includes(sem) ? details.semesters.push(sem) : 0);
           await Classes.updateOne({classTitle: title}, {$set: {classSems: details.semesters}});
        } else {
            classDocs.push(new Classes({
                classSub : details.classInfo.subject.toLowerCase(),
                classNum : details.classInfo.catalogNbr,
                classTitle : title,
                classPrereq : [],
                classFull: details.classInfo.subject.toLowerCase() + " " + details.classInfo.catalogNbr + " " + title,
                classSems: details.semesters
            }));
        }
    }

    let classRes = await Classes.collection.insertMany(classDocs);

    if (classRes.result.ok != 1) {
        throw new Error("Unable to write classes to db!");
    } else {
        console.log("Done writing " + classRes.result.n + " classes to db!");
    }

    console.log(await Classes.find({}).exec());

    const end_time = time();
    return end_time - begin_time;
}

/*
 * The old web scraping function
 */
async function addAllCoursesOld(semesters: string[]) {
    const begin_time = time();
    console.log("Query over semesters: " + semesters);
    for (const semester in semesters) {
        //get all classes in this semester
        console.log("Adding classes for the following semester: " + semesters[semester]);
        const result = await axios.get("https://classes.cornell.edu/api/2.0/config/subjects.json?roster=" + semesters[semester], { timeout: 30000 });
        if (result.status !== 200) {
            console.log("Error in addAllCourses: 1");
            return 0;
        } else {
            const response = result.data;
            //console.log(response);
            const sub = response.data.subjects;
            await Promise.all(Object.keys(sub).map(async course => {
                const parent = sub[course];
                //if subject doesn't exist add to Subjects collection
                const checkSub = await Subjects.find({ subShort: parent.value.toLowerCase() }).exec();
                if (checkSub.length === 0) {
                    //console.log("new subject: " + parent.value);
                    await new Subjects({
                        subShort : (parent.value).toLowerCase(),
                        subFull : parent.descr
                    }).save();
                }

                //for each subject, get all classes in that subject for this semester
                const result2 = await axios.get("https://classes.cornell.edu/api/2.0/search/classes.json?roster=" + semesters[semester] + "&subject=" + parent.value, { timeout: 30000 });
                if (result2.status !== 200) {
                    console.log("Error in addAllCourses: 2");
                    return 0;
                } else {
                    const response2 = result2.data;
                    const courses = response2.data.classes;

                    //add each class to the Classes collection if it doesnt exist already
                    for (const course in courses) {
                        try {
                          //console.log(courses[course].subject + " " + courses[course].catalogNbr);
                            const check = await Classes.find({ classSub: courses[course].subject.toLowerCase(), classNum: courses[course].catalogNbr }).exec();
                            //console.log(check);
                            if (check.length === 0) {
                                //console.log("new class: " + courses[course].subject + " " + courses[course].catalogNbr + "," + semesters[semester]);
                                //insert new class with empty prereqs and reviews
                                await new Classes({
                                    classSub : (courses[course].subject).toLowerCase(),
                                    classNum : courses[course].catalogNbr,
                                    classTitle : courses[course].titleLong,
                                    classPrereq : [],
                                    classFull: (courses[course].subject).toLowerCase() + " " + courses[course].catalogNbr + " " + courses[course].titleLong.toLowerCase(),
                                    classSems: [semesters[semester]]
                                }).save();
                            } else {
                                const matchedCourse = check[0] //only 1 should exist
                                const oldSems = matchedCourse.classSems;
                                if (oldSems && oldSems.indexOf(semesters[semester]) === -1) {
                                    // console.log("update class " + courses[course].subject + " " + courses[course].catalogNbr + "," + semesters[semester]);
                                    oldSems.push(semesters[semester]) //add this semester to the list
                                    Classes.update({_id: matchedCourse._id}, {$set: {classSems: oldSems}})
                                }
                            }
                        } catch(error){
                            console.log("Error in addAllCourses: 3");
                            return 0;
                        }
                    }
                }
            }));
        }
    }

    const end_time = time();
    return end_time - begin_time;
}