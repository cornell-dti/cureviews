import { Search } from "./search.js";

export interface SearchQueryRequestType {
  query: string;
}

export interface SearchQueryType {
  search: Search;
}
