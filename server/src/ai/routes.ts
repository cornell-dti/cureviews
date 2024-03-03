import { Router } from 'express'
import { minReviewsCosting, simpleCosting } from './functions'

const router = Router()


/** Reachable at POST /ai/costing 
 * @body none 
 * values used for OpenAI model costing consideration
*/
router.post('/costing', async (req, res) => {
  if (req) {
    console.log(req)
  }
  const number1 = await simpleCosting()
  const number2 = await minReviewsCosting(3)

  res.send(` Number of total reviews: ${number1.reviews}, 
  \n Average length of all reviews: ${number1.words},
  \n Number of total reviews belonging to courses with minimum ${number2.min} reviews: ${number2.reviews},
  \n Number of total words belonging to courses with minimum ${number2.min} reviews: ${number2.words}
  \n Average length of all reviews belonging to courses with minimum ${number2.min} reviews: ${number2.avgwords}`)
})

export default router 