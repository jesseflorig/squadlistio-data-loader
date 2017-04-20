import {zipObject} from 'lodash'

// create pilots
const createPilot = async (pilot: Pilot, client: Client) => {
  const {id: oldId, name, unique = false, skill, points, image, text='', faction, xws} = pilot

  const skillFix = typeof skill == 'number' ? skill : 0
  const pointsFix = typeof points == 'number' ? points : 0

  const result = await client.mutate(`{
    pilot: createPilot(
      oldId: ${oldId},
      name: "${name.replace(/"/g, '&quote;')}",
      unique: ${unique},
      skill: ${skillFix},
      points: ${pointsFix},
      image: "${image}",
      text: "${text.replace(/"/g, '&quote;')}",
      faction: "${faction}",
      xws: "${xws}"
    ){
      id
    }
  }`)

  if(!result) {
    console.log(pilot)
  }
  else {
    console.log(`Added ${name}`)
  }

  return result.pilot.id
}

const findPilot = async (pilot: Pilot, client: Client) => {
  const {id: oldId} = pilot
  const result = await client.query(`{
    allPilots(
      filter: {
        oldId: ${oldId}
      }
    ) {
      id
    }
  }`)

  return result
}

export const connectPilotsAndSlots = async(rawPilots, newPilots, rawSlots, newSlots, client) => {
  return await map(rawPilots, async(pilot) => {
    const newPilotId = newPilots[pilot.id]
    const newSlotIds = chain(rawSlots)
      .filter(slot => {
        return slot.pilot === pilot.name
      })
      .map(slot => {
        return newSlots[slot.id]
      })
      .value()

    return await map(newSlotIds, async(newSlotId) => {
      const connectedPilot = await connectPilotsAndSlotsMutation(newPilotId, newSlotId, client)
      return connectedPilot
    })
  })
}

const connectPilotsAndSlotsMutation = async(pilotId, slotId, client) => {
  const result = await client.mutate(`{
      addToPilotOnSlot(pilotsPilotId: "${pilotId}" slotsSlotId: "${slotId}") {
        slotsSlot{
          id
        }
      }
    }`)

  return result
}


export const createPilots = async (rawPilots: Pilot[], client: Client): Promise<IdMap> => {
  const pilotIds = await Promise.all(rawPilots.map( async(pilot) => {

    // check if pilot already exists
    const existingPilot = await findPilot(pilot, client)

    // if pilot doesn't exist, create it
    if (existingPilot.allPilots.length === 0) {
      return await createPilot(pilot, client)
    } else {
      return existingPilot.allPilots[0].id
    }
  }))

  return zipObject(rawPilots.map(pilot => pilot.id), pilotIds)
}
