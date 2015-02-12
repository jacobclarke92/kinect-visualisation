var Stream = require('stream').Stream;
var util = require('util');

exports.BufferedNetstringStream = BufferedNetstringStream;

function BufferedNetstringStream() {
  this.readable = true;
  this.writable = true;
  this.length = null;
  this.buffer = null;
  this.offset = 0;
}

util.inherits(BufferedNetstringStream, Stream);

function readLength(buffer, offset) {
  var char = buffer[offset], value;
  if (char >= 48 && char <= 57) {
    value = char - 48;
    if (this.length == null) {
      this.length = value;
      return false;
    } else {
      this.length = (this.length * 10) + value;
      return false;
    }
  } else if (char == 58) {
    this.length += 1;
    return true;
  } else {
    throw Error('malformed payload length header');
  }
}

function readData(buffer, offset) {
  var size = Math.min(buffer.length - offset, this.length - this.offset);
  buffer.copy(this.buffer, this.offset, offset, offset + size);
  return size;
}

BufferedNetstringStream.prototype.write = function(data) {
  var offset = 0;
  while (offset < data.length) {
    if (this.buffer == null) {
      try {
        if (readLength.call(this, data, offset)) {
          this.buffer = new Buffer(this.length);
        }
        offset += 1;
      } catch (error) {
        this.emit('error', error);
        return this.destroy();
      }
    } else {
      var size = readData.call(this, data, offset);
      offset += size, this.offset += size;
      if (this.length == this.offset) {
        if (this.buffer[this.length - 1] != 44) {
          this.emit('error', Error('payload length mismatch'));
          return this.destroy();
        }
        this.emit('data', this.buffer.slice(0, this.length - 1));
        this.buffer = null;
        this.length = null;
        this.offset = 0;
      }
    }
  }
}

BufferedNetstringStream.prototype.end = function() {
  if (this.length != null || this.buffer != null) {
    this.emit('error', Error('unexpected end of stream'));
    return this.destroy();
  }
  this.emit('end');
}

BufferedNetstringStream.prototype.destroy = function() {
  this.emit('close');
}
