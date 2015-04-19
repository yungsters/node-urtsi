# node-urtsi

A JavaScript interface for the Somfy Universal RTS Interface (URTSI).

This package was tested using the following:

- Raspberry Pi (with Raspbian)
- USB-to-DB9 Serial Adapter
- DB9-to-RJ45 Adapter (with Cat 6)
- Somfy URTSI II

## Example

The `URTSI` class is instantiated with a path to the serial port (e.g. `/dev/ttyUSB0` or `/dev/ttyAMA0`).

The `URTSI` class only has one method, `getChannels()`, that returns an array of 16 channels.

Each channel has the `up()`, `down()`, and `stop()` methods.

```js
var channels = new URTSI('/dev/ttyUSB0').getChannels();
// Open all shades.
channels.forEach(channel => channel.up());
// Close all shades.
channels.forEach(channel => channel.down());
// Stop (or go to favorite position for) all shades.
channels.forEach(channel => channel.stop());
```

Each channel command returns a promise:

```js
Promise.all(channels.map(channel => channel.stop())).done(() => {
  console.log('All shades are going to their favorite positions!');
});
```
