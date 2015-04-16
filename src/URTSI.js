var Promise = require('promise');
var SerialPort = require('serialport').SerialPort;

var invariant = require('invariant');
var stringPad = require('stringPad');

class URTSI {
  constructor(serialPath, address = 1) {
    invariant(address > 0 && address < 100, 'Invalid address: ' + address);
    this._address = address;
    this._path = serialPath;
    this._serialPort = null;
  }
  getChannel(channel) {
    return new URTSIChannel(this, channel);
  }
  execute(channel, direction) {
    this._serialPort = this._serialPort || new Promise((resolve, reject) => {
      var serialPort = new SerialPort(this._path, {
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });
      serialPort.on('open', () => resolve(serialPort));
      serialPort.on('error', reject);
    });
    return this._getSerialPort().then(
      serialPort => new Promise((resolve, reject) => {
        var command =
          stringPad(this._address, 2) +
          stringPad(channel, 2) +
          direction;

        serialPort.write(command, error => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      })
    );
  }
}

class URTSIChannel {
  constructor(urtsi, channel) {
    invariant(channel > 0 && channel < 17, 'Invalid motor channel: ' + channel);
    this._urtsi = urtsi;
    this._channel = channel;
  }
  up() {
    this._urtsi.execute(this._channel, 'U');
  }
  down() {
    this._urtsi.execute(this._channel, 'D');
  }
  stop() {
    this._urtsi.execute(this._channel, 'S');
  }
}

module.exports = URTSI;
