# node-urtsi

A JavaScript interface for the Somfy Universal RTS Interface (URTSI).

This package was tested using the following:

- Raspberry Pi (with Raspbian)
- USB-to-DB9 Serial Adapter
- DB9-to-RJ45 Adapter (with Cat 6)
- Somfy URTSI II

## Example

The `URTSI` class is instantiated with a path to the serial port (e.g. `/dev/ttyUSB0` or `/dev/ttyAMA0`).

The `URTSI` class a few methods that return one or a group of the 16 channels.

Each channel or group of channels has the `up()`, `down()`, and `stop()` methods.

```js
var urtsi = new URTSI('/dev/ttyUSB0');

// Open shades on the first channel.
var channel = urtsi.getChannel(1);
channel.up();

// Get an array of all 16 channels.
var channels = urtsi.getChannels();

// Close shades on the even channels.
var evenChannels = urtsi.getChannels(2, 4, 6, 8, 10, 12, 14, 16);
evenChannels.map(channel => channel.down());

// Stop (or go to favorite position for) a group of channels.
var channelGroup = urtsi.getChannelGroup(1, 2, 3);
channelGroup.stop();
```

Each command returns a promise:

```js
urtsi.getChannelGroup().stop().done(() => {
  console.log('All shades are going to their favorite positions!');
});
```
