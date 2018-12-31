
let { readFile, writeFile } = require('fs')
  , { join } = require('path')
  , chokidar = require('chokidar')
  , postcss = require('postcss')
  , atImport = require('postcss-import')
  , url = require('postcss-url')
  , presetEnv = require('postcss-preset-env')
  , browserReporter = require('postcss-browser-reporter')
  , reporter = require('postcss-reporter')
  , nano = require('cssnano')
  , uniq = require('uniq')
;

module.exports = function ({ watch: mustWatch = false, input, output } = {}, cb) {
  if (!input) return process.nextTick(() => cb(new Error('cssn needs an input parameter')));
  if (mustWatch) {
    let watcher = chokidar.watch(input, { persistent: true });
    watcher.on('change', () => {
      cssnow(input, output, cb, { watcher });
    });
    watcher.on('unlink', () => {
      cb(new Error(`cssn saw an 'unlink' event for ${input}, needs restarting.`));
      watcher.close();
    });
    watcher.on('error', cb);
    return cssnow(input, output, cb, { watcher });
  }
  cssnow(input, output, cb);
};

function cssnow (input, output, cb, { watcher } = {}) {
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
      .then(({ css, messages = [] }) => {
        if (watcher) {
          let depMsg = messages.filter(m => m.type === 'dependency')
            , parents = depMsg.map(m => m.parent)
            , deps = depMsg.map(m => m.file)
            , watched = watcher.getWatched()
            , watching = {}
          ;
          deps = deps.concat(parents);
          uniq(deps);
          Object.keys(watched).forEach(k => {
            watched[k].forEach(f => {
              watching[join(k, f)] = true;
            });
          });
          let add = deps.filter(f => !watching[f])
            , del = Object.keys(watching).filter(f => !deps.find(d => d === f))
          ;
          if (add && add.length) watcher.add(add);
          if (del && del.length) watcher.unwatch(del);
        }
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
