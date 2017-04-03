import {zipObject, map} from 'lodash'

// create factions
const createFaction = async (faction: Faction, client: Client) => {
  const {name, xws} = faction
  const result = await client.mutate(`{
    faction: createFaction(
      name: "${name}",
      xws: "${xws}"
    ){
      id
    }
  }`)

  if(!result) {
    console.log(`Error adding ${faction}:`)
    console.log(faction)
  }
  // else {
  //   console.log(`Added ${name} faction`)
  // }

  return result.faction.id
}

const findFaction = async (faction: Faction, client: Client) => {
  const {name} = faction
  const result = await client.query(`{
    allFactions(
      filter: {
        name: "${name}"
      }
    ) {
      id
    }
  }`)

  return result
}

export const factionListToObj = (allFactions: string[]) => {
  const toObj = (item) => {
    const xws = item.replace(/\W/g,'').toLowerCase()
    return {
      'name': item,
      'xws': xws
    }
  }

  return map(allFactions, toObj)
}

export const createFactions = async (rawFactions: Faction[], client: Client): Promise<IdMap> => {
  const factionIds = await Promise.all(rawFactions.map( async(faction) => {

    // check if faction already exists
    const existingFaction = await findFaction(faction, client)

    // if faction doesn't exist, create it
    if (existingFaction.allFactions.length === 0) {
      return await createFaction(faction, client)
    } else {
      return existingFaction.allFactions[0].id
    }
  }))

  return zipObject(rawFactions.map(faction => faction.name), factionIds)
}
