const { Meteor } = require('meteor/meteor');

Meteor.startup(() => {
  // code to run on server at startup
});

// Export empty object to convince typescript that this is a module.
module.exports = {};
