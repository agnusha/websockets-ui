/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { type Response } from './types/Response'
import { type WebSocket } from 'ws'
import { type User } from './types/User'
import { type Room } from './types/Room'
import { Type } from './types/enums/Type'

const userIndex: number = 1
const users: User[] = []
const rooms: Room[] = []

let roomId: number = 1
const gameId: number = 1

const mapToRespose = (data: any, type: Type): string => {
  const result = JSON.stringify({
    type,
    data: JSON.stringify(data),
    id: 0
  })
  console.log('result')
  console.log(result)
  return result
}

export const handleMessage = (response: Response, ws: WebSocket): void => {
  const data = response.data ? JSON.parse(response.data) : undefined

  switch (response.type) {
    case (Type.Registration): {
      const { name, password } = data

      let errorText: string = ''
      if (!name || !password) {
        errorText = 'Empty registration data'
      } else if (users.some(u => u.name === name)) {
        errorText = 'User name already exists'
      } else {
        const newUser: User = { name, password, id: response.id }
        users.push(newUser)
      }

      ws.send(mapToRespose({
        name,
        index: 0,
        error: !!errorText,
        errorText
      }, response.type))
      break
    }

    case (Type.CreateRoom): {
      const newRoom = { roomId, roomUsers: users }
      roomId++
      rooms.push(newRoom)
      ws.send(mapToRespose(rooms, Type.UpdateRoom))

      // {
      //   type: "update_room",
      //     data:
      //   [
      //     {
      //       roomId: <number>,
      //       roomUsers:
      //         [
      //           {
      //             name: <string>,
      //             index: <number>,
      //           }
      //         ],
      //     },
      //   ],
      // id: 0,

      break
    }

    default:
      console.error('Unknown command:', data.type)
  }
}
