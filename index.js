import Lokka from 'lokka';
import Transport from 'lokka-transport-http';
import {chain, flatMap, uniqBy, value} from 'lodash';


const client = new Lokka({
  transport: new Transport('https://api.graph.cool/simple/v1/cj0bgunelehlb0148ye2ovsgn')
});

//set timezone to UTC for Graphcool
process.env.TZ = 'UTC';

// git clone git@github.com:guidokessels/xwing-data.git
const rawShips = require('./data/ships.js');

const allFactions = chain(rawShips)
  .flatMap(rawShip => rawShip.faction)
  // .uniqBy(faction => faction[0])
  .value();

console.log(rawShips);
console.log(allFactions);
