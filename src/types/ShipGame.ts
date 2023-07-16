import { type Ship } from './Ship'

export interface ShipGame {
  ships: Ship[]
  currentPlayerIndex: number
}
