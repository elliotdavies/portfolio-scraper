const fs = require('fs');

const srcDir = `./elliot`;
const outDir = `./elliot-txt`;


/**
 * Convert a JSON comment to a formatted string
 */
const commentToStr = comment =>
`Author: ${comment.author}
Text (as HTML): ${comment.content}

`;


/**
 * Convert article JSON to a formatted string
 */
const convertToStr = json => {

  const str =

`Headline
--------
${json.headline}

Byline(s)
---------
${json.bylines.join(', ')}

Date
----
${json.date}

Categories
----------
${json.categories.join(', ')}

URL
---
${json.url}

Copy (as HTML)
--------------
${json.copy}

Images
------
${json.images.join(', ')}

Tags
----
${json.tags.join(', ')}

Comments (${json.comments.length}):
-------------

${json.comments.map(commentToStr).join('')}
`;

  return str;
};


/**
 * Map a directory of JSON files to a directory of formatted text files
 */
fs.readdir(srcDir, (err, fileNames) => {
  if (err) {
    console.log(err);
    return;
  }

  const files = fileNames.map(f => f.replace('.json', ''));

  files.forEach(f => {
    fs.readFile(`${srcDir}/${f}.json`, (err, contents) => {

      if (err) {
        console.log(err);
        return;
      }

      const str = convertToStr(JSON.parse(contents));

      fs.writeFile(`${outDir}/${f}.txt`, str, err => {
        if (err) console.log('Err writing file:', err);
      })

    })
  })
})
