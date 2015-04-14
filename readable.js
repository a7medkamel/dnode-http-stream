var uuid      = require('node-uuid')
  , _         = require('underscore')
  , Readable  = require('stream').Readable
  ;

var lookup = {};

function write(uuid, base64) {
  var stream = lookup[uuid];

  var buf = base64? new Buffer(base64, 'base64') : null;
  if (stream) {
    stream.push(buf);

    if (_.isNull(buf)) {
      delete lookup[uuid];
    }
  } else {
    console.log('unable to find stream', uuid, buf? buf.toString('utf-8') : null);
  }
};

function ctor(id) {
  var ret = new Readable;

  ret._read = function noop() {};
  ret.uuid = id || uuid.v4();

  lookup[ret.uuid] = ret;

  ret.toJSON = function(mixin) { return _.extend({ uuid : ret.uuid }, mixin); };

  ret
    .on('error', function(err){
      console.error('error dnode-stream.readable', err);
    })
    .on('end', function(){
      delete lookup[ret.uuid];
    })
    ;

  return ret;
}

ctor.write = write;

module.exports = ctor;