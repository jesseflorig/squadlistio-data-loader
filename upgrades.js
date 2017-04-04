// create ships
const createUpgrade = async (upgrade: Upgrade, client: Client) => {
  const {
    id,
    attack = null,
    image,
    name,
    points,
    range,
    text,
    unique = false,
    xws } = upgrade

  const result = await client.mutate(`{
    upgrade: createUpgrade(
      oldId: ${id},
      attack: ${attack},
      images: "${image}",
      name: "${name.replace(/"/g, '&quote;')}",
      points: ${points},
      range: "${range}",
      text: "${text.replace(/"/g, '&quote;')}",
      unique: ${unique},
      xws: "${xws}"
    ){
      id
    }
  }`)

  if (!result) console.log(upgrade)

  return result.upgrade.id
}

const findUpgrade = async (upgrade: Upgrade, client: Client) => {
  const result = await client.query(`{
    allUpgrades(
      filter: {
        oldId: ${upgrade.id}
      }
    ) {
      id
    }
  }`)

  return result
}

export const createUpgrades = async (rawUpgrades: Upgrade[], client: Client): Promise<IdMap> => {
  const createdUpgrades = []
  await Promise.all(rawUpgrades.map( async(upgrade) => {

    // check if upgrade already exists
    const isExistingUpgrade = await findUpgrade(upgrade, client).then(r => {
      return r.allUpgrades.length > 0
    })

    // if upgrade doesn't exist, create it
    if (!isExistingUpgrade) {
      const createdUpgrade = await createUpgrade(upgrade, client)
      createdUpgrades.push(createdUpgrade)
    }
  }))

  return createdUpgrades
}
