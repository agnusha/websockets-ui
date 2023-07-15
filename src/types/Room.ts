import { type User } from './User'

export interface Room {
  roomId: number
  roomUsers: User[]
}
