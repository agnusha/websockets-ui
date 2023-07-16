/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { Type } from './types/enums/Type'
import { type Response } from './types/Response'
import { type WebSocket } from 'ws'
import { type User } from './types/User'
import { type Room } from './types/Room'
import { type Game } from './types/Game'
import { type Ship } from './types/Ship'
import { type ShipGame } from './types/ShipGame'

let currentUser: User
const users: User[] = []
const rooms: Room[] = []
const games: Game[] = []
const ships: Ship[] = []
const shipGames: ShipGame[] = []

let userId: number = 1
let roomId: number = 1
let gameId: number = 1

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
        const newUser: User = { name, password, id: userId }
        currentUser = newUser
        users.push(newUser)
        userId++
      }

      ws.send(mapToRespose({
        name,
        index: 0,
        error: !!errorText,
        errorText
      }, response.type))
      break
    }

    // create game room and add yourself there
    case (Type.CreateRoom): {
      const newRoom = { roomId, roomUsers: [currentUser] }
      roomId++
      rooms.push(newRoom)
      ws.send(mapToRespose(rooms, Type.UpdateRoom))

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

    // { "type": "add_user_to_room", "data": "{\"indexRoom\":2}", "id": 0 }
    // add youself to somebodys room, then remove room from rooms lis
    case (Type.AddUserToRoom): {
      const { indexRoom } = data
      const currentUserId = 1

      // Remove the room from the rooms list
      const roomIndex = rooms.findIndex((r) => r.roomId === indexRoom)
      const currentRoom = rooms[roomIndex]
      rooms.splice(roomIndex, 1)

      currentUser && currentRoom?.roomUsers.push(currentUser)

      const newGame = { gameId, gameUserIds: [currentUserId], gameRooms: [currentRoom] }
      games.push(newGame)
      gameId++

      // todo: also update rooms
      ws.send(mapToRespose({ idGame: gameId, idPlayer: currentUserId }, Type.CreateGame))

      //   type: "create_game", //send for both players in the room
      //     data:
      //   {
      //       idGame: <number>,
      //       idPlayer: <number>, \* player id in the game *\
      //   },
      //   id: 0,

      break
    }

    //         type: "add_ships",
    //           data:
    //         {
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
    //         },
    //         id: 0,

    case (Type.AddShips): {
      // Start game (only after server receives both player's ships positions)
      const { gameId, ships, indexPlayer } = data

      const newShipGame: ShipGame = { ships, currentPlayerIndex: indexPlayer }
      shipGames.push(newShipGame)

      ws.send(mapToRespose({ ships, currentPlayerIndex: currentUser.id }, Type.StartGame))
      break
    }

    default:
      console.error('Unknown command:', data.type)
  }
}
