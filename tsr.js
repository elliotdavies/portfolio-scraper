const authorPageBase = `http://thestudentreview.co.uk/author/elliot-davies`;


/**
 * Parse the HTML for a single author page and retrieve the author page links
 */
const parseAuthorPageLinks = ($) => {
  const numPages = $('.pagination li').length;
  
  return Array.from(Array(numPages)).map((p, i) => `${authorPageBase}/page/${i+1}`);
};


/**
 * Parse the HTML for a single author page and retrieve the article links
 */
const parseArticleLinks = (url, $) => {
  const articleUrls = [];

  const links = $('.content .article article header .title a');
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
  const headline = $('header .title').text();
  
  // Bylines (may be multiple)
  const bylines = []
  $('header .post-info .theauthor a').each((i, a) => bylines.push($(a).text()));
  
  // Publish date
  const date = $('header .post-info .thetime').text();

  // Categories / sections
  const categories = [];
  $('header .post-info .thecategory a').each((i, a) => categories.push($(a).text()));

  // Featured image (normally present), and possibly other images from article body
  const images = [];
  $('.post-single-content a img').each((i, img) => images.push($(img).attr('src')));

  // Article body as HTML
  let copy = '';
  $('.post-single-content')
    .children()
    .not('script')
    .not('div.yarpp-related')
    .each((i, e) => copy += $(e).html())

  // Tags
  const tags =
    $('div.post').attr('class')
      .split(' ')
      .filter(c => c.includes('tag-'))
      .map(c => c.replace('tag-', ''));

  // Comments (author name and text)
  const comments = [];
  $('#comments li.comment').each((i, c) => {
    const author = $(c).find('.comment-metadata .fn').text();
    const content = $(c).find('.commentmetadata').html();
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
