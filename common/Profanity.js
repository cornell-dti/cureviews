// eslint-disable-next-line @typescript-eslint/no-var-requires
const Filter = require('bad-words');

const filter = new Filter();

const includesProfanity = (s) => filter.isProfane(s);

module.exports = {
  includesProfanity,
};
