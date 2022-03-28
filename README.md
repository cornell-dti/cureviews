# CU Reviews

## Contents

- [CU Reviews](#cu-reviews)
  - [Contents](#contents)
  - [About](#about)
  - [Getting Started](#getting-started)
  - [Dependencies & Libraries](#dependencies--libraries)
  - [Screenshots](#screenshots)
  - [Contributors](#contributors)
    - [2019-2020](#2019-2020)
    - [2018-2019](#2018-2019)
    - [2017-2018](#2017-2018)

## About

A web app for Cornell students to read and write reviews for Cornell classes, allowing a common platform for students to get advice and suggestions for picking classes. In other words, a "rate my Cornell classes".

## Getting Started

Create an .env file in the `server/` folder with content:

```bash
MONGODB_URL=[SECRET_URL_ASK_TEAM_MEMBER_FOR_IT]
```

**You will probably use the address of the staging server.** If, for some reason you want to have a local db (E.g. you're making some changes to the db structure, and don't want to accidently trash the staging db), the following works:

<details><summary>Running using local mongodb server</summary>
<p>

Option 1:

Previously, you would start a server like so:

```bash
MONGODB_URL='mongodb://foo' yarn workspace server start
```

There is also something called "fallback mode", which you can trigger by starting the server with the ALLOW_LOCAL env variable set to 1, and **without** setting MONGODB_URL. Fallback mode automatically configures a blank mongodb for use in the application, and then scrapes some data from Cornell's endpoint for you to test. There will not be any reviews by default.

```bash
ALLOW_LOCAL=1 yarn workspace server start
```

Option 2:

<details><summary>If you really, really do want to use a local Mongo instance using mongod (not recommended), this might work: </summary>

You need the mongodb database tools and server installed. They are available [here](https://docs.mongodb.com/database-tools/) and [here](https://www.mongodb.com/download-center/community). If, for some reason, you want to use the tools on a linux box, you will probably have to build them from source [here](https://github.com/mongodb/mongo-tools).

```bash
mkdir mongo # create a directory for mongo to dump its files in
mongod --dbpath mongo/ --port 3001 # launch the mongo server on localhost:3001
```

Set your `MONGODB_URL` to `mongodb://localhost:3001`

You will probably want to restore some collections from a bson, in which case you should, in a new terminal:

```bash
mongorestore -h 127.0.0.1 --port 3001 -d test /path/to/your/bson.bson --drop
```

You will probably need to run this for the `classes`, `subjects` and `reviews` collections (Perhaps also `students`). Ask a team member for the bsons if you need them. If this errors, it might be because the `-d test` specifies the wrong database name (`test`), in which case you should figure out your db name, and replace `-d test` with `-d dbname`. Note that it **won't** error on the command, the only evidence of an error is that none of collections will be show up on the site (i.e. no classes visible).

</details>

</p>
</details>

Now that you have the database configured, make sure you have [Yarn](https://classic.yarnpkg.com/) installed.

```bash
yarn
yarn workspace server start # start server
yarn workspace client start # start client
```

You can access the app at [http://localhost:3000].

If you need features which use admin access, you need to create an entry in the `students` collection which has you flagged as an admin user. We should have done this when you joined the team.

_Last updated **05/07/2020**_.

## Dependencies & Libraries

- **[Node.js](https://nodejs.org/en/about/)** v10 - **Node.js provides the basis for our server. It handles external connects and gives us access to an vast array of useful packages via Node Package Manager (NPM)**
- **[Express](https://expressjs.com/)** v4.17.1 - **The package for running the web server.**
- **[React](https://reactjs.org/)** v16.13.1 - **We use React to help us create a component-based site. Using components allow us to re-use code more efficiently and modify their implementation more quickly**
- **[Bootstrap](http://getbootstrap.com/)** v3.3.7 - **Allows us to quickly define our front end components’ display.**

## Screenshots

_Screenshots coming soon_

## Contributors

### 2021 - 2022

- **Akash Aryal** - Technical Product Manager
- **Andrew Gao** - Developer
- **Julie Jeong** - Developer
- **Jack Farley** - Developer
- **Michelle Li** - Developer
- **Ankit Lakkapragada** - Developer

### 2021-2020

- **Angela Chen** - Product Manager
- **Julian Londono** - Technical Project Manager
- **Luis Hoderlein** - Technical Project Manager
- **Dray Farley** - Developer
- **Akash Aryal** - Developer
- **Julie Jeong** - Developer
- **Tanay Menezes** - Developer

### 2019-2020

- **Julian Londono** - Technical Project Manager
- **Adam Masters** - Product Manager
- **Jessica Chen** - Developer
- **Dray Farley** - Developer
- **Akash Aryal** - Developer
- **Luis Hoderlein** - Developer
- **Erin Chen** - Designer
- **Flora Liu** - Designer

### 2018-2019

- **Julian Londono** - Project Manager
- **Adam Masters** - Project Manager (in transition)
- **Jessica Prague** - Project Manager
- **Jessica Chen** - Developer
- **Dray Farley** - Developer
- **Bryan Graeser** - Developer
- **Erin Chen** - Designer
- **Jesse Mansoor** - Designer

### 2017-2018

- **Brooke Docherty** - Product Manager
- **Divyansha Sehgal** - Product Manager
- **Jessica Chen** - Developer
- **Julian Londono** - Developer
- **Vinisha Mittal** - Developer
- **Jesse Mansoor** - Designer
- **Jessica Prague** - Designer

We are a team within **Cornell Design & Tech Initiative**. For more information, see our website [here](https://cornelldti.org/).
<img src="https://raw.githubusercontent.com/cornell-dti/design/master/Branding/Wordmark/Dark%20Text/Transparent/Wordmark-Dark%20Text-Transparent%403x.png">
