import { type User } from './types/User'
import { type Room } from './types/Room'
import { type Game } from './types/Game'
import { type ShipGame } from './types/ShipGame'

const users: User[] = []
const rooms: Room[] = []
const games: Game[] = []
const shipGames: ShipGame[] = []

let userId: number = 1
let roomId: number = 1
let gameId: number = 1

function addUser (item: User): void {
  users.push(item)
  userId++
}

function addRoom (item: Room): void {
  rooms.push(item)
  roomId++
}

function removeRoom (indexRoom: number): Room {
  const roomIndex = rooms.findIndex((r) => r.roomId === indexRoom)
  const removedItem = rooms[roomIndex]
  rooms.splice(roomIndex, 1)
  return removedItem
}

function addGame (item: Game): void {
  games.push(item)
  gameId++
}

export { users, rooms, games, shipGames }
export { userId, roomId, gameId }
export { addUser, addRoom, addGame, removeRoom }
