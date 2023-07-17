import { type Room } from './Room'

export interface Game {
  gameId: number
  gameRooms: Room[]
  gameUserIds: number[]
}
