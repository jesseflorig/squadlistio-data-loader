import Lokka from 'lokka';
import Transport from 'lokka-transport-http';
import {chain, flatMap, uniq, value} from 'lodash';
import jsonloader from 'jsonloader'


const client = new Lokka({
  // add  your Graphcool endpoint key
  transport: new Transport('https://api.graph.cool/simple/v1/__YOUR_KEY')
});

// set timezone to UTC for Graphcool
process.env.TZ = 'UTC';

// git clone git@github.com:guidokessels/xwing-data.git
const rawShips = new jsonloader('../xwing-data/data/ships.js');

const allFactions = chain(rawShips)
  .flatMap(rawShip => rawShip.faction)
  .uniq()
  .value();

console.log('all factions:',allFactions);
