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
