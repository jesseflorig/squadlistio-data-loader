import Lokka from 'lokka';
import Transport from 'lokka-transport-http';
import {chain, flatMap, uniq, value, omitBy, isNil, zipObject} from 'lodash';
import jsonloader from 'jsonloader'
import config from 'config'
import {createPilots} from './pilots'
import {createShips, connectShipsAndPilots} from './ships'
import {createUpgrades} from './upgrades'
import {createConditions} from './conditions'
import {createFactions, factionListToObj} from './factions'
import {createSlots, slotListToObj} from './slots'
import {createReferences} from './references'
import {createDamages} from './damages'

const graphCoolKey = config.get('graphcool.key')

const client = new Lokka({
  // add  your Graphcool endpoint key
  transport: new Transport(`https://api.graph.cool/simple/v1/${graphCoolKey}`)
});

// set timezone to UTC for Graphcool
process.env.TZ = 'UTC'

const main = async() => {
  // git clone git@github.com:guidokessels/xwing-data.git
  const rawShips = new jsonloader('../xwing-data/data/ships.js')
  const rawPilots = new jsonloader('../xwing-data/data/pilots.js')
  const rawUpgrades = new jsonloader('../xwing-data/data/upgrades.js')
  const rawConditions = new jsonloader('../xwing-data/data/conditions.js')
  const rawReferences = new jsonloader('../xwing-data/data/reference-cards.js')
  const rawDamages = new jsonloader('../xwing-data/data/damage-deck-core-tfa.js')

  const uniqFlatMap = (data, key) => {
    return chain(data)
      .flatMap(item => item[key])
      .uniq()
      .compact()
      .value()
  }

  // ingest factions
  const allFactions = uniqFlatMap(rawPilots, 'faction')
  const rawFactions = factionListToObj(allFactions)
  const createdFactions = await createFactions(rawFactions, client)
  console.log(`Created ${Object.keys(createdFactions).length} new factions.`)

  // ingest slots
  const allSlots = uniqFlatMap(rawPilots, 'slots')
  const rawSlots = slotListToObj(allSlots)
  const createdSlots = await createSlots(rawSlots, client)
  console.log(`Created ${Object.keys(createdSlots).length} new slots.`)

  // ingest ships
  const createdShips = await createShips(rawShips, client)
  console.log(`Created ${Object.keys(createdShips).length} new ships.`)

  // ingest pilots
  const createdPilots = await createPilots(rawPilots, client)
  console.log(`Created ${Object.keys(createdPilots).length} new pilots.`)

  // ingest upgrades
  const createdUpgrades = await createUpgrades(rawUpgrades, client)
  console.log(`Created ${createdUpgrades.length} new upgrades.`)

  // ingest conditions
  const createdConditions = await createConditions(rawConditions, client)
  console.log(`Created ${Object.keys(createdConditions).length} new conditions.`)

  // ingest references
  const createdReferences = await createReferences(rawReferences, client)
  console.log(`Created ${Object.keys(createdReferences).length} new reference cards.`)

  // ingest damages
  const createdDamages = await createDamages(rawDamages, client)
  console.log(`Created ${Object.keys(createdDamages).length} new damage cards.`)

  // connect ships and pilots
  const connectedPilots = await connectShipsAndPilots(rawShips, createdShips, rawPilots, createdPilots, client)
}

main().catch(e => console.log(e))
