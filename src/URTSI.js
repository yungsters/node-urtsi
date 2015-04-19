var Promise = require('promise');
var SerialPort = require('serialport').SerialPort;

var invariant = require('./invariant');
var stringPad = require('./stringPad');

class URTSI {
  constructor(serialPath, address = 1) {
    invariant(address > 0 && address < 100, 'Invalid address: ' + address);

    var execute = (channel, direction) => getSerialPort(serialPath).then(
      serialPort => new Promise((resolve, reject) => {
        serialPort.write(
          stringPad('' + address, 2) + stringPad('' + channel, 2) + direction,
          error => error ? reject(error) : resolve()
        );
      })
    );

    this._channels = [];
    for (var ii = 1; ii <= 16; ii++) {
      this._channels.push({
        down: execute.bind(null, ii, 'D'),
        stop: execute.bind(null, ii, 'S'),
        up:   execute.bind(null, ii, 'U'),
      });
    }
  }

  getChannels() {
    return this._channels;
  }
}

var getSerialPort = (serialPorts => function(serialPath) {
  if (!serialPorts.hasOwnProperty(serialPath)) {
    serialPorts[serialPath] = new Promise((resolve, reject) => {
      var serialPort = new SerialPort(serialPath, {
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });
      serialPort.on('open', () => resolve(serialPort));
      serialPort.on('error', reject);
    });
  }
  return serialPorts[serialPath];
})({});

module.exports = URTSI;
