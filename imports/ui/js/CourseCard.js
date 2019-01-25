/*
  Additonal functions used in the CourseCard component.
*/

// Get a human-readable string representing a list of [up to] the last 2 semesters this class was offered.
export function lastOfferedSems(theClass){
  var semsArray = theClass.classSems;
  var lastSemester = semsArray[semsArray.length-1];
  var lastSemester2 = semsArray[semsArray.length-2];
  if (lastSemester2 != null){
    var lastTwoOffered = semAbbriviationToWord(semsArray[semsArray.length-1]) + ", " + semAbbriviationToWord(semsArray[semsArray.length-2]);
  }
  else {
    var lastTwoOffered = semAbbriviationToWord(semsArray[semsArray.length-1]);
  }


  return lastTwoOffered;
}

// helper function to convert semester abbreviations to a full word
export function semAbbriviationToWord(sem){
  var abbreviation  = String(sem);
  switch (abbreviation.substring(0,2)){
    case "SP":
      return "Spring 20" + abbreviation.substring(2);
    case "FA":
      return "Fall 20" + abbreviation.substring(2);
    case "SU":
      return "Summer 20" + abbreviation.substring(2);
    case "WI":
      return "Winter 20" + abbreviation.substring(2);
  }
}


export function lastSem(sem){
  var semesterList  = String(sem);
  return semesterList.substring(semesterList.length-4);
}

// collect aggregate information from allReviews, the list of all reviews
// submitted for this class. Return values for the average difficulty, quality,
// average grade, and madatory/not mandatory status.
export function getGaugeValues(allReviews) {
  newState = {};
  //create initial variables
  var sumGrade = 0;
  var sumRating = 0;
  var sumDiff = 0;
  var sumWork = 0;
  
  var countGrade = 0;
  var countRatingAndDiff = 0;
  var countWork = 0;
  
  allReviews.forEach(function(review) {
    // console.log("rating: " + review["rating"]);
    // console.log("quality: " + review["quality"]);
    console.log("work: " + review["workload"]);

    countRatingAndDiff++;
    sumDiff += review["difficulty"];
    if(review["rating"] != undefined){
      sumRating += review["rating"];
    }
    else{
      sumRating += review["quality"];
    }
    
    if (review["workload"] != undefined) {
      countWork++;
      sumWork += Number(review["workload"]);
    }
    
    if (review["grade"] != undefined) {
      countGrade++;
      sumGrade += Number(review["grade"]);
    }
  });

  //Update the gauge variable values for rating, difficulty, and workload using averages
  //Fixed to 1 decimal place
  newState.rating = (sumRating/countRatingAndDiff).toFixed(1); //out of 5
  newState.diff = (sumDiff/countRatingAndDiff).toFixed(1); //out of 5
  newState.workload = (sumWork/countWork).toFixed(1); //out of 5

  if (sumGrade > 0) {
    newState.gradeNum = Math.floor(sumGrade/countGrade); //out of 5
  } else {
    newState.gradeNum = 0;
  }

  //translate grades from numerical value to letters, and assign the correct color.
  if (newState.gradeNum > 0) {
    var gradeTranslation = ["C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
    newState.grade = gradeTranslation[Math.floor(newState.gradeNum) - 1];
  } else {
    newState.grade = '-';
  }

  //Set gauge color for rating
  if (newState.rating <= 2 ) {
    newState.ratingColor = "#E64458";
  }
  else if (newState.rating > 2 && newState.rating < 3.5) {
    newState.ratingColor = "#f9cc30";
  }
  else {
    newState.ratingColor = "#53B277";
  }

  //set gauge color for difficulty
  if (newState.diff <= 2 ) {
    newState.diffColor = "#53B277";
  }
  else if (newState.diff > 2 && newState.diff < 3.5) {
    newState.diffColor = "#f9cc30";
  }
  else {
    newState.diffColor = "#E64458";
  }
  
  //set gauge color for workload
  if (newState.workload <= 2 ) {
    newState.workloadColor = "#53B277";
  }
  else if (newState.workload > 2 && newState.workload < 3.5) {
    newState.workloadColor = "#f9cc30";
  }
  else {
    newState.workloadColor = "#E64458";
  }

  return newState;
}
