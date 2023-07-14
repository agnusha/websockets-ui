import { type Response } from './types/Response'
import { type WebSocket } from 'ws'
import { type User } from './types/User'
import { Type } from './types/enums/Type'

const userIndex: number = 1
const users: User[] = []
const roomId: number = 1
const gameId: number = 1

const mapToRespose = (data: any, type: Type): string => {
  return JSON.stringify({
    type,
    data: JSON.stringify(data),
    id: 0
  })
}

export const handleMessage = (response: Response, ws: WebSocket): void => {
  console.log(response)

  const { data, id } = { data: JSON.parse(response.data), id: response.id }

  switch (response.type) {
    case (Type.Registration): {
      const { name, password } = data

      let errorText: string = ''
      if (!name || !password) {
        errorText = 'Empty registration data'
      } else if (users.some(u => u.name === name)) {
        errorText = 'User name already exists'
      } else {
        const newUser: User = { name, password, id }
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
      ws.send(mapToRespose({}, response.type))
      break
    }

    default:
      console.error('Unknown command:', data.type)
  }
}
