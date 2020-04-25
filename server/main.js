import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // ensure that there is always an index to search classes by
  Classes._ensureIndex({classSub: "text", classNum: "text", classTitle: "text"});

  // ensure that there is always an index to search subjects by
  Subjects._ensureIndex({subShort: "text", subFull: "text"});
});
