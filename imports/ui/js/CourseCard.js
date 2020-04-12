/*
  Additonal functions used in the CourseCard component.
*/

// Get a human-readable string representing a list of [up to] the last 2 semesters this class was offered.
export function lastOfferedSems(theClass){
  const semsArray = theClass.classSems;
  const lastSemester2 = semsArray[semsArray.length - 2];
  if (lastSemester2 != null) {
    return semAbbriviationToWord(semsArray[semsArray.length - 1]) + ", " + semAbbriviationToWord(semsArray[semsArray.length - 2]);
  }
  else {
    return semAbbriviationToWord(semsArray[semsArray.length - 1]);
  }
}

// helper function to convert semester abbreviations to a full word
export function semAbbriviationToWord(sem){
  const abbreviation = String(sem);
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
  // how much should we factor in virtual reviews? Weighted, 0-1, where 1 is as much a regular reviews
  const virtualWeightFactor = 0.5;

  const newState = {};
  // create summation variables for reviews
  let sumRatingNormal = 0;
  let sumDiffNormal = 0;
  let sumWorkNormal = 0;

  let sumRatingVirtual = 0;
  let sumDiffVirtual = 0;
  let sumWorkVirtual = 0;

  // create size counting variables
  let countRatingAndDiffNormal = 0;
  let countWorkNormal = 0;

  let countRatingAndDiffVirtual = 0;
  let countWorkVirtual = 0;

  allReviews.forEach(function(review) {
    if(review){
      if (review.virtual) {
        countRatingAndDiffVirtual++;
        sumDiffVirtual += Number(review["difficulty"]);
        if(review["rating"] !== undefined){
          sumRatingVirtual += Number(review["rating"]);
        } else {
          sumRatingVirtual += Number(review["quality"]);
        }
        if (review["workload"] != undefined) {
          countWorkVirtual++;
          sumWorkVirtual += Number(review["workload"]);
        }
      } else {
        countRatingAndDiffNormal++;
        sumDiffNormal += Number(review["difficulty"]);
        if(review["rating"] !== undefined){
          sumRatingNormal += Number(review["rating"]);
        } else {
          sumRatingNormal += Number(review["quality"]);
        }

        if (review["workload"] != undefined) {
          countWorkNormal++;
          sumWorkNormal += Number(review["workload"]);
        }
      }
    }
  });

  // a division function for which divide by 0 is defined to return 0
  // allows us to optimize the following code
  let safe_divide = (a, b) => (b == 0 ? 0 : a / b);

  // we know that if these are 0, then there must not be reviews of that type
  // why? because the minimum rating that anyone can give is 1!
  const ratingRatioNormal = safe_divide(sumRatingNormal, countRatingAndDiffNormal);
  const ratingRatioVirtual = safe_divide(sumRatingVirtual, countRatingAndDiffVirtual);

  if (ratingRatioNormal == 0 && ratingRatioVirtual == 0) {
    newState.rating = "-";
  } else if (ratingRatioNormal == 0) {
    newState.rating = ratingRatioVirtual.toFixed(1);
  } else if (ratingRatioVirtual == 0) {
    newState.rating = ratingRatioNormal.toFixed(1);
  } else {
    newState.rating = ((ratingRatioNormal + virtualWeightFactor * ratingRatioVirtual) / (1 + virtualWeightFactor)).toFixed(1);
  }

  // these behave the same as their counterparts for ratings
  const diffRatioNormal = safe_divide(sumDiffNormal, countRatingAndDiffNormal);
  const diffRatioVirtual = safe_divide(sumDiffVirtual, countRatingAndDiffVirtual);

  if (diffRatioNormal == 0 && diffRatioVirtual == 0) {
    newState.diff = "-";
  } else if (diffRatioNormal == 0) {
    newState.diff = diffRatioVirtual.toFixed(1);
  } else if (diffRatioVirtual == 0) {
    newState.diff = diffRatioNormal.toFixed(1);
  } else {
    newState.diff = ((diffRatioNormal + virtualWeightFactor * diffRatioVirtual) / (1 + virtualWeightFactor)).toFixed(1);
  }

  // these behave the same as their counterparts for ratings
  const workloadRatioNormal = safe_divide(sumWorkNormal, countWorkNormal);
  const workloadRatioVirtual = safe_divide(sumWorkVirtual, countWorkVirtual);

  if (workloadRatioNormal == 0 && workloadRatioVirtual == 0) {
    newState.rating = "-";
  } else if (workloadRatioNormal == 0) {
    newState.workload = workloadRatioVirtual.toFixed(1);
  } else if (workloadRatioVirtual == 0) {
    newState.workload = workloadRatioNormal.toFixed(1);
  } else {
    newState.workload = ((workloadRatioNormal + virtualWeightFactor * workloadRatioVirtual) / (1 + virtualWeightFactor)).toFixed(1);
  }

  //Set gauge color for rating
  if (newState.rating <= 2 ) {
    newState.ratingColor = "#E64458";
  } else if (newState.rating > 2 && newState.rating < 3.5) {
    newState.ratingColor = "#f9cc30";
  } else {
    newState.ratingColor = "#53B277";
  }

  //set gauge color for difficulty
  if (newState.diff <= 2 ) {
    newState.diffColor = "#53B277";
  } else if (newState.diff > 2 && newState.diff < 3.5) {
    newState.diffColor = "#f9cc30";
  } else {
    newState.diffColor = "#E64458";
  }
  
  //set gauge color for workload
  if (newState.workload <= 2 ) {
    newState.workloadColor = "#53B277";
  } else if (newState.workload > 2 && newState.workload < 3.5) {
    newState.workloadColor = "#f9cc30";
  } else {
    newState.workloadColor = "#E64458";
  }
  
  return newState;
}
