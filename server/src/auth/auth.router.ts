import express from 'express';
import { Auth } from './auth';

const authRouter = express.Router();

authRouter.post('/getStudentEmailByToken', async (req, res) => {
  try {
    const { token } = req.body;
    const auth: Auth = new Auth({ token });

    const validToken: string = auth.getToken();

    const ticket = await auth.getVerificationTicket(validToken);
    if (ticket.hd === 'cornell.edu') {
      return res.status(200).json({ message: ticket.email });
    }

    return res.status(400).json({ error: `Invalid email ${ticket.email}` });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
});

// export const getStudentEmailByToken: Endpoint<ProfileRequest> = {
//   guard: [body('token').notEmpty().isAscii()],
//   callback: async (ctx: Context, request: ProfileRequest) => {
//     const { token } = request;

//     try {
//       const ticket = await getVerificationTicket(token);
//       if (ticket.hd === 'cornell.edu') {
//         return { code: 200, message: ticket.email };
//       }

//       return { code: 500, message: 'Invalid email' };
//     } catch (error) {
//       // eslint-disable-next-line no-console
//       console.log("Error: at 'getStudentEmailByToken' method");
//       // eslint-disable-next-line no-console
//       console.log(error);
//       return { code: 500, message: error.message };
//     }
//   },
// };

export default authRouter;
