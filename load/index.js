/**
 * AWS Module: Action: Modularized Code
 */
var url = require('url');
var http = require('http');

// Export For Lambda Handler
module.exports.run = function(event, context, cb) {

  if (!event.url) {
    return cb(null, {
      error: 'Invalid URL.'
    });
  }

  var parsed = url.parse(unescape(event.url));
  var client = http.createClient(80, parsed.hostname);
  var request = client.request('GET', parsed.pathname, {
    host: parsed.hostname
  });

  request.on('response', function(response) {

    if (response.statusCode !== 200) {
      return cb(null, {
        error: response.statusCode
      });
    }

    var chunks = [];

    response.setEncoding('binary');
    response.on('data', chunks.push.bind(chunks));
    response.on('end', function() {

      var body = chunks.join('');
      var base64 = new Buffer(body, 'binary').toString('base64');
      var prefix = 'data:' + response.headers['content-type'] + ';base64,';
      var data = prefix + base64;
      
      return cb(null, {
        image: data
      });

    });

  });

  request.end();

};
