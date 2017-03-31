import Lokka from 'lokka';
import Transport from 'lokka-transport-http';
import {chain, flatMap, uniq, value, omitBy, isNil} from 'lodash';
import jsonloader from 'jsonloader'


const client = new Lokka({
  // add  your Graphcool endpoint key
  transport: new Transport('https://api.graph.cool/simple/v1/__YOUR_KEY')
});

// set timezone to UTC for Graphcool
process.env.TZ = 'UTC';

// git clone git@github.com:guidokessels/xwing-data.git
const rawShips = new jsonloader('../xwing-data/data/ships.js');
const rawPilots = new jsonloader('../xwing-data/data/pilots.js');

const uniqFlatMap = (data, key) => {
  return chain(data)
    .flatMap(item => item[key])
    .uniq()
    .compact()
    .value()
}

const allFactions = uniqFlatMap(rawShips, 'faction')
const allActions = uniqFlatMap(rawShips, 'actions')
const allSlots = uniqFlatMap(rawPilots, 'slots')

console.log('all factions:',allFactions);
console.log('all actions:',allActions);
console.log('all slots:',allSlots);
