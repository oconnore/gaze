'use strict';

var gaze = require('../index.js');
var path = require('path');
var fs = require('fs');

// Clean up helper to call in setUp and tearDown
function cleanUp(done) {
  [
    'safewrite.js'
  ].forEach(function(d) {
    var p = path.resolve(__dirname, 'fixtures', d);
    if (fs.existsSync(p)) { fs.unlinkSync(p); }
  });
  done();
}

exports.safewrite = {
  setUp: function(done) {
    process.chdir(path.resolve(__dirname, 'fixtures'));
    cleanUp(done);
  },
  tearDown: cleanUp,
  safewrite: function(test) {
    test.expect(2);

    var file = path.resolve(__dirname, 'fixtures', 'safewrite.js');
    var backup = path.resolve(__dirname, 'fixtures', 'safewrite.ext~');
    fs.writeFileSync(file, 'var safe = true;');

    function simSafewrite() {
      fs.writeFileSync(backup, fs.readFileSync(file));
      fs.unlinkSync(file);
      fs.renameSync(backup, file);
    }

    gaze('**/*', function(err, watcher) {
      this.on('end', test.done);
      this.on('all', function(action, filepath) {
        test.equal(action, 'changed');
        test.equal(path.basename(filepath), 'safewrite.js');
        watcher.close();
      });
      simSafewrite();
    });
  }
};

// :'| Ignoring these tests on linux for now
if (process.platform === 'linux') {
  exports.safewrite = {};
}
