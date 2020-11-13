import express from "express";
import { validationResult, ValidationChain } from "express-validator";
import { tokenIsAdmin } from "./endpoints/Auth";
import { getClassesByQuery, getSubjectsByQuery, getProfessorsByQuery } from "./endpoints/Search";

// A type which captures an endpoint, and the guard for that endpoint
// INVARIANT: If an object passes the guard, it can be coerced into type T
export interface Endpoint<T> {
    guard: ValidationChain[];
    callback: (args: T) => any;
}

/*
 * Configure the various endpoints to use
 */
export function configure(app: express.Application) {
  const methods = express.Router();
  methods.use(express.json());
  app.use(express.json());

  register(app, "getClassesByQuery", getClassesByQuery);
  register(app, "tokenIsAdmin", tokenIsAdmin);
  register(app, "getSubjectsByQuery", getSubjectsByQuery);
  register(app, "getProfessorsByQuery", getProfessorsByQuery);
}

function register<T>(app: express.Application, name: string, endpoint: Endpoint<T>) {
  const { callback, guard } = endpoint;
  app.post(`/v2/${name}`, guard, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // INVARIANT:
    // The fact that the guard has not errored is enough for this to be safe
    // Make sure that your guard is sufficient!
    const arg = req.body;
    return res.status(200).send({ result: await callback(arg) });
  });
}
