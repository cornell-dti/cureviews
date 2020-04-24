/*
  Additonal functions used in the CourseCard component.
*/

// Get a human-readable string representing a list of [up to] the last 2 semesters this class was offered.
export function lastOfferedSems(theClass){
  const offered = new Set();

  theClass.classSems.forEach(function(sem){
    
    offered.add(semAbbriviationToWord(sem.slice(0,-2)));
  
  });
  // Array.from(offered).join(' ');
  return Array.from(offered).join(", ");
}

// helper function to convert semester abbreviations to a full word
export function semAbbriviationToWord(sem){
  switch (sem){
    case "SP":
      return "Spring";
    case "FA":
      return "Fall";
    case "SU":
      return "Summer";
    case "WI":
      return "Winter";
  }
}


export function lastSem(sem){
  const semesterList = String(sem);
  return semesterList.substring(semesterList.length-4);
}

// Returns an array of objects of containing courseIds
// of cross-listed classes
export function getCrossListOR(course){
  let crossList;
  let courseId;
  if (course !== undefined) {
      // Why
      crossList = course.crossList;
      courseId = course._id;
  }
  else{
    return [{"class": courseId}]
  }
  
  //if there are crossListed Courses, merge the reviews
  if (crossList !== undefined && crossList.length > 0) {
    //format each courseid into an object to input to the find's '$or' search
    const crossListOR = crossList.map(function(courseId) {
      return {"class": courseId};
    });
    crossListOR.push({"class": courseId}) //make sure to add the original course to the list
    return crossListOR
  }
  else{
    return [{"class": courseId}]
  }
}

// collect aggregate information from allReviews, the list of all reviews
// submitted for this class. Return values for the average difficulty, quality,
// and madatory/not mandatory status.
export function getGaugeValues(allReviews) {
  const newState = {};
  //create initial variables
  let sumRating = 0;
  let sumDiff = 0;
  let sumWork = 0;

  let countRatingAndDiff = 0;
  let countWork = 0;

  allReviews.forEach(function(review) {
    if(review){
      countRatingAndDiff++;
      sumDiff += Number(review["difficulty"]);
      if(review["rating"] !== undefined){
        sumRating += Number(review["rating"]);
      }
      else{
        sumRating += Number(review["quality"]);
      }
      if (review["workload"] != undefined) {
        countWork++;
        sumWork += Number(review["workload"]);
      }
    }
    

  });

  //Update the gauge variable values for rating, difficulty, and workload using averages
  //Fixed to 1 decimal place
  
  if(countRatingAndDiff > 0){
    newState.rating = (sumRating/countRatingAndDiff).toFixed(1); //out of 5
    newState.diff = (sumDiff/countRatingAndDiff).toFixed(1); //out of 5
  }
  else{
    newState.rating = "-";
    newState.diff = "-";
  }
  
  if(countWork > 0){
    newState.workload = (sumWork/countWork).toFixed(1); //out of 5
  }
  else{
    newState.workload = "-";
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
