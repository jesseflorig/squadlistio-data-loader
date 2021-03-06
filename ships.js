import {zipObject, chain, map, filter} from 'lodash'

// create ships
const createShip = async (ship: Ship, client: Client) => {
  const {id: oldId, name, attack = 0, agility = 0, hull = 0, shields = 0, actions = [], size, xws} = ship
  const actionsFix =actions.map((action)=> `"${action}"`)
  const result = await client.mutate(`{
    ship: createShip(
      oldId: ${oldId},
      name: "${name}",
      attack: ${attack || 0},
      agility: ${agility},
      hull: ${hull},
      shields: ${shields},
      actions: [${actionsFix.toString()}],
      size: "${size}",
      xws: "${xws}"
    ){
      id
    }
  }`)

  return result.ship.id
}

const findShip = async (ship: Ship, client: Client) => {
  const result = await client.query(`{
    allShips(
      filter: {
        oldId: ${ship.id}
      }
    ) {
      id
    }
  }`)

  return result
}

export const connectShipsAndPilots = async(rawShips, newShips, rawPilots, newPilots, client) => {
  return await map(rawShips, async(ship) => {
    const newShipId = newShips[ship.id]
    const newPilotIds = chain(rawPilots)
      .filter(pilot => {
        return pilot.ship === ship.name
      })
      .map(pilot => {
        return newPilots[pilot.id]
      })
      .value()

    return await map(newPilotIds, async(newPilotId) => {
      const connectedShip = await connectShipsAndPilotsMutation(newShipId, newPilotId, client)
      return connectedShip
    })
  })
}

const connectShipsAndPilotsMutation = async(shipId, pilotId, client) => {
  const result = await client.mutate(`{
      addToShipPilots(shipShipId: "${shipId}" pilotsPilotId: "${pilotId}") {
        pilotsPilot{
          id
        }
      }
    }`)

  return result
}

export const createShips = async (rawShips: Ship[], client: Client): Promise<IdMap> => {
  const shipIds = await Promise.all(rawShips.map( async(ship) => {

    // check if ship already exists
    const existingShip = await findShip(ship, client)

    // if ship doesn't exist, create it
    if (existingShip.allShips.length === 0) {
      return await createShip(ship, client)
    } else {
      return existingShip.allShips[0].id
    }
  }))

  return zipObject(rawShips.map(ship => ship.id), shipIds)
}
