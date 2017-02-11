const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

// Helper functions
const { slugify, log, flatten } = require('./helpers');

// Saint-speciifc code
const { authorPageBase, parseAuthorPageLinks, parseArticleLinks, parseArticleContent } = require('./saint');


/**
 * Fetch many URLs and return promises of { url, text } objects
 */
const fetchAllAsText = urls =>
  Promise
    .all(urls.map(url => fetch(url)))

    // For each URL, return a promise containing the URL and body text
    .then(results => {

      const textPromises = results.map(result =>
        result
          .text()
          .then(text => ({ url: result.url, text }))
      );

      return Promise.all(textPromises);
    });


/**
 * Given an array of author page texts, parse them all for article links
 */
const parseArticleLinksFromTexts = texts => texts.map(({text, url}) => parseArticleLinks(url, cheerio.load(text)));


/**
 * Given an array of article page texts, parse them all for the article content
 */
const parseArticleContentFromTexts = texts => texts.map(({text, url}) => parseArticleContent(url, cheerio.load(text)));


/**
 * Write articles to JSON files
 */
const writeFiles = articles => {
  articles
    .filter(a => a.headline !== '')
    .forEach(a =>
      fs.writeFile(`./data/${slugify(a.headline)}.json`, JSON.stringify(a), err => {
        if (err) console.log(err);
      })
    );

  return articles;
};


/**
 * Return URLs only for pages that didn't parse
 */
const filterFailures = articles =>
  articles
    .filter(a => a.headline === '')
    .map(a => a.url);


/**
 * Fetch and parse article URLs, and retry failures
 */
const fetchArticlesRecursively = urls => {

  if (urls.length === 0) {
    console.log('All done');
    return;
  }

  console.log(`${urls.length} pages remaining`);

  fetchAllAsText(urls)
    .then(parseArticleContentFromTexts)
    .then(writeFiles)
    .then(filterFailures)
    .then(fetchArticlesRecursively)
    .catch(err => {
      console.log('Err while fetching:', err);
      // Retry on error
      fetchArticlesRecursively(urls);
    });
}


/**
 * Run everything
 */
fetch(authorPageBase)
  // First fetch the initial author page and parse it
  .then(res => res.text())
  .then(text => cheerio.load(text))
  // Fetch every author page (because of pagination)
  .then(parseAuthorPageLinks)
  .then(fetchAllAsText)
  // Get links to all the article pages
  .then(parseArticleLinksFromTexts)
  .then(flatten)
  // Fetch and parse the articles
  .then(fetchArticlesRecursively)
  .catch(err => {
    console.log('Err:', err);
  });
