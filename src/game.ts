import { type Ship } from './types/Ship'
import { type ShipGame } from './types/ShipGame'
import { type AttackStatus } from './types/enums/AttackStatus'

function getStatus (shipGames: ShipGame[], x: number, y: number, userId: number): AttackStatus {
  const opponentPlayerShips = getAnotherPlayerShips(shipGames, userId)

  for (const ship of opponentPlayerShips) {
    if (isShot(x, y, ship)) {
      updateShipHit(ship)
      return isShipKilled(ship) ? 'killed' : 'shot'
    }
  }
  return 'miss'
}

function getAnotherPlayerShips (shipGames: ShipGame[], userId: number): Ship[] {
  const opponentPlayerShips = shipGames.find(s => s.currentPlayerIndex !== userId)?.ships
  return opponentPlayerShips ?? []
}

function isShot (x: number, y: number, ship: Ship): boolean {
  if (ship.direction) {
    return (
      y === ship.position.y &&
            x >= ship.position.x &&
            x < ship.position.x + ship.length
    )
  } else {
    return (
      x === ship.position.x &&
            y >= ship.position.y &&
            y < ship.position.y + ship.length
    )
  }
}

function updateShipHit (ship: Ship): void {
  ship.hits = ship.hits != null ? ship.hits + 1 : 0
}

function isShipKilled (ship: Ship): boolean {
  const { length, hits } = ship
  return hits === length
}

function isAllShipKilled (ships: Ship[]): boolean {
  for (const ship of ships) {
    if ((ship.hits != null) && ship.hits < ship.length) {
      return false
    }
  }
  return true
}

export { getStatus }
