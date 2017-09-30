import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import App from '../imports/ui/App.jsx';
import Update from '../imports/ui/Update.jsx';

Meteor.startup(() => {
  render(<App query=""/>, document.getElementById('render-target'));
  //render(<Update />, document.getElementById('render-target'));
});
