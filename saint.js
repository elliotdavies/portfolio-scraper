const fetch = require('node-fetch');
const cheerio = require('cheerio');

const authorPage = `http://thesaint-online.com/author/elliot-davies`;


// Parse the HTML for a single author page and retrieve the author page links
const getAuthorPageLinks = ($) => {
  const lastLink = $('.page-nav a.last');
  const numPages = parseInt($(lastLink).attr('title'));
  
  return Array.from(Array(numPages)).map((p, i) => `${authorPage}/page/${i+1}`);
};


// Fetch many URLs
const fetchManyAsText = urls =>
  Promise
    .all(urls.map(url => fetch(url)))
    .then(results => Promise.all(results.map(r => r.text())));


// Parse the HTML for a single author page and retrieve the article links
const getArticleLinks = ($) => {
  const articleUrls = [];

  const links = $('.td-main-content-wrap h3.entry-title a');
  links.each((i, l) => {
    const link = $(l);
    articleUrls.push(link.attr('href'));
  });

  return articleUrls;
}


// Given an array of res.text()s for author pages, parse them all for article links
const getArticleLinksForTexts = texts => texts.map(t => getArticleLinks(cheerio.load(t)));


// Flatten nested arrays
const flatten = arrs => [].concat(...arrs);


// Helper function
const log = x => {
  console.log(x);
  return x;
}


fetch(authorPage)
  .then(res => res.text())
  .then(text => cheerio.load(text))
  .then(getAuthorPageLinks)
  .then(fetchManyAsText)
  .then(getArticleLinksForTexts)
  .then(flatten)
  .then(log)
  .catch(err => {
    console.log('Err:', err);
  });
