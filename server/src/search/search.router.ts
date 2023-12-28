import express from 'express';

import { Search } from './Search';
import {
  searchCourses,
  searchProfessors,
  searchSubjects,
} from './search.controller';

const searchRouter = express.Router();

searchRouter.post('/getClassesByQuery', async (req, res) => {
  try {
    const { query } = req.body;
    const search = new Search({ query });

    const courses = await searchCourses(search);

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

    const subjects = await searchSubjects(search);

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

    const professors = await searchProfessors(search);

    res.status(200).json({
      message: `Success! Retrieved all subjects by query: ${query}`,
      result: professors,
    });
  } catch (err) {
    res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

export default searchRouter;
