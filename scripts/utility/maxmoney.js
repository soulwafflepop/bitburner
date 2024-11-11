import {
  abbr
} from './functions.js'

export async function main(ns) {
  if (ns.getHostname() == "home" || ns.getServerMaxMoney() == 0) {
    ns.alert("-Server Not Applicable-");
  } else {
    var maxMoney = ns.getServerMaxMoney(ns.getHostname());
    ns.clearLog();
    ns.print("Server Money Capacity:", abbr(maxMoney));
    ns.tail();
  }
}
