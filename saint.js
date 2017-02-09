const fetch = require('node-fetch');
const cheerio = require('cheerio');

const authorPageBase = `http://thesaint-online.com/author/elliot-davies`;


// Parse the HTML for a single author page and retrieve the author page links
const getAuthorPageLinks = ($) => {
  const lastLink = $('.page-nav a.last');
  const numPages = parseInt($(lastLink).attr('title'));
  
  return Array.from(Array(numPages)).map((p, i) => `${authorPageBase}/page/${i+1}`);
};


// Fetch many URLs
const fetchAllAsText = urls =>
  Promise
    .all(urls.map(url => fetch(url)))
    .then(results => Promise.all(results.map(r => r.text())));


// Parse the HTML for a single author page and retrieve the article links
const parseArticleLinks = ($) => {
  const articleUrls = [];

  const links = $('.td-main-content-wrap h3.entry-title a');
  links.each((i, l) => {
    const link = $(l);
    articleUrls.push(link.attr('href'));
  });

  return articleUrls;
};


// Given an array of res.text()s for author pages, parse them all for article links
const parseArticleLinksFromTexts = texts => texts.map(t => parseArticleLinks(cheerio.load(t)));


// Parse the HTML for a single article page and retrieve the article content
const parseArticleContent = ($) => {
  const articleContent = {
    headline: '',
    byline: '',
    date: '',
    section: '',
    images: [],
    url: '',
    copy: [],
    tags: [],
    likes: 0,
    shares: 0,
    comments: []
  };

  // DOM parsing here

  return articleContent;
};


// Given an array of res.text()s for article pages, parse them all for the article content
const parseArticleContentFromTexts = texts => texts.map(t => parseArticleContent(cheerio.load(t)));


// Flatten nested arrays
const flatten = arrs => [].concat(...arrs);


// Helper function
const log = x => {
  console.log(x);
  return x;
};


fetch(authorPageBase)
  .then(res => res.text())
  .then(text => cheerio.load(text))
  .then(getAuthorPageLinks)
  .then(fetchAllAsText)
  .then(parseArticleLinksFromTexts)
  .then(flatten)
  .then(fetchAllAsText)
  .then(parseArticleContentFromTexts)
  .then(log)
  .catch(err => {
    console.log('Err:', err);
  });
