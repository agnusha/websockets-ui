import { WebSocketServer } from 'ws';


export const createWebSocketServer = (port: number) => {
    const webSocketServer = new WebSocketServer({ port });


    webSocketServer.on('connection', function connection(ws) {
        ws.on('open', () => {
            console.log(`Start web socket server on the ${port} port!`);
        });

        ws.on('message', function message(data) {
            const dataParsed = JSON.parse(data.toString());
            handleMessage(dataParsed);
        });

        ws.on('error', console.error);
        
        ws.on('close', () => {
            console.log(`Close web socket server on the ${port} port!`);
        });
    });
}