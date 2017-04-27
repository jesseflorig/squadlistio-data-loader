import {zipObject} from 'lodash'

// create damages
const createDamage = async (damage: Damage, client: Client) => {
  const {name, amount: qtyTFA = 0, qtyCore = 0, type, text=''} = damage

  const result = await client.mutate(`{
    damage: createDamage(
      name: "${name.replace(/"/g, '&quote;')}",
      qtyTFA: ${qtyTFA},
      qtyCore: ${qtyCore},
      type: "${type}"
      text: "${text.replace(/"/g, '&quote;')}"
    ){
      id
    }
  }`)

  if(!result) {
    console.log(damage)
  }
  // else {
  //   console.log(`Added ${name}`)
  // }

  return result.damage.id
}

const findDamage = async (damage: Damage, client: Client) => {
  const {name} = damage
  const result = await client.query(`{
    allDamages(
      filter: {
        name: "${name}"
      }
    ) {
      id
    }
  }`)

  return result
}

export const createDamages = async (rawDamages: Damage[], client: Client): Promise<IdMap> => {
  const damageIds = await Promise.all(rawDamages.map( async(damage) => {

    // check if damage already exists
    const existingDamage = await findDamage(damage, client)

    // if damage doesn't exist, create it
    if (existingDamage.allDamages.length === 0) {
      return await createDamage(damage, client)
    } else {
      return existingDamage.allDamages[0].id
    }
  }))

  return zipObject(rawDamages.map(damage => damage.name), damageIds)
}
