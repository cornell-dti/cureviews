import express from 'express';

import { Classes } from '../../db/schema';
import { courseSort } from './search_original';

import {
  findCourses,
  findProfessors,
  findSubjects,
} from './search.data-access';
import { Search } from './Search';

const searchRouter = express.Router();

searchRouter.post('/getClassesByQuery', async (req, res) => {
  try {
    const { query } = req.body;
    const search = new Search({ query });
    const validQuery = search.getQuery();

    const courses = await findCourses(validQuery);

    res.status(200).json({
      message: `Success! Retrieved all courses by query: ${query}`,
      result: courses,
    });
  } catch (err) {
    res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

/*
//  * Searches the database on Subjects using the text index and returns matching subjects
//  */
searchRouter.post('/getSubjectsByQuery', async (req, res) => {
  try {
    const { query } = req.body;
    const search = new Search({ query });
    const validQuery = search.getQuery();

    const subjects = await findSubjects(validQuery);

    res.status(200).json({
      message: `Success! Retrieved all subjects by query: ${query}`,
      result: subjects,
    });
  } catch (err) {
    res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

searchRouter.post('/getProfessorsByQuery', async (req, res) => {
  try {
    const { query } = req.body;
    const search = new Search({ query });
    const validQuery = search.getQuery();

    const professors = await findProfessors(validQuery);

    res.status(200).json({
      message: `Success! Retrieved all subjects by query: ${query}`,
      result: professors,
    });
  } catch (err) {
    res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

export default searchRouter;
