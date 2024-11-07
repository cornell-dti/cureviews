import axios from 'axios';

/**
 * Fetches all available semesters in class roster
 *
 * @returns list of semester strings on success, or empty list if failed
 */
export async function findAllSemesters(): Promise<string[]> {
  let response = await axios.get(
    'https://classes.cornell.edu/api/2.0/config/rosters.json',
    { timeout: 30000 }
  );
  if (response.status !== 200) {
    return [];
  }
  response = response.data;
  const allSemesters = response.data.rosters;
  return allSemesters.map((semesterObject) => semesterObject.slug);
}
