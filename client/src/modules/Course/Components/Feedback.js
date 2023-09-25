/* globals gtag */
export function courseVisited(classSub, classNum) {
  gtag('event', 'Course Visited', {
    event_category: 'Courses Visited',
    event_label: classSub + classNum,
  })
}
