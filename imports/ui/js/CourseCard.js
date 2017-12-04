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

export function semAbbriviationToWord(sem){
  var abbreviation  = String(sem);
  switch (abbreviation.substring(0,2)){
    case "SP":
      return "Spring \'" + abbreviation.substring(2);
    case "FA":
      return "Fall \'" + abbreviation.substring(2);
    case "SU":
      return "Summer \'" + abbreviation.substring(2);
  }
}

export function lastSem(sem){
  var semesterList  = String(sem);
  return semesterList.substring(semesterList.length-4);
}

export function getGaugeValues(allReviews) {
  newState = {};
  //create initial variables
  var countGrade = 0;
  var countDiff = 0;
  var countQual = 0;
  var countMan = 0;
  var count = 0;
  var count2 = 0;

  allReviews.forEach(function(review) {
    count++;
    countDiff = countDiff + review["difficulty"];
    countQual = countQual + review["quality"];
    countMan = countMan + review["atten"];
    if (Number(review["grade"]) > 0) {
      count2++;
      countGrade = countGrade + Number(review["grade"]);
    }
  });

  //update the gauge variable values
  newState.qual = (countQual/count).toFixed(1); //out of 5
  newState.diff = (countDiff/count).toFixed(1); //out of 5
  if (count2 > 0) {
    newState.gradeNum = (countGrade/count2).toFixed(1); //out of 5
  } else {
    newState.gradeNum = 0;
  }
  if ((countMan/count).toFixed(0) == 1) {
    newState.mandatory = "Yes";
  }  else {
    newState.mandatory = "No";
  }

  //translate grades from numerical value to letters, and assign the correct color.
  if (newState.gradeNum > 0) {
    var gradeTranslation = ["C-", "C", "C+", "B-", "B", "B-", "A-", "A", "A+"];
    newState.grade = gradeTranslation[Math.floor(newState.gradeNum) - 1];
    var gradeCols = ["#E64458", "#E64458", "#E64458", "#f9cc30", "#f9cc30", "#ff9e00","#53B277","#53B277","#53B277"];
    newState.gradeColor = gradeCols[Math.floor(newState.gradeNum) - 1];
  } else {
    newState.gradeColor = "#E64458";
    newState.grade = '-';
  }

  //set colors for quality and difficulty
  if (newState.qual <= 2 ) {
    newState.qualColor = "#E64458";
  }
  else if (newState.qual > 2 && newState.qual < 3.5) {
    newState.qualColor = "#f9cc30";
  }
  else {
    newState.qualColor = "#53B277";
  }

  //set colors for difficulty
  if (newState.diff <= 2 ) {
    newState.diffColor = "#53B277";
  }
  else if (newState.diff > 2 && newState.diff < 3.5) {
    newState.diffColor = "#f9cc30";
  }
  else {
    newState.diffColor = "#E64458";
  }

  return newState;
}
