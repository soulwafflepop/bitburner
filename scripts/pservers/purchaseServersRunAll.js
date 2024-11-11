import {
  target
} from './functions.js'

//under the impression that home server is running the best target (will not run anything on best target)
export async function main(ns) {
  let hackServers = await target(ns, 27, true, false); //gets an array of the 2nd to 26th best servers to hack
  let pServers = ns.getPurchasedServers(); //gets an array of all purchased servers
  
  for (let i = 0; i < pServers.length; i++) {
    ns.killall(pServers[i]);
    let host = pServers[i];
    let target = hackServers[i];
    ns.exec("hackManager.js", host, 1, target, 0, true);
  }

  ns.tprint("---All PSERVERS are Running Batchers---");
}
