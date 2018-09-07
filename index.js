
// -    "cssnano": "^3.10.0",
// +    "cssnano": "^4.1.0",
// -    "postcss": "^5.2.15",
// +    "postcss": "^7.0.2",
// -    "postcss-cli": "^2.6.0",
// -    "postcss-cssnext": "^2.9.0",
// -    "postcss-import": "^9.1.0",
// -    "postcss-reporter": "^3.0.0",
// -    "postcss-url": "^5.1.2"
// +    "postcss-cli": "^6.0.0",
// +    "postcss-cssnext": "^3.1.0",
// +    "postcss-import": "^12.0.0",
// +    "postcss-reporter": "^6.0.0",
// +    "postcss-url": "^8.0.0"

var fs = require('fs')
  , path = require('path')
  , join = path.join
;

module.exports = function (options, cb) {
  var args = [];
  npmPath({ cwd: __dirname }, function (err) {
    if (err) return cb(err);
    if (options.input) args.push(options.input);
    if (options.watch) args.push('--watch');
    args.push('--config');
    args.push((process.env.NODE_ENV === 'production') ? prodConfig : devConfig);
    if (options.output) {
      args.push('--output');
      args.push(options.output);
    }
    console.log('postcss', args);
    var child = spawn('postcss', args, { stdio:  ['inherit', 'inherit', 'pipe'] })
      , end = once(cb)
      , error = null
    ;
    child.stderr.on('data', function (data) {
      if (!error) error = '';
      error += data;
    });
    child.on('error', end);
    child.on('exit', function () { end(error); });
  });
};

module.exports.development = dev;
module.exports.production = prod;
module.exports.configuration = (process.env.NODE_ENV === 'production') ? prod : dev;
