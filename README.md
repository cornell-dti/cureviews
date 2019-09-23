# CU Reviews

#### Contents
- [About]
- [Getting Started]
- [Dependencies & Libraries]
- [Screenshots]
- [Contributors]

## About
A web app for Cornell students to read and write reviews for Cornell classes, allowing a common platform for students to get advice and suggestions for picking classes. In other words, a "rate my Cornell classes".

## Getting Started
Make sure you have [Meteor](https://www.meteor.com) installed!

    npm install
    meteor npm install
    meteor --port 3000

You can access the app at http://localhost:3000.

Next, add a password to your local database. Launch a second terminal window and
navigate to the application folder (leave the application running in the first
terminal window). Run:

    meteor mongo
    db.validation.insert({"adminPass": "my_super_secret_password"})

Note: If you copy and paste, ensure that the quotes ("") copy over correctly!

Navigate to http://localhost:3000/admin and enter your password when prompted.
Select the “Initialize Database” button and wait for the database to populate.
Once this process completes, the application is ready to use!

_Last updated **08/23/2018**_.

## Dependencies & Libraries
* **[Node.js](https://nodejs.org/en/about/)** v10.4.0 - **Node.js provides the basis for our server.  It handles external connects and gives us access to an vast array of useful packages via Node Package Manager (NPM)**
* **[Meteor](https://www.meteor.com/)** v1.3 - **Meteor provides a file structure for our app, allows us to code primarily in JavaScript, and aid in connecting with our MongoDB backend efficiently.**
* **[React](https://reactjs.org/)** v15.6.2 - **We use React to help us create a component-based site. Using components allow us to re-use code more efficiently and modify their implementation more quickly**
* **[Bootstrap](http://getbootstrap.com/)** v3.3.7 - **Allows us to quickly define our front end components’ display.**

## Screenshots

_Screenshots coming soon_

## Contributors
**2018-2019**
* **Julian Londono** - Project Manager
* **Adam Masters** - Project Manager (in transition)
* **Jessica Prague** - Project Manager
* **Jessica Chen** - Developer
* **Bryan Graeser** - Developer
* **Erin Chen** - Designer
* **Jesse Mansoor** - Designer

**2017-2018**
* **Brooke Docherty** - Product Manager
* **Divyansha Sehgal** - Product Manager
* **Jessica Chen** - Developer
* **Julian Londono** - Developer
* **Vinisha Mittal** - Developer
* **Jesse Mansoor** - Designer
* **Jessica Prague** - Designer

We are a team within **Cornell Design & Tech Initiative**. For more information, see our website [here](https://cornelldti.org/).
<img src="https://raw.githubusercontent.com/cornell-dti/design/master/Branding/Wordmark/Dark%20Text/Transparent/Wordmark-Dark%20Text-Transparent%403x.png">
