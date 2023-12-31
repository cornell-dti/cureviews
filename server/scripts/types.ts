// Represents a subject which is scraped
// Note: there's a load of additional information when we scrape it.
// It's not relevant, so we just ignore it for now.
export interface ScrapingSubject {
  descrformal: string; // Subject description, e.g. "Asian American Studies"
  value: string; // Subject code, e.g. "AAS"
}

// This only exists for compatibility with the API
export interface ScrapingInstructor {
  firstName: string;
  lastName: string;
}

// This only exists for compatibility with the API
export interface ScrapingMeeting {
  instructors: ScrapingInstructor[];
}

// This only exists for compatibility with the API
export interface ScrapingClassSection {
  ssrComponent: string; // i.e. LEC, SEM, DIS
  meetings: ScrapingMeeting[];
}

// This only exists for compatibility with the API
export interface ScrapingEnrollGroup {
  classSections: ScrapingClassSection[]; // what sections the class has
}

// Represents a class which is scraped
// Note: there's a load of additional information when we scrape it.
// It's not relevant, so we just ignore it for now.
export interface ScrapingClass {
  subject: string; // Short: e.g. "CS"
  catalogNbr: string; // e.g. 1110
  titleLong: string; // long variant of a title e.g. "Introduction to Computing Using Python"
  enrollGroups: ScrapingEnrollGroup[]; // specified by the API
}
