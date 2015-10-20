export function log() {
  if (process.send) {
    const args = Array.prototype.slice.call(arguments);
    process.send({
      type: 'log',
      msg: args.join(' ')
    });
  } else {
    console.log.apply(null, arguments);
  }
}

export function error() {
  if (process.send) {
    process.send({
      type: 'error',
      msg: arguments.join(' ')
    });
  } else {
    console.error(arguments);
  }
}

export function onMsg(data) {
  if (data.type === 'error') {
    console.error(data.msg);
  } else if (data.type === 'log' ) {
    console.log(data.msg);
  }
}
