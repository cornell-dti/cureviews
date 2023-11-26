import express from 'express';
import { Classes, Subjects, Professors } from '../../db/dbDefs';
import { SearchQuery } from './search.dto';
import { courseSort, regexClassesSearch } from './search.controller';

const router = express.Router();

/*
 * Query for classes using a query
 */
router.post('/getClassesByQuery', async (req, res) => {
  const { query } = req.body as SearchQuery;
  try {
    const classes = await Classes.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } },
      { sort: { score: { $meta: 'textScore' } } },
    ).exec();
    if (classes && classes.length > 0) {
      res.status(200).json({
        message: `Successfully retrieved classes with query ${query}`,
        data: classes.sort(courseSort(query)),
      });
    }

    const regexClasses = await regexClassesSearch(query);
    res
      .status(200)
      .json({
        message: `Successfully retrieved classes with query ${query} using regex`,
        data: regexClasses,
      });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getClassesByQuery' endpoint");
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/*
 * Searches the database on Subjects using the text index and returns matching subjects
 */
router.post("/getSubjectsByQuery", async (req, res) => {
  const { query } = req.body as SearchQuery;
  try {
    const subjects = await Subjects.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } },
      { sort: { score: { $meta: 'textScore' } } },
    ).exec();

    res.status(200).json({ message: `Successfully retrieved subjects with query ${query}`, data: subjects });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getSubjectsByQuery' endpoint");
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/*
 * Searches the database on Professors using the text index and returns matching professors
 */
router.post("/getProfessorsByQuery", async (req, res) => {
  const { query } = req.body as SearchQuery;
  try {
    const professors = await Professors.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } },
      { sort: { score: { $meta: 'textScore' } } },
    ).exec();

    res.status(200).json({ message: `Successfully retrieved professors from query ${query}`, data: professors });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getProfessorsByQuery' endpoint");
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post("/getCoursesByMajor", async (req, res) => {
  const { query } = req.body as SearchQuery;
  try {
    let courses = [];
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(query)) {
      courses = await Classes.find({ classSub: query }).exec();
    }
    res.status(200).json({ message: `Successfully retrieved all courses by major based on query ${query}`, data: courses });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getCoursesByMajor' method");
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post("/getCoursesByProfessor", async (req, res) => {
  const { query } = req.body as SearchQuery;
  try {
    let courses = [];
    const regex = new RegExp(/^(?=.*[A-Z0-9])/i);
    if (regex.test(query)) {
      const professorRegex = query.replace('+', '.*.');
      courses = await Classes.find({
        classProfessors: { $regex: professorRegex, $options: 'i' },
      }).exec();
    }
    res.status(200).json({ message: `Successfully retrieved all courses by professor based on query ${query}`, data: courses });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("Error: at 'getCoursesByProfessor' method");
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
