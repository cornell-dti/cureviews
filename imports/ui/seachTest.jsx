Meteor.call("getClassesByProfessor", this.state.selectedProfessors, (err, classes) => {
  if (!err && classes) {
    console.log(classes);
    console.log(selectedProfessors);
    this.setState({
      searchClasses: classes
    });
  }
  else {
    // No class matches the request.
    console.log(err);
  }
});
Meteor.call("getReviewsByProfessor", this.state.selectedProfessors, (err, reviews) => {
  if (!err && reviews) {
    console.log(reviews);
    console.log(selectedProfessors);
    this.setState({
      searchReviews: reviews
    });
  }
  else {
    // No class matches the request.
    console.log(err);
  }
});
