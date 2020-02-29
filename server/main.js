import { Meteor } from 'meteor/meteor';
import { Classes, Reviews } from '../imports/api/dbDefs.js';

const fs = require("fs");
const path = require("path");
const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');

function initializeBot() {
  const cwd = path.resolve("");
  console.log("Current working directory: " + cwd);
  const basedir = cwd.substr(0, cwd.indexOf("course-reviews-react-2.0"));
  const content = fs.readFileSync(basedir + "course-reviews-react-2.0/token").toString().split("\n");

  const web = new WebClient(content[0]);
  const slackEvents = createEventAdapter(content[1]);

  slackEvents.on('reaction_added', (event) => {
    if (event.user != 'UU2KKF4KT' && event.item_user == 'UU2KKF4KT') {
      const ts = event.item.ts;

      (async () => {
        const hist = await web.conversations.history({
          channel: event.item.channel,
          latest: ts,
          inclusive: true,
          limit: 2,
        });
  
        if (hist.messages.length == 0) {
          return;
        }

        const text = hist.messages[0].text;
        const lower = text.indexOf("Id: ");
        const id = text.substring(lower + 4, text.indexOf("\n", lower));
  
        if (lower == -1) {
          return;
        }

        if (event.reaction == 'heavy_check_mark') {
          console.log("Slack approved a review with id: " + id + "!");
          Meteor.call("makeVisible", Reviews.find({_id: id}).fetch()[0], "bot");
        } else if (event.reaction == 'x') {
          console.log("Slack denied a review with id: " + id + "!");
          // TODO remove it?
        }

        await web.chat.delete({
          channel: event.item.channel,
          ts: ts
        });
      })(); 
    }
  });

  (async () => {
    try {
      const currentTime = new Date().toTimeString();

      const res = await web.chat.postMessage({
        channel: '#cu-reviews',
        text: "Onlining CU-Reviews at " + currentTime,
      });

      const emoji_res = await web.reactions.add({
        timestamp: res.ts,
        channel: res.channel,
        name: "face_with_cowboy_hat",
      });

    } catch (error) {
      console.log(error);
    }

    const server = await slackEvents.start(3002);

    console.log("Listening for events on " + server.address().port);
  })();

  return web;
}

const web = initializeBot();

export async function postReview(review, id) {
  const course = Meteor.call('getCourseById', review.class);
  const classText = course.classSub + " " + course.classNum;

  const res = await web.chat.postMessage({
    channel: '#cu-reviews',
    text: "A new review has been posted for *" + classText.toUpperCase() + "*!\n" +
      "Id: " + id + "\n\n" + 
      "*Rating: " + review.rating + " Difficulty: " + review.difficulty + " Workload: " + review.workload + "*\n" +
      "```" + review.text + "```",
  });

  await web.reactions.add({
    timestamp: res.ts,
    channel: res.channel,
    name: "heavy_check_mark",
  });

  await web.reactions.add({
    timestamp: res.ts,
    channel: res.channel,
    name: "x",
  });
}

Meteor.startup(() => {
  // maybe add something idk
});
