import {zipObject, chain, map, filter} from 'lodash'

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
    xws
  } = upgrade

  const nameFix = name.replace(/"/g, '&quote;')
  const textFix = text.replace(/"/g, '&quote;')

  const result = await client.mutate(`{
    upgrade: createUpgrade(
      oldId: ${id},
      attack: ${attack},
      images: "${image}",
      name: "${nameFix}",
      points: ${points},
      range: "${range}",
      text: "${textFix}",
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

export const connectUpgradesAndSlot = async(rawUpgrades, newUpgrades, rawSlots, newSlots, client) => {
  return await map(rawUpgrades, async(upgrade) => {
    const newUpgradeId = newUpgrades[upgrade.id]
    const newSlotIds = chain(rawSlots)
      .filter(slot => {
        return upgrade.slot.includes(slot.name)
      })
      .map(slot => {
        return newSlots[slot.name]
      })
      .value()

    return await map(newSlotIds, async(newSlotId) => {
      const connectedUpgrade = await connectUpgradesAndSlotsMutation(newUpgradeId, newSlotId, client)
      return connectedUpgrade
    })
  })
}

const connectUpgradesAndSlotsMutation = async(upgradeId, slotId, client) => {
  const result = await client.mutate(`{
      addToSlotUpgrades(upgradesUpgradeId: "${upgradeId}" slotSlotId: "${slotId}") {
        slotSlot{
          id
        }
      }
    }`)

  return result
}

export const createUpgrades = async (rawUpgrades: Upgrade[], client: Client): Promise<IdMap> => {
  const upgradeIds = await Promise.all(rawUpgrades.map( async(upgrade) => {

    // check if upgrade already exists
    const existingUpgrade = await findUpgrade(upgrade, client)

    // if upgrade doesn't exist, create it
    if (existingUpgrade.allUpgrades.length === 0) {
      return await createUpgrade(upgrade, client)
    } else {
      return existingUpgrade.allUpgrades[0].id
    }
  }))

  return zipObject(rawUpgrades.map(upgrade => upgrade.id), upgradeIds)
}
