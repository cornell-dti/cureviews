import axios from 'axios';

import {
  testClasses,
  testProfessors,
  testStudents,
  testSubjects,
  testReviews,
} from './mocks/InitMockDb';
import { testServer, testPort } from './mocks/MockServer';

beforeAll(async () => {
  await testServer.setUpDB(
    testReviews,
    testStudents,
    testClasses,
    testProfessors,
    testSubjects,
  );
});

afterAll(async () => {
  await testServer.shutdownTestingServer();
});

describe('search functionality unit tests', () => {
  it('getResultsFromQuery - invalid body is sent', async () => {
    expect(
      await axios
        .post(`http://localhost:${testPort}/api/search/results`, {
          'other query': 'other',
        })
        .catch((e) => 'failed!'),
    ).toBe('failed!');
  });

  it('getResultsFromQuery - valid query "MORK 1" sent with correct subject and order of classes', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      {
        query: 'MORK 1',
      },
    );

    expect(res.data.result.subjects.map((e) => e.subShort)).toContain('MORK');
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain('MAD');
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain('FEDN');

    // we expect it to be MORK 1110 first, and then MORK 2110
    expect(res.data.result.courses.map((e) => e.classFull)).toStrictEqual([
      'MORK 1110: Introduction to Testing',
      'MORK 2110: Intermediate Testing',
      'MORK 3110: Advanced Mock',
    ]);
  });

  it('getResultsFromQuery - valid query: "MORK1" sent with correct order of classes', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      {
        query: 'MORK1',
      },
    );

    expect(res.data.result.courses.map((e) => e.classFull)).toStrictEqual([
      'MORK 1110: Introduction to Testing',
      'MORK 2110: Intermediate Testing',
      'MORK 3110: Advanced Mock',
    ]);
  });

  it('getResultsFromQuery - valid query: "MORK 1110" sent with correct subject and order of classes', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: 'MORK 1110' },
    );

    expect(res.data.result.subjects.map((e) => e.subShort)).toContain('MORK');
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain('MAD');
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain('FEDN');

    expect(res.data.result.courses.map((e) => e.classFull)).toStrictEqual([
      'MORK 1110: Introduction to Testing',
    ]);
  });

  it('getResultsFromQuery - valid query: "1110" sent with correct order of classes', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: '1110' },
    );
    expect(res.data.result.courses.map((e) => e.classFull)).toContain(
      'MORK 1110: Introduction to Testing'
    );
    expect(res.data.result.courses.map((e) => e.classFull)).not.toContain(
      'MORK 2110: Intermediate Testing'
    );
    expect(res.data.result.courses.map((e) => e.classFull)).not.toContain(
      'MORK 3110: Advanced Mock'
    );
  });

  it('getResultsFromQuery - valid query: "Advanced" sent with correct order of classes', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: 'Advanced' },
    );
    expect(res.data.result.courses.map((e) => e.classFull)).toContain(
      'MORK 3110: Advanced Mock'
    );
    expect(res.data.result.courses.map((e) => e.classFull)).not.toContain(
      'MORK 1110: Introduction to Testing'
    );
    expect(res.data.result.courses.map((e) => e.classFull)).not.toContain(
      'MORK 2110: Intermediate Testing'
    );
  });

  it('getResultsFromQuery - valid query: "Advanced Mock" sent with correct order of classes', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: 'Advanced Mock' },
    );
    expect(res.data.result.courses.map((e) => e.classFull)).toContain(
      'MORK 3110: Advanced Mock'
    );
    expect(res.data.result.courses.map((e) => e.classFull)).not.toContain(
      'MORK 1110: Introduction to Testing'
    );
    expect(res.data.result.courses.map((e) => e.classFull)).not.toContain(
      'MORK 2110: Intermediate Testing'
    );
  });

  it('getResultsFromQuery - valid query subject: "MORK" sent with correct order', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: 'MORK' },
    );
    expect(res.data.result.subjects.map((e) => e.subShort)).toContain('MORK');
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain('MAD');
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain('FEDN');
  });

  it('getResultsFromQuery - query professor: "Gazghul Thraka" sent', async () => {
    const res1 = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: 'Gazghul Thraka' },
    );
    expect(res1.data.result.professors.map((e) => e.fullName)).toContain(
      'Gazghul Thraka'
    );
    expect(res1.data.result.professors.map((e) => e.fullName)).not.toContain(
      'Jean-Luc Picard',
    );
  });

  it('getResultsFromQuery - query professor: "Jean-Luc Picard" sent', async () => {
    const res2 = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: 'Jean-Luc Picard' },
    );
    expect(res2.data.result.professors.map((e) => e.fullName)).not.toContain(
      'Gazghul Thraka'
    );
    expect(res2.data.result.professors.map((e) => e.fullName)).toContain(
      'Jean-Luc Picard',
    );
  });

  // Query has no matching results:
  it('getResultsFromQuery - no matching classes', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      {
        query: 'random',
      },
    );

    // we expect no results to be returned
    expect(res.data.result.courses.map((e) => e.classFull)).toStrictEqual([]);
    expect(res.data.result.courses.map((e) => e.classFull)).not.toContain([
      'MORK 1110: Introduction to Testing',
      'MORK 2110: Intermediate Testing',
      'MORK 3110: Advanced Mock',
    ]);
  });

  it('getResultsFromQuery - no matching subjects', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: 'RAND' },
    );
    // we expect no results to be returned
    expect(res.data.result.subjects.map((e) => e.subShort)).toStrictEqual([]);
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain('MORK');
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain('MAD');
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain('FEDN');
  });

  it('getResultsFromQuery - no matching professors', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: 'Random Professor' },
    );
    // we expect no results to be returned
    expect(res.data.result.professors.map((e) => e.fullName)).toStrictEqual([]);
    expect(res.data.result.professors.map((e) => e.fullName)).not.toContain(
      'Gazghul Thraka',
    );
    expect(res.data.result.professors.map((e) => e.fullName)).not.toContain(
      'Jean-Luc Picard',
    );
  });

  it('getResultsFromQuery - non Ascii query', async () => {
    const res = await axios
      .post(`http://localhost:${testPort}/api/search/results`, {
        query: 'भारत',
      })
      .catch((e) => e);
    expect(res.response.status).toBe(400);
  });

  it('getResultsFromQuery - empty query', async () => {
    const res = await axios
      .post(`http://localhost:${testPort}/api/search/results`, {
        query: '',
      })
      .catch((e) => e);

    expect(res.response.status).toBe(400);
  });
});
