import React, {Component, PropTypes} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import { CollectionName } from '../api/dbDefs.js';
import "./css/App.css"; // css files

/*
  Template Component. Use as a blueprint for creating new components.

  Start all components with this description format:

  'Name' Component. Short description if needed.

  Identify as one of the following components:
  Simple styling: mainly renders HTML and CSS,
  Container: combines multiple components into a single feature
  View: top-level component accessed by a URL endpoint defined by the router in main.jsx

  Include a breif description of the component's purpose, where it falls in the
  component tree, and any inportant information it accesses or modifies.
  Include the route for View components.
*/

export class Template extends Component {
  constructor(props) {
    super(props);

    this.state = {
      somevar1: 1
      somevar2: 2
    }

    this.func1.bind(this)
  }

  // given a incoming post request, generate a token for this user
  func1(value) {

  }

  // save the token against this user, or add in a new user if needed
  func2(value) {

  }

  render() {
    return (
      <div>
        Some React components.
        Reference functions defined above with exact names (func2(x)), local state using this.state.somevar1,
        and props provided to the component using this.props.propName.
      </div>
    );
  }
}

// Define the names, types and optional status of the props that will be passed
// to this component from the parent component that creates it.
// Be sure to include any collections obtained from withTracker!

// describe props
Template.propTypes = {
  prop1: PropTypes.array.isRequired
  prop2: PropTypes.string.
  prop2: PropTypes.func.isRequired
  collectionAsObjectList: PropTypes.array.isRequired
};

// If the component needs to access data from the database, it must be wrapped
// inside a container that can subscribe to a meteor collection.
//
// withTracker encapsulates the component and subscribes to the published version
// of a specified Meteor collections (defined in server/publications.js),
// passing it to the component as a prop. This subscription will automatically
// update whenever its database collection changes and will trigger a component re-render.
// Look at the publishers in server/publications.js for more information about publishers and subscribers.

// Explain which collections this componet will subscribe to, and what data is expected to be returned.
export default withTracker((props) => {
  const subscription = Meteor.subscribe('collection name', parameter1InPublisher, parameter2InPublisher); //get collection as lowercase name from ../api/dbInit.js
  const loading = !subscription.ready();
  const collectionAsObjectList = CollectionName.find({}).fetch();
  return {
    collectionAsObjectList,
  };
}, Template);
