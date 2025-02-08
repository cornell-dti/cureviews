/**
 * Formats list into human-readable text.
 * eg ["a","b","c"] --> "a, b, and c"
 * @param list
 */

const formatList = (list: string[]) => {
  return list.join(', ').replace(/(, )(?!.*\1)/,
    (list.length > 2 ? ', and ' : ' and ')
  );
}

export default formatList;