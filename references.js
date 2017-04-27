import {zipObject} from 'lodash'

// create references
const createReference = async (reference: Reference, client: Client) => {
  const {id: oldId, title, subtitle, image} = reference

  const result = await client.mutate(`{
    reference: createReference(
      oldId: ${oldId},
      title: "${title}",
      subtitle: "${subtitle}",
      image: "${image}"
    ){
      id
    }
  }`)

  if(!result) {
    console.log(reference)
  }
  // else {
  //   console.log(`Added ${title}`)
  // }

  return result.reference.id
}

const findReference = async (reference: Reference, client: Client) => {
  const {id: oldId} = reference
  const result = await client.query(`{
    allReferences(
      filter: {
        oldId: ${oldId}
      }
    ) {
      id
    }
  }`)

  return result
}

export const createReferences = async (rawReferences: Reference[], client: Client): Promise<IdMap> => {
  const referenceIds = await Promise.all(rawReferences.map( async(reference) => {

    // check if reference already exists
    const existingReference = await findReference(reference, client)

    // if reference doesn't exist, create it
    if (existingReference.allReferences.length === 0) {
      return await createReference(reference, client)
    } else {
      return existingReference.allReferences[0].id
    }
  }))

  return zipObject(rawReferences.map(reference => reference.id), referenceIds)
}
