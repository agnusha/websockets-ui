/* eslint-disable @typescript-eslint/no-base-to-string */
import { WebSocketServer } from 'ws'
import { handleMessage } from '../messageHandler'

export const createWebSocketServer = (port: number): void => {
  const webSocketServer = new WebSocketServer({ port })

  webSocketServer.on('connection', function connection (ws) {
    ws.on('open', () => {
      console.log(`Start web socket server on the ${port} port!`)
    })
    ws.on('error', console.error)
    ws.on('close', () => {
      console.log(`Close web socket server on the ${port} port!`)
    })

    ws.on('message', function message (data) {
      console.log('message')
      console.log(data)

      const dataParsed = JSON.parse(data.toString())

      const response = handleMessage(dataParsed)

      console.log('responseText send' + response)
      ws.send(response)
    })
  })
}
