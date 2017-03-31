// create ships
const createShip = async (ship: Ship, client: Client) => {
  const result = await client.mutate(`{
    ship: createShip(
      oldId: ${ship.id},
      name: "${ship.name}",
      attack: ${ship.attack || 0},
      agility: ${ship.agility},
      hull: ${ship.hull},
      shields: ${ship.shields},
      size: "${ship.size}",
      xws: "${ship.xws}"
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

export const createShips = async (rawShips: Ship[], client: Client): Promise<IdMap> => {
  const createdShips = []
  await Promise.all(rawShips.map( async(ship) => {

    // check if ship already exists
    const isExistingShip = await findShip(ship, client).then(r => {
      return r.allShips.length > 0
    })

    // if ship doesn't exist, create it
    if (!isExistingShip) {
      const createdShip = await createShip(ship, client)
      createdShips.push(createdShip)
    }
  }))

  return createdShips
}
