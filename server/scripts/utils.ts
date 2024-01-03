import axios from 'axios';

export async function findAllSemesters(): Promise<string[]> {
  let response = await axios.get(
    'https://classes.cornell.edu/api/2.0/config/rosters.json',
    { timeout: 30000 },
  );
  if (response.status !== 200) {
    console.log('error');
    return [];
  }
  response = response.data;
  const allSemesters = response.data.rosters;
  return allSemesters.map((semesterObject) => semesterObject.slug);
}
