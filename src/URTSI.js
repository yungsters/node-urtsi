var Promise = require('promise');
var SerialPort = require('serialport').SerialPort;

var invariant = require('./invariant');
var stringPad = require('./stringPad');

class URTSI {
  constructor(serialPath) {
    var address = 1; // Address for RS-232 is always 01.
    var execute = (channel, direction) => getSerialPort(serialPath).then(
      serialPort => new Promise((resolve, reject) => {
        serialPort.write(
          stringPad('' + address, 2) + stringPad('' + channel, 2) + direction,
          error => error ? reject(error) : resolve()
        );
      })
    );

    // URTSI II cannot handle subsequent `stop` commands within ~600ms.
    var prevStop = Promise.resolve();

    this._channels = Array(...Array(16)).map((_, ii) => {
      var channel = ii + 1;
      return {
        up() {
          return execute(channel, 'U');
        },
        down() {
          return execute(channel, 'D');
        },
        stop() {
          var result = prevStop.then(() => execute(channel, 'S'));
          prevStop = prevStop.then(() => new Promise(resolve => {
            setTimeout(resolve, 600);
          }));
          return result;
        }
      };
    });
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
