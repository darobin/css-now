
let cssnow = require('..')
  , join = require('path').join
  , assert = require('assert')
  , simpleCSS = join(__dirname, 'fixtures/simple.css')
  , brokenCSS = join(__dirname, 'fixtures/broken.css')
;

function run (src, cb) {
  cssnow({ input: src }, cb);
}

describe('API', function () {
  this.timeout(10 * 1000);
  it('reports errors', (done) => {
    run(brokenCSS, (err, out) => {
      assert(err, 'there must be an error');
      assert(!out, 'there must be no result');
      done();
    });
  });
  it('does not minify in development', (done) => {
    process.env.NODE_ENV = 'development';
    run(simpleCSS, (err, out) => {
      assert.ifError(err);
      assert(out.match(/(\n)/g).length > 7, 'plenty of newlines left');
      done();
    });
  });
  it('minifies in production', (done) => {
    process.env.NODE_ENV = 'production';
    run(simpleCSS, (err, out) => {
      assert.ifError(err);
      assert.equal(out.match(/(\n)/g), null, 'minification worked');
      done();
    });
  });
  it('remains safe even under minification', (done) => {
    process.env.NODE_ENV = 'production';
    run(simpleCSS, (err, out) => {
      assert.ifError(err);
      assert(out.match(/80/), 'z-index wasn\'t killed');
      done();
    });
  });
});
