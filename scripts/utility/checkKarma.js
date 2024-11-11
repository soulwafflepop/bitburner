import {
  abbr
} from './functions.js'


export async function main(ns) {
  var karma = ns.heart.break();
  ns.tprint("Current Karma: -", abbr(Math.abs(karma)));
}
