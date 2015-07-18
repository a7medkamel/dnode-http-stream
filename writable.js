var through2      = require('through2')
  , node_uuid     = require('node-uuid')
  , _             = require('underscore')
  , STATUS_CODES  = require('http').STATUS_CODES
  ;

function ctor (remote, uuid) {
  if (!uuid) {
    uuid = node_uuid.v4();
  }

  function transform(chunk, encoding, cb) {
    var buf = Buffer.isBuffer(chunk)? chunk : new Buffer(chunk, encoding);

    remote.write(uuid, buf.toString('base64'));

    cb(null, chunk);
  }

  function end(cb) {
    remote.write(uuid);
    cb();
  }

  var ret = through2(transform, end);

  ret.toJSON = function(mixin) {
    return _.extend({ uuid : uuid }, mixin);
  };

  ret.writeHead = function(statusCode, reason, headers) {
    if (arguments.length == 2 && typeof arguments[1] !== 'string') {
      headers = reason;
      reason = undefined;
    }

    var status = 'HTTP/ ' + statusCode + ' ' + (reason || STATUS_CODES[statusCode] || 'unknown') + '\r\n';

    this.write(status);

    if (headers) {
      for (var name in headers) {
        this.write(name + ': ' + headers[name] + '\r\n');
      }
    }

    this.write('\r\n');
  };

  return ret;
}

module.exports = ctor;