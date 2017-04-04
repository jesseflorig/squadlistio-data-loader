import {zipObject} from 'lodash'

// create pilots
const createPilot = async (pilot: Pilot, client: Client) => {
  const {id: oldId, name, unique = false, skill, points, text='', faction, xws} = pilot

  const skillFix = typeof skill == 'number' ? skill : 0
  const pointsFix = typeof points == 'number' ? points : 0

  const result = await client.mutate(`{
    pilot: createPilot(
      oldId: ${oldId},
      name: "${name.replace(/"/g, '&quote;')}",
      unique: ${unique},
      skill: ${skillFix},
      points: ${pointsFix},
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
