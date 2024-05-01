export { adminRouter } from "./admin.router";


import OpenAI from "openai";

// const openai = new OpenAI();

// async function complete() {
//   const completion = await openai.chat.completions.create({
//     model: 'gpt-3.5-turbo',
//     messages: [
//       {
//         role: 'system', content: 'You are creating a 50 word summary based.'
//       },
//       {
//         role: 'user', content: 'hi'
//       }
//     ]
//   })

//   return completion.choices[0].message.content;
// }