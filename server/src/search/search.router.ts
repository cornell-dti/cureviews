import express from 'express';

import { Search } from './search';
import {
  searchCourses,
  searchProfessors,
  searchSubjects,
  searchCoursesBySubject,
} from './search.controller';
import { SearchQueryRequestType } from './search.type';

export const searchRouter = express.Router();

searchRouter.post('/getClassesByQuery', async (req, res) => {
  try {
    const { query }: SearchQueryRequestType = req.body;
    const search = new Search({ query });

    const courses = await searchCourses({ search }).catch((err) => {
      return res.status(500).json({ error: `Internal Server Error: ${err}` });
    });

    return res.status(200).json({
      message: `Success! Retrieved all courses by query: ${query}`,
      result: courses,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ error: `Search query must contain ASCII characters.` });
  }
});

/*
//  * Searches the database on Subjects using the text index and returns matching subjects
//  */
searchRouter.post('/getSubjectsByQuery', async (req, res) => {
  try {
    const { query }: SearchQueryRequestType = req.body;
    const search = new Search({ query });

    const subjects = await searchSubjects({ search }).catch((err) => {
      return res.status(500).json({ error: `Internal Server Error: ${err}` });
    });

    return res.status(200).json({
      message: `Success! Retrieved all subjects by query: ${query}`,
      result: subjects,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ error: `Search query must contain ASCII characters.` });
  }
});

searchRouter.post('/getProfessorsByQuery', async (req, res) => {
  try {
    const { query }: SearchQueryRequestType = req.body;
    const search = new Search({ query });

    const professors = await searchProfessors({ search }).catch((err) => {
      return res.status(500).json({ error: `Internal Server Error: ${err}` });
    });

    return res.status(200).json({
      message: `Success! Retrieved all subjects by query: ${query}`,
      result: professors,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ error: `Search query must contain ASCII characters.` });
  }
});

searchRouter.post('/getCoursesByMajor', async (req, res) => {
  try {
    const { query }: SearchQueryRequestType = req.body;
    const search = new Search({ query });

    const courses = await searchCoursesBySubject({ search }).catch((err) => {
      return res.status(500).json({ error: `Internal Server Error: ${err}` });
    });

    return res.status(200).json({
      message: `Success! Retrieved all courses by query: ${query}`,
      result: courses,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ error: `Search query must contain ASCII characters.` });
  }
});

searchRouter.post('/getCoursesByProfessor', async (req, res) => {
  try {
    const { query }: SearchQueryRequestType = req.body;
    const search = new Search({ query });

    const courses = await searchCoursesBySubject({ search }).catch((err) => {
      return res.status(500).json({ error: `Internal Server Error: ${err}` });
    });

    return res.status(200).json({
      message: `Success! Retrieved all courses by query: ${query}`,
      result: courses,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ error: `Search query must contain ASCII characters.` });
  }
});
