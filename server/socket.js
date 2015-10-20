let io;

export default function init(server) {
  if (!io && server) io = require('socket.io')(server);
  return io;
}
