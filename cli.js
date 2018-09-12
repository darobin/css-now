#!/usr/bin/env node

let cssnow = require('.')
  , commander = require('commander')
;

commander
  .version(require('./package.json').version)
  .option('-w, --watch', 'Watch mode')
  .arguments('<input> <output>')
  .action((input, output, options) => {
    cssnow(
      {
        watch:    options.watch,
        execDir:  __dirname,
        input,
        output,
      },
      (err) => {
        if (err) {
          console.error(err);
          process.exit(42);
        }
        process.exit(0);
      }
    );
  })
  .parse(process.argv)
;
