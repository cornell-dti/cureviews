export function sendFeedback(x) {
  gtag('event', 'Sent Feedback: ' + x);
  if (x == 1) {
    $(".useful-text").html("Glad to hear it! 😃");
    //$('#feedback').attr("placeholder","Any suggestions?");
    //$(".form").show();
  } else {
    //$(".useful").hide();
    $(".useful-text").html("Tell us how we can improve!");
    //$(".form").show();
  }
}

export function courseVisited(classSub, classNum){
  gtag('event', 'Course Visited', {
    'event_category' : 'Courses Visited',
    'event_label' : classSub + classNum
  });
}
