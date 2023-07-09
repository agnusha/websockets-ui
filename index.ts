import { httpServer } from "./src/http_server/index";
import { WebSocketServer } from 'ws';

const HTTP_PORT = 8181;
const WEB_SOCKET_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: WEB_SOCKET_PORT });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});