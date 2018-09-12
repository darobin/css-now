
let { watch, readFile, writeFile } = require('fs')
  , postcss = require('postcss')
  , atImport = require('postcss-import')
  , url = require('postcss-url')
  , presetEnv = require('postcss-preset-env')
  , browserReporter = require('postcss-browser-reporter')
  , reporter = require('postcss-reporter')
  , nano = require('cssnano-preset-default')
;

module.exports = function ({ watch: mustWatch = false, input, output } = {}, cb) {
  if (!input) return cb(new Error('css-now needs an input parameter'));
  if (mustWatch) {
    let watcher = watch(input, { persistent: true }, (evt) => {
      if (evt === 'rename') {
        console.error(`css-now saw a 'rename' event for ${input}, needs restarting.`);
        watcher.close();
      }
      else cssnow(input, output, cb);
    });
  }
  cssnow(input, output, cb);
};

function cssnow (input, output, cb) {
  readFile(input, 'utf8', (err, data) => {
    if (err) return cb(err);
    let steps = [
      atImport(),
      url(),
      presetEnv(),
    ];
    if (process.env.NODE_ENV === 'production') {
      steps.push(browserReporter());
      steps.push(reporter());
    }
    else {
      steps.push(nano());
    }
    postcss(steps)
      .process(data)
      .then(({ css }) => {
        if (output) {
          writeFile(output, css, (err) => {
            if (err) return cb(err);
            cb(null, css);
          });
        }
        else cb(null, css);
      })
      .catch(cb)
    ;
  });
}
