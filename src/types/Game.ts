import { type Room } from './Room'
import { type User } from './User'

export interface Game {
  gameId: number
  gameRooms: Room[]
  gameUserIds: number[]
}
