import {zipObject} from 'lodash'

// create conditions
const createCondition = async (condition: Condition, client: Client) => {
  const {id: oldId, name, unique = false, text='', image, xws} = condition

  const result = await client.mutate(`{
    condition: createCondition(
      oldId: ${oldId},
      name: "${name.replace(/"/g, '&quote;')}",
      unique: ${unique},
      text: "${text.replace(/"/g, '&quote;')}",
      image: "${image}",
      xws: "${xws}"
    ){
      id
    }
  }`)

  if(!result) {
    console.log(condition)
  }
  else {
    console.log(`Added ${name}`)
  }

  return result.condition.id
}

const findCondition = async (condition: Condition, client: Client) => {
  const {id: oldId} = condition
  const result = await client.query(`{
    allConditions(
      filter: {
        oldId: ${oldId}
      }
    ) {
      id
    }
  }`)

  return result
}

export const createConditions = async (rawConditions: Condition[], client: Client): Promise<IdMap> => {
  const conditionIds = await Promise.all(rawConditions.map( async(condition) => {

    // check if condition already exists
    const existingCondition = await findCondition(condition, client)

    // if condition doesn't exist, create it
    if (existingCondition.allConditions.length === 0) {
      return await createCondition(condition, client)
    } else {
      return existingCondition.allConditions[0].id
    }
  }))

  return zipObject(rawConditions.map(condition => condition.id), conditionIds)
}
