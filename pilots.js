import {zipObject, chain, map, filter} from 'lodash'

// create pilots
const createPilot = async (pilot: Pilot, client: Client) => {
  const {id: oldId, name, unique = false, skill, points, image, slots=[], text="", faction, xws} = pilot

  const skillFix = typeof skill == 'number' ? skill : 0
  const pointsFix = typeof points == 'number' ? points : 0
  const slotsFix = slots.map((slot)=> `"${slot}"`)

  const result = await client.mutate(`{
    pilot: createPilot(
      oldId: ${oldId},
      name: "${name.replace(/"/g, '&quote;')}",
      unique: ${unique},
      skill: ${skillFix},
      points: ${pointsFix},
      image: "${image}",
      slots: [${slotsFix.toString()}],
      text: "${text.replace(/"/g, '&quote;')}",
      xws: "${xws}"
    ){
      id
    }
  }`)

  if(!result) {
    console.log(`ERROR adding ${name}`)
  }
  // else {
  //   console.log(`ADDED ${name}`)
  // }

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

export const connectPilotsAndFaction = async(rawPilots, newPilots, rawFactions, newFactions, client) => {
  return await map(rawPilots, async(pilot) => {
    const newPilotId = newPilots[pilot.id]
    const newFactionIds = chain(rawFactions)
      .filter(faction => {
        return pilot.faction.includes(faction.name)
      })
      .map(faction => {
        return newFactions[faction.name]
      })
      .value()

    return await map(newFactionIds, async(newFactionId) => {
      const connectedPilot = await connectPilotsAndFactionsMutation(newPilotId, newFactionId, client)
      return connectedPilot
    })
  })
}

const connectPilotsAndFactionsMutation = async(pilotId, factionId, client) => {
  const result = await client.mutate(`{
      addToPilotOnFaction(pilotsPilotId: "${pilotId}" factionFactionId: "${factionId}") {
        factionFaction{
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
