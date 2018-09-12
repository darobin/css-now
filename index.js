
let { watch, readFile, writeFile } = require('fs')
  , postcss = require('postcss')
  , atImport = require('postcss-import')
  , url = require('postcss-url')
  , presetEnv = require('postcss-preset-env')
  , browserReporter = require('postcss-browser-reporter')
  , reporter = require('postcss-reporter')
  , nano = require('cssnano')
;

module.exports = function ({ watch: mustWatch = false, input, output } = {}, cb) {
  if (!input) return process.nextTick(() => cb(new Error('cssn needs an input parameter')));
  if (mustWatch) {
    let watcher = watch(input, { persistent: true }, (evt) => {
      if (evt === 'rename') {
        console.error(`cssn saw a 'rename' event for ${input}, needs restarting.`);
        watcher.close();
      }
      else cssnow(input, output, cb);
    });
  }
  cssnow(input, output, cb);
};

function cssnow (input, output, cb) {
  readFile(input, 'utf8', (err, data) => {
    if (err) return process.nextTick(() => cb(err));
    let steps = [
      atImport(),
      url(),
      presetEnv(),
    ];
    if (process.env.NODE_ENV === 'production') {
      steps.push(nano({ preset: 'default' }));
    }
    else {
      steps.push(browserReporter());
      steps.push(reporter());
    }
    postcss(steps)
      .process(data, { from: input, to: output })
      .then(({ css }) => {
        if (output) {
          writeFile(output, css, (err) => {
            if (err) return process.nextTick(() => cb(err));
            process.nextTick(() => cb(null, css));
          });
        }
        else process.nextTick(() => cb(null, css));
      })
      .catch((err) => process.nextTick(() => cb(err)))
    ;
  });
}
