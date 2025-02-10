/**
 * Applies stemming rules to reduce a word to its base form
 */
const stemWord = (word) => {
  if (word.endsWith("sses")) {
    return word.replace(/sses$/, 'ss');
  } if (word.endsWith("ies")) {
    return word.replace(/ies$/, 'y');
  } if (word.endsWith("es") && !/[aeiou]es$/.test(word)) {
    return word.replace(/es$/, '');
  } if (word.endsWith("s") && word.length > 1 && !/[sxz]$/.test(word)) {
    return word.replace(/s$/, '');
  }
  return word;
}

/**
 * Removes filler words from a course description
 */
const cleanWords = (sentence: string, fillerWords: string[]) =>
  sentence
    .match(/\b\w+\b/g)
    ?.map(word => {
      let singularWord = stemWord(word.toLowerCase());
      return fillerWords.includes(singularWord) ? '' : singularWord;
    })
    .filter(Boolean)
    .join(' ');

/**
 * Preprocesses the description to remove pluralities and unnecessary punctuation
 * @param description A course description that needs to be preprocessed
 * @returns The processed description for a course
 */
export const preprocess = (description: string) => {
  const fillerWords = ["and", "the", "to", "for", "with", "it", "you", "not", "but", "have", "been", "of", "all", "in", "your", "their", "do", "this", "a", "is", "be", "will"];
  const sentences = description.match(/[^.!?]+[.!?]*/g) || [description];

  const processedText = sentences.map(sentence => {
    const cleaned = cleanWords(sentence, fillerWords);
    return cleaned;
  });

  return processedText.join('. ').trim();
};

/**
 * Calculates the inverse document frequency for the given terms
 * @param terms list of terms in the course description
 * @param words list of all course descriptions as word arrays
 * @returns a dictionary with terms as keys and their IDF scores as values
 */
export const idf = (terms, words) => {
  let df = {};
  let idf = {};
  for (const term of terms) {
    df[term] = words.reduce((count, wordsSet) => (count + (wordsSet.includes(term) ? 1 : 0)), 0);
    idf[term] = 1 / (df[term] + 1);
  }
  return idf;
}

/**
 * Calculates the TF-IDF vector for the given terms
 * @param terms list of terms in the course description
 * @param idf inverse document frequency (IDF) for the terms
 * @returns a dictionary with terms as keys and their TF-IDF scores as values
 */
export const tfidf = (terms, idf) => {
  let d = {};
  const termCount = terms.length;
  // tf
  for (const term of terms) {
    if (!d[term]) {
      d[term] = 0;
    }
    d[term]++;
  }
  // idf
  for (const term in d) {
    let normalize = d[term] / termCount;
    d[term] *= normalize * (idf[term] || 1);
  }
  return d;
}

/**
 * Computes the dot product between two vectors
 */
const dot = (a, b) => {
  let sum = 0;
  for (let key in a) {
    if (b[key]) {
      sum += a[key] * b[key];
    }
  }
  return sum;
}

/**
 * Computes the magnitude of a vector
 */
const norm = (vec) => {
  const sum = dot(vec, vec);
  return Math.sqrt(sum);
}

/**
 * Calculates the cosine similarity of two frequency word vectors
 * @param vecA frequency word vector corresponding to the first course description
 * @param vecB frequency word vector corresponding to the second course description
 * @returns a number representing the similarity between the two descriptions
 */
export const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = dot(vecA, vecB);
  const magA = norm(vecA);
  const magB = norm(vecB);
  return dotProduct / (magA * magB);
}