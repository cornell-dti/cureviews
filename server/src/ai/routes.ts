import { Router } from 'express'
import { minReviewsCosting, simpleCosting, avgReviewsPerCourse } from './functions'

const router = Router()


/** Reachable at POST /ai/costing 
 * @body none 
*/
router.post('/costing', async (req, res) => {
  if (req) {
    console.log(req)
  }

  const overallNumbers = await simpleCosting()
  const avgRevsPerCourse = await avgReviewsPerCourse()
  let outputString: string = `Number of total reviews: ${overallNumbers.reviews}
  Number of total tokens: ${overallNumbers.tokens}
  Average length of all reviews: ${overallNumbers.words}
  Average number of reviews per course:  ${avgRevsPerCourse}`;
  for (let i = 3; i <= 10; i++) {
    const min = await minReviewsCosting(i)
    outputString += `\n\n Number of total reviews belonging to courses with minimum ${min.min} reviews: ${min.reviews}
    Number of total words belonging to courses with minimum ${min.min} reviews: ${min.words}
    Number of total characters belonging to courses with minimum ${min.min} reviews: ${min.chars}
    Number of total tokens belonging to courses with minimum ${min.min} reviews: ${min.tokens}
    Average word length of all reviews belonging to courses with minimum ${min.min} reviews: ${min.avgwords}
    Average character length of all reviews belonging to courses with minimum ${min.min} reviews: ${min.avgchar}`
  }

  res.send(outputString)
})

export default router 