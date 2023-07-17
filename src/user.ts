import { type WebSocket } from 'ws'
import { type User } from './types/User'

function getUserId (ws: WebSocket, users: User[], userSockets: Record<number, WebSocket>): number {
  const entry = Object.entries(userSockets).find(([_, value]) => value === ws)
  if (entry != null) {
    return Number(entry[0])
  }
  throw Error('User id hot match web socket')
}

function getUser (userId: number, users: User[]): User {
  const user = users.find(u => u.id === userId)
  if (user != null) {
    return user
  }
  throw Error('User is not found by id')
}

function getAnotherUser (userId: number, users: User[]): User {
  const user = users.find(u => u.id !== userId)
  if (user != null) {
    return user
  }
  throw Error('User is not found by id')
}

export { getUserId, getUser, getAnotherUser }
