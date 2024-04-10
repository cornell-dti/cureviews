import express from 'express';

import { Search } from './search';
import {
  searchCourses,
  searchProfessors,
  searchSubjects,
  searchCoursesBySubject,
  searchCoursesByProfessor,
} from './search.controller';
import { SearchQueryRequestType } from './search.type';

export const searchRouter = express.Router();

/**
 * Searches the database for potential courses, subjects, and professors relating 
 * to the query and returns an object containing 3 arrays of the above queries
 */
searchRouter.post('/getResultsFromQuery', async (req, res) => {
  try {
    const { query }: SearchQueryRequestType = req.body;
    const cleanQuery = query.replace('+', ' ').toLowerCase();
    const search = new Search({ query: cleanQuery });

    // divide up course search by whether it is subject or professor, 
    // then use default course search at the end
    const subjects = await searchSubjects({ search });
    const professors = await searchProfessors({ search });

    // checks to see if input is full subject name
    let coursesBySubject
    if (subjects.length > 0 && cleanQuery == subjects[0].subFull.toLowerCase()) {
      const subjectQuery = subjects[0].subShort;
      const search = new Search({ query: subjectQuery })
      coursesBySubject = await searchCoursesBySubject({ search });
    } else {
      coursesBySubject = await searchCoursesBySubject({ search });
    }

    const coursesByProfessor = await searchCoursesByProfessor({ search });
    const coursesNaive = await searchCourses({ search });

    const courses = coursesBySubject.length > coursesByProfessor.length ?
      (coursesBySubject.length > coursesNaive.length ? coursesBySubject : coursesNaive) :
      (coursesByProfessor.length > coursesNaive.length ? coursesByProfessor : coursesNaive)

    if (!subjects || !professors || !courses) {
      return res.status(204).json({ error: `No results found for query: ${cleanQuery}` });
    }

    return res.status(200).json({
      message: `Success! Retrieved all courses, subjects, and professors by query: ${cleanQuery}`,
      result: { subjects: subjects, professors: professors, courses: courses },
    });
  } catch (err) {
    return res
      .status(400)
      .json({ error: `Search query must contain ASCII characters.` });
  }
});

searchRouter.post('/getClassesByQuery', async (req, res) => {
  try {
    const { query }: SearchQueryRequestType = req.body;
    const search = new Search({ query });

    const courses = await searchCourses({ search });

    if (!courses) {
      return res.status(500).json({ error: `Internal Server Error.` });
    }

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

/**
 * Searches the database on Subjects using the text index and returns matching subjects
 */
searchRouter.post('/getSubjectsByQuery', async (req, res) => {
  try {
    const { query }: SearchQueryRequestType = req.body;
    const search = new Search({ query });

    const subjects = await searchSubjects({ search });

    if (!subjects) {
      return res.status(500).json({ error: `Internal Server Error.` });
    }

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

    const professors = await searchProfessors({ search });

    if (!professors) {
      return res.status(500).json({ error: `Internal Server Error.` });
    }

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

    const courses = await searchCoursesBySubject({ search });

    if (!courses) {
      return res.status(500).json({ error: `Internal Server Error.` });
    }

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
    const cleanQuery = query.replace('+', ' ');
    const search = new Search({ query: cleanQuery });
    const courses = await searchCoursesByProfessor({ search });

    if (!courses) {
      return res.status(500).json({ error: `Internal Server Error.` });
    }

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
