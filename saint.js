const authorPageBase = `http://www.thesaint-online.com/author/rachael-miller`;


/**
 * Parse the HTML for a single author page and retrieve the author page links
 */
const parseAuthorPageLinks = ($) => {
  const lastLink = $('.page-nav a.last');
  const numPages = parseInt($(lastLink).attr('title'));
  
  return Array.from(Array(numPages)).map((p, i) => `${authorPageBase}/page/${i+1}`);
};


/**
 * Parse the HTML for a single author page and retrieve the article links
 */
const parseArticleLinks = (url, $) => {
  const articleUrls = [];

  const links = $('.td-main-content-wrap h3.entry-title a');
  links.each((i, l) => {
    const link = $(l);
    articleUrls.push(link.attr('href'));
  });

  return articleUrls;
};


/**
 * Parse the HTML for a single article page and retrieve the article content
 */
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


module.exports = {
  authorPageBase,
  parseAuthorPageLinks,
  parseArticleLinks,
  parseArticleContent,
};
