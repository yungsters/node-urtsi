var Promise = require('promise');
var SerialPort = require('serialport').SerialPort;

var invariant = require('./invariant');
var stringPad = require('./stringPad');

class URTSI {
  constructor(serialPath) {
    var address = 1; // Address for RS-232 is always 01.
    var execute = (channelID, direction) => getSerialPort(serialPath).then(
      serialPort => new Promise((resolve, reject) => {
        serialPort.write(
          stringPad('' + address, 2) + stringPad('' + channelID, 2) + direction,
          error => error ? reject(error) : resolve()
        );
      })
    );

    // URTSI II cannot handle subsequent `stop` commands within ~600ms.
    var prevStop = Promise.resolve();

    this._channels = Array(...Array(16)).map((_, ii) => {
      var channelID = ii + 1;
      return {
        up() {
          return execute(channelID, 'U');
        },
        down() {
          return execute(channelID, 'D');
        },
        stop() {
          var result = prevStop.then(() => execute(channelID, 'S'));
          prevStop = prevStop.then(() => new Promise(resolve => {
            setTimeout(resolve, 600);
          }));
          return result;
        }
      };
    });
  }

  getChannel(channelID) {
    var ii = channelID - 1;
    invariant(
      this._channels.hasOwnProperty(ii),
      'Invalid channel ID: ' + channelID
    );
    return this._channels[ii];
  }

  getChannels(...channelIDs) {
    if (channelIDs.length) {
      return channelIDs.map(channelID => this.getChannel(channelID));
    } else {
      return this._channels.slice(0);
    }
  }

  getChannelGroup(...channelIDs) {
    var channels = this.getChannels(...channelIDs);
    return {
      up() {
        return Promise.all(channels.map(channel => channel.up()));
      },
      down() {
        return Promise.all(channels.map(channel => channel.down()));
      },
      stop() {
        return Promise.all(channels.map(channel => channel.stop()));
      }
    };
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
