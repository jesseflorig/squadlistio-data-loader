import {zipObject, map} from 'lodash'

// create slots
const createSlot = async (slot: Slot, client: Client) => {
  const {name, xws} = slot
  const result = await client.mutate(`{
    slot: createSlot(
      name: "${name}",
      xws: "${xws}"
    ){
      id
    }
  }`)

  if(!result) {
    console.log(`Error adding ${slot}:`)
    console.log(slot)
  }
  // else {
  //   console.log(`Added ${name} slot`)
  // }

  return result.slot.id
}

const findSlot = async (slot: Slot, client: Client) => {
  const {name} = slot
  const result = await client.query(`{
    allSlots(
      filter: {
        name: "${name}"
      }
    ) {
      id
    }
  }`)

  return result
}

export const slotListToObj = (allSlots: string[]) => {
  const toObj = (item) => {
    const xws = item.replace(/\W/g,'').toLowerCase()
    return {
      'name': item,
      'xws': xws
    }
  }

  return map(allSlots, toObj)
}

export const createSlots = async (rawSlots: Slot[], client: Client): Promise<IdMap> => {
  const slotIds = await Promise.all(rawSlots.map( async(slot) => {

    // check if slot already exists
    const existingSlot = await findSlot(slot, client)

    // if slot doesn't exist, create it
    if (existingSlot.allSlots.length === 0) {
      return await createSlot(slot, client)
    } else {
      return existingSlot.allSlots[0].id
    }
  }))

  return zipObject(rawSlots.map(slot => slot.name), slotIds)
}
