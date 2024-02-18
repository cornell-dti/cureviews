import { Router } from 'express'
import { simpleCosting } from './functions'

const router = Router()


/** Reachable at POST /ai/costing 
 * @body none
 * @res hello world, number 
*/
router.post('/costing', async (req, res) => {
  if (req) {
    console.log(req)
  }
  const number = await simpleCosting(10)
  res.send(`"Hello World! " ${number}`)
})

export default router 