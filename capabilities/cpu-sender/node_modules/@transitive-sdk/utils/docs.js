/* A script that uses the documentation.js npm package to generate Markdown
documentation from jsdoc comments in the code. */

import { build, formats } from 'documentation';
import fs from 'fs';

const postProcessLine = (line) => line
    // Reduce heading level of Parameters to avoid it showing up in docusaurus
    // table of content
    .replace('### Parameters', '#### Parameters');

// build(process.argv.slice(2), {
//   sortOrder: ['kind', 'alpha'],
//   inferPrivate: '^_'
//   shallow: true,
// }).then(formats.md)
//   .then(output => {
//     // post-process
//     const processed = output.split('\n').map(postProcessLine).join('\n');

//     let header = '';
//     try {
//       header = fs.readFileSync('./docs_header.md', {encoding: 'utf-8'});
//     } catch (e) {
//       console.log('No docs_header.md found, proceeding without');
//     }

//     fs.mkdirSync('docs', {recursive: true});
//     fs.writeFileSync('./docs/index.md', header + processed);
//   });


process.argv.slice(2).forEach(folder => {
  build(folder, {
    sortOrder: ['kind', 'alpha'],
    inferPrivate: '^_',
    shallow: true,
  }).then(formats.md)
    .then(output => {
      // post-process
      const processed = output.split('\n').map(postProcessLine).join('\n');

      let header = '';
      try {
        header = fs.readFileSync(`./${folder}/docs_header.md`, {encoding: 'utf-8'});
      } catch (e) {
        console.log('No docs_header.md found, proceeding without');
      }

      fs.mkdirSync('docs', {recursive: true});
      fs.writeFileSync(`./docs/${folder.replace(/\//g, '')}.md`, header + processed);
    });
});