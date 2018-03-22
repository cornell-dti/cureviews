# Course Reviews
React version of course-reviews

# Install & Run
Make sure you have [Meteor](https://www.meteor.com) installed!

    npm install
    meteor npm install
    meteor --port 3000

You can access the app at http://localhost:3000.

Next, add a password to your local database. Launch a second terminal window and
navigate to the application folder (leave the application running in the first
terminal window). Run:

    meteor mongo
    db.validation.insert({'adminPass': 'my_super_secret_password'})

Note: If you copy and paste, ensure that the quotes ('') copy over correctly!

Navigate to http://localhost:3000/admin and enter your password when prompted.
Select the “Initialize Database” button and wait for the database to populate.

Once this process completes, the application is ready to use!
