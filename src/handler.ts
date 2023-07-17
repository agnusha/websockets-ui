import { mapToRespose } from './mapper'
import { TypeResponse } from './types/enums/TypeResponse'
import { TypeRequest } from './types/enums/TypeRequest'

import { type Response } from './types/Response'
import { type WebSocket } from 'ws'
import { type User } from './types/User'
import { type ShipGame } from './types/ShipGame'
import { type AttackStatus } from './types/enums/AttackStatus'

import { getStatus } from './game'
import { getAnotherUser, getUser, getUserId } from './user'
import { addGame, addRoom, addUser, gameId, removeRoom, roomId, rooms, shipGames, userId, users } from './store'

const userSockets: Record<number, WebSocket> = {}

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

        if (userWithSameName.password !== password) {
          errorText = 'User name already exists but password is incorrect'
        }
      } else {
        const newUser: User = { id: userId, name, password }
        addUser(newUser)
        userSockets[newUser.id] = ws
      }

      ws.send(mapToRespose({
        name,
        index: 0,
        error: !!errorText,
        errorText
      }, TypeResponse.Registration))
      break
    }

    // create game room and add yourself there
    case (TypeRequest.CreateRoom): {
      const currentUser = getUser(getUserId(ws, users, userSockets), users)

      const newRoom = { roomId, roomUsers: [currentUser] }
      addRoom(newRoom)

      users.forEach(u => {
        userSockets[u.id].send(mapToRespose(rooms, TypeResponse.UpdateRoom))
        userSockets[u.id].send(mapToRespose(rooms, TypeResponse.UpdateRoom))
      })

      break
    }

    // { "type": "add_user_to_room", "data": "{\"indexRoom\":2}", "id": 0 }
    // add youself to somebodys room, then remove room from rooms lis
    case (TypeRequest.AddUserToRoom): {
      const { indexRoom } = data
      const currentUser = getUser(getUserId(ws, users, userSockets), users)

      const currentRoom = removeRoom(indexRoom)
      currentRoom.roomUsers.push(currentUser)

      const newGame = { gameId, gameUserIds: [currentUser.id], gameRooms: [currentRoom] }
      addGame(newGame)

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
      console.log('ship Games', shipGames)

      if (shipGames.length > 1) {
        users.forEach(u => {
          userSockets[u.id].send(mapToRespose(newShipGame, TypeResponse.StartGame))
          userSockets[u.id].send(mapToRespose({ currentPlayer: indexPlayer }, TypeResponse.Turn))
        })
      }
      break
    }

    case (TypeRequest.Attack): {
      // Start game (only after server receives both player's ships positions)
      const { gameId, x, y, indexPlayer } = data
      const status: AttackStatus = getStatus(shipGames, x, y, indexPlayer)

      users.forEach(u => {
        userSockets[u.id].send(mapToRespose({
          position: { x, y },
          currentPlayer: indexPlayer,
          status
        }, TypeResponse.Attack))
      })

      users.forEach(u => {
        userSockets[u.id].send(mapToRespose({
          currentPlayer: indexPlayer
        }, TypeResponse.Turn))
      })

      // {
      //   type: "attack";,
      //   data:
      //   {
      //     position:
      //     {
      //       x: <number>,
      //         y: <number>,
      //       },
      //     currentPlayer: <number>, /* id of the player in the current game */
      //       status: "miss" | "killed" | "shot",
      //   },
      //   id: 0,
      break
    }
    case (TypeRequest.RandomAttack): {
      // Start game (only after server receives both player's ships positions)
      const { indexPlayer } = data

      users.forEach(u => {
        userSockets[u.id].send(mapToRespose({
          currentPlayer: indexPlayer
        }, TypeResponse.Turn))
      })
      // {
      //   type: "attack";,
      //   data:
      //   {
      //     position:
      //     {
      //       x: <number>,
      //         y: <number>,
      //       },
      //     currentPlayer: <number>, /* id of the player in the current game */
      //       status: "miss" | "killed" | "shot",
      //   },
      //   id: 0,
      break
    }

    default:
      console.error('Unknown command:', data.type)
  }
}
