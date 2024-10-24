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

export const preprocess = (text: string) => {
  let sentences = text.match(/[^.!?]*[.!?]\s+[A-Z]/g) || [text];
  let processedText = sentences.map(sentence => {
    let words = sentence.match(/\b\w+\b/g) || [];
    let cleanedWords = words.map(word => {
      const singularWord = stemWord(word.toLowerCase());
      return singularWord.replace(/[^\w\s]/g, '');
    });
    return cleanedWords.join(' ');
  });
  return processedText.join('. ');
}

export const idf = (terms, words) => {
  let df = {};
  let idf = {};
  for (const term of terms) {
    df[term] = words.reduce((count, wordsSet) => (count + (wordsSet.includes(term) ? 1 : 0)), 0);
    idf[term] = 1 / (df[term] + 1);
  }
  return idf;
}

export const tfidf = (terms, idf) => {
  let d = {};
  for (const term of terms) {
    if (!d[term]) {
      d[term] = 0;
    }
    d[term]++;
  }
  for (const term in d) {
    if (idf && idf[term] === undefined) {
      idf[term] = 1;
    }
    d[term] *= idf[term];
  }
  return d;
}

const dot = (a, b) => {
  let sum = 0;
  for (let key in a) {
    if (b[key]) {
      sum += a[key] * b[key];
    }
  }
  return sum;
}

const norm = (vec) => {
  const sum = dot(vec, vec);
  return Math.sqrt(sum);
}

export const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = dot(vecA, vecB);
  const magA = norm(vecA);
  const magB = norm(vecB);
  return dotProduct / (magA * magB);
}