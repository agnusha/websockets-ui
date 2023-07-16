/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { TypeResponse } from './types/enums/TypeResponse'
import { TypeRequest } from './types/enums/TypeRequest'

import { type Response } from './types/Response'
import { type WebSocket } from 'ws'
import { type User } from './types/User'
import { type Room } from './types/Room'
import { type Game } from './types/Game'
import { type Ship } from './types/Ship'
import { type ShipGame } from './types/ShipGame'

const userSockets: Record<number, WebSocket> = {}

let currentUser: User
const users: User[] = []
const rooms: Room[] = []
const games: Game[] = []
const ships: Ship[] = []
const shipGames: ShipGame[] = []

let userId: number = 1
let roomId: number = 1
let gameId: number = 1

const mapToRespose = (data: any, type: TypeResponse): string => {
  const result = JSON.stringify({
    type,
    data: JSON.stringify(data),
    id: 0
  })
  console.log('resul sent')
  console.log(result)
  return result
}

const getAnotherUserId = (id: number): number => {
  const anotherUser = users.find(u => u.id !== id)?.id
  if (!anotherUser) throw new Error('unavbe to find second user')
  return anotherUser
}

export const handleMessage = (response: Response, ws: WebSocket): void => {
  const data = response.data ? JSON.parse(response.data) : undefined

  switch (response.type) {
    case (TypeRequest.Registration): {
      const { name, password } = data

      let errorText: string = ''
      if (!name || !password) {
        errorText = 'Empty registration data'
      } else if (users.some(u => u.name === name)) {
        const userWithSameName = users.find(u => u.name === name) as User

        if (userWithSameName.password === password) {
          currentUser = userWithSameName
        } else {
          errorText = 'User name already exists'
        }
      } else {
        const newUser: User = { id: userId, name, password }
        users.push(newUser)
        userId++

        currentUser = newUser
        userSockets[currentUser.id] = ws
      }

      userSockets[currentUser.id].send(mapToRespose({
        name,
        index: 0,
        error: !!errorText,
        errorText
      }, TypeResponse.Registration))
      break
    }

    // create game room and add yourself there
    case (TypeRequest.CreateRoom): {
      const newRoom = { roomId, roomUsers: [currentUser] }
      roomId++
      rooms.push(newRoom)
      userSockets[currentUser.id].send(mapToRespose(rooms, TypeResponse.UpdateRoom))

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

      break
    }

    // { "type": "add_user_to_room", "data": "{\"indexRoom\":2}", "id": 0 }
    // add youself to somebodys room, then remove room from rooms lis
    case (TypeRequest.AddUserToRoom): {
      const { indexRoom } = data

      // Remove the room from the rooms list
      const roomIndex = rooms.findIndex((r) => r.roomId === indexRoom)
      const currentRoom = rooms[roomIndex]
      rooms.splice(roomIndex, 1)
      currentRoom?.roomUsers.push(currentUser)

      const newGame = { gameId, gameUserIds: [currentUser.id], gameRooms: [currentRoom] }
      games.push(newGame)
      gameId++

      users.forEach(u => {
        userSockets[u.id].send(mapToRespose({ idGame: gameId, idPlayer: u.id }, TypeResponse.CreateGame))
        // (send rooms list, where only one player inside)
        userSockets[u.id].send(mapToRespose(rooms, TypeResponse.UpdateRoom))
      })

      //     data:
      //   {
      //       idGame: <number>,
      //       idPlayer: <number>, \* player id in the game *\
      //   },

      break
    }

    //           gameId: <number>,
    //             ships:
    //           [
    //             {
    //               position: {
    //                 x: <number>,
    //                 y: <number>,
    //               },
    //               direction: <boolean>,
    //               length: <number>,
    //               type: "small" | "medium" | "large" | "huge",
    //             }
    //           ],
    //             indexPlayer: <number>, /* id of the player in the current game */

    case (TypeRequest.AddShips): {
      // Start game (only after server receives both player's ships positions)
      const { gameId, ships, indexPlayer } = data

      const newShipGame: ShipGame = { ships, currentPlayerIndex: indexPlayer }
      shipGames.push(newShipGame)

      if (shipGames.length > 1) {
        userSockets[indexPlayer].send(mapToRespose(newShipGame, TypeResponse.StartGame))
        userSockets[getAnotherUserId(indexPlayer)].send(mapToRespose(newShipGame, TypeResponse.StartGame))
      }
      break
    }

    default:
      console.error('Unknown command:', data.type)
  }
}
