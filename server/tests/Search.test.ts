import { expect, test, describe, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

import {
  testClasses,
  testProfessors,
  testStudents,
  testSubjects,
  testReviews
} from './mocks/InitMockDb';
import { testServer, testPort } from './mocks/MockServer';

beforeAll(async () => {
  await testServer.setUpDB(
    testReviews,
    testStudents,
    testClasses,
    testProfessors,
    testSubjects
  );
});

afterAll(async () => {
  await testServer.shutdownTestingServer();
});

describe('Search functionality unit tests', () => {
  test('Get results from a query with an invalid body', async () => {
    expect(
      await axios
        .post(`http://localhost:${testPort}/api/search/results`, {
          'other query': 'other'
        })
        .catch((e) => 'failed!')
    ).toBe('failed!');
  });

  test('Get results from a valid query (correct subject and order of classes)', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      {
        query: 'MORK 1'
      }
    );

    expect(res.data.result.subjects.map((e) => e.subShort)).toContain('MORK');
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain(
      'MAD'
    );
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain(
      'FEDN'
    );

    // we expect it to be MORK 1110 first, and then MORK 2110
    expect(res.data.result.courses.map((e) => e.classFull)).toStrictEqual([
      'MORK 1110: Introduction to Testing',
      'MORK 2110: Intermediate Testing',
      'MORK 3110: Advanced Mock'
    ]);
  });

  test('Get results from a valid query: "MORK 1110"', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: 'MORK 1110' }
    );

    expect(res.data.result.subjects.map((e) => e.subShort)).toContain('MORK');
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain(
      'MAD'
    );
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain(
      'FEDN'
    );

    expect(res.data.result.courses.map((e) => e.classFull)).toStrictEqual([
      'MORK 1110: Introduction to Testing'
    ]);
  });

  test('Get results from valid query: "1110" returns correct order of classes', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: '1110' }
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

  test('Get results from valid query: "Advanced" returns correct order of classes', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: 'Advanced' }
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

  test('Get results from valid query: "Advanced Mock" returns correct order of classes', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: 'Advanced Mock' }
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

  test('Get results from valid query with subject: "MORK" returns correct order', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: 'MORK' }
    );
    expect(res.data.result.subjects.map((e) => e.subShort)).toContain('MORK');
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain(
      'MAD'
    );
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain(
      'FEDN'
    );
  });

  test('Get results from valid query with professor: "Gazghul Thraka"', async () => {
    const res1 = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: 'Gazghul Thraka' }
    );
    expect(res1.data.result.professors.map((e) => e.fullName)).toContain(
      'Gazghul Thraka'
    );
    expect(res1.data.result.professors.map((e) => e.fullName)).not.toContain(
      'Jean-Luc Picard'
    );
  });

  test('Get results from valid query with professor: "Jean-Luc Picard" sent', async () => {
    const res2 = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: 'Jean-Luc Picard' }
    );
    expect(res2.data.result.professors.map((e) => e.fullName)).not.toContain(
      'Gazghul Thraka'
    );
    expect(res2.data.result.professors.map((e) => e.fullName)).toContain(
      'Jean-Luc Picard'
    );
  });

  // Query has no matching results:
  test('Get results from query with no matching results', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      {
        query: 'random'
      }
    );

    // we expect no results to be returned
    expect(res.data.result.courses.map((e) => e.classFull)).toStrictEqual([]);
    expect(res.data.result.courses.map((e) => e.classFull)).not.toContain([
      'MORK 1110: Introduction to Testing',
      'MORK 2110: Intermediate Testing',
      'MORK 3110: Advanced Mock'
    ]);
  });

  test('Get results from query with no matching subjects', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: 'RAND' }
    );
    // we expect no results to be returned
    expect(res.data.result.subjects.map((e) => e.subShort)).toStrictEqual([]);
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain(
      'MORK'
    );
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain(
      'MAD'
    );
    expect(res.data.result.subjects.map((e) => e.subShort)).not.toContain(
      'FEDN'
    );
  });

  test('Get results from query with no matching professors', async () => {
    const res = await axios.post(
      `http://localhost:${testPort}/api/search/results`,
      { query: 'Random Professor' }
    );
    // we expect no results to be returned
    expect(res.data.result.professors.map((e) => e.fullName)).toStrictEqual([]);
    expect(res.data.result.professors.map((e) => e.fullName)).not.toContain(
      'Gazghul Thraka'
    );
    expect(res.data.result.professors.map((e) => e.fullName)).not.toContain(
      'Jean-Luc Picard'
    );
  });

  test('Get results from non-ASCII query', async () => {
    const res = await axios
      .post(`http://localhost:${testPort}/api/search/results`, {
        query: 'भारत'
      })
      .catch((e) => e);
    expect(res.response.status).toBe(400);
  });

  test('Get results from empty query - should throw error', async () => {
    const res = await axios
      .post(`http://localhost:${testPort}/api/search/results`, {
        query: ''
      })
      .catch((e) => e);

    expect(res.response.status).toBe(400);
  });
});
