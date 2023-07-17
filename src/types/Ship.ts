import { type Position } from './Position'

export interface Ship {
  position: Position
  direction: boolean
  length: number
  type: 'small' | 'medium' | 'large' | 'huge'
  hits?: number
}
