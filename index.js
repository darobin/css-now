
let { readFile, writeFile } = require('fs')
  , chokidar = require('chokidar')
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
    let watcher = chokidar.watch(input, { persistent: true });
    watcher.on('change', () => {
      cssnow(input, output, cb);
    });
    watcher.on('unlink', () => {
      cb(new Error(`cssn saw an 'unlin' event for ${input}, needs restarting.`));
      watcher.close();
    });
    watcher.on('error', cb);
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
