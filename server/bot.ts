import { Meteor } from "./shim"
import { WebClient } from "@slack/web-api"
import { createEventAdapter } from "@slack/events-api"
import { Reviews, ReviewDocument } from "./dbDefs"

// which channel should we post any and all messages to?
const channel_name = "cu-reviews-bot";

/**
 * Initialze the 2 Slack APIs:
 * Web: Sending any kind of request (messages/emoji post, getting history)
 * Events: Listen for messages & reactions
 * 
 * Local Testing: REQUIRES ngrok: https://ngrok.com/
 * Why? Because the Slack Events API ** HTTP-POSTS ** to you whenever a message is posted by a user 
 * For reference:
 * You need to verify the url to post to on the slack developer portal!
 * You can verify your ngrok url using this command ./node_modules/.bin/slack-verify --secret [Slack Events Token] --port=3002
 * Setting up ngrok: https://api.slack.com/tutorials/tunneling-with-ngrok
 * How the events api works: https://api.slack.com/events-api
 * 
 * @returns 
 * An interface to the Web API (used by the postMessage function) on a success
 * undefined on an error. This will disable the bot.
 */
export function initializeBot(): WebClient {
  if (!process.env.EventsToken) {
    console.log("Missing events token, skipping bot initialization.");
    return undefined;
  }

  if (!process.env.WebToken) {
    console.log("Missing web token, skipping bot initialization.");
    return undefined;
  }

  if (!process.env.BotId) {
    console.log("Missing bot id, skipping bot initialization.");
    return undefined;
  }

  try {
    // create the clients
    const web = new WebClient(process.env.WebToken);

    // Why the "any" is necessary here? It seems bad.
    // Compare what it says here here to the type error you get when you remove the as any. 
    // Apparently, the "on" method is not defined, even though it clearly exists.
    // https://slack.dev/node-slack-sdk/events-api
    // This is suboptimal, and we should figure out what is going on sometime.
    const slackEvents = createEventAdapter(process.env.EventsToken) as any;

    // listen for a reaction added event
    slackEvents.on('reaction_added', (event) => {
      // make sure that the reaction wasn't by the bot, and was on a message that was sent by the bot
      if (event.user != process.env.BotId && event.item_user == process.env.BotId) {
        (async () => {
          // get the timestamp (Slack's way of identifying messages) of the message in question
          const ts = event.item.ts;

          // get the message in question
          const hist = await web.conversations.history({
            channel: event.item.channel,
            latest: ts,
            inclusive: true,
            limit: 1,
          });

          // if we found no messages, do nothing
          if ((hist.messages as any[]).length === 0) {
            return;
          }

          // extract the id from the text of the message we retrived
          const text: string = hist.messages[0].text;
          const lower = text.indexOf("Id: ");
          const id = text.substring(lower + 4, text.indexOf("\n", lower));
    
          // if the message posted by the bot isn't a valid id let the user know we are dissatisfied
          if (lower == -1) {
            await web.chat.postMessage({
              channel: channel_name,
              text: "",
              attachments: [{
                  text: "You have displeased CU-Reviews Bot. React to a review next time.", 
                  image_url: "https://hoderle.in/me-robot.jpg"
                }]
            });
            return;
          }

          if (event.reaction == 'heavy_check_mark') {
            // approve a review
            console.log("Slack approved a review with id: " + id + "!");
            Meteor.call("makeVisible", await Reviews.findOne({_id: id}), process.env.WebToken);

            // notify user that the review has been approved
            await web.chat.postMessage({
              channel: channel_name,
              text: "Published review with id: " + id,
            });
          } else if (event.reaction == 'x') {
            // deny a review
            // TODO remove it? we leave it in for now.
            console.log("Slack denied a review with id: " + id + "!");
          }
        })(); 
      }
    });

    // send an online message
    (async () => {
      try {
        const currentTime = new Date().toTimeString();

        const res = await web.chat.postMessage({
          channel: channel_name,
          text: "Hello, Cornell DTI! CU Reviews is onlining at " + currentTime,
        });

        await web.reactions.add({
          timestamp: res.ts as string,
          channel: res.channel as string,
          name: "face_with_cowboy_hat",
        });

      } catch (error) {
        console.log("Unable to initialze the bot. Sorry about that.");
        return undefined;
      }

      const server = await slackEvents.start(3002);

      console.log("Listening for events on " + server.address().port);
    })();

    // everything initialized properly, so return the Web API interface
    console.log("Bot initialized!");
    return web;
  } catch (e) {
    console.log("Unable to initialze the bot. Sorry about that.");
    return undefined;
  }
}


/**
 * Post a review using the Slack Web API
 * Works only if the web constant has been set by initialzeBot();
 * 
 * @param {*} web The webclient to use to post to slack. Does nothing if this is undefined.
 * @param {*} review A review in the database
 * @param {*} id the Id of that review in the database
 * 
 * @returns nothing
 */
export async function postReview(web: WebClient, review: ReviewDocument, id: string) {
  // if the bot initialization failed, do not post messages!
  if (!web) {
    return;
  }

  // get the course in question from mongodb, and build a little description
  const course: any = await Meteor.call('getCourseById', review.class);
  const classText = course.classSub + " " + course.classNum;

  // notify slack that a new review has been posted
  const res = await web.chat.postMessage({
    channel: channel_name,
    text: "A new review has been posted for *" + classText.toUpperCase() + "*!\n" +
      "Id: " + id + "\n\n" + 
      "*Rating: " + review.rating + " Difficulty: " + review.difficulty + " Workload: " + review.workload + "*\n" +
      "```" + review.text + "```",
  });

  // add a confirm reaction to let the users know what to click
  await web.reactions.add({
    timestamp: res.ts as string,
    channel: res.channel as string,
    name: "heavy_check_mark",
  });

  // add a deny reaction
  await web.reactions.add({
    timestamp: res.ts as string,
    channel: res.channel as string,
    name: "x",
  });
}