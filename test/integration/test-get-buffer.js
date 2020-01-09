var common = require('../common');
var assert = common.assert;

var FormData = require(common.dir.lib + '/form_data');

(function testTypeIsBuffer() {
  var form = new FormData();
  form.append( 'String', 'Some random string' );
  var buffer = form.getBuffer();

  assert.equal(typeof buffer === 'object' && Buffer.isBuffer(buffer), true);
})();

(function testBufferIsValid() {
  var form = new FormData();

  var stringName = 'String',
    stringValue = 'This is a random string',
    intName = 'Int',
    intValue = 1549873167987,
    bufferName = 'Buffer',
    bufferValue = Buffer.from([0x00,0x4a,0x45,0x46,0x46,0x52,0x45,0x59,0x255]),
    emptyFileName = 'EmptyFile',
    asciiFileName = 'AsciiFile',
    nonAsciiFileName = 'NonAsciiFile',
    asciiFile = 'file.jpg',
    nonAsciiFile = 'フェニックス.jpg';

  // Fill the formData object
  form.append( stringName, stringValue );
  form.append( intName, intValue );
  form.append( bufferName, bufferValue );

  // @note using `null` here because Stream returned by fs.createReadStream does not work with `getBuffer()`
  form.append( asciiFileName, null, { filename: asciiFile });
  form.append( nonAsciiFileName, null, { filename: nonAsciiFile });

  form.append( emptyFileName, null, { filename: '' } );

  // Get the resulting Buffer
  var buffer = form.getBuffer();

  // Generate expected code.
  var boundary = form.getBoundary();
  var expected = Buffer.concat( [
    Buffer.from( '--' + boundary + FormData.LINE_BREAK +
  'Content-Disposition: form-data; name="' + stringName + '"' + FormData.LINE_BREAK +
      FormData.LINE_BREAK +
      stringValue + FormData.LINE_BREAK +
      '--' + boundary + FormData.LINE_BREAK +
  'Content-Disposition: form-data; name="' + intName + '"' + FormData.LINE_BREAK +
      FormData.LINE_BREAK +
      intValue + FormData.LINE_BREAK +
      '--' + boundary + FormData.LINE_BREAK +
  'Content-Disposition: form-data; name="' + bufferName + '"' + FormData.LINE_BREAK +
  'Content-Type: application/octet-stream' + FormData.LINE_BREAK + FormData.LINE_BREAK),
    bufferValue,
    Buffer.from( FormData.LINE_BREAK + '--' + boundary + FormData.LINE_BREAK +
  'Content-Disposition: form-data; name="' + asciiFileName + '"; filename="' + asciiFile + '"' + FormData.LINE_BREAK +
  'Content-Type: image/jpeg' + FormData.LINE_BREAK + FormData.LINE_BREAK),
    Buffer.from( FormData.LINE_BREAK + '--' + boundary + FormData.LINE_BREAK +
  'Content-Disposition: form-data; name="' + nonAsciiFileName +
      '"; filename="' + nonAsciiFile +
      '"; filename*="' + 'UTF-8\'\'%E3%83%95%E3%82%A7%E3%83%8B%E3%83%83%E3%82%AF%E3%82%B9.jpg"' +
      FormData.LINE_BREAK +
  'Content-Type: image/jpeg' + FormData.LINE_BREAK + FormData.LINE_BREAK),
    Buffer.from( FormData.LINE_BREAK + '--' + boundary + FormData.LINE_BREAK +
  'Content-Disposition: form-data; name="' + emptyFileName + '"; filename=""' + FormData.LINE_BREAK +
    FormData.LINE_BREAK +
    FormData.LINE_BREAK + '--' + boundary + '--' + FormData.LINE_BREAK )
  ] );

  // Test if the buffer content, equals the expected buffer.
  assert.equal(buffer.length, expected.length);
  assert.equal(buffer.toString('hex'), expected.toString('hex'));
})();
