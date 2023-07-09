import { WebSocketServer } from 'ws';


export const createWebSocketServer = (port: number) => {
    const webSocketServer = new WebSocketServer({ port });

    webSocketServer.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });

    ws.send('something');
    });
}