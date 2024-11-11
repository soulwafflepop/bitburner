import {
  abbr, abbrRam
} from './functions.js'

export async function main(ns, ram = ns.args[0], upgrade = ns.args[1]) {
  ram = Math.pow(2, ram);
  var cost = abbr(ns.getPurchasedServerCost(ram));
  var simpRam = abbrRam(ram);
  ns.tprint("Cost for a ", simpRam, " server is: ", cost);
}
