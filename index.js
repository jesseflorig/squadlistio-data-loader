import Lokka from 'lokka';
import Transport from 'lokka-transport-http';
import {chain, flatMap, uniq, value, omitBy, isNil, zipObject} from 'lodash';
import jsonloader from 'jsonloader'
import config from 'config'
import {createShips} from './ships'
import {createPilots} from './pilots'
import {createUpgrades} from './upgrades'

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

  const uniqFlatMap = (data, key) => {
    return chain(data)
      .flatMap(item => item[key])
      .uniq()
      .compact()
      .value()
  }

  // ingest ships
  const createdShips = await createShips(rawShips, client)
  console.log(`Created ${createdShips.length} new ships.`)

  // ingest pilots
  const createdPilots = await createPilots(rawPilots, client)
  console.log(`Created ${createdPilots.length} new pilots.`)

  // ingest upgrades
  const createdUpgrades = await createUpgrades(rawUpgrades, client)
  console.log(`Created ${createdUpgrades.length} new upgrades.`)
}

main().catch(e => console.log(e))
