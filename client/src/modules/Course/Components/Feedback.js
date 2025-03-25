/* globals gtag */
export const courseVisited = (classSub, classNum) => {
  gtag('event', 'Course Visited', {
    eventCategory: 'Courses Visited',
    eventLabel: classSub + classNum
  });
};
