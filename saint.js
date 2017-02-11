const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

// const authorPageBase = `http://thesaint-online.com/author/elliot-davies`;
const authorPageBase = `http://www.thesaint-online.com/author/laura-abernethy`;


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

    // For each URL, return a promise containing the URL and body text
    .then(results => {

      const textPromises = results.map(result =>
        result
          .text()
          .then(text => ({ url: result.url, text }))
      );

      return Promise.all(textPromises);
    });


// Parse the HTML for a single author page and retrieve the article links
const parseArticleLinks = (url, $) => {
  const articleUrls = [];

  const links = $('.td-main-content-wrap h3.entry-title a');
  links.each((i, l) => {
    const link = $(l);
    articleUrls.push(link.attr('href'));
  });

  return articleUrls;
};


// Given an array of res.text()s for author pages, parse them all for article links
const parseArticleLinksFromTexts = texts => texts.map(({text, url}) => parseArticleLinks(url, cheerio.load(text)));


// Parse the HTML for a single article page and retrieve the article content
const parseArticleContent = (url, $) => {

  // Headline
  const headline = $('header.td-post-title h1.entry-title').text();
  
  // Bylines (may be multiple)
  const bylines = []
  $('.td-post-author-name a').each((i, a) => bylines.push($(a).text()));
  
  // Publish date
  const date = $('header.td-post-title .td-post-date time').text();

  // Categories / sections
  const categories = [];
  $('ul.td-category li a').each((i, a) => categories.push($(a).text()));

  // Featured image (normally present), and possibly other images from article body
  const images = [];
  const featuredImage = $('.td-post-featured-image img').attr('src');
  const bodyImages = $('.td-post-content img').attr('src');
  if (featuredImage) images.push(featuredImage);
  if (bodyImages) images.push(bodyImages);

  // Article URL
  // const url = $('link[rel="canonical"]').attr('href');

  // Article body as HTML
  const copy = $('.td-post-content').html();

  // Tags
  const tags = [];
  $('ul.td-tags li a').each((i, a) => tags.push($(a).text()));

  // Comments (author name and text)
  const comments = [];
  $('li.comment article').each((i, c) => {
    const author = $(c).find('footer cite').text();
    const content = $(c).find('.comment-content').html();
    comments.push({ author, content });
  });

  return {
    headline,
    bylines,
    date,
    categories,
    images,
    url,
    copy,
    tags,
    comments,
  };
};


// Given an array of res.text()s for article pages, parse them all for the article content
const parseArticleContentFromTexts = texts => texts.map(({text, url}) => parseArticleContent(url, cheerio.load(text)));


// Flatten nested arrays
const flatten = arrs => [].concat(...arrs);


// Write to JSON files
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


// Return URLs only for pages that didn't parse
const filterFailures = articles =>
  articles
    .filter(a => a.headline === '')
    .map(a => a.url);


// Helper
const log = x => {
  console.log(x);
  return x;
};


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


// Fetch and parse article URLs, and retry failures
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


// First fetch the initial author page and parse it
fetch(authorPageBase)
  .then(res => res.text())
  .then(text => cheerio.load(text))
  // Fetch every author page (because of pagination)
  .then(getAuthorPageLinks)
  .then(fetchAllAsText)
  // Get links to all the article pages
  .then(parseArticleLinksFromTexts)
  .then(flatten)
  // Fetch and parse the articles
  .then(fetchArticlesRecursively)
  .catch(err => {
    console.log('Err:', err);
  });
