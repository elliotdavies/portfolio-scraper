const authorPageBase = `http://www.independent.co.uk/author/elliot-davies`;


/**
 * Parse the HTML for a single author page and retrieve the author page links
 */
const parseAuthorPageLinks = ($) => {
  return [authorPageBase];
};


/**
 * Parse the HTML for a single author page and retrieve the article links
 */
const parseArticleLinks = (url, $) => {
  const articleUrls = [];

  const links = $('.content article .content a');
  links.each((i, l) => {
    const link = $(l);
    articleUrls.push('http://independent.co.uk' + link.attr('href'));
  });

  return articleUrls;
};


/**
 * Parse the HTML for a single article page and retrieve the article content
 */
const parseArticleContent = (url, $) => {

  // Headline
  const headline = $('article.full-article header h1').text();
  
  // Bylines (may be multiple)
  const bylines = []
  $('article.full-article header ul.meta li.author a').each((i, a) => bylines.push($(a).text()));
  
  // Publish date
  const date = $($('article.full-article header ul.meta li')[2]).attr('title');

  // Categories / sections
  const categories = [];
  $('article.full-article header ol.breadcrumbs li span').each((i, s) => categories.push($(s).text()));

  // Featured image (normally present), and possibly other images from article body
  const images = [];
  const featuredImage = $('article.full-article figure.featured-media img').attr('src');
  const bodyImages = $('article.full-article div.main-content-column div.image img').attr('src');
  if (featuredImage) images.push(featuredImage);
  if (bodyImages) images.push(bodyImages);

  // // Article body as HTML
  let copy = '';
  $('article.full-article div.main-content-column div.text-wrapper')
    .children()
    .not('div#gigya-share-btns-2')
    .not('a.syndication-btn')
    .each((i, e) => copy += $(e).html());

  return {
    headline,
    bylines,
    date,
    categories,
    images,
    url,
    copy,
  };
};


module.exports = {
  authorPageBase,
  parseAuthorPageLinks,
  parseArticleLinks,
  parseArticleContent,
};
