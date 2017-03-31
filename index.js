import Lokka from 'lokka';
import Transport from 'lokka-transport-http';
import {chain, flatMap, uniq, value, omitBy, isNil, zipObject} from 'lodash';
import jsonloader from 'jsonloader'
import config from 'config'
import {createShips} from './ships'

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

  const createdShips = await createShips(rawShips, client)
  console.log(`Created ${createdShips.length} new ships.`)
}

main().catch(e => console.log(e))
