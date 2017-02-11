// Slugify some text
const slugify = text =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text


// Log and return a variable (useful for promise chains)
const log = x => {
  console.log(x);
  return x;
};


// Flatten nested arrays
const flatten = arrs => [].concat(...arrs);


module.exports = {
  slugify,
  log,
  flatten,
}
