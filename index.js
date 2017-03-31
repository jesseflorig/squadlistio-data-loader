import Lokka from 'lokka';
import Transport from 'lokka-transport-http';
import {chain, flatMap, uniq, value, omitBy, isNil} from 'lodash';
import jsonloader from 'jsonloader'
import config from 'config'


const graphCoolKey = config.get('grahpcool.key')

const client = new Lokka({
  // add  your Graphcool endpoint key
  transport: new Transport(`https://api.graph.cool/simple/v1/${graphCoolKey}`)
});

// set timezone to UTC for Graphcool
process.env.TZ = 'UTC'

// git clone git@github.com:guidokessels/xwing-data.git
const rawShips = new jsonloader('../xwing-data/data/ships.js')
const rawPilots = new jsonloader('../xwing-data/data/pilots.js')

const uniqFlatMap = (data, key) => {
  return chain(data)
    .flatMap(item => item[key])
    .uniq()
    .compact()
    .value()
}

const allShips = uniqFlatMap(rawShips, 'name')
const allFactions = uniqFlatMap(rawShips, 'faction')
const allActions = uniqFlatMap(rawShips, 'actions')
const allSlots = uniqFlatMap(rawPilots, 'slots')

console.log(`all ships: ${allShips}!`)
// console.log('all factions:',allFactions)
// console.log('all actions:',allActions)
// console.log('all slots:',allSlots)

// create ships
// const shipIdMap = await createShips(allShips)
// console.log(`Created ${Object.keys(shipIdMap).length} ships.`)

// const createShips = async (rawShips: Ship[]): Promise<IdMap> => {
//   const shipIds = await Promise.all(rawShips.map(createShip))
//   return _.zipObject<IdMap> (rawShips.map(ship => ship.id), shipIds)
// }

// const createShip = async (ship: Ship): Promise<string> => {
//   const result = await client.mutate(`{
//     ship: createShip(
//       oldId: ${ship.id},
//       name: "${ship.name}",
//       attack: ${ship.attack},
//       agility: ${ship.agility},
//       hull: ${ship.hull},
//       shields: ${ship.shields},
//       size: "${ship.size}",
//       xws: "${ship.xws}",
//     )
//   }`)
//
//   return result.ship.id
// }
